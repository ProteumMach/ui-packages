import { describe, expect, it } from 'vitest'
import { engineFeatureRegions, engineMeshAssets, loadEngineGeometry } from '../src/engine/index.js'

const baseReport = {
  meshTriangleCount: 12,
  meshGlbUrl: 'https://example.test/part.glb',
  meshStlUrl: 'https://example.test/part.stl',
  regions: [
    { idx: 3, triangleStart: 0, triangleEnd: 4 },
    { idx: 8, triangleStart: 4, triangleEnd: 12 },
  ],
  features: [
    { featureTag: 'face-a', regionIdxs: [3] },
    { featureTag: 'face-b', regionIdxs: [8, 3] },
  ],
}

describe('Engine report mapping', () => {
  it('prefers GLB and retains STL as a fallback', () => {
    expect(engineMeshAssets(baseReport)).toEqual([
      { format: 'glb', url: baseReport.meshGlbUrl },
      { format: 'stl', url: baseReport.meshStlUrl },
    ])
  })

  it('maps all owning feature tags to each region', () => {
    expect(engineFeatureRegions(baseReport)).toEqual([
      { regionIndex: 3, triangleStart: 0, triangleEnd: 4, featureIds: ['face-a', 'face-b'] },
      { regionIndex: 8, triangleStart: 4, triangleEnd: 12, featureIds: ['face-b'] },
    ])
  })

  it('falls back to STL when the preferred GLB cannot be parsed', async () => {
    const stl = new TextEncoder().encode(
      'solid triangle\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid',
    )
    const fetcher = async (url: string) =>
      new Response(url.endsWith('.glb') ? new Uint8Array([0, 1, 2]) : stl, { status: 200 })

    const geometry = await loadEngineGeometry(baseReport, fetcher as typeof fetch)
    expect(geometry.getAttribute('position').count).toBe(3)
  })

  it('rejects invalid report triangle ranges', () => {
    expect(() =>
      engineFeatureRegions({
        ...baseReport,
        regions: [{ idx: 3, triangleStart: 6, triangleEnd: 20 }],
      }),
    ).toThrow('invalid triangle range')
  })
})
