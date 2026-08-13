import type { PartFeature } from '../shared/report'
import { classNames } from '../shared/class-names'
import { featureSummary } from '../shared/report'

export const FeatureList = ({
  features,
  focusedTag,
  candidateTags,
  onChoose,
  onHover,
  className,
}: {
  features: readonly PartFeature[]
  focusedTag: string | null
  candidateTags: readonly string[]
  onChoose: (featureTag: string) => void
  onHover: (featureTags: string[]) => void
  className?: string
}) => (
  <div className={classNames('overflow-y-auto', className)}>
    {features.length ? (
      features.map((feature) => {
        const summary = featureSummary(feature)
        return (
          <button
            key={feature.featureTag}
            type="button"
            className={classNames(
              'flex w-full items-center gap-3 border-b border-zinc-800 px-3 py-3 text-left transition duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info/75',
              feature.featureTag === focusedTag && 'bg-info/15',
              feature.featureTag !== focusedTag &&
                candidateTags.includes(feature.featureTag) &&
                'bg-warning/10',
              feature.featureTag !== focusedTag &&
                !candidateTags.includes(feature.featureTag) &&
                'hover:bg-zinc-900',
            )}
            onMouseEnter={() => onHover([feature.featureTag])}
            onMouseLeave={() => onHover([])}
            onFocus={() => onHover([feature.featureTag])}
            onBlur={() => onHover([])}
            onClick={() => onChoose(feature.featureTag)}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{summary.type}</span>
              <span className="mt-0.5 block truncate font-mono text-2xs text-zinc-500">
                {summary.tag}
              </span>
            </span>
            <span className="shrink-0 text-right text-xs text-zinc-400">
              <span className="block">{summary.headline ?? `${summary.regionCount} regions`}</span>
              <span className="block text-2xs text-zinc-600">{summary.direction}</span>
            </span>
          </button>
        )
      })
    ) : (
      <p className="p-4 text-sm text-zinc-500">No features match this search.</p>
    )}
  </div>
)
