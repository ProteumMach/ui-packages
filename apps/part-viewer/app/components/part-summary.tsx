import type { PublicInspectionReport } from '../shared/contracts'
import { duration, partSummary } from '../shared/part-summary'

const Count = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-baseline justify-between gap-4 py-1">
    <span className="text-zinc-400">{label}</span>
    <span className="font-medium tabular-nums text-zinc-100">{value}</span>
  </div>
)

const Heading = ({ children }: { children: string }) => (
  <h3 className="mb-1 mt-5 text-2xs font-bold uppercase tracking-wider text-zinc-500 first:mt-0">
    {children}
  </h3>
)

/**
 * What the Engine found, before anybody has clicked anything.
 *
 * The first question of a report is what is in it, and this answers it in the
 * order it gets asked: how much geometry, which ways up, what kinds of feature,
 * and how long it took to say so.
 */
export const PartSummary = ({
  report,
  activeDirection,
  onPickDirection,
  typeFilter,
  onTypeFilter,
}: {
  report: PublicInspectionReport
  activeDirection: number | null
  onPickDirection: (index: number) => void
  typeFilter: string | null
  onTypeFilter: (type: string | null) => void
}) => {
  const summary = partSummary(report)

  return (
    <div className="p-3 text-xs">
      <Heading>Geometry</Heading>
      <Count label="Features" value={summary.features} />
      <Count label="Regions" value={summary.regions} />
      <Count label="Triangles" value={summary.triangles.toLocaleString()} />
      <Count label="Points" value={summary.points.toLocaleString()} />

      <Heading>Machining directions</Heading>
      <div className="flex flex-wrap gap-1">
        {summary.directions.map((direction) => (
          <button
            key={direction.index}
            type="button"
            aria-pressed={activeDirection === direction.index}
            title={`Only features cut from ${direction.label}`}
            onClick={() => onPickDirection(direction.index)}
            className={`flex items-center gap-1.5 rounded border px-1.5 py-0.5 transition ${
              activeDirection === direction.index
                ? 'border-info bg-info/20 text-info'
                : 'border-zinc-800 text-zinc-300 hover:border-zinc-600'
            }`}
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full"
              style={{ background: DIRECTION_DOTS[direction.index % DIRECTION_DOTS.length] }}
            />
            {direction.label}
            <span className="tabular-nums text-zinc-500">{direction.features}</span>
          </button>
        ))}
      </div>

      <Heading>Candidate features</Heading>
      <ul>
        {summary.types.map((entry) => (
          <li key={entry.type}>
            <button
              type="button"
              aria-pressed={typeFilter === entry.type}
              onClick={() => onTypeFilter(typeFilter === entry.type ? null : entry.type)}
              className={`flex w-full items-baseline justify-between gap-4 rounded px-1 py-1 text-left transition ${
                typeFilter === entry.type
                  ? 'bg-info/15 text-info'
                  : 'text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              <span>{entry.label}</span>
              <span className="font-medium tabular-nums">{entry.features}</span>
            </button>
          </li>
        ))}
      </ul>

      <Heading>Timing</Heading>
      <Count label="Download" value={duration(summary.timing.download)} />
      <Count label="Analysis" value={duration(summary.timing.analysis)} />
      <Count label="Total" value={duration(summary.timing.total)} />
    </div>
  )
}

/**
 * The direction cycle, as CSS.
 *
 * The same nine the viewer paints a direction with, so a chip here and an arrow
 * on the part are the same colour — the palette is an identity, and it stops
 * being one the moment two places disagree about it.
 */
const DIRECTION_DOTS = [
  '#3b82f6',
  '#14b8a6',
  '#d946ef',
  '#06b6d4',
  '#65a30d',
  '#ec4899',
  '#64748b',
  '#10b981',
  '#6366f1',
]
