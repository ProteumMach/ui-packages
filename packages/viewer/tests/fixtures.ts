import { readFileSync } from 'node:fs'
import { buildRegionIndex } from '../src/model/region-index.js'
import type { PartModel, PartModelFeature, PartModelRegion } from '../src/model/types.js'

export type ReportFixture = 'local-0.3.0-cube' | 'local-0.3.0-demo'

/** Reads a captured report as the untyped JSON a fetch would hand back. */
export function loadReportFixture(name: ReportFixture): Record<string, unknown> {
  const url = new URL(`../fixtures/reports/${name}.json`, import.meta.url)
  return JSON.parse(readFileSync(url, 'utf8')) as Record<string, unknown>
}

interface RawRegion {
  idx: number
  shapeKind: string
  area: number
  triangleStart: number
  triangleEnd: number
}

interface RawFeature {
  featureTag: string
  featureType: string
  machiningDirection: { x: number; y: number; z: number }
  axis?: { x: number; y: number; z: number } | null
  regionIdxs: number[]
}

/**
 * Projects a captured report into a `PartModel` for the model-layer tests.
 *
 * Deliberately trusting: it asserts nothing about the report, because the tests
 * that use it are about the index and the ranking rather than about validation.
 * The validating path is `normalizePartReport`, which lands with the Engine
 * adapter and replaces this.
 */
export function partModelFromReport(report: Record<string, unknown>): PartModel {
  const rawRegions = report['regions'] as RawRegion[]
  const rawFeatures = report['features'] as RawFeature[]

  const regions: PartModelRegion[] = rawRegions.map((region) => ({
    idx: region.idx,
    shapeKind: region.shapeKind,
    area: region.area,
    triangles: { start: region.triangleStart, end: region.triangleEnd },
  }))
  const features: PartModelFeature[] = rawFeatures.map((feature) => ({
    tag: feature.featureTag,
    featureType: feature.featureType,
    machiningDirection: feature.machiningDirection,
    axis: feature.axis ?? null,
    regionIdxs: feature.regionIdxs,
  }))

  return {
    partId: report['partId'] as string,
    kernelVersion: report['kernelVersion'] as string,
    features,
    regions,
    candidateDirections: report['candidateDirections'] as PartModel['candidateDirections'],
    mesh: {
      pointCount: report['meshPointCount'] as number,
      triangleCount: report['meshTriangleCount'] as number,
      glbUrl: null,
      stlUrl: null,
      thumbnailUrl: null,
    },
    regionIndex: buildRegionIndex({
      regions,
      features,
      triangleCount: report['meshTriangleCount'] as number,
    }),
    warnings: [],
  }
}

/** The cube: 24 features, 6 regions, 4 directions, 5–8 owners per region. */
export function cubeModel(): PartModel {
  return partModelFromReport(loadReportFixture('local-0.3.0-cube'))
}

/**
 * Narrows a caught value to an error class without a type assertion, so a
 * miscategorized failure surfaces here rather than as a confusing property read
 * on the wrong object.
 */
export function assertInstanceOf<T>(
  value: unknown,
  ctor: abstract new (...args: never[]) => T,
): asserts value is T {
  if (!(value instanceof ctor)) {
    throw new TypeError(`Expected an instance of ${ctor.name}, got ${String(value)}`)
  }
}

/** Deterministic RNG so a property-test failure reproduces from its seed. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0 || 1
  return () => {
    // xorshift32
    state ^= state << 13
    state >>>= 0
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 0x1_0000_0000
  }
}
