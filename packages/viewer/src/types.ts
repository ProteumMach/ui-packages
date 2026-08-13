import type { Vector3 } from 'three'
import type { FeatureTag } from './model/types.js'

/**
 * A pointer event on the part, resolved to the region it landed on.
 *
 * `featureIds` is every feature owning that region — five to eight of them on
 * real parts — and is deliberately not narrowed to one here. Ranking a click is
 * a separate decision that depends on the active direction and the camera.
 */
export interface FeaturePointerEvent {
  featureIds: readonly FeatureTag[]
  regionIndex: number
  triangleIndex: number
  point: readonly [number, number, number]
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
