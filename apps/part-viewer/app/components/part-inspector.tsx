import { directionIndexOf, sameDirection, type PartPick } from '@toolpath/viewer'
import { type Arrows, arrowsVisible, shownArrow } from '../shared/arrows'
import { type PaintMode, loadPaintMode, savePaintMode } from '../shared/paint'
import { type Unit, loadUnit, saveUnit } from '../shared/units'
import { Panels, Tabs } from '@toolpath/ui'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { PublicInspectionReport } from '../shared/contracts'
import {
  NOTHING_SELECTED,
  type SelectionState,
  heldRegions,
  isEmptySelection,
  pickFace,
  scopeToDirection,
  stepCandidate,
} from '../shared/selection'
import { directionLabel, featureFromTags, filterFeatures } from '../shared/report'
import { AppHeader } from './app-header'
import { FeatureDetail } from './feature-detail'
import { PartSummary } from './part-summary'
import { FeatureViewer } from './feature-viewer'

type ViewerTab = 'inspector' | 'directions'

const separatorClassName =
  "relative z-20 w-px cursor-col-resize hover:border-info data-[separator=active]:border-info before:absolute before:inset-y-0 before:-left-[5px] before:-right-[5px] before:content-['']"

export const PartInspector = ({
  report,
  jobId,
}: {
  report: PublicInspectionReport
  jobId: string
}) => {
  const [tab, setTab] = useState<ViewerTab>('inspector')
  const [query, setQuery] = useState('')
  const [hoveredTags, setHoveredTags] = useState<string[]>([])
  const [selection, setSelection] = useState<SelectionState>(NOTHING_SELECTED)
  const [activeDirection, setActiveDirection] = useState<number | null>(null)
  const [paintMode, setPaintMode] = useState<PaintMode>('plain')
  const [arrows, setArrows] = useState<Arrows>('off')
  const [focusFeature, setFocusFeature] = useState<string | null>(null)

  // Read after mount rather than during render: the server has no localStorage,
  // and a mode that differed between the two would hydrate as a flash of the
  // wrong colours.
  useEffect(() => {
    setPaintMode(loadPaintMode(globalThis.localStorage ?? null))
  }, [])

  /**
   * Pressing an arrow holds that way up — and re-reads whatever faces are
   * already held from it, rather than putting them down. Pressing it again
   * lets go, and the faces are read again unscoped.
   */
  const holdDirection = (index: number) => {
    const holding = activeDirection === index ? null : index
    setActiveDirection(holding)
    // Narrow the arrows to the one being held. Left showing all of them,
    // pressing an arrow changed nothing anybody could see, and a filter with no
    // sign of itself reads as a click that missed.
    if (holding !== null) setArrows('off')

    const direction = holding === null ? null : report.candidateDirections[holding]
    setSelection((current) =>
      scopeToDirection(current, (tag) => {
        if (!direction) return true
        const feature = report.features.find((each) => each.featureTag === tag)
        return feature ? sameDirection(feature.machiningDirection, direction) : false
      }),
    )
  }

  /**
   * A zoom is a request rather than a state, so the same feature twice has to
   * read as two requests — the viewer frames on change, and a repeated value is
   * not one.
   */
  const zoomToFeature = (featureTag: string) => {
    setFocusFeature(null)
    requestAnimationFrame(() => setFocusFeature(featureTag))
  }

  const choosePaintMode = (mode: PaintMode) => {
    setPaintMode(mode)
    savePaintMode(globalThis.localStorage ?? null, mode)
  }
  const candidateTags = selection.candidates
  const focusedTag = selection.focused
  const focused = useMemo(
    () => report.features.find((feature) => feature.featureTag === focusedTag) ?? null,
    [focusedTag, report.features],
  )
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [unit, setUnit] = useState<Unit>('mm')
  const features = useMemo(() => filterFeatures(report.features, query), [query, report.features])

  // Read after mount, like the paint mode: the server has no localStorage, and
  // a unit that differed between the two would hydrate as a flash of the wrong
  // numbers.
  useEffect(() => {
    setUnit(loadUnit(globalThis.localStorage ?? null))
  }, [])

  const chooseUnit = (next: Unit) => {
    setUnit(next)
    saveUnit(globalThis.localStorage ?? null, next)
  }
  /**
   * Once a feature is being read, its own way up is the only one worth drawing.
   * An explicit direction still wins: choosing one is a question about that
   * direction, and it stays on screen while readings are looked at within it.
   */
  const arrowContext = useMemo(() => {
    const index = focused ? directionIndexOf(report, focused.machiningDirection) : -1
    return { focusedDirection: index === -1 ? null : index, activeDirection }
  }, [activeDirection, focused, report])
  const candidates = useMemo(
    () => featureFromTags(report.features, candidateTags),
    [candidateTags, report.features],
  )
  /** Naming a feature in the list is a different question from the one a click asked. */
  const choose = (featureTag: string) => {
    setSelection({ picks: [], candidates: [], focused: featureTag })
  }

  /**
   * Switching between the readings of the face already clicked.
   *
   * Keeps the candidate list up: it is the control being used, and clearing it
   * on the first press left nothing to switch back with.
   */
  const focusCandidate = (featureTag: string) =>
    setSelection((current) => ({ ...current, focused: featureTag }))

  /**
   * A click on the part offers its readings rather than deciding between them.
   * The best one is focused so there is something to read, and clicking the
   * same face again walks the rest — the list beside it is how you pick another
   * outright.
   *
   * A click that lands back on the reading already being read clears it. On a
   * face with one reading that makes a click a toggle; on a face with eight it
   * is the end of the cycle, which is the point at which walking them again
   * would say nothing new.
   */
  const pickFromPart = (pick: PartPick) => setSelection((current) => pickFace(current, pick))

  /**
   * Arrow keys walk the readings of the face that was clicked.
   *
   * On the window rather than on the list: the click that produced the
   * candidates left focus on the canvas, and asking somebody to click the list
   * before they can arrow through it defeats the point of the shortcut.
   */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      // A list under the pointer walks itself; this is the shortcut for when
      // focus is still on the canvas that produced the candidates.
      if (target?.closest('[data-keynav]')) return

      // Escape works outward: the selection first, then the direction being
      // worked in. Clearing both at once throws away a scope somebody set
      // deliberately along with the click they are undoing.
      if (event.key === 'Escape') {
        if (isEmptySelection(selection)) setActiveDirection(null)
        else setSelection(NOTHING_SELECTED)
        return
      }

      const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
      if (step === 0) return
      event.preventDefault()
      setSelection((current) => stepCandidate(current, step))
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selection])

  const tabPanel =
    tab === 'inspector' ? (
      <aside className="flex size-full min-h-0 flex-col overflow-y-auto bg-zinc-900/40">
        <PartSummary
          report={report}
          features={features}
          activeDirection={activeDirection}
          onPickDirection={holdDirection}
          expandedType={expandedType}
          onExpandType={setExpandedType}
          focusedTag={focusedTag}
          candidateTags={candidateTags}
          onChoose={choose}
          onHover={setHoveredTags}
          unit={unit}
          onUnit={chooseUnit}
          query={query}
          onQuery={setQuery}
        />
      </aside>
    ) : (
      <aside className="size-full overflow-y-auto bg-zinc-900/40 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-info">Directions</p>
        <h2 className="mt-1 font-display text-2xl font-bold">Machining directions</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Direction labels describe each feature&apos;s machining axis in the part coordinate
          system. Select a feature in Inspector or on the viewer to inspect its direction.
        </p>
        {focused ? (
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-zinc-500">Direction</dt>
              <dd className="font-medium text-zinc-200">
                {directionLabel(focused.machiningDirection)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-zinc-500">X axis</dt>
              <dd className="font-medium text-zinc-200">
                {focused.machiningDirection.x.toFixed(2)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-zinc-500">Y axis</dt>
              <dd className="font-medium text-zinc-200">
                {focused.machiningDirection.y.toFixed(2)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-zinc-500">Z axis</dt>
              <dd className="font-medium text-zinc-200">
                {focused.machiningDirection.z.toFixed(2)}
              </dd>
            </div>
          </dl>
        ) : null}
      </aside>
    )

  return (
    <main className="flex h-screen min-h-0 flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <AppHeader
        className="border-b border-zinc-800 px-4 py-3"
        navigation={
          <Tabs value={tab} onValueChange={(value) => setTab(value as ViewerTab)}>
            <Tabs.List>
              <Tabs.Tab value="inspector">Inspector</Tabs.Tab>
              <Tabs.Tab value="directions">Directions</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        }
        actions={
          <div className="flex items-center gap-4">
            <div className="text-right text-xs text-zinc-500">
              <p>{report.features.length} recognized features</p>
              <p className="font-mono">{report.partId}</p>
            </div>
            <Link
              className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
              to="/"
            >
              Upload another part
            </Link>
          </div>
        }
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-info">Toolpath</p>
        <h1 className="font-display text-xl font-bold">Part Viewer</h1>
      </AppHeader>

      <Panels.Group className="min-h-0 flex-1" orientation="horizontal">
        <Panels.Panel defaultSize={460} minSize={260}>
          {tabPanel}
        </Panels.Panel>
        <Panels.Separator className={separatorClassName} />
        <Panels.Panel minSize={400}>
          <FeatureViewer
            activeDirection={activeDirection}
            onPickDirection={(index) => holdDirection(index)}
            report={report}
            jobId={jobId}
            selectedFeatureTag={focusedTag}
            highlightedFeatureTags={hoveredTags}
            heldRegions={heldRegions(selection)}
            shownDirection={shownArrow(arrows, arrowContext)}
            arrows={arrows}
            onArrows={setArrows}
            arrowsVisible={arrowsVisible(arrows, arrowContext)}
            paintMode={paintMode}
            onPaintMode={choosePaintMode}
            focusFeature={focusFeature}
            onPick={pickFromPart}
            onClearSelection={() => setSelection(NOTHING_SELECTED)}
          />
        </Panels.Panel>
        <Panels.Separator className={separatorClassName} />
        <Panels.Panel defaultSize={460} minSize={320}>
          <FeatureDetail
            feature={focused}
            report={report}
            candidates={candidates}
            onChoose={focusCandidate}
            onZoom={zoomToFeature}
            onClose={() => setSelection(NOTHING_SELECTED)}
            unit={unit}
          />
        </Panels.Panel>
      </Panels.Group>
    </main>
  )
}
