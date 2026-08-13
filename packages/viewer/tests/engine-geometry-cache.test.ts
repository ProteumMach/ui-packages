import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { createEngineGeometryCache } from '../src/engine/geometry-cache.js'

const mesh = (id: string, query = '') => ({
  pointCount: 8,
  triangleCount: 12,
  glbUrl: `https://example.test/${id}.glb${query}`,
  stlUrl: null,
  thumbnailUrl: null,
})

describe('Engine geometry cache', () => {
  it('retains rendered geometry and disposes the least-recent released entry at capacity', async () => {
    const loader = vi.fn(async () => new THREE.BufferGeometry())
    const cache = createEngineGeometryCache(loader, 1)
    const first = cache.get(mesh('first'))
    await first.promise
    const dispose = vi.fn()
    first.geometry!.addEventListener('dispose', dispose)
    cache.retain(first)
    cache.release(first)

    const second = cache.get(mesh('second'))
    await second.promise
    cache.retain(second)
    cache.release(second)

    expect(dispose).toHaveBeenCalledOnce()
  })

  it('keys on the artifact path, so a re-presigned URL is still a hit', async () => {
    const loader = vi.fn(async () => new THREE.BufferGeometry())
    const cache = createEngineGeometryCache(loader)

    // The same mesh, presigned twice: different signature, same artifact.
    const first = cache.get(mesh('part', '?X-Amz-Signature=aaa'))
    await first.promise
    const second = cache.get(mesh('part', '?X-Amz-Signature=bbb'))
    await second.promise

    expect(second).toBe(first)
    expect(loader).toHaveBeenCalledOnce()
  })

  it('does not retain failed loads, so an error boundary retry can request the artifact again', async () => {
    const loader = vi
      .fn<() => Promise<THREE.BufferGeometry>>()
      .mockRejectedValueOnce(new Error('expired URL'))
      .mockResolvedValueOnce(new THREE.BufferGeometry())
    const cache = createEngineGeometryCache(loader)
    const failed = cache.get(mesh('retry'))
    await failed.promise

    const retried = cache.get(mesh('retry'))
    await retried.promise
    expect(retried.status).toBe('fulfilled')
    expect(loader).toHaveBeenCalledTimes(2)
  })
})
