import { useEffect, useMemo } from 'react'
import { PartMesh, type PartMeshProps } from '../part-mesh.js'
import { engineGeometryCache, type EngineGeometryResource } from './geometry-cache.js'
import { engineFeatureRegions } from './region-mapping.js'
import type { EnginePartReport } from './types.js'

const useEngineGeometryResource = (
  report: Pick<EnginePartReport, 'meshGlbUrl' | 'meshStlUrl'>,
): EngineGeometryResource => {
  const resource = engineGeometryCache.get(report)
  if (resource.status === 'pending') throw resource.promise
  if (resource.status === 'rejected') throw resource.error
  return resource
}

export interface EnginePartProps extends Omit<PartMeshProps<string>, 'geometry' | 'regions'> {
  report: EnginePartReport
}

/** Renders a Toolpath Engine report and preserves featureTag identities for interactions. */
export const EnginePart = ({ report, ...props }: EnginePartProps) => {
  const resource = useEngineGeometryResource(report)
  const geometry = resource.geometry!
  const regions = useMemo(() => engineFeatureRegions(report), [report])
  useEffect(() => {
    engineGeometryCache.retain(resource)
    return () => engineGeometryCache.release(resource)
  }, [resource])
  return <PartMesh<string> geometry={geometry} regions={regions} {...props} />
}
