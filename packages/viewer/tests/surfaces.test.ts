import { BufferGeometry, Float32BufferAttribute } from 'three'
import { describe, expect, it } from 'vitest'
import { smoothRegionNormals } from '../src/engine/normals.js'
import { visualSurfaces } from '../src/model/surfaces.js'
import type { PartModelRegion } from '../src/model/types.js'
import { regionEdgesGeometry } from '../src/render/edges.js'

const region = (
  idx: number,
  splitOrigin: number,
  start: number,
  end: number,
  shapeKind = 'Plane',
): PartModelRegion => ({
  idx,
  splitOrigin,
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

/** Two triangles meeting at 90°, useful for proving a boundary stays hard. */
function corner(): BufferGeometry {
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0], 3),
  )
  return geometry
}

describe('visualSurfaces', () => {
  it('groups regions solely by their kernel split origin', () => {
    const surfaces = visualSurfaces([
      region(3, 12, 0, 1, 'Cylinder'),
      region(9, 12, 1, 2, 'Cylinder'),
      region(4, 23, 2, 3, 'Cylinder'),
    ])

    expect(surfaces.get(3)).toBe(12)
    expect(surfaces.get(9)).toBe(12)
    expect(surfaces.get(4)).toBe(23)
  })
})

describe('what the split stops costing', () => {
  it('draws no line down a curved split surface', () => {
    const geometry = splitSquare()
    const model = {
      regions: [region(0, 7, 0, 1, 'Cylinder'), region(1, 7, 1, 2, 'Cylinder')],
      regionIndex: null as never,
    }

    // The one shared edge is an analysis split, so only the four outer edges remain.
    expect(regionEdgesGeometry(geometry, model).getAttribute('position').count).toBe(4 * 2)
  })

  it('keeps a boundary between distinct original faces', () => {
    const geometry = corner()
    const model = {
      regions: [region(0, 7, 0, 1), region(1, 8, 1, 2)],
      regionIndex: null as never,
    }

    expect(regionEdgesGeometry(geometry, model).getAttribute('position').count).toBe(5 * 2)
  })

  it('shades curved split siblings with no crease', () => {
    const geometry = splitSquare()

    smoothRegionNormals(geometry, [region(0, 7, 0, 1, 'Cylinder'), region(1, 7, 1, 2, 'Cylinder')])

    const normal = geometry.getAttribute('normal')
    for (let vertex = 0; vertex < normal.count; vertex += 1) {
      expect(normal.getX(vertex)).toBeCloseTo(0, 12)
      expect(normal.getY(vertex)).toBeCloseTo(0, 12)
      expect(normal.getZ(vertex)).toBeCloseTo(1, 12)
    }
  })

  it('keeps normals hard between distinct original faces', () => {
    const geometry = corner()

    smoothRegionNormals(geometry, [region(0, 7, 0, 1), region(1, 8, 1, 2)])

    expect(geometry.getAttribute('normal').getZ(0)).toBe(1)
    expect(geometry.getAttribute('normal').getY(3)).toBe(1)
  })
})
