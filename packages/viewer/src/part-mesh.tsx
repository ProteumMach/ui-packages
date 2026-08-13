import type { ThreeEvent } from '@react-three/fiber'
import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { type BufferGeometry, Vector3 } from 'three'
import type { FeatureTag, PartModel } from './model/types.js'
import type { FeatureHighlight, RegionHighlight } from './render/paint.js'
import { applyHighlightLayers } from './render/paint.js'
import { sectionBounds, sectionDepth, sectionOffset } from './render/section.js'
import { createPart } from './render/part.js'
import { type PartPick, buildPick, viewDirection } from './render/picking.js'
import { useViewerControls } from './viewer.js'
import {
  type SectionOptions,
  type SectionState,
  SectionView,
  resolveSectionPlane,
} from './section-view.js'
import { useContentBox } from './content-box.js'
import { type ViewerTheme, resolveTheme, themesEqual } from './render/theme.js'

export interface PartMeshProps {
  /** The normalized report. `engine/normalize.ts` produces it. */
  model: PartModel
  /**
   * The part's mesh, from `loadPartMesh`, which checks the two describe the
   * same artifact. Owned by the caller: this adds a region attribute to it and
   * removes that again, but never disposes it.
   */
  geometry: BufferGeometry
  /**
   * The features being read. The consumer owns this — a feature panel is
   * authoritative for what is selected, because `region → feature` is
   * one-to-many and no scoping rule fixes that.
   */
  selection?: readonly FeatureTag[]
  /**
   * Every feature a click could have meant, painted faintly in each one's own
   * direction colour, under the selection.
   */
  candidates?: readonly FeatureTag[]
  /** The consumer's own colouring, painted under everything else. */
  highlights?: readonly FeatureHighlight[]
  /** Colours on named faces, over the feature highlights. */
  regionHighlights?: readonly RegionHighlight[]
  /**
   * The faces a click just picked, painted over the reading they resolved to so
   * that holding a second face shows what it did even when the reading is
   * unchanged.
   */
  pickedRegions?: readonly number[]
  /**
   * Features to show as hovered from outside the viewport — a list row under
   * the pointer. The face under the pointer *in* the viewport is tracked here
   * and needs no prop.
   */
  hoveredFeatureIds?: readonly FeatureTag[]
  /**
   * Scopes a pick to one machining direction, as an index into the model's
   * `candidateDirections`. A face that direction cannot reach then picks to
   * nothing, which is a real answer rather than a missed click.
   */
  activeDirection?: number | null
  /**
   * The section cut. Omit, or pass `enabled: false`, for none.
   *
   * Either sweep an axis — `normal` points into the half that stays and
   * `offset` runs 0 (whole) to 1 (gone) — or key the cut off one surface with
   * `plane`, which `depth` then moves in model units. `sectionFromPick` turns a
   * pick into that placement with the normal the right way round.
   */
  section?: SectionOptions
  /**
   * The cut changed, including when the handle was dragged. Emitted only on a
   * real change, so echoing it into state is safe.
   */
  onSectionChange?: (state: SectionState) => void
  /**
   * A feature to frame. Framed when it changes, so setting it to the feature
   * already framed does nothing — a zoom is a request, not a state to hold.
   */
  focusFeature?: FeatureTag | null
  onHover?: (pick: PartPick | null) => void
  /**
   * A click on the part.
   *
   * Never `null`: a mesh's own "missed" event fires whenever *it* was not hit,
   * including when the click landed on an arrow or a section handle, so
   * emitting an empty pick from here made pressing an arrow clear the
   * selection. Clicking nothing at all is a fact about the scene, and
   * `<Viewer onPointerMissed>` is where it is reported.
   */
  onPick?: (pick: PartPick) => void
  theme?: Partial<ViewerTheme>
  showEdges?: boolean
}

/**
 * The part, as one mesh with one material.
 *
 * Highlighting writes texels rather than swapping materials or rebuilding draw
 * groups — see `render/part.ts` — so a repaint costs one texture upload. That is
 * why the paint runs in a layout effect against a ref rather than being
 * expressed as JSX, and why moving the pointer over the part repaints with no
 * React render at all: the hovered face lives in a ref, and routing it through
 * state is what this rewrite exists to stop doing.
 */
export const PartMesh = ({
  model,
  geometry,
  selection = [],
  candidates = [],
  highlights = [],
  regionHighlights = [],
  pickedRegions = [],
  hoveredFeatureIds = [],
  activeDirection = null,
  section,
  onSectionChange,
  focusFeature = null,
  onHover,
  onPick,
  theme,
  showEdges = true,
}: PartMeshProps) => {
  const { camera, controls, invalidate } = useThree()
  const viewerControls = useViewerControls()
  const resolved = useStableTheme(theme)
  // The part is built once per mesh and re-themed in place: a colour change is
  // two material writes, not a rebuilt region attribute and state texture.
  const currentTheme = useRef(resolved)
  currentTheme.current = resolved
  const part = useMemo(() => createPart(model, geometry, currentTheme.current), [geometry, model])
  const hoverRegion = useRef<number | null>(null)
  const box = useContentBox()
  const cut = useMemo(() => resolveSectionPlane(section, box), [box, section])

  // Every layer the paint reads, held so a pointer move can repaint without a
  // render. Refreshed here because a render is exactly when the props are new.
  const layers = useRef({
    selection,
    candidates,
    highlights,
    regionHighlights,
    pickedRegions,
    hoveredFeatureIds,
  })
  layers.current = {
    selection,
    candidates,
    highlights,
    regionHighlights,
    pickedRegions,
    hoveredFeatureIds,
  }

  const repaint = useCallback(() => {
    const { hoveredFeatureIds: hoveredFeatures, ...rest } = layers.current
    applyHighlightLayers(
      part,
      { ...rest, hoveredFeatures, hoverRegion: hoverRegion.current },
      currentTheme.current,
    )
    invalidate()
  }, [invalidate, part])

  useEffect(() => () => part.dispose(), [part])

  const framed = useRef<FeatureTag | null>(null)
  useEffect(() => {
    if (focusFeature === null || focusFeature === framed.current) return
    framed.current = focusFeature
    const box = part.boxForFeature(focusFeature)
    if (box) viewerControls.frameBox(box)
  }, [focusFeature, part, viewerControls])

  useLayoutEffect(() => {
    part.setTheme(resolved)
    repaint()
  }, [part, repaint, resolved])

  useLayoutEffect(() => {
    part.edges.visible = showEdges
    invalidate()
  }, [invalidate, part, showEdges])

  useLayoutEffect(() => {
    part.setClippingPlanes(cut ? [cut.plane] : null)
    invalidate()
  }, [cut, invalidate, part])

  const reportedSection = useRef<string>('')
  useLayoutEffect(() => {
    const state = cut?.state ?? null
    const key = state
      ? `${state.constant}|${state.normal.x},${state.normal.y},${state.normal.z}`
      : ''
    if (key === reportedSection.current) return
    reportedSection.current = key
    if (state) onSectionChange?.(state)
  }, [cut, onSectionChange])

  // Keyed by content: callers pass inline arrays and object literals, so
  // identity would repaint on every unrelated render.
  const layerKey = [
    selection.join(' '),
    candidates.join(' '),
    pickedRegions.join(' '),
    hoveredFeatureIds.join(' '),
    highlights.map((entry) => `${entry.tag}:${entry.color}:${entry.weight ?? ''}`).join(' '),
    regionHighlights
      .map((entry) => `${entry.region}:${entry.color}:${entry.weight ?? ''}`)
      .join(' '),
  ].join('|')

  useLayoutEffect(() => {
    repaint()
  }, [layerKey, repaint])

  const pickFor = (event: ThreeEvent<PointerEvent | MouseEvent>): PartPick | null => {
    const triangleIndex = event.faceIndex
    if (triangleIndex == null) return null
    const region = model.regionIndex.regionForTriangle(triangleIndex)
    if (region === null) return null

    // The owner whose machining direction most nearly faces the viewer wins a
    // tie, so which reading a click means depends on where it was made from.
    const target = readTarget(controls)
    const normal = event.face?.normal ?? UP
    const source = event.nativeEvent

    return buildPick({
      model,
      region,
      triangleIndex,
      point: [event.point.x, event.point.y, event.point.z],
      normal: [normal.x, normal.y, normal.z],
      activeDirection,
      viewDirection: viewDirection(camera, target),
      modifiers: {
        alt: source.altKey,
        ctrl: source.ctrlKey,
        meta: source.metaKey,
        shift: source.shiftKey,
        secondary: 'button' in source && source.button === 2,
      },
    })
  }

  // Hover is region-level, so moving between triangles of one face is not a new
  // hover — and repainting is a texel write, so it happens here rather than
  // through a state update the consumer would have to round-trip.
  const emitHover = (next: PartPick | null) => {
    const region = next?.region ?? null
    if (hoverRegion.current === region) return
    hoverRegion.current = region
    repaint()
    onHover?.(next)
  }

  const dragSection = useCallback(
    (constant: number) => {
      if (!cut) return
      const anchor = section?.plane?.point
      onSectionChange?.({
        ...cut.state,
        constant,
        offset: sectionOffset(sectionBounds(box, cut.state.normal), constant),
        depth: anchor ? sectionDepth(cut.state.normal, anchor, constant) : null,
      })
    },
    [box, cut, onSectionChange, section],
  )

  return (
    <>
      <primitive
        object={part.object}
        onPointerMove={(event: ThreeEvent<PointerEvent>) => emitHover(pickFor(event))}
        onPointerOut={() => emitHover(null)}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          const pick = pickFor(event)
          if (pick) onPick?.(pick)
        }}
      />
      {cut ? (
        <SectionView
          geometry={geometry}
          box={box}
          plane={cut.plane}
          theme={resolved}
          showHandle={onSectionChange !== undefined}
          onDrag={onSectionChange ? dragSection : undefined}
        />
      ) : null}
    </>
  )
}

const ORIGIN = new Vector3()
const UP = new Vector3(0, 0, 1)
const TARGET = new Vector3()

/**
 * The orbit target, whatever the controls are.
 *
 * `camera-controls` reads its target out into a vector rather than exposing one,
 * and R3F's `controls` slot is typed loosely enough to hold either shape.
 */
function readTarget(controls: unknown): Vector3 {
  if (controls && typeof (controls as { getTarget?: unknown }).getTarget === 'function') {
    return (controls as { getTarget: (into: Vector3) => Vector3 }).getTarget(TARGET)
  }
  const target = (controls as { target?: Vector3 } | null)?.target
  return target ?? ORIGIN
}

/**
 * The resolved theme, with an identity that changes only when a colour does.
 *
 * `theme={{ part: 0xffffff }}` is a fresh object on every render, so keying the
 * effects below on its identity would re-apply and request a frame each time.
 */
function useStableTheme(theme: Partial<ViewerTheme> | undefined): ViewerTheme {
  const held = useRef<ViewerTheme | null>(null)
  const next = resolveTheme(theme)
  if (held.current === null || !themesEqual(held.current, next)) held.current = next
  return held.current
}
