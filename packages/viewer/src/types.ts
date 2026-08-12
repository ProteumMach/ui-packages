import type { Vector3 } from 'three'

export type FeatureId = string | number

export interface FeatureRegion<TFeatureId extends FeatureId = FeatureId> {
  /** The caller's stable region identifier. */
  regionIndex: number
  /** Inclusive triangle index in the mesh's original triangle order. */
  triangleStart: number
  /** Exclusive triangle index in the mesh's original triangle order. */
  triangleEnd: number
  /** Every feature that owns this region. */
  featureIds: readonly TFeatureId[]
}

export interface FeaturePointerEvent<TFeatureId extends FeatureId = FeatureId> {
  featureIds: readonly TFeatureId[]
  regionIndex: number
  triangleIndex: number
  point: readonly [number, number, number]
}

export interface PartColors {
  default?: string
  hovered?: string
  selected?: string
  edge?: string
}

export interface ViewerControls {
  /** Frames the part without changing the current viewing direction. */
  fit(): void
  /** Returns to the canonical isometric view and frames the part. */
  reset(): void
  setView(view: ViewerView): void
}

export type ViewerView = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'isometric'

export interface ViewerHandle extends ViewerControls {}

export type ThreePoint = readonly [number, number, number]
export type VectorLike = Pick<Vector3, 'x' | 'y' | 'z'>
