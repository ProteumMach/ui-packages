import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import type { BufferGeometry } from 'three'
import type { EnginePartReport } from './types.js'

export type MeshFormat = 'glb' | 'stl'

export interface MeshAsset {
  format: MeshFormat
  url: string
}

/** Lists Engine mesh artifacts in the order they should be attempted: GLB, then STL. */
export const engineMeshAssets = (
  report: Pick<EnginePartReport, 'meshGlbUrl' | 'meshStlUrl'>,
): MeshAsset[] => {
  const assets: MeshAsset[] = []
  if (report.meshGlbUrl) assets.push({ format: 'glb', url: report.meshGlbUrl })
  if (report.meshStlUrl) assets.push({ format: 'stl', url: report.meshStlUrl })
  return assets
}

const parseGlb = async (buffer: ArrayBuffer, url: string): Promise<BufferGeometry> => {
  const loader = new GLTFLoader()
  const gltf = await loader.parseAsync(buffer, url.slice(0, url.lastIndexOf('/') + 1))
  let geometry: BufferGeometry | undefined
  gltf.scene.traverse((object) => {
    if (!geometry && 'isMesh' in object && object.isMesh && 'geometry' in object) {
      geometry = object.geometry as BufferGeometry
    }
  })
  if (!geometry) throw new Error('GLB contains no mesh geometry')
  return geometry.clone()
}

/** Loads one Engine mesh artifact, preferring GLB and using STL as a resilient fallback. */
export const loadEngineGeometry = async (
  report: Pick<EnginePartReport, 'meshGlbUrl' | 'meshStlUrl'>,
  fetcher: typeof fetch = fetch,
): Promise<BufferGeometry> => {
  const assets = engineMeshAssets(report)
  if (!assets.length) throw new Error('Engine report contains neither a GLB nor an STL mesh URL')

  const errors: Error[] = []
  for (const asset of assets) {
    try {
      const response = await fetcher(asset.url)
      if (!response.ok)
        throw new Error(`${asset.format.toUpperCase()} request failed with HTTP ${response.status}`)
      const buffer = await response.arrayBuffer()
      return asset.format === 'glb'
        ? await parseGlb(buffer, asset.url)
        : new STLLoader().parse(buffer)
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)))
    }
  }
  throw new AggregateError(errors, 'Could not load an Engine mesh artifact')
}
