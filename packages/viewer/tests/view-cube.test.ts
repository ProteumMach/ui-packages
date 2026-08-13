import { Box3, Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { gridSpec } from '../src/render/grid.js'
import {
  CHAMFER,
  VIEW_NAMES,
  cubeZones,
  panelGeometry,
  viewKind,
  viewUp,
  viewVector,
} from '../src/render/view-cube.js'

/**
 * The cube is the only control in the viewport that is also geometry, so its
 * shape is testable in node: 26 planar panels, each facing the direction it
 * takes the camera to.
 */

describe('the 26 standard views', () => {
  it('covers six faces, twelve edges and eight corners', () => {
    const kinds = VIEW_NAMES.map(viewKind)

    expect(VIEW_NAMES).toHaveLength(26)
    expect(kinds.filter((kind) => kind === 'face')).toHaveLength(6)
    expect(kinds.filter((kind) => kind === 'edge')).toHaveLength(12)
    expect(kinds.filter((kind) => kind === 'corner')).toHaveLength(8)
  })

  it('names them in the Z-up frame the part data is authored in', () => {
    // +Z is the top, −Y is the front, +X is the right. Getting this wrong puts
    // every label on the wrong panel, which is not subtle but is easy to do.
    expect(viewVector('top')).toEqual({ x: 0, y: 0, z: 1 })
    expect(viewVector('front')).toEqual({ x: 0, y: -1, z: 0 })
    expect(viewVector('right')).toEqual({ x: 1, y: 0, z: 0 })
  })

  it('gives every view a unit direction', () => {
    for (const name of VIEW_NAMES) {
      const { x, y, z } = viewVector(name)
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 12)
    }
  })
})

describe('viewUp', () => {
  it('keeps Z up for every view that is not looking down it', () => {
    expect(viewUp(viewVector('front'))).toEqual({ x: 0, y: 0, z: 1 })
    expect(viewUp(viewVector('top-front-right'))).toEqual({ x: 0, y: 0, z: 1 })
  })

  /**
   * Straight down Z, an up vector parallel to the view is degenerate and the
   * camera has no defined roll. ±Y puts the front edge at the bottom of the
   * screen, which is what every CAD package does.
   */
  it('falls to Y on the two views that look down Z', () => {
    expect(viewUp(viewVector('top'))).toEqual({ x: 0, y: 1, z: 0 })
    expect(viewUp(viewVector('bottom'))).toEqual({ x: 0, y: -1, z: 0 })
  })
})

describe('cubeZones', () => {
  const zones = cubeZones()

  it('gives a square to a face, a rectangle to an edge and a triangle to a corner', () => {
    const sides = (kind: string) =>
      zones.filter((zone) => zone.kind === kind).map((zone) => zone.polygon.length)

    expect(new Set(sides('face'))).toEqual(new Set([4]))
    expect(new Set(sides('edge'))).toEqual(new Set([4]))
    expect(new Set(sides('corner'))).toEqual(new Set([3]))
  })

  /**
   * Every panel is wound counter-clockwise seen from outside. Getting one
   * backwards makes it invisible from the front and solid from behind, which
   * reads as a hole in the cube.
   */
  it('winds every panel to face outwards', () => {
    for (const zone of zones) {
      const [a, b, c] = zone.polygon
      if (!a || !b || !c) throw new Error(`${zone.name} has no polygon`)

      const facing = new Vector3()
        .subVectors(new Vector3(b.x, b.y, b.z), new Vector3(a.x, a.y, a.z))
        .cross(new Vector3().subVectors(new Vector3(c.x, c.y, c.z), new Vector3(a.x, a.y, a.z)))

      expect(
        facing.dot(new Vector3(zone.direction.x, zone.direction.y, zone.direction.z)),
      ).toBeGreaterThan(0)
    }
  })

  it('keeps every panel planar and on its own side of the cube', () => {
    for (const zone of zones) {
      const normal = new Vector3(zone.direction.x, zone.direction.y, zone.direction.z)
      const distances = zone.polygon.map((point) =>
        new Vector3(point.x, point.y, point.z).dot(normal),
      )

      // All at one distance along the normal: a planar panel.
      for (const distance of distances) {
        expect(distance).toBeCloseTo(distances[0]!, 9)
        expect(distance).toBeGreaterThan(0)
      }
    }
  })

  it('takes the chamfer off the faces, which is what leaves room for the rest', () => {
    const top = zones.find((zone) => zone.name === 'top')

    // A face reaches CHAMFER of the way out; the remainder is the chamfer the
    // edge and corner panels occupy.
    for (const point of top?.polygon ?? []) {
      expect(Math.abs(point.x)).toBeCloseTo(CHAMFER, 9)
      expect(point.z).toBeCloseTo(1, 9)
    }
    expect(CHAMFER).toBeLessThan(1)
  })

  it('builds a triangle fan for every panel', () => {
    for (const zone of zones) {
      const geometry = panelGeometry(zone)
      const vertices = geometry.getAttribute('position').count

      expect(vertices).toBe((zone.polygon.length - 2) * 3)
      expect(geometry.getAttribute('normal').count).toBe(vertices)
    }
  })
})

describe('gridSpec', () => {
  const box = (x: number, y: number, z = 10) => new Box3(new Vector3(0, 0, 0), new Vector3(x, y, z))

  /**
   * The Engine emits millimetres and says nothing about scale, so the step is a
   * 1-2-5 progression rather than a fixed size — a fixed grid is invisible under
   * a 900 mm plate and a solid wash under a 12 mm insert.
   */
  it('picks a step a machinist reads without doing arithmetic', () => {
    expect(gridSpec(box(50.8, 50.8)).step).toBe(5)
    expect(gridSpec(box(900, 900)).step).toBe(50)
    expect(gridSpec(box(12, 12)).step).toBe(1)
  })

  it('rounds the step down, so the part gets a grid rather than a border', () => {
    // Rounding up would leave a 50.8 mm cube on 10 mm cells: five squares.
    expect(50.8 / gridSpec(box(50.8, 50.8)).step).toBeGreaterThanOrEqual(10)
  })

  it('sits on the bottom of the part rather than on z = 0', () => {
    const raised = new Box3(new Vector3(0, 0, -30), new Vector3(50, 50, -10))

    // A part modelled about its own centre would otherwise be sliced in half by
    // its own grid.
    expect(gridSpec(raised).z).toBe(-30)
  })

  it('spans a whole number of cells past the part', () => {
    const spec = gridSpec(box(50.8, 50.8))

    expect(spec.extent % spec.step).toBeCloseTo(0, 9)
    expect(spec.extent * 2).toBeGreaterThan(50.8)
  })
})
