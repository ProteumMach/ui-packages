import { describe, expect, it } from 'vitest'
import { PartReportFormatError } from '../src/model/errors.js'
import {
  buildRegionIndex,
  type BuildRegionIndexInput,
  type IndexableRegion,
} from '../src/model/region-index.js'
import {
  assertInstanceOf,
  createRandom,
  loadReportFixture,
  partModelFromReport,
} from './fixtures.js'

/**
 * `RegionIndex` is the correctness core of feature selection and it is entirely
 * pure, so it can be tested exhaustively without a GPU. The failure mode it
 * guards against is silent: a mis-tiled region table does not crash, it
 * highlights the wrong surface.
 */

/** The demo fixture's tiling: 0–39 → 0, 40–71 → 1, 72–95 → 2. */
function demoRegionOf(triangle: number): number {
  if (triangle < 40) return 0
  if (triangle < 72) return 1
  return 2
}

function index(input: Partial<BuildRegionIndexInput> = {}) {
  return buildRegionIndex({
    regions: [
      { idx: 0, triangles: { start: 0, end: 40 } },
      { idx: 1, triangles: { start: 40, end: 72 } },
      { idx: 2, triangles: { start: 72, end: 96 } },
    ],
    features: [
      { tag: 'f1e2d3c4b5a69788', regionIdxs: [1, 2] },
      { tag: '00a1b2c3d4e5f607', regionIdxs: [0] },
    ],
    triangleCount: 96,
    ...input,
  })
}

describe('buildRegionIndex — triangle lookup', () => {
  it('resolves every triangle of the demo fixture to its region', () => {
    const { regionIndex, mesh } = partModelFromReport(loadReportFixture('local-0.3.0-demo'))

    expect(mesh.triangleCount).toBe(96)

    for (let triangle = 0; triangle < 96; triangle += 1) {
      expect(regionIndex.regionForTriangle(triangle)).toBe(demoRegionOf(triangle))
    }
  })

  it('treats triangleEnd as exclusive at every boundary', () => {
    const regionIndex = index()

    expect(regionIndex.regionForTriangle(39)).toBe(0)
    expect(regionIndex.regionForTriangle(40)).toBe(1)
    expect(regionIndex.regionForTriangle(71)).toBe(1)
    expect(regionIndex.regionForTriangle(72)).toBe(2)
    expect(regionIndex.regionForTriangle(95)).toBe(2)
  })

  it('returns null past the end of the mesh and for non-triangle inputs', () => {
    const regionIndex = index()

    expect(regionIndex.regionForTriangle(96)).toBeNull()
    expect(regionIndex.regionForTriangle(1_000)).toBeNull()
    expect(regionIndex.regionForTriangle(-1)).toBeNull()
    expect(regionIndex.regionForTriangle(1.5)).toBeNull()
    expect(regionIndex.regionForTriangle(Number.NaN)).toBeNull()
  })

  it('does not depend on the order regions arrive in', () => {
    const shuffled = index({
      regions: [
        { idx: 2, triangles: { start: 72, end: 96 } },
        { idx: 0, triangles: { start: 0, end: 40 } },
        { idx: 1, triangles: { start: 40, end: 72 } },
      ],
    })

    expect(shuffled.regionForTriangle(0)).toBe(0)
    expect(shuffled.regionForTriangle(50)).toBe(1)
    expect(shuffled.regionForTriangle(80)).toBe(2)
  })

  it('looks regions up by idx rather than array position', () => {
    // Sparse, non-monotonic idx values: array position would give 0/1/2.
    const regionIndex = index({
      regions: [
        { idx: 7, triangles: { start: 0, end: 40 } },
        { idx: 3, triangles: { start: 40, end: 72 } },
        { idx: 9, triangles: { start: 72, end: 96 } },
      ],
      features: [{ tag: 'a', regionIdxs: [3, 9] }],
    })

    expect(regionIndex.regionForTriangle(10)).toBe(7)
    expect(regionIndex.regionForTriangle(50)).toBe(3)
    expect(regionIndex.rangeForRegion(9)).toEqual({ start: 72, end: 96 })
    expect(regionIndex.rangeForRegion(0)).toBeNull()
  })
})

describe('buildRegionIndex — feature ↔ region', () => {
  it('inverts regionIdxs into owner sets', () => {
    const regionIndex = index()

    expect(regionIndex.regionsForFeature('f1e2d3c4b5a69788')).toEqual([1, 2])
    expect(regionIndex.featuresForRegion(1)).toEqual(['f1e2d3c4b5a69788'])
    expect(regionIndex.featuresForRegion(0)).toEqual(['00a1b2c3d4e5f607'])
  })

  it('returns empty, not undefined, for unknown lookups', () => {
    const regionIndex = index()

    expect(regionIndex.regionsForFeature('nope')).toEqual([])
    expect(regionIndex.featuresForRegion(42)).toEqual([])
  })

  /**
   * The finding that shapes the whole interaction model: on a cube, every
   * region has 5–8 owning features, because the same physical face is a `face`
   * under one machining direction and a `wall` under others, and each
   * direction's `profile` overlaps the surfaces it traces. `region → feature`
   * is irreducibly one-to-many, so the index must never collapse it.
   *
   * The fixture below is a hand-built miniature of that shape; the measured
   * article is `fixtures/reports/local-0.3.0-cube.json`, asserted at the end of
   * this file.
   */
  it('keeps every owner when features share a region', () => {
    const regionIndex = buildRegionIndex({
      regions: [
        { idx: 0, triangles: { start: 0, end: 2 } }, // +Z
        { idx: 1, triangles: { start: 2, end: 4 } }, // -Z
        { idx: 2, triangles: { start: 4, end: 6 } }, // +X
      ],
      features: [
        { tag: 'pz-face', regionIdxs: [0] },
        { tag: 'pz-wall-x', regionIdxs: [2] },
        { tag: 'pz-profile', regionIdxs: [2] },
        { tag: 'ny-wall-a', regionIdxs: [0, 1, 2] },
        { tag: 'py-wall-b', regionIdxs: [0, 1, 2] },
        { tag: 'nz-face', regionIdxs: [1] },
      ],
      triangleCount: 6,
    })

    expect(regionIndex.featuresForRegion(0)).toEqual(['pz-face', 'ny-wall-a', 'py-wall-b'])
    expect(regionIndex.featuresForRegion(2)).toEqual([
      'pz-wall-x',
      'pz-profile',
      'ny-wall-a',
      'py-wall-b',
    ])
    // Owner order follows report order, so a click that cycles is stable.
    expect(regionIndex.featuresForRegion(2)[0]).toBe('pz-wall-x')
  })

  it('lets two features reference an identical region set', () => {
    const regionIndex = index({
      features: [
        { tag: 'wall-from-pz', regionIdxs: [0, 1] },
        { tag: 'wall-from-ny', regionIdxs: [0, 1] },
      ],
    })

    expect(regionIndex.featuresForRegion(0)).toEqual(['wall-from-pz', 'wall-from-ny'])
    expect(regionIndex.regionsForFeature('wall-from-ny')).toEqual([0, 1])
  })

  it('holds the cube fixture at five to eight owners on every region', () => {
    const { regions, regionIndex } = partModelFromReport(loadReportFixture('local-0.3.0-cube'))

    const owners = regions.map((region) => regionIndex.featuresForRegion(region.idx).length)

    expect(owners).toHaveLength(6)
    for (const count of owners) {
      expect(count).toBeGreaterThanOrEqual(5)
      expect(count).toBeLessThanOrEqual(8)
    }
  })
})

describe('buildRegionIndex — malformed tables are rejected at build', () => {
  const cases: Array<[string, Partial<BuildRegionIndexInput>, RegExp]> = [
    [
      'a gap between regions',
      {
        regions: [
          { idx: 0, triangles: { start: 0, end: 40 } },
          { idx: 1, triangles: { start: 41, end: 96 } },
        ],
      },
      /belong to no region/,
    ],
    [
      'overlapping regions',
      {
        regions: [
          { idx: 0, triangles: { start: 0, end: 50 } },
          { idx: 1, triangles: { start: 40, end: 96 } },
        ],
      },
      /overlaps/,
    ],
    [
      'a region past meshTriangleCount',
      {
        regions: [
          { idx: 0, triangles: { start: 0, end: 40 } },
          { idx: 1, triangles: { start: 40, end: 97 } },
        ],
      },
      /past meshTriangleCount/,
    ],
    [
      'regions that stop short of the mesh',
      {
        regions: [
          { idx: 0, triangles: { start: 0, end: 40 } },
          { idx: 1, triangles: { start: 40, end: 72 } },
        ],
      },
      /cover 72 triangles but the mesh has 96/,
    ],
    [
      'an inverted range',
      {
        regions: [
          { idx: 0, triangles: { start: 0, end: 40 } },
          { idx: 1, triangles: { start: 72, end: 40 } },
          { idx: 2, triangles: { start: 40, end: 96 } },
        ],
      },
      /invalid triangle range/,
    ],
    [
      'a duplicated region idx',
      {
        regions: [
          { idx: 0, triangles: { start: 0, end: 40 } },
          { idx: 0, triangles: { start: 40, end: 96 } },
        ],
      },
      /appears more than once/,
    ],
    [
      'a duplicated featureTag',
      {
        features: [
          { tag: 'same', regionIdxs: [0] },
          { tag: 'same', regionIdxs: [1] },
        ],
      },
      /featureTag same appears more than once/,
    ],
    [
      'a feature referencing a region that does not exist',
      { features: [{ tag: 'a', regionIdxs: [0, 99] }] },
      /references region 99/,
    ],
  ]

  for (const [name, override, message] of cases) {
    it(`rejects ${name}`, () => {
      expect(() => index(override)).toThrow(PartReportFormatError)
      expect(() => index(override)).toThrow(message)
    })
  }

  it('reports every problem it finds, not just the first', () => {
    let error: unknown
    try {
      index({ features: [{ tag: 'a', regionIdxs: [98, 99] }] })
    } catch (caught) {
      error = caught
    }

    assertInstanceOf(error, PartReportFormatError)
    expect(error.issues).toHaveLength(2)
  })

  it('accepts an empty table for an empty mesh', () => {
    const empty = buildRegionIndex({ regions: [], features: [], triangleCount: 0 })

    expect(empty.regionCount).toBe(0)
    expect(empty.regionForTriangle(0)).toBeNull()
  })
})

describe('buildRegionIndex — property coverage over synthetic tilings', () => {
  /**
   * The invariants are simple enough to check exhaustively against a brute
   * force: for any gapless tiling, every triangle must resolve to the region
   * whose half-open range contains it.
   */
  it('agrees with a linear scan on random tilings', () => {
    const random = createRandom(0x5eed)

    for (let trial = 0; trial < 200; trial += 1) {
      const regionCount = 1 + Math.floor(random() * 12)
      const regions: IndexableRegion[] = []
      let cursor = 0
      for (let i = 0; i < regionCount; i += 1) {
        const size = 1 + Math.floor(random() * 20)
        regions.push({
          // Deliberately non-contiguous idx values, shuffled below.
          idx: i * 3 + 1,
          triangles: { start: cursor, end: cursor + size },
        })
        cursor += size
      }
      const triangleCount = cursor
      const shuffled = [...regions].sort(() => random() - 0.5)

      const regionIndex = buildRegionIndex({ regions: shuffled, features: [], triangleCount })

      for (let triangle = 0; triangle < triangleCount; triangle += 1) {
        const expected = regions.find(
          (region) => triangle >= region.triangles.start && triangle < region.triangles.end,
        )
        expect(regionIndex.regionForTriangle(triangle)).toBe(expected?.idx)
      }
      expect(regionIndex.regionForTriangle(triangleCount)).toBeNull()
    }
  })
})
