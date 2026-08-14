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
    // In the order they were named — they arrive ranked, and this used to hand
    // them back in report order instead.
    expect(featureFromTags([hole, wall], ['wall-456', 'hole-123'])).toEqual([wall, hole])
  })
})

describe('featureFromTags', () => {
  const features = [hole, wall]

  test('returns them in the order they were named, not report order', () => {
    // The candidates are ranked. Shown in report order while the keyboard walks
    // the ranking, the highlight jumps around the list.
    expect(featureFromTags(features, ['wall-456', 'hole-123']).map((f) => f.featureTag)).toEqual([
      'wall-456',
      'hole-123',
    ])
  })

  test('skips a tag no feature answers to', () => {
    expect(featureFromTags(features, ['nope', 'wall-456']).map((f) => f.featureTag)).toEqual([
      'wall-456',
    ])
  })
})
