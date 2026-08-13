import { focusForPick, type PartPick } from '@toolpath/viewer'
import { Panels, Tabs } from '@toolpath/ui'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { PublicInspectionReport } from '../shared/contracts'
import { holdFace, sharedReadings } from '../shared/picks'
import { directionLabel, featureFromTags, filterFeatures } from '../shared/report'
import { AppHeader } from './app-header'
import { FeatureDetail } from './feature-detail'
import { FeatureList } from './feature-list'
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
  const [focusedTag, setFocusedTag] = useState<string | null>(null)
  const [hoveredTags, setHoveredTags] = useState<string[]>([])
  const [candidateTags, setCandidateTags] = useState<string[]>([])
  /**
   * The faces being held, most recent last.
   *
   * Held rather than reduced to one answer: the readings that own *all* of them
   * are what a second click is asking for, and that set cannot be recovered
   * from a single tag afterwards.
   */
  const [picks, setPicks] = useState<PartPick[]>([])
  const [activeDirection, setActiveDirection] = useState<number | null>(null)
  const pickedRegion = picks.length === 1 ? (picks[0]?.region ?? null) : null
  const focused = useMemo(
    () => report.features.find((feature) => feature.featureTag === focusedTag) ?? null,
    [focusedTag, report.features],
  )
  const features = useMemo(() => filterFeatures(report.features, query), [query, report.features])
  const candidates = useMemo(
    () => featureFromTags(report.features, candidateTags),
    [candidateTags, report.features],
  )
  /** Naming a feature in the list is a different question from the one a click asked. */
  const choose = (featureTag: string) => {
    setFocusedTag(featureTag)
    setCandidateTags([])
    setPicks([])
  }

  const clearSelection = () => {
    setFocusedTag(null)
    setCandidateTags([])
    setPicks([])
  }

  /**
   * Switching between the readings of the face already clicked.
   *
   * Keeps the candidate list up: it is the control being used, and clearing it
   * on the first press left nothing to switch back with.
   */
  const focusCandidate = (featureTag: string) => setFocusedTag(featureTag)

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
  const pickFromPart = (pick: PartPick | null) => {
    if (!pick) return clearSelection()

    const adding = pick.modifiers.meta || pick.modifiers.ctrl
    const held = adding ? holdFace(picks, pick) : [pick]

    if (held.length === 0) return clearSelection()
    setPicks(held)

    // Several faces held: the readings that own every one of them. Two walls of
    // a pocket resolve to the pocket, which is how you name a reading without
    // hunting for it in a list of eight.
    if (held.length > 1) {
      const shared = sharedReadings(held)
      setCandidateTags(shared)
      setFocusedTag(shared[0] ?? null)
      return
    }

    const next = focusForPick(pick, pickedRegion, focusedTag)
    const unselecting = next !== null && next === focusedTag

    setCandidateTags(unselecting ? [] : [...pick.ranked])
    setFocusedTag(unselecting ? null : next)
    if (unselecting) setPicks([])
  }

  /**
   * Arrow keys walk the readings of the face that was clicked.
   *
   * On the window rather than on the list: the click that produced the
   * candidates left focus on the canvas, and asking somebody to click the list
   * before they can arrow through it defeats the point of the shortcut.
   */
  useEffect(() => {
    if (candidateTags.length < 2) return

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      if (event.key === 'Escape') {
        clearSelection()
        return
      }

      const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
      if (step === 0) return
      event.preventDefault()

      const at = focusedTag === null ? -1 : candidateTags.indexOf(focusedTag)
      const next = (at + step + candidateTags.length) % candidateTags.length
      setFocusedTag(candidateTags[next] ?? null)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const tabPanel =
    tab === 'inspector' ? (
      <aside className="flex size-full min-h-0 flex-col bg-zinc-900/40">
        <div className="border-b border-zinc-800 p-3">
          <label className="sr-only" htmlFor="feature-search">
            Search features
          </label>
          <input
            id="feature-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search type, direction, or tag"
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-info/75"
          />
        </div>
        <FeatureList
          className="min-h-0 flex-1"
          features={features}
          focusedTag={focusedTag}
          candidateTags={candidateTags}
          onChoose={choose}
          onHover={setHoveredTags}
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
        <Panels.Panel defaultSize={300} minSize={220}>
          {tabPanel}
        </Panels.Panel>
        <Panels.Separator className={separatorClassName} />
        <Panels.Panel minSize={400}>
          <FeatureViewer
            activeDirection={activeDirection}
            onPickDirection={(index) =>
              setActiveDirection((current) => (current === index ? null : index))
            }
            report={report}
            jobId={jobId}
            selectedFeatureTag={focusedTag}
            highlightedFeatureTags={hoveredTags}
            onPick={pickFromPart}
          />
        </Panels.Panel>
        <Panels.Separator className={separatorClassName} />
        <Panels.Panel defaultSize={360} minSize={280}>
          {focused || candidates.length ? (
            <FeatureDetail feature={focused} candidates={candidates} onChoose={focusCandidate} />
          ) : null}
        </Panels.Panel>
      </Panels.Group>
    </main>
  )
}
