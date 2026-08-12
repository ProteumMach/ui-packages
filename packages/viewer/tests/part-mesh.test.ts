import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  buildPartMaterialGroups,
  buildPartRenderGroups,
  featureRegionAtTriangle,
  resolveFeatureVisualState,
  sameFeatureHover,
} from '../src/part-mesh.js'

const geometry = new THREE.BoxGeometry(1, 1, 1)

describe('PartMesh helpers', () => {
  it('keeps unassigned triangles renderable around mapped feature regions', () => {
    expect(
      buildPartRenderGroups(geometry, [
        { regionIndex: 4, triangleStart: 2, triangleEnd: 6, featureIds: ['a'] },
      ]),
    ).toEqual([
      { triangleStart: 0, triangleEnd: 2 },
      {
        region: { regionIndex: 4, triangleStart: 2, triangleEnd: 6, featureIds: ['a'] },
        triangleStart: 2,
        triangleEnd: 6,
      },
      { triangleStart: 6, triangleEnd: 12 },
    ])
  })

  it('uses selection before hover and supports overlapping feature ownership', () => {
    expect(resolveFeatureVisualState(['a', 'b'], ['b'], ['a'])).toBe('selected')
    expect(resolveFeatureVisualState(['a', 'b'], [], ['a'])).toBe('hovered')
    expect(resolveFeatureVisualState(['a'], [], [])).toBe('default')
  })

  it('uses three shared material states instead of a material for every feature region', () => {
    const manyRegions = Array.from({ length: 500 }, (_, index) => ({
      regionIndex: index,
      triangleStart: index,
      triangleEnd: index + 1,
      featureIds: [`feature-${index}`],
    }))
    const ranges = manyRegions.map((region) => ({
      region,
      triangleStart: region.triangleStart,
      triangleEnd: region.triangleEnd,
    }))
    const groups = buildPartMaterialGroups(ranges, [], [])

    expect(groups).toEqual([{ triangleStart: 0, triangleEnd: 500, materialIndex: 0 }])
    expect(buildPartMaterialGroups(ranges, ['feature-17'], ['feature-412'])).toEqual([
      { triangleStart: 0, triangleEnd: 17, materialIndex: 0 },
      { triangleStart: 17, triangleEnd: 18, materialIndex: 2 },
      { triangleStart: 18, triangleEnd: 412, materialIndex: 0 },
      { triangleStart: 412, triangleEnd: 413, materialIndex: 1 },
      { triangleStart: 413, triangleEnd: 500, materialIndex: 0 },
    ])
  })

  it('finds mapped pointer regions with a sorted triangle lookup', () => {
    const regions = [
      { regionIndex: 2, triangleStart: 4, triangleEnd: 7, featureIds: ['middle'] },
      { regionIndex: 4, triangleStart: 8, triangleEnd: 10, featureIds: ['last'] },
    ]
    expect(featureRegionAtTriangle(regions, 5)?.featureIds).toEqual(['middle'])
    expect(featureRegionAtTriangle(regions, 7)).toBeUndefined()
  })

  it('rejects overlapping render regions', () => {
    expect(() =>
      buildPartRenderGroups(geometry, [
        { regionIndex: 1, triangleStart: 0, triangleEnd: 4, featureIds: ['a'] },
        { regionIndex: 2, triangleStart: 3, triangleEnd: 5, featureIds: ['b'] },
      ]),
    ).toThrow('overlaps')
  })

  it('does not treat movement between triangles in the same feature region as a new hover', () => {
    expect(
      sameFeatureHover(
        { featureIds: ['top'], regionIndex: 2, triangleIndex: 4, point: [0, 0, 0] },
        { featureIds: ['top'], regionIndex: 2, triangleIndex: 5, point: [1, 0, 0] },
      ),
    ).toBe(true)
  })
})
