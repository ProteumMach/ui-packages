import type { PartModelRegion } from './types.js'

/** Region index → the visual surface it belongs to. */
export type SurfaceOf = ReadonlyMap<number, number>

/**
 * The visual surface of each post-split region.
 *
 * The kernel divides B-rep faces to make machining relationships unambiguous.
 * Those divisions remain meaningful to feature extraction and picking, but
 * they are not physical edges. `splitOrigin` is the kernel's exact lineage
 * relation: equal values mean the regions were one face before that analysis
 * split. It is therefore the single grouping used for rendering, rather than
 * attempting to infer continuations from mesh normals or surface kinds.
 */
export function visualSurfaces(regions: readonly PartModelRegion[]): SurfaceOf {
  return new Map(regions.map((region) => [region.idx, region.splitOrigin]))
}
