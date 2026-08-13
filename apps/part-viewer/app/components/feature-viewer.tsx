import {
  Axes,
  DirectionArrows,
  Grid,
  ViewCube,
  Viewer,
  type ViewerHandle,
  sectionFromPick,
} from '@toolpath/viewer'
import { EnginePart } from '@toolpath/viewer/engine'
import {
  ArrowCounterClockwiseIcon,
  CornersOutIcon,
  CrosshairSimpleIcon,
  CubeIcon,
  MouseIcon,
  PerspectiveIcon,
  SquareHalfIcon,
} from '@phosphor-icons/react'
import { Component, Suspense, useMemo, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import type {
  ControlScheme,
  PartPick,
  Projection,
  SectionPlacement,
  SectionState,
} from '@toolpath/viewer'
import { PAINT_MODE_LABELS, type PaintMode, paintWash } from '../shared/paint'
import { ToolButton } from './tool-button'
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

/**
 * The part, showing the one reading being read.
 *
 * The viewer can paint every feature a click could have meant, and this
 * deliberately passes none. A click resolves to five to eight readings, and
 * among them are the direction's `profile` features — a profile traces the
 * whole boundary contour of its direction, so painting the owners of one face
 * washed most of the part and read as though clicking had chained things
 * together. The alternatives are offered in words instead, in the panel beside
 * it, and only the focused reading is coloured.
 */
export const FeatureViewer = ({
  report,
  jobId,
  selectedFeatureTag,
  highlightedFeatureTags,
  heldRegions,
  activeDirection,
  shownDirection,
  paintMode,
  onPaintMode,
  focusFeature,
  onPickDirection,
  onPick,
}: {
  report: PublicInspectionReport
  jobId: string
  selectedFeatureTag: string | null
  /** Features under the pointer in the feature list. */
  highlightedFeatureTags: readonly string[]
  /**
   * The faces being held, painted so a modifier-click has something to aim at.
   *
   * Without them, holding a second face narrows the candidate list and often
   * leaves the same reading painted, so the click looks like it did nothing.
   */
  heldRegions: readonly number[]
  /** Scopes picking to one way up, and shows that arrow on its own. */
  activeDirection: number | null
  /**
   * The way up the feature being read is cut from, shown on its own.
   *
   * A part has up to ten candidate directions and the arrows are large; once
   * one feature is being read, the other nine answer a question nobody asked.
   */
  shownDirection: number | null
  /** The standing wash: what the part is coloured by while nothing is selected. */
  paintMode: PaintMode
  onPaintMode: (mode: PaintMode) => void
  /** A feature to zoom to. Framed when it changes. */
  focusFeature: string | null
  onPickDirection: (index: number) => void
  onPick: (pick: PartPick | null) => void
}) => {
  const viewerRef = useRef<ViewerHandle>(null)
  // The cut is a mode: its handle stands over the part's centre, which is also
  // where an orbit starts, so leaving it on would swallow the gesture.
  const [sectioning, setSectioning] = useState(false)
  const [cut, setCut] = useState(0.35)
  // A cut keyed off a face, rather than swept along an axis. `armed` is the
  // moment between asking for one and clicking the face it starts from.
  const [armed, setArmed] = useState(false)
  const [plane, setPlane] = useState<SectionPlacement | null>(null)
  const [depth, setDepth] = useState(0)
  const [depthRange, setDepthRange] = useState<SectionState['depthRange']>(null)
  const [projection, setProjection] = useState<Projection>('perspective')
  const [scheme, setScheme] = useState<ControlScheme>('toolpath')

  const wash = useMemo(
    () => paintWash(paintMode, report.features, report.candidateDirections),
    [paintMode, report.candidateDirections, report.features],
  )

  const pickInViewport = (pick: PartPick | null) => {
    if (armed && pick) {
      // The click places the cut instead of selecting: it is the question that
      // was just asked, and answering both at once would select whatever the
      // cut is about to hide.
      setPlane(
        sectionFromPick({
          point: { x: pick.point[0], y: pick.point[1], z: pick.point[2] },
          normal: { x: pick.normal[0], y: pick.normal[1], z: pick.normal[2] },
        }),
      )
      setDepth(0)
      setArmed(false)
      return
    }
    onPick(pick)
  }

  const stopSectioning = () => {
    setSectioning(false)
    setArmed(false)
    setPlane(null)
  }
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
    <section className="relative size-full min-h-[32rem] bg-zinc-900">
      <div
        className="absolute left-3 top-3 z-10 flex items-center gap-1.5"
        aria-label="Viewer controls"
      >
        {/* A shelf rather than a toggle: what the part is coloured by is the
            first thing anybody changes, and a switch that hides the other mode
            makes you press it to find out what it was. */}
        <span
          className="flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900/80 p-1"
          role="group"
          aria-label="Colour the part by"
        >
          {PAINT_MODE_LABELS.map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={paintMode === mode}
              onClick={() => onPaintMode(mode)}
              className={`rounded px-2 py-0.5 text-xs font-semibold transition ${
                paintMode === mode
                  ? 'bg-info/20 text-info'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/75`}
            >
              {label}
            </button>
          ))}
        </span>
        <ToolButton
          label={projection === 'perspective' ? 'Perspective view' : 'Orthographic view'}
          onClick={() =>
            setProjection((current) => (current === 'perspective' ? 'orthographic' : 'perspective'))
          }
        >
          {projection === 'perspective' ? <PerspectiveIcon /> : <CubeIcon />}
        </ToolButton>
        <ToolButton
          label={scheme === 'toolpath' ? 'Toolpath controls' : 'Fusion controls'}
          onClick={() => setScheme((current) => (current === 'toolpath' ? 'fusion' : 'toolpath'))}
        >
          <MouseIcon />
        </ToolButton>
        <ToolButton label="Fit to part" onClick={() => viewerRef.current?.fit()}>
          <CornersOutIcon />
        </ToolButton>
        <ToolButton label="Reset the view" onClick={() => viewerRef.current?.reset()}>
          <ArrowCounterClockwiseIcon />
        </ToolButton>
        <ToolButton
          label={sectioning ? 'Section (on)' : 'Section'}
          pressed={sectioning}
          onClick={() => (sectioning ? stopSectioning() : setSectioning(true))}
        >
          <SquareHalfIcon />
        </ToolButton>
        {sectioning ? (
          <>
            <ToolButton
              label={armed ? 'Now click a face' : 'Cut from a face'}
              pressed={armed}
              onClick={() => {
                setArmed((on) => !on)
                setPlane(null)
              }}
            >
              <CrosshairSimpleIcon />
            </ToolButton>
            <label className="flex h-8 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/80 px-3 text-xs text-zinc-300">
              <span className="sr-only">Cut depth</span>
              {plane && depthRange ? (
                <>
                  <input
                    type="range"
                    min={Math.max(0, depthRange.min)}
                    max={depthRange.max}
                    step={0.1}
                    value={depth}
                    onChange={(event) => setDepth(Number(event.target.value))}
                    className="w-32 accent-info"
                  />
                  <span className="w-14 text-right font-mono">{depth.toFixed(1)} mm</span>
                </>
              ) : (
                <>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={cut}
                    onChange={(event) => setCut(Number(event.target.value))}
                    className="w-32 accent-info"
                  />
                  <span className="w-14 text-right font-mono">{Math.round(cut * 100)}%</span>
                </>
              )}
            </label>
          </>
        ) : null}
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
            <Viewer ref={viewerRef} projection={projection} controls={scheme}>
              <EnginePart
                report={viewerReport}
                selection={selectedFeatureTag ? [selectedFeatureTag] : []}
                hoveredFeatureIds={highlightedFeatureTags}
                pickedRegions={heldRegions}
                highlights={wash}
                focusFeature={focusFeature}
                onPick={pickInViewport}
                activeDirection={activeDirection}
                section={{
                  enabled: sectioning,
                  normal: { x: 0, y: 0, z: -1 },
                  offset: cut,
                  plane,
                  depth,
                }}
                onSectionChange={(state) => {
                  // The handle reports its drag through the same path the
                  // sliders write to, so the two never disagree.
                  if (state.plane && state.depth !== null) setDepth(state.depth)
                  else setCut(state.offset)
                  setDepthRange(state.depthRange)
                }}
              />
              <DirectionArrows
                directions={report.candidateDirections}
                activeDirection={activeDirection}
                shownDirection={shownDirection}
                onPickDirection={onPickDirection}
              />
              <Grid />
              <Axes size={35} />
              <ViewCube />
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
