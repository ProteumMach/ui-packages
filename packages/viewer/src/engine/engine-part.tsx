import { useEffect, useMemo } from 'react'
import { PartMesh, type PartMeshProps } from '../part-mesh.js'
import { type EngineGeometryResource, engineGeometryCache } from './geometry-cache.js'
import { normalizePartReport } from './normalize.js'

export interface EnginePartProps extends Omit<PartMeshProps, 'model' | 'geometry'> {
  /**
   * A Toolpath Engine part report, exactly as the API returned it.
   *
   * Typed `unknown` because it is validated rather than trusted: a report read
   * from a file is treated the same as one off the wire. A malformed one throws
   * `PartReportFormatError`, and one from a pre-0.3.0 kernel throws
   * `UnsupportedKernelVersionError` — both worth catching in an error boundary,
   * since neither is a state the viewport can render.
   */
  report: unknown
}

/**
 * Renders a Toolpath Engine report, fetching the mesh it describes.
 *
 * Suspends while the mesh loads and throws its failure, so a caller wraps it in
 * `<Suspense>` and an error boundary rather than threading loading state
 * through props.
 */
export const EnginePart = ({ report, ...props }: EnginePartProps) => {
  const model = useMemo(() => normalizePartReport(report), [report])
  const resource = useGeometryResource(model.mesh)

  useEffect(() => {
    engineGeometryCache.retain(resource)
    return () => engineGeometryCache.release(resource)
  }, [resource])

  return <PartMesh model={model} geometry={resource.geometry!} {...props} />
}

function useGeometryResource(mesh: Parameters<typeof engineGeometryCache.get>[0]) {
  const resource: EngineGeometryResource = engineGeometryCache.get(mesh)
  if (resource.status === 'pending') throw resource.promise
  if (resource.status === 'rejected') throw resource.error
  return resource
}
