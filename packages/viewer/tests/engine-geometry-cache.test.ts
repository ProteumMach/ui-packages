import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { createEngineGeometryCache } from '../src/engine/geometry-cache.js'

const report = (id: string) => ({
  meshGlbUrl: `https://example.test/${id}.glb`,
  meshStlUrl: null,
})

describe('Engine geometry cache', () => {
  it('retains rendered geometry and disposes the least-recent released entry at capacity', async () => {
    const loader = vi.fn(async () => new THREE.BufferGeometry())
    const cache = createEngineGeometryCache(loader, 1)
    const first = cache.get(report('first'))
    await first.promise
    const dispose = vi.fn()
    first.geometry!.addEventListener('dispose', dispose)
    cache.retain(first)
    cache.release(first)

    const second = cache.get(report('second'))
    await second.promise
    cache.retain(second)
    cache.release(second)

    expect(dispose).toHaveBeenCalledOnce()
  })

  it('does not retain failed loads, so an error boundary retry can request the artifact again', async () => {
    const loader = vi
      .fn<() => Promise<THREE.BufferGeometry>>()
      .mockRejectedValueOnce(new Error('expired URL'))
      .mockResolvedValueOnce(new THREE.BufferGeometry())
    const cache = createEngineGeometryCache(loader)
    const failed = cache.get(report('retry'))
    await failed.promise

    const retried = cache.get(report('retry'))
    await retried.promise
    expect(retried.status).toBe('fulfilled')
    expect(loader).toHaveBeenCalledTimes(2)
  })
})
