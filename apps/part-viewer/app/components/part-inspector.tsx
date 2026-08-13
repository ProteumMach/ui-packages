import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { PublicInspectionReport } from '../shared/contracts'
import { featureFromTags, filterFeatures } from '../shared/report'
import { AppHeader } from './app-header'
import { FeatureDetail } from './feature-detail'
import { FeatureList } from './feature-list'
import { FeatureViewer } from './feature-viewer'

export const PartInspector = ({
  report,
  jobId,
}: {
  report: PublicInspectionReport
  jobId: string
}) => {
  const [query, setQuery] = useState('')
  const [focusedTag, setFocusedTag] = useState<string | null>(
    report.features[0]?.featureTag ?? null,
  )
  const [hoveredTags, setHoveredTags] = useState<string[]>([])
  const [candidateTags, setCandidateTags] = useState<string[]>([])
  const features = useMemo(() => filterFeatures(report.features, query), [query, report.features])
  const focused = useMemo(
    () => report.features.find((feature) => feature.featureTag === focusedTag) ?? null,
    [focusedTag, report.features],
  )
  const candidates = useMemo(
    () => featureFromTags(report.features, candidateTags),
    [candidateTags, report.features],
  )
  const highlightedTags = candidateTags.length ? candidateTags : hoveredTags

  const choose = (featureTag: string) => {
    setFocusedTag(featureTag)
    setCandidateTags([])
  }

  const selectMeshFeatures = (featureTags: string[]) => {
    setCandidateTags(featureTags)
    if (featureTags.length === 1) choose(featureTags[0])
  }

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <AppHeader
        className="border-b border-zinc-800 px-4 py-3"
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

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(17rem,0.85fr)_minmax(30rem,2fr)_minmax(18rem,0.9fr)]">
        <aside className="min-h-[18rem] border-b border-zinc-800 lg:min-h-0 lg:border-b-0 lg:border-r">
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
            features={features}
            focusedTag={focusedTag}
            candidateTags={candidateTags}
            onChoose={choose}
            onHover={setHoveredTags}
          />
        </aside>

        <FeatureViewer
          report={report}
          jobId={jobId}
          selectedFeatureTag={focusedTag}
          highlightedFeatureTags={highlightedTags}
          onFeatureClick={selectMeshFeatures}
        />

        <FeatureDetail feature={focused} candidates={candidates} onChoose={choose} />
      </div>
    </main>
  )
}
