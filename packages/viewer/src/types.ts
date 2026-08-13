import type { Vector3 } from 'three'

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
