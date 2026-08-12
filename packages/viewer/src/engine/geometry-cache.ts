import type { BufferGeometry } from 'three'
import { loadEngineGeometry } from './mesh-loader.js'
import type { EnginePartReport } from './types.js'

type EngineMeshUrls = Pick<EnginePartReport, 'meshGlbUrl' | 'meshStlUrl'>

export interface EngineGeometryResource {
  status: 'pending' | 'fulfilled' | 'rejected'
  promise: Promise<void>
  geometry?: BufferGeometry
  error?: Error
  references: number
  lastAccess: number
}

export interface EngineGeometryCache {
  get(report: EngineMeshUrls): EngineGeometryResource
  retain(resource: EngineGeometryResource): void
  release(resource: EngineGeometryResource): void
  clear(): void
}

export const engineGeometryResourceKey = (report: EngineMeshUrls): string =>
  `${report.meshGlbUrl ?? ''}|${report.meshStlUrl ?? ''}`

/**
 * A small reference-aware LRU cache for Engine artifacts. Rendered parts retain their source
 * geometry; released entries are evicted and disposed once the cache exceeds its capacity.
 */
export const createEngineGeometryCache = (
  loadGeometry: (report: EngineMeshUrls) => Promise<BufferGeometry> = loadEngineGeometry,
  maximumEntries = 8,
): EngineGeometryCache => {
  const resources = new Map<string, EngineGeometryResource>()
  let accessSequence = 0
  const touch = (resource: EngineGeometryResource) => {
    resource.lastAccess = ++accessSequence
  }

  const evictReleasedResources = () => {
    while (resources.size > maximumEntries) {
      let oldest: [string, EngineGeometryResource] | undefined
      for (const entry of resources) {
        const [, resource] = entry
        if (
          resource.status !== 'fulfilled' ||
          resource.references > 0 ||
          (oldest && oldest[1].lastAccess <= resource.lastAccess)
        ) {
          continue
        }
        oldest = entry
      }
      if (!oldest) return
      resources.delete(oldest[0])
      oldest[1].geometry?.dispose()
    }
  }

  return {
    get: (report) => {
      const key = engineGeometryResourceKey(report)
      const existing = resources.get(key)
      if (existing) {
        touch(existing)
        return existing
      }

      const resource = {
        status: 'pending',
        promise: Promise.resolve(),
        references: 0,
        lastAccess: ++accessSequence,
      } as EngineGeometryResource
      resource.promise = loadGeometry(report).then(
        (geometry) => {
          resource.status = 'fulfilled'
          resource.geometry = geometry
        },
        (error: unknown) => {
          resource.status = 'rejected'
          resource.error = error instanceof Error ? error : new Error(String(error))
          if (resources.get(key) === resource) resources.delete(key)
        },
      )
      resources.set(key, resource)
      return resource
    },
    retain: (resource) => {
      resource.references += 1
      touch(resource)
    },
    release: (resource) => {
      resource.references = Math.max(0, resource.references - 1)
      touch(resource)
      evictReleasedResources()
    },
    clear: () => {
      for (const resource of resources.values()) resource.geometry?.dispose()
      resources.clear()
    },
  }
}

export const engineGeometryCache = createEngineGeometryCache()
