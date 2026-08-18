import { readFileSync } from 'node:fs'
import { normalizePartReport } from '../src/engine/normalize.js'
import type { PartModel } from '../src/model/types.js'

export type ReportFixture = 'local-0.3.0-cube' | 'local-0.3.0-demo' | 'legacy-0.2.0-cube'

/** Reads a fixture report as the untyped JSON a fetch would hand back. */
export function loadReportFixture(name: ReportFixture): Record<string, unknown> {
  const url = new URL(`../fixtures/reports/${name}.json`, import.meta.url)
  return JSON.parse(readFileSync(url, 'utf8')) as Record<string, unknown>
}

export type MeshFixture = 'local-0.3.0-cube'

/** Reads a captured GLB as the `ArrayBuffer` a fetched response would give. */
export function loadMeshFixture(name: MeshFixture): ArrayBuffer {
  const url = new URL(`../fixtures/mesh/${name}.glb`, import.meta.url)
  const bytes = readFileSync(url)
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

/** A structured clone with one path overridden, for malformed-input cases. */
export function withOverride(
  value: Record<string, unknown>,
  override: Record<string, unknown>,
): unknown {
  return { ...structuredClone(value), ...override }
}

/** The normalized cube: 24 features, 6 regions, 4 directions, 5-8 owners each. */
export function cubeModel(): PartModel {
  return normalizePartReport(loadReportFixture('local-0.3.0-cube'))
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
