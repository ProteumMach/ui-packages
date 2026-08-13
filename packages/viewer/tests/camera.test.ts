import {
  Box3,
  Group,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Vector3,
} from 'three'
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FIT_MARGIN,
  EXCLUDE_FROM_FRAME,
  PERSPECTIVE_FOV,
  applyProjection,
  aspectRatio,
  boundsFromBox,
  contentBounds,
  currentViewDirection,
  defaultBounds,
  fitDistance,
  orthographicHalfHeight,
  perspectiveFitDistance,
  startPosition,
} from '../src/render/camera.js'

const LANDSCAPE = { width: 1600, height: 900 }
const PORTRAIT = { width: 900, height: 1600 }

function box(size: number): Box3 {
  return new Box3(new Vector3(0, 0, 0), new Vector3(size, size, size))
}

describe('boundsFromBox', () => {
  it('frames a sphere, so the fit is the same from every angle', () => {
    const bounds = boundsFromBox(box(50.8))

    expect(bounds.center.toArray()).toEqual([25.4, 25.4, 25.4])
    // Half the diagonal, not half the width: a cube seen corner-on is wider
    // than its side, and framing the side clips it.
    expect(bounds.radius).toBeCloseTo((50.8 * Math.sqrt(3)) / 2, 6)
  })

  it('gives an empty scene a frustum with volume', () => {
    expect(boundsFromBox(new Box3()).radius).toBe(defaultBounds().radius)
  })

  it('gives a perfectly flat part a frustum with volume', () => {
    const flat = new Box3(new Vector3(0, 0, 0), new Vector3(0, 0, 0))

    expect(boundsFromBox(flat).radius).toBe(1)
  })
})

describe('aspectRatio', () => {
  it('falls back to square for a container laid out at zero size', () => {
    // A degenerate aspect makes a NaN projection matrix that never recovers.
    expect(aspectRatio({ width: 0, height: 0 })).toBe(1)
    expect(aspectRatio({ width: 800, height: 0 })).toBe(1)
  })
})

describe('fitting a sphere', () => {
  it('frames on the narrower angle, so a portrait viewport frames on width', () => {
    const radius = 10
    const landscape = perspectiveFitDistance(PERSPECTIVE_FOV, aspectRatio(LANDSCAPE), radius)
    const portrait = perspectiveFitDistance(PERSPECTIVE_FOV, aspectRatio(PORTRAIT), radius)

    // The portrait viewport is narrower, so it has to stand further back.
    expect(portrait).toBeGreaterThan(landscape)
  })

  it('grows an orthographic frustum vertically when the viewport is portrait', () => {
    expect(orthographicHalfHeight(2, 10)).toBe(10)
    expect(orthographicHalfHeight(0.5, 10)).toBe(20)
  })

  it('keeps the whole sphere inside the frustum', () => {
    const radius = 10
    const distance = perspectiveFitDistance(PERSPECTIVE_FOV, 1, radius)
    const halfAngle = Math.asin(radius / distance)

    expect(halfAngle).toBeCloseTo((PERSPECTIVE_FOV * Math.PI) / 360, 6)
  })
})

describe('applyProjection', () => {
  it('derives near and far from the bounds rather than the camera distance', () => {
    const camera = new PerspectiveCamera()
    const bounds = boundsFromBox(box(50.8))

    applyProjection(camera, LANDSCAPE, bounds)
    const { near, far } = camera

    // Dollying must not need them recomputed, so moving the camera changes
    // neither.
    camera.position.set(0, 0, 5000)
    applyProjection(camera, LANDSCAPE, bounds)
    expect(camera.near).toBe(near)
    expect(camera.far).toBe(far)
    expect(camera.fov).toBe(PERSPECTIVE_FOV)
  })

  it('lets an orthographic near plane sit behind the camera', () => {
    const camera = new OrthographicCamera()

    applyProjection(camera, LANDSCAPE, boundsFromBox(box(10)))

    // Otherwise pushing the camera back clips the part out of existence.
    expect(camera.near).toBeLessThan(0)
    expect(camera.right - camera.left).toBeGreaterThan(camera.top - camera.bottom)
  })
})

describe('startPosition', () => {
  it('stands far enough back to frame the part', () => {
    const bounds = boundsFromBox(box(50.8))
    const position = startPosition('perspective', LANDSCAPE, bounds)

    expect(position.distanceTo(bounds.center)).toBeCloseTo(
      fitDistance('perspective', LANDSCAPE, bounds, DEFAULT_FIT_MARGIN),
      6,
    )
  })
})

describe('contentBounds', () => {
  /**
   * The reason this is not just `setFromObject`: a 100 mm grid around a 6 mm
   * part frames the grid, and the part becomes a speck.
   */
  it('ignores the grid and axes', () => {
    const root = new Group()
    const part = new Mesh(new PlaneGeometry(2, 2), new MeshBasicMaterial())
    const furniture = new Mesh(new PlaneGeometry(200, 200), new MeshBasicMaterial())
    furniture.userData[EXCLUDE_FROM_FRAME] = true
    root.add(part, furniture)

    const bounds = contentBounds(root, new Box3())

    expect(bounds.radius).toBeCloseTo(Math.SQRT2, 6)
  })

  it('ignores the children of something excluded', () => {
    const root = new Group()
    const part = new Mesh(new PlaneGeometry(2, 2), new MeshBasicMaterial())
    const group = new Group()
    group.userData[EXCLUDE_FROM_FRAME] = true
    group.add(new Mesh(new PlaneGeometry(200, 200), new MeshBasicMaterial()))
    root.add(part, group)

    expect(contentBounds(root, new Box3()).radius).toBeCloseTo(Math.SQRT2, 6)
  })

  it('falls back to default bounds when nothing is framable', () => {
    expect(contentBounds(new Group(), new Box3()).radius).toBe(defaultBounds().radius)
  })
})

describe('currentViewDirection', () => {
  it('reports the direction the camera is looking from, so Fit can keep it', () => {
    const camera = new PerspectiveCamera()
    camera.position.set(0, 0, 42)

    expect(currentViewDirection(camera, new Vector3(), new Vector3()).toArray()).toEqual([0, 0, 1])
  })

  it('falls back rather than normalizing a zero vector', () => {
    const camera = new PerspectiveCamera()
    camera.position.set(3, 3, 3)

    const direction = currentViewDirection(camera, new Vector3(3, 3, 3), new Vector3())
    expect(direction.length()).toBeCloseTo(1, 6)
  })
})
