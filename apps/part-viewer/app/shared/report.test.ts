import { describe, expect, test } from 'vitest'
import type { PartFeature } from './report'
import { featureDetailRows, featureFromTags, featureSummary, filterFeatures } from './report'

const hole: PartFeature = {
  featureTag: 'hole-123',
  featureType: 'blind_hole',
  regionIdxs: [3, 4],
  machiningDirection: { x: 0, y: 0, z: 1 },
  axis: { x: 0, y: 0, z: 1 } as never,
  datasheet: { facts: { diameter: 6.35 } },
}

const wall: PartFeature = {
  featureTag: 'wall-456',
  featureType: 'wall',
  regionIdxs: [1],
  machiningDirection: { x: -1, y: 0, z: 0 },
  axis: { x: 1, y: 0, z: 0 } as never,
}

describe('report view model', () => {
  test('derives readable feature information without mutating Engine data', () => {
    expect(featureSummary(hole)).toEqual({
      tag: 'hole-123',
      type: 'Blind Hole',
      direction: '+Z',
      regionCount: 2,
      headline: '⌀ 6.35 mm',
    })
    expect(filterFeatures([hole, wall], '−x')).toEqual([wall])
    expect(featureDetailRows(hole)).toContainEqual({ label: 'Diameter', value: '6.35 mm' })
  })

  test('keeps every ownership candidate from an ambiguous mesh click', () => {
    expect(featureFromTags([hole, wall], ['wall-456', 'hole-123'])).toEqual([hole, wall])
  })
})
