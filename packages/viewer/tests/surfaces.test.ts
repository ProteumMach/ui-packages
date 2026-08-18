import { BufferGeometry, Float32BufferAttribute } from 'three'
import { describe, expect, it } from 'vitest'
import { visualSurfaces } from '../src/model/surfaces.js'
import { regionEdgesGeometry } from '../src/render/edges.js'
import { smoothRegionNormals } from '../src/engine/normals.js'
import type { PartModelRegion } from '../src/model/types.js'

/**
 * The Engine splits a surface where that makes a better machining plan. Those
 * splits are real to a feature and invisible to an eye: a flat floor cut in two
 * is still flat, and the part should not grow a crease down it.
 */

const region = (idx: number, start: number, end: number, shapeKind = 'Plane'): PartModelRegion => ({
  idx,
  shapeKind,
  area: 1,
  triangles: { start, end },
})

/** One square of two triangles, split down the shared diagonal into two regions. */
function splitSquare(): BufferGeometry {
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0], 3),
  )
  return geometry
}

/** Two triangles meeting at 90°, which is an edge whatever the report says. */
function corner(): BufferGeometry {
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0], 3),
  )
  return geometry
}

describe('visualSurfaces', () => {
  it('joins two regions that continue each other', () => {
    const surfaces = visualSurfaces(splitSquare(), [region(0, 0, 1), region(1, 1, 2)])

    // One flat square, however the Engine chose to divide it.
    expect(surfaces.get(0)).toBe(surfaces.get(1))
  })

  it('keeps two regions apart where the part actually turns', () => {
    const surfaces = visualSurfaces(corner(), [region(0, 0, 1), region(1, 1, 2)])

    expect(surfaces.get(0)).not.toBe(surfaces.get(1))
  })

  it('keeps two kinds of surface apart even where they meet smoothly', () => {
    // A fillet running tangentially into a wall is still a fillet meeting a
    // wall. Same-kind is the conservative half of this: it merges splits and
    // nothing else.
    const surfaces = visualSurfaces(splitSquare(), [region(0, 0, 1), region(1, 1, 2, 'Torus')])

    expect(surfaces.get(0)).not.toBe(surfaces.get(1))
  })

  it('leaves an indexed mesh alone, where it cannot key an edge', () => {
    const geometry = splitSquare()
    geometry.setIndex([0, 1, 2, 3, 4, 5])

    const surfaces = visualSurfaces(geometry, [region(0, 0, 1), region(1, 1, 2)])

    expect(surfaces.get(0)).not.toBe(surfaces.get(1))
  })
})

describe('what the split stops costing', () => {
  it('draws no line down a split surface', () => {
    const geometry = splitSquare()
    const model = { regions: [region(0, 0, 1), region(1, 1, 2)], regionIndex: null as never }

    // The one shared edge is the split, and a split is not an edge of the part.
    expect(regionEdgesGeometry(geometry, model).getAttribute('position').count).toBe(4 * 2)
  })

  it('still draws the line where the part turns', () => {
    const geometry = corner()
    const model = { regions: [region(0, 0, 1), region(1, 1, 2)], regionIndex: null as never }

    // Five distinct edges between two triangles that share one, and the shared
    // one stays because the part turns through it.
    expect(regionEdgesGeometry(geometry, model).getAttribute('position').count).toBe(5 * 2)
  })

  it('shades a split surface as one, with no crease down it', () => {
    const geometry = splitSquare()

    smoothRegionNormals(geometry, [region(0, 0, 1), region(1, 1, 2)])

    // Every vertex facing the same way is a flat square; one normal per half
    // would crease it down the middle. Compared component-wise because a
    // signed zero is still zero.
    const normal = geometry.getAttribute('normal')
    for (let vertex = 0; vertex < normal.count; vertex += 1) {
      expect(normal.getX(vertex)).toBeCloseTo(0, 12)
      expect(normal.getY(vertex)).toBeCloseTo(0, 12)
      expect(normal.getZ(vertex)).toBeCloseTo(1, 12)
    }
  })
})

describe('how much disagreement is a split', () => {
  /** Two planes meeting at a shallow angle — a chamfer, not a split. */
  function shallow(): BufferGeometry {
    const geometry = new BufferGeometry()
    // The second triangle rises 0.15 over 1, which is about 8°.
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0.15, 0, 1, 0], 3),
    )
    return geometry
  }

  it('keeps two planes apart at an angle a chamfer could be', () => {
    // The window that lets a tessellated bore merge would swallow this, which
    // is why a plane gets a tighter one: a plane is flat, so a split in one is
    // exactly coplanar and anything else is an edge.
    const surfaces = visualSurfaces(shallow(), [region(0, 0, 1), region(1, 1, 2)])

    expect(surfaces.get(0)).not.toBe(surfaces.get(1))
  })

  it('draws every boundary between curved regions, split or not', () => {
    // Nothing in the report says which surface a region was cut from, and a
    // fillet running tangentially into a shaft looks exactly like a fillet
    // split down the middle. Losing a line the part has is the worse mistake,
    // so curved boundaries are all kept.
    const surfaces = visualSurfaces(splitSquare(), [
      region(0, 0, 1, 'Cylinder'),
      region(1, 1, 2, 'Cylinder'),
    ])

    expect(surfaces.get(0)).not.toBe(surfaces.get(1))
  })
})

describe('when the report names the face a region was cut from', () => {
  const stated = (
    idx: number,
    start: number,
    end: number,
    splitOrigin: number,
    shapeKind = 'Torus',
  ) => ({ idx, shapeKind, area: 1, triangles: { start, end }, splitOrigin }) as PartModelRegion

  it('groups by what the Engine said, for a kind the facets cannot settle', () => {
    // A fillet split down the middle. Geometry alone cannot tell this from a
    // fillet meeting a shaft, so the fallback keeps both lines; the Engine
    // knows, and here it says.
    const surfaces = visualSurfaces(splitSquare(), [stated(0, 0, 1, 7), stated(1, 1, 2, 7)])

    expect(surfaces.get(0)).toBe(surfaces.get(1))
  })

  it('keeps two surfaces apart even where they meet flat', () => {
    const surfaces = visualSurfaces(splitSquare(), [
      stated(0, 0, 1, 7, 'Plane'),
      stated(1, 1, 2, 8, 'Plane'),
    ])

    // Coplanar and adjacent, which the fallback would merge. The Engine says
    // they are two faces, so they are two faces.
    expect(surfaces.get(0)).not.toBe(surfaces.get(1))
  })

  it('falls back to the geometry when only some regions say', () => {
    // Two halves of one face grouped by two different methods is worse than
    // either, so a partial answer is no answer.
    const surfaces = visualSurfaces(splitSquare(), [stated(0, 0, 1, 7, 'Plane'), region(1, 1, 2)])

    expect(surfaces.get(0)).toBe(surfaces.get(1))
  })
})
