import { Axes, Grid, OrientationCube, Viewer, type ViewerHandle } from '@toolpath/viewer'
import { EnginePart } from '@toolpath/viewer/engine'
import { Button } from '@toolpath/ui'
import { Component, Suspense, useMemo, useRef } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import type { PartReport, PublicInspectionReport } from '../shared/contracts'

class MeshErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  render() {
    if (this.state.error) {
      return (
        <div className="grid size-full place-items-center p-8 text-center text-sm text-zinc-400">
          <p>The mesh could not be loaded. The feature list is still available.</p>
        </div>
      )
    }
    return this.props.children
  }
}

const meshUrl = (partId: string, jobId: string, format: 'glb' | 'stl'): string =>
  `/api/parts/${encodeURIComponent(partId)}/mesh?${new URLSearchParams({ jobId, format })}`

export const FeatureViewer = ({
  report,
  jobId,
  selectedFeatureTag,
  candidateFeatureTags,
  highlightedFeatureTags,
  onFeatureClick,
}: {
  report: PublicInspectionReport
  jobId: string
  selectedFeatureTag: string | null
  /** Every feature the last click on the part could have meant. */
  candidateFeatureTags: readonly string[]
  /** Features under the pointer in the feature list. */
  highlightedFeatureTags: readonly string[]
  onFeatureClick: (featureTags: string[]) => void
}) => {
  const viewerRef = useRef<ViewerHandle>(null)
  const viewerReport = useMemo<PartReport>(
    () => ({
      ...report,
      meshGlbUrl: report.hasMeshGlb ? meshUrl(report.partId, jobId, 'glb') : null,
      meshStlUrl: report.hasMeshStl ? meshUrl(report.partId, jobId, 'stl') : null,
      thumbnailUrl: null,
    }),
    [jobId, report],
  )

  return (
    <section className="relative min-h-[32rem] border-b border-zinc-800 bg-zinc-900 lg:min-h-0 lg:border-b-0">
      <div className="absolute left-3 top-3 z-10 flex gap-2" aria-label="Viewer controls">
        <Button size="sm" variant="secondary" onClick={() => viewerRef.current?.fit()}>
          Fit
        </Button>
        <Button size="sm" variant="secondary" onClick={() => viewerRef.current?.reset()}>
          Reset
        </Button>
      </div>
      {report.hasMeshGlb || report.hasMeshStl ? (
        <MeshErrorBoundary key={`${report.partId}:${jobId}`}>
          <Suspense
            fallback={
              <div className="grid size-full place-items-center text-sm text-zinc-400">
                Loading mesh…
              </div>
            }
          >
            <Viewer ref={viewerRef}>
              <EnginePart
                report={viewerReport}
                selection={selectedFeatureTag ? [selectedFeatureTag] : []}
                candidates={candidateFeatureTags}
                hoveredFeatureIds={highlightedFeatureTags}
                onFeatureClick={(event) => onFeatureClick([...event.featureIds])}
                showEdges={false}
              />
              <Grid size={100} divisions={20} />
              <Axes size={35} />
              <OrientationCube />
            </Viewer>
          </Suspense>
        </MeshErrorBoundary>
      ) : (
        <div className="grid size-full place-items-center p-8 text-center text-sm text-zinc-400">
          This report has no viewable mesh. Its feature data is still available.
        </div>
      )}
    </section>
  )
}
