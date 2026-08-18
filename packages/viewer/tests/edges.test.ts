import { BufferGeometry, Float32BufferAttribute } from 'three'
import { describe, expect, it } from 'vitest'
import { parsePartGeometry } from '../src/engine/geometry.js'
import { buildRegionIndex } from '../src/model/region-index.js'
import type { PartModel, PartModelRegion } from '../src/model/types.js'
import { regionEdgesGeometry } from '../src/render/edges.js'
import { cubeModel, loadMeshFixture } from './fixtures.js'

/**
 * An edge threshold guesses at where a real edge is, and on a machined part it
 * guesses wrong in both directions — a twelve-facet bore reads as a nut, a
 * shallow chamfer gets no line at all. The report knows instead.
 */

function region(idx: number, start: number, end: number): PartModelRegion {
  return { idx, splitOrigin: idx, shapeKind: 'Plane', area: 1, triangles: { start, end } }
}

function model(
  regions: PartModelRegion[],
  triangleCount: number,
): Pick<PartModel, 'regions' | 'regionIndex'> {
  return {
    regions,
    regionIndex: buildRegionIndex({
      regions: regions.map((r) => ({ idx: r.idx, triangles: r.triangles })),
      features: [],
      triangleCount,
    }),
  }
}

/** Two triangles sharing the edge (0,0,0)–(1,0,0), folded at 90°. */
function fold(): BufferGeometry {
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0], 3),
  )
  return geometry
}

const segments = (geometry: BufferGeometry) => geometry.getAttribute('position').count / 2

describe('regionEdgesGeometry', () => {
  it('draws nothing along a seam inside one surface', () => {
    const geometry = fold()

    const edges = regionEdgesGeometry(geometry, model([region(0, 0, 2)], 2))

    // Both facets are one region, so the fold between them is tessellation —
    // even at 90°, which any angle threshold would draw.
    expect(segments(edges)).toBe(4)
  })

  it('draws the boundary where two surfaces meet', () => {
    const geometry = fold()

    const edges = regionEdgesGeometry(geometry, model([region(0, 0, 1), region(1, 1, 2)], 2))

    // The same two facets, now a region each: the shared edge is real and the
    // four outer ones still are.
    expect(segments(edges)).toBe(5)
  })

  it('keeps every edge of the cube and none of its diagonals', async () => {
    const model = cubeModel()
    const geometry = await parsePartGeometry(loadMeshFixture('local-0.3.0-cube'), model.mesh)

    const edges = regionEdgesGeometry(geometry, model)

    // A cube has twelve edges. Each face is two triangles in one region, so the
    // diagonal across it is tessellation and is dropped — `EdgesGeometry` at 15
    // degrees agrees here, which is why a cube was never the case that showed
    // the difference.
    expect(segments(edges)).toBe(12)
  })

  it('leaves an indexed mesh alone rather than guessing at its edges', () => {
    const geometry = fold()
    geometry.setIndex([0, 1, 2, 3, 4, 5])

    expect(segments(regionEdgesGeometry(geometry, model([region(0, 0, 2)], 2)))).toBe(0)
  })
})
