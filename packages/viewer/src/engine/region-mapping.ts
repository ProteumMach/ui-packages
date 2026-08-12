import type { FeatureRegion } from '../types.js'
import type { EnginePartReport } from './types.js'

/** Maps Engine regions to viewer regions while preserving every owning featureTag. */
export const engineFeatureRegions = (
  report: Pick<EnginePartReport, 'features' | 'regions' | 'meshTriangleCount'>,
): FeatureRegion<string>[] => {
  const tagsByRegion = new Map<number, string[]>()
  for (const feature of report.features) {
    for (const regionIndex of feature.regionIdxs) {
      const tags = tagsByRegion.get(regionIndex) ?? []
      tags.push(feature.featureTag)
      tagsByRegion.set(regionIndex, tags)
    }
  }

  const seen = new Set<number>()
  return report.regions.map((region) => {
    if (seen.has(region.idx))
      throw new RangeError(`Engine report contains duplicate region index ${region.idx}`)
    seen.add(region.idx)
    if (
      !Number.isInteger(region.triangleStart) ||
      !Number.isInteger(region.triangleEnd) ||
      region.triangleStart < 0 ||
      region.triangleEnd < region.triangleStart ||
      region.triangleEnd > report.meshTriangleCount
    ) {
      throw new RangeError(
        `Region ${region.idx} has an invalid triangle range [${region.triangleStart}, ${region.triangleEnd})`,
      )
    }
    return {
      regionIndex: region.idx,
      triangleStart: region.triangleStart,
      triangleEnd: region.triangleEnd,
      featureIds: tagsByRegion.get(region.idx) ?? [],
    }
  })
}
