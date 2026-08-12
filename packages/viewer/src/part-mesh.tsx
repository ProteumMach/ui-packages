import type { ThreeEvent } from '@react-three/fiber'
import { useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { FeatureId, FeaturePointerEvent, FeatureRegion, PartColors } from './types.js'

export type FeatureVisualState = 'default' | 'hovered' | 'selected'

export interface PartTriangleRange<TFeatureId extends FeatureId> {
  region?: FeatureRegion<TFeatureId>
  triangleStart: number
  triangleEnd: number
}

export interface PartMaterialGroup {
  triangleStart: number
  triangleEnd: number
  materialIndex: number
}

const materialIndexForState: Record<FeatureVisualState, number> = {
  default: 0,
  hovered: 1,
  selected: 2,
}

const triangleCount = (geometry: THREE.BufferGeometry): number => {
  if (geometry.index) return geometry.index.count / 3
  return geometry.getAttribute('position').count / 3
}

export const buildPartRenderGroups = <TFeatureId extends FeatureId>(
  geometry: THREE.BufferGeometry,
  regions: readonly FeatureRegion<TFeatureId>[],
): PartTriangleRange<TFeatureId>[] => {
  const total = triangleCount(geometry)
  const ordered = [...regions].sort((a, b) => a.triangleStart - b.triangleStart)
  let cursor = 0
  const groups: PartTriangleRange<TFeatureId>[] = []
  for (const region of ordered) {
    if (region.triangleStart < cursor || region.triangleEnd > total) {
      throw new RangeError(
        `Region ${region.regionIndex} is outside the mesh or overlaps another region`,
      )
    }
    if (region.triangleStart > cursor)
      groups.push({ triangleStart: cursor, triangleEnd: region.triangleStart })
    if (region.triangleEnd > region.triangleStart)
      groups.push({ region, triangleStart: region.triangleStart, triangleEnd: region.triangleEnd })
    cursor = region.triangleEnd
  }
  if (cursor < total) groups.push({ triangleStart: cursor, triangleEnd: total })
  return groups
}

/**
 * Coalesces adjacent triangles that share a visual state. This keeps a mesh with hundreds of
 * feature regions at one draw range when unhighlighted, rather than one material per region.
 */
export const buildPartMaterialGroups = <TFeatureId extends FeatureId>(
  ranges: readonly PartTriangleRange<TFeatureId>[],
  selected: readonly TFeatureId[],
  hovered: readonly TFeatureId[],
): PartMaterialGroup[] => {
  const groups: PartMaterialGroup[] = []
  for (const range of ranges) {
    const materialIndex =
      materialIndexForState[
        resolveFeatureVisualState(range.region?.featureIds ?? [], selected, hovered)
      ]
    const previous = groups.at(-1)
    if (
      previous &&
      previous.materialIndex === materialIndex &&
      previous.triangleEnd === range.triangleStart
    ) {
      previous.triangleEnd = range.triangleEnd
    } else {
      groups.push({
        triangleStart: range.triangleStart,
        triangleEnd: range.triangleEnd,
        materialIndex,
      })
    }
  }
  return groups
}

/** Applies the coalesced visual groups without recreating the geometry or its materials. */
export const applyPartMaterialGroups = (
  geometry: THREE.BufferGeometry,
  groups: readonly PartMaterialGroup[],
): void => {
  geometry.clearGroups()
  for (const group of groups) {
    geometry.addGroup(
      group.triangleStart * 3,
      (group.triangleEnd - group.triangleStart) * 3,
      group.materialIndex,
    )
  }
}

/** Finds a feature region in O(log n) time after sorting by triangle start. */
export const featureRegionAtTriangle = <TFeatureId extends FeatureId>(
  sortedRegions: readonly FeatureRegion<TFeatureId>[],
  triangleIndex: number,
): FeatureRegion<TFeatureId> | undefined => {
  let low = 0
  let high = sortedRegions.length - 1
  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    const region = sortedRegions[middle]
    if (!region) return undefined
    if (triangleIndex < region.triangleStart) high = middle - 1
    else if (triangleIndex >= region.triangleEnd) low = middle + 1
    else return region
  }
  return undefined
}

export const resolveFeatureVisualState = <TFeatureId extends FeatureId>(
  featureIds: readonly TFeatureId[],
  selected: readonly TFeatureId[],
  hovered: readonly TFeatureId[],
): FeatureVisualState => {
  if (featureIds.some((id) => selected.includes(id))) return 'selected'
  if (featureIds.some((id) => hovered.includes(id))) return 'hovered'
  return 'default'
}

/** Hover state is feature-level, so moving between triangles in one region is not a new hover. */
export const sameFeatureHover = <TFeatureId extends FeatureId>(
  previous: FeaturePointerEvent<TFeatureId> | null,
  next: FeaturePointerEvent<TFeatureId> | null,
): boolean =>
  previous === next ||
  (previous !== null &&
    next !== null &&
    previous.regionIndex === next.regionIndex &&
    previous.featureIds.length === next.featureIds.length &&
    previous.featureIds.every((id, index) => id === next.featureIds[index]))

export interface PartMeshProps<TFeatureId extends FeatureId = FeatureId> {
  geometry: THREE.BufferGeometry
  regions?: readonly FeatureRegion<TFeatureId>[]
  selectedFeatureIds?: readonly TFeatureId[]
  hoveredFeatureIds?: readonly TFeatureId[]
  onFeatureHover?: (event: FeaturePointerEvent<TFeatureId> | null) => void
  onFeatureClick?: (event: FeaturePointerEvent<TFeatureId>) => void
  colors?: PartColors
  showEdges?: boolean
}

const defaults: Required<PartColors> = {
  default: '#e8eaf0',
  hovered: '#6bb0b3',
  selected: '#4f7cff',
  edge: '#333844',
}

export const PartMesh = <TFeatureId extends FeatureId>({
  geometry,
  regions = [],
  selectedFeatureIds = [],
  hoveredFeatureIds = [],
  onFeatureHover,
  onFeatureClick,
  colors,
  showEdges = true,
}: PartMeshProps<TFeatureId>) => {
  const { invalidate } = useThree()
  const hoveredEventRef = useRef<FeaturePointerEvent<TFeatureId> | null>(null)
  const palette = { ...defaults, ...colors }
  const triangleRanges = useMemo(
    () => buildPartRenderGroups(geometry, regions),
    [geometry, regions],
  )
  const materialGroups = useMemo(
    () => buildPartMaterialGroups(triangleRanges, selectedFeatureIds, hoveredFeatureIds),
    [hoveredFeatureIds, selectedFeatureIds, triangleRanges],
  )
  const sortedRegions = useMemo(
    () => [...regions].sort((left, right) => left.triangleStart - right.triangleStart),
    [regions],
  )
  const preparedGeometry = useMemo(() => {
    const clone = geometry.clone()
    return clone
  }, [geometry])
  const materials = useMemo(
    () =>
      ([palette.default, palette.hovered, palette.selected] as const).map((color) => {
        return new THREE.MeshStandardMaterial({
          color,
          roughness: 0.72,
          metalness: 0.08,
          flatShading: true,
        })
      }),
    [palette.default, palette.hovered, palette.selected],
  )

  useEffect(() => () => preparedGeometry.dispose(), [preparedGeometry])
  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials])
  useLayoutEffect(() => {
    applyPartMaterialGroups(preparedGeometry, materialGroups)
    invalidate()
  }, [invalidate, materialGroups, preparedGeometry])

  const eventFor = (
    event: ThreeEvent<PointerEvent | MouseEvent>,
  ): FeaturePointerEvent<TFeatureId> | null => {
    const triangleIndex = event.faceIndex
    if (triangleIndex == null) return null
    const region = featureRegionAtTriangle(sortedRegions, triangleIndex)
    if (!region?.featureIds.length) return null
    return {
      featureIds: region.featureIds,
      regionIndex: region.regionIndex,
      triangleIndex,
      point: [event.point.x, event.point.y, event.point.z],
    }
  }

  const emitHover = (event: FeaturePointerEvent<TFeatureId> | null) => {
    if (sameFeatureHover(hoveredEventRef.current, event)) return
    hoveredEventRef.current = event
    onFeatureHover?.(event)
  }

  return (
    <group>
      <mesh
        geometry={preparedGeometry}
        material={materials}
        onPointerMove={(event) => emitHover(eventFor(event))}
        onPointerOut={() => emitHover(null)}
        onClick={(event) => {
          const featureEvent = eventFor(event)
          if (featureEvent) onFeatureClick?.(featureEvent)
        }}
      ></mesh>
      {showEdges && (
        <lineSegments raycast={() => null}>
          <edgesGeometry args={[preparedGeometry, 15]} />
          <lineBasicMaterial color={palette.edge} transparent opacity={0.58} />
        </lineSegments>
      )}
    </group>
  )
}
