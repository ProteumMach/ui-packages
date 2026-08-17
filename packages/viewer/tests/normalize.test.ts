import { describe, expect, it } from 'vitest'
import {
  MIN_KERNEL_VERSION,
  assertSupportedKernelVersion,
  normalizePartReport,
} from '../src/engine/normalize.js'
import { PartReportFormatError, UnsupportedKernelVersionError } from '../src/model/errors.js'
import type { Vec3 } from '../src/model/types.js'
import { assertInstanceOf, cubeModel, loadReportFixture, withOverride } from './fixtures.js'

const demo = () => loadReportFixture('local-0.3.0-demo')

describe('normalizePartReport — the 0.3.0 demo report', () => {
  it('projects the report onto a PartModel', () => {
    const model = normalizePartReport(demo())

    expect(model.partId).toBe('7c3e91a4-5d2b-4f18-9a6c-e83b17d40f52')
    expect(model.kernelVersion).toBe('0.3.0')
    expect(model.features).toHaveLength(2)
    expect(model.regions).toHaveLength(3)
    expect(model.candidateDirections).toEqual([{ x: 0, y: 0, z: 1 }])
    expect(model.mesh.pointCount).toBe(248)
    expect(model.mesh.triangleCount).toBe(96)
    expect(model.warnings).toEqual([])
  })

  it('carries region ranges as half-open [start, end)', () => {
    const model = normalizePartReport(demo())

    expect(model.regions.map((region) => region.triangles)).toEqual([
      { start: 0, end: 40 },
      { start: 40, end: 72 },
      { start: 72, end: 96 },
    ])
    // Ending exactly at meshTriangleCount is what settles the exclusivity.
    expect(model.regions.at(-1)?.triangles.end).toBe(model.mesh.triangleCount)
  })

  it('keeps area as reported without deriving anything from it', () => {
    const model = normalizePartReport(demo())

    // Analytic, not faceted — 314.16 is π·r·h for a smooth cylinder, while the
    // 24-segment mesh sums to 313.26. Never validate geometry against this.
    expect(model.regions.map((region) => region.area)).toEqual([1200, 314.16, 78.54])
  })

  it('keeps split origins as opaque visual-surface groups', () => {
    const model = normalizePartReport(demo())

    expect(model.regions.map((region) => region.splitOrigin)).toEqual([0, 1, 2])
  })

  it('identifies features by tag and wires the region index', () => {
    const { features, regionIndex } = normalizePartReport(demo())

    const hole = features[0]
    expect(hole?.tag).toBe('f1e2d3c4b5a69788')
    expect(hole?.featureType).toBe('through_hole')
    expect(hole?.machiningDirection).toEqual({ x: 0, y: 0, z: 1 })

    expect(regionIndex.regionsForFeature('f1e2d3c4b5a69788')).toEqual([1, 2])
    expect(regionIndex.featuresForRegion(0)).toEqual(['00a1b2c3d4e5f607'])
    expect(regionIndex.regionForTriangle(50)).toBe(1)
  })

  /**
   * A report with no mesh is a correct response, not a failure: the API
   * verifies each artifact exists before presigning, so a report can carry a
   * complete `regions[]` table and `null` for all three URLs — and a URL that
   * *was* presigned is dead fifteen minutes later regardless. The feature list
   * stays usable on this path, so normalization must not treat it as an error.
   */
  it('accepts a report whose artifact URLs are null', () => {
    const model = normalizePartReport(
      withOverride(demo(), { meshGlbUrl: null, meshStlUrl: null, thumbnailUrl: null }),
    )

    expect(model.mesh).toEqual({
      pointCount: 248,
      triangleCount: 96,
      glbUrl: null,
      stlUrl: null,
      thumbnailUrl: null,
    })
    expect(model.regions).toHaveLength(3)
  })
})

/**
 * The complete fixture: regions *and* real geometry from one analysis run, and
 * the article the overlap finding was measured on. Everything the selection
 * model assumes about ambiguity comes from these numbers, so they are asserted
 * rather than described.
 */
describe('normalizePartReport — the 0.3.0 cube report', () => {
  it('normalizes cleanly, with a mesh and no warnings', () => {
    const model = cubeModel()

    expect(model.partId).toBe('6492078d-693c-4645-b86b-1027f3bbfd2a')
    expect(model.features).toHaveLength(24)
    expect(model.regions).toHaveLength(6)
    expect(model.candidateDirections).toEqual([
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: -1 },
      { x: 0, y: -1, z: 0 },
      { x: 0, y: 1, z: 0 },
    ])
    expect(model.mesh.pointCount).toBe(8)
    expect(model.mesh.triangleCount).toBe(12)
    expect(model.warnings).toEqual([])
  })

  it('tiles all 12 triangles, two per region', () => {
    const { regionIndex, regions } = cubeModel()

    expect(regions.map((region) => region.triangles)).toEqual([
      { start: 0, end: 2 },
      { start: 2, end: 4 },
      { start: 4, end: 6 },
      { start: 6, end: 8 },
      { start: 8, end: 10 },
      { start: 10, end: 12 },
    ])

    for (let triangle = 0; triangle < 12; triangle += 1) {
      expect(regionIndex.regionForTriangle(triangle)).toBe(triangle >> 1)
    }
    expect(regionIndex.regionForTriangle(12)).toBeNull()
  })

  /**
   * The one finding that shapes the whole interaction model. If a tidier
   * fixture ever replaces this one and the counts drop to 1, the code would
   * still pass its own tests while the premise underneath it had vanished.
   */
  it('gives every region five to eight owning features', () => {
    const { regionIndex, features } = cubeModel()

    const typeOf = new Map(features.map((feature) => [feature.tag, feature.featureType]))
    const owners = [0, 1, 2, 3, 4, 5].map((region) =>
      regionIndex.featuresForRegion(region).map((tag) => typeOf.get(tag)),
    )

    expect(owners.map((set) => set.length)).toEqual([5, 5, 5, 8, 5, 8])

    // Regions 3 and 5 are the ±X faces. The candidate directions are ±Y and ±Z
    // only, so nothing faces them: they collect a `wall` and a `profile` from
    // all four directions and no `face` at all. That is the worst case any
    // panel layout has to survive.
    expect(owners[3]).not.toContain('face')
    expect(owners[5]).not.toContain('face')
    expect(owners[0]?.filter((type) => type === 'face')).toHaveLength(1)
  })

  /**
   * Scoping to one machining direction narrows a region's 5–8 owners to **two,
   * one, or none** — and the shape of the residue is completely regular:
   *
   * | region, relative to the direction | owners                |
   * | --------------------------------- | --------------------- |
   * | the one it faces                  | 1 — the `face`        |
   * | the one behind it                 | 0 — unreachable       |
   * | the four it grazes                | 2 — `wall`, `profile` |
   *
   * Two consequences. A direction-scoped click is still ambiguous on four of
   * six regions, so `profile` ranking last stays load-bearing; and "no owner in
   * the active direction" is a real state the UI must say something about,
   * since with `+Z` active the bottom face of the cube belongs to no feature.
   */
  it('narrows a region to at most two owners within one direction', () => {
    const { regionIndex, features, candidateDirections } = cubeModel()

    const byTag = new Map(features.map((feature) => [feature.tag, feature]))

    for (const direction of candidateDirections) {
      const composition = [0, 1, 2, 3, 4, 5].map((region) =>
        regionIndex
          .featuresForRegion(region)
          .map((tag) => byTag.get(tag))
          .filter((feature) => sameDirection(feature, direction))
          .map((feature): string => feature?.featureType ?? '?')
          .sort()
          .join('+'),
      )

      expect([...composition].sort()).toEqual([
        '',
        'face',
        'profile+wall',
        'profile+wall',
        'profile+wall',
        'profile+wall',
      ])
    }
  })
})

function sameDirection(
  feature: { machiningDirection: Vec3 } | undefined,
  direction: Vec3,
): boolean {
  const own = feature?.machiningDirection
  return (
    own !== undefined && own.x === direction.x && own.y === direction.y && own.z === direction.z
  )
}

describe('normalizePartReport — kernel version gating', () => {
  it('rejects a legacy 0.2.0 report', () => {
    const report = loadReportFixture('legacy-0.2.0-cube')

    expect(() => normalizePartReport(report)).toThrow(UnsupportedKernelVersionError)
    // The failure has to name the version — a 0.2.0 report is structurally
    // close enough that a vaguer error would send debugging elsewhere.
    expect(() => normalizePartReport(report)).toThrow(/0\.2\.0/)
    expect(() => normalizePartReport(report)).toThrow(
      new RegExp(MIN_KERNEL_VERSION.replaceAll('.', '\\.')),
    )
  })

  it('accepts 0.3.0 and anything newer', () => {
    for (const version of ['0.3.0', '0.3.1', '0.4.0', '1.0.0', '0.3.0-rc.1']) {
      expect(() => assertSupportedKernelVersion(version)).not.toThrow()
    }
  })

  it('rejects anything older', () => {
    for (const version of ['0.2.0', '0.2.9', '0.1.0', '0.0.1']) {
      expect(() => assertSupportedKernelVersion(version)).toThrow(UnsupportedKernelVersionError)
    }
  })

  it('rejects an unrecognizable version as malformed, not as too old', () => {
    for (const version of ['', 'banana', '0', '1.2.3.4', 'v1.2.3']) {
      expect(() => assertSupportedKernelVersion(version)).toThrow(PartReportFormatError)
    }
  })

  it('checks the version before anything else', () => {
    // An otherwise-empty 0.2.0 report must fail on the version, not on the
    // missing regions[] that the old kernel never had.
    expect(() => normalizePartReport({ kernelVersion: '0.2.0' })).toThrow(
      UnsupportedKernelVersionError,
    )
  })
})

describe('normalizePartReport — malformed reports fail loudly', () => {
  it('rejects a non-object', () => {
    expect(() => normalizePartReport(null)).toThrow(PartReportFormatError)
    expect(() => normalizePartReport('{}')).toThrow(PartReportFormatError)
  })

  it('rejects a 0.3.0 report with no regions[]', () => {
    expect(() => normalizePartReport(withOverride(demo(), { regions: undefined }))).toThrow(
      /regions is missing/,
    )
  })

  it('rejects a region table that does not tile the mesh', () => {
    const report = withOverride(demo(), {
      regions: [
        {
          idx: 0,
          splitOrigin: 0,
          shapeKind: 'Plane',
          area: 1,
          triangleStart: 0,
          triangleEnd: 40,
        },
        {
          idx: 1,
          splitOrigin: 1,
          shapeKind: 'Plane',
          area: 1,
          triangleStart: 41,
          triangleEnd: 96,
        },
      ],
    })

    expect(() => normalizePartReport(report)).toThrow(PartReportFormatError)
    expect(() => normalizePartReport(report)).toThrow(/belong to no region/)
  })

  it.each([undefined, -1, 1.5])('rejects an invalid region splitOrigin: %p', (splitOrigin) => {
    const report = structuredClone(demo())
    const regions = report['regions'] as Array<Record<string, unknown>>
    regions[0]!['splitOrigin'] = splitOrigin

    expect(() => normalizePartReport(report)).toThrow(/Region schema/)
  })

  it('rejects a feature with no featureTag', () => {
    const report = withOverride(demo(), {
      features: [{ featureType: 'face', machiningDirection: { x: 0, y: 0, z: 1 }, regionIdxs: [] }],
    })

    expect(() => normalizePartReport(report)).toThrow(/has no featureTag/)
  })

  it('collects every problem rather than stopping at the first', () => {
    let error: unknown
    try {
      normalizePartReport({
        kernelVersion: '0.3.0',
        features: [],
        regions: [],
        candidateDirections: [],
      })
    } catch (caught) {
      error = caught
    }

    assertInstanceOf(error, PartReportFormatError)
    expect(error.issues).toContain('partId is missing or not a string')
    expect(error.issues.length).toBeGreaterThan(1)
  })
})

describe('normalizePartReport — open sets and non-fatal data', () => {
  it('passes an unknown featureType through untouched', () => {
    const report = withOverride(demo(), {
      features: [
        {
          featureTag: 'aa',
          featureType: 'future_kernel_feature',
          machiningDirection: { x: 0, y: 0, z: 1 },
          regionIdxs: [0, 1, 2],
        },
      ],
    })

    expect(normalizePartReport(report).features[0]?.featureType).toBe('future_kernel_feature')
  })

  it('preserves non-axis-aligned candidate directions', () => {
    const tilted = { x: 0.5878, y: 0, z: 0.809 }
    const model = normalizePartReport(
      withOverride(demo(), { candidateDirections: [{ x: 0, y: 0, z: 1 }, tilted] }),
    )

    expect(model.candidateDirections[1]).toEqual(tilted)
  })

  it('reads a feature axis, and treats an absent one as normal', () => {
    const report = withOverride(demo(), {
      features: [
        {
          featureTag: 'aa',
          featureType: 'through_hole',
          machiningDirection: { x: 0, y: 0, z: 1 },
          axis: { x: 0, y: 0, z: 1 },
          regionIdxs: [0, 1, 2],
        },
      ],
    })

    const model = normalizePartReport(report)
    expect(model.features[0]?.axis).toEqual({ x: 0, y: 0, z: 1 })
    expect(model.warnings).toEqual([])
    // The demo's own features carry no axis at all, which is not a problem.
    expect(normalizePartReport(demo()).features[0]?.axis).toBeNull()
  })

  it('drops an unreadable axis with a warning instead of failing', () => {
    const report = withOverride(demo(), {
      features: [
        {
          featureTag: 'aa',
          featureType: 'face',
          machiningDirection: { x: 0, y: 0, z: 1 },
          axis: { x: 0, y: 'sideways', z: 1 },
          regionIdxs: [0, 1, 2],
        },
      ],
    })

    const model = normalizePartReport(report)
    expect(model.features[0]?.axis).toBeNull()
    expect(model.warnings).toEqual(['feature aa has an axis this package cannot read; dropped'])
  })
})

describe('fixture integrity', () => {
  /**
   * Guards a finding the selection model depends on, so a fixture swapped for a
   * tidier one cannot silently remove the evidence.
   */
  it('the cube still reports far more features than triangles', () => {
    const report = loadReportFixture('legacy-0.2.0-cube')

    // 24 features over 12 triangles: features are not a partition of the mesh.
    expect(report['features']).toHaveLength(24)
    expect(report['meshTriangleCount']).toBe(12)
  })
})
