/** A region in the tessellated Engine mesh, identified by the Engine's stable index. */
export interface EngineRegion {
  idx: number
  triangleStart: number
  triangleEnd: number
}

/** An Engine feature and every mesh region that it owns. */
export interface EngineFeature {
  featureTag: string
  regionIdxs: readonly number[]
}

/** The structural subset of an Engine part report needed to render a tessellated part. */
export interface EnginePartReport {
  meshTriangleCount: number
  meshGlbUrl: string | null
  meshStlUrl: string | null
  regions: readonly EngineRegion[]
  features: readonly EngineFeature[]
}
