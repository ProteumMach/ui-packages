import { type Box3, type Object3D, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'

export type Projection = 'orthographic' | 'perspective'

export type ViewerCamera = OrthographicCamera | PerspectiveCamera

export interface ViewportSize {
  readonly width: number
  readonly height: number
}

/** Vertical field of view, in degrees, for the perspective camera. */
export const PERSPECTIVE_FOV = 30

/** Padding around the framed bounds, as a multiple of its radius. */
export const DEFAULT_FIT_MARGIN = 1.2

/** Marks scene furniture — grid, axes — that the camera should not frame. */
export const EXCLUDE_FROM_FRAME = 'viewerExcludeFromFrame'

/**
 * What the camera frames: a bounding *sphere*, not a box.
 *
 * A sphere makes framing rotation-invariant — the part stays fully visible from
 * every angle, and a resize never needs to know the current pose. Framing
 * per-axis box dimensions instead means recomputing the camera distance on
 * every resize, and still clipping on some orientations.
 */
export interface SceneBounds {
  readonly center: Vector3
  readonly radius: number
}

/**
 * Bounds for a scene with nothing in it. A viewer is mounted before it has a
 * part, and a camera with a zero-size frustum renders nothing at all.
 */
export function defaultBounds(): SceneBounds {
  return { center: new Vector3(0, 0, 0), radius: 1 }
}

/**
 * A container can be laid out at zero size, and a degenerate aspect ratio
 * produces a `NaN` projection matrix that never recovers. Fall back to square.
 */
export function aspectRatio(size: ViewportSize): number {
  return size.width > 0 && size.height > 0 ? size.width / size.height : 1
}

export function boundsFromBox(box: Box3): SceneBounds {
  if (box.isEmpty()) return defaultBounds()

  const center = box.getCenter(new Vector3())
  const radius = box.getSize(new Vector3()).length() / 2

  // A single point, or a perfectly flat part seen edge-on, still needs a
  // frustum with volume.
  return { center, radius: radius > 0 ? radius : 1 }
}

/**
 * The bounds of everything worth framing under `root`.
 *
 * Skips objects flagged with {@link EXCLUDE_FROM_FRAME} and their descendants:
 * a 100 mm grid around a 6 mm part would otherwise frame the grid, and the part
 * would be a speck.
 */
export function contentBounds(root: Object3D, into: Box3): SceneBounds {
  into.makeEmpty()

  root.updateWorldMatrix(true, true)
  root.traverse((object) => {
    if (object.userData[EXCLUDE_FROM_FRAME]) return
    let ancestor: Object3D | null = object.parent
    while (ancestor && ancestor !== root) {
      if (ancestor.userData[EXCLUDE_FROM_FRAME]) return
      ancestor = ancestor.parent
    }
    if ('isMesh' in object || 'isLine' in object || 'isPoints' in object) {
      into.expandByObject(object)
    }
  })

  return boundsFromBox(into)
}

/**
 * The distance at which a sphere of `radius` fits inside a perspective frustum.
 * Uses the narrower of the two field-of-view angles, so a portrait viewport
 * frames on width and a landscape one on height.
 */
export function perspectiveFitDistance(fovDegrees: number, aspect: number, radius: number): number {
  const verticalFov = (fovDegrees * Math.PI) / 180
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect)

  return radius / Math.sin(Math.min(verticalFov, horizontalFov) / 2)
}

/**
 * Half-height of an orthographic frustum that fits a sphere of `radius`. A
 * portrait viewport grows the height so the width still clears the sphere.
 */
export function orthographicHalfHeight(aspect: number, radius: number): number {
  return aspect >= 1 ? radius : radius / aspect
}

/**
 * Near and far planes, deliberately derived from the bounds alone and not from
 * the camera's distance: they then survive dollying and orbiting without
 * needing to be recomputed, and the ratio stays small enough for the depth
 * buffer to behave.
 */
function nearFar(projection: Projection, radius: number): { near: number; far: number } {
  // An orthographic near plane may sit behind the camera, which keeps geometry
  // visible however far the controls push the camera back.
  if (projection === 'orthographic') return { near: -radius * 100, far: radius * 100 }
  return { near: radius / 100, far: radius * 100 }
}

const START_DIRECTION: Record<Projection, readonly [number, number, number]> = {
  orthographic: [1.2, -2.5, 3],
  perspective: [2, 1.2, -2.5],
}

export function fitDistance(
  projection: Projection,
  size: ViewportSize,
  bounds: SceneBounds,
  margin = DEFAULT_FIT_MARGIN,
): number {
  if (projection === 'perspective') {
    return perspectiveFitDistance(PERSPECTIVE_FOV, aspectRatio(size), bounds.radius * margin)
  }
  // Distance does not affect an orthographic framing — the frustum does. The
  // camera only has to sit clear of the geometry.
  return bounds.radius * margin * 4
}

export function startPosition(
  projection: Projection,
  size: ViewportSize,
  bounds: SceneBounds,
  margin = DEFAULT_FIT_MARGIN,
): Vector3 {
  const [x, y, z] = START_DIRECTION[projection]

  return new Vector3(x, y, z)
    .normalize()
    .multiplyScalar(fitDistance(projection, size, bounds, margin))
    .add(bounds.center)
}

/**
 * Points an existing camera's frustum at `bounds` for the current viewport.
 * Pose is untouched — that belongs to the controls.
 */
export function applyProjection(
  camera: ViewerCamera,
  size: ViewportSize,
  bounds: SceneBounds,
  margin = DEFAULT_FIT_MARGIN,
): void {
  const aspect = aspectRatio(size)
  const radius = bounds.radius * margin

  if (camera instanceof OrthographicCamera) {
    const halfHeight = orthographicHalfHeight(aspect, radius)
    const halfWidth = halfHeight * aspect

    camera.left = -halfWidth
    camera.right = halfWidth
    camera.top = halfHeight
    camera.bottom = -halfHeight

    const { near, far } = nearFar('orthographic', radius)
    camera.near = near
    camera.far = far
  } else {
    camera.fov = PERSPECTIVE_FOV
    camera.aspect = aspect

    const { near, far } = nearFar('perspective', radius)
    camera.near = near
    camera.far = far
  }

  camera.updateProjectionMatrix()
}

/**
 * The world-up convention. The part data is Z-up (millimetres, no conversion) —
 * not the glTF-conventional Y-up — so the camera has to say so explicitly.
 */
export const CAD_CAMERA_UP = new Vector3(0, 0, 1)

/** Named viewing directions, as unit vectors from the part toward the camera. */
export const cadViewDirections = {
  front: new Vector3(0, -1, 0),
  back: new Vector3(0, 1, 0),
  left: new Vector3(-1, 0, 0),
  right: new Vector3(1, 0, 0),
  top: new Vector3(0, 0, 1),
  bottom: new Vector3(0, 0, -1),
  isometric: new Vector3(1, -1, 1).normalize(),
} as const

export type ViewerView = keyof typeof cadViewDirections

/** The current orbit direction, so Fit can retain the direction being looked from. */
export function currentViewDirection(
  camera: ViewerCamera,
  target: Vector3,
  into: Vector3,
): Vector3 {
  into.subVectors(camera.position, target)
  if (into.lengthSq() <= Number.EPSILON) return into.copy(cadViewDirections.isometric)
  return into.normalize()
}
