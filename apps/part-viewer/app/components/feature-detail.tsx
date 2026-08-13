import { Badge, Button } from '@toolpath/ui'
import type { PartFeature } from '../shared/report'
import { featureDetailRows, featureSummary, rawDatasheet } from '../shared/report'

export const FeatureDetail = ({
  feature,
  candidates,
  onChoose,
}: {
  feature: PartFeature | null
  candidates: readonly PartFeature[]
  onChoose: (featureTag: string) => void
}) => (
  <aside className="h-full min-h-0 overflow-y-auto bg-zinc-900/40 p-4">
    {candidates.length > 1 ? (
      <section className="mb-6 rounded-lg border border-warning/40 bg-warning/10 p-3">
        <h2 className="text-sm font-bold text-zinc-100">Choose feature</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          This mesh region belongs to multiple recognized features.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {candidates.map((candidate) => (
            <Button
              key={candidate.featureTag}
              size="sm"
              variant={candidate.featureTag === feature?.featureTag ? 'info' : 'secondary'}
              onClick={() => onChoose(candidate.featureTag)}
            >
              {featureSummary(candidate).type}
            </Button>
          ))}
        </div>
      </section>
    ) : null}
    {feature ? (
      <section>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-info">Focused feature</p>
            <h2 className="mt-1 font-display text-2xl font-bold">{featureSummary(feature).type}</h2>
          </div>
          <Badge variant="secondary">{featureSummary(feature).direction}</Badge>
        </div>
        <dl className="mt-6 space-y-3 text-sm">
          {featureDetailRows(feature).map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4">
              <dt className="text-zinc-500">{row.label}</dt>
              <dd className="max-w-[58%] break-all text-right font-medium text-zinc-200">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        <details className="mt-7 rounded-lg border border-zinc-800 bg-zinc-950/50">
          <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">
            Raw datasheet
          </summary>
          <pre className="max-h-80 overflow-auto border-t border-zinc-800 p-3 text-2xs leading-5 text-zinc-400">
            {rawDatasheet(feature)}
          </pre>
        </details>
      </section>
    ) : (
      <p className="text-sm text-zinc-500">Select a feature from the list or mesh to inspect it.</p>
    )}
  </aside>
)
