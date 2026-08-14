import { Button, Input } from '@toolpath/ui'
import { bandCss } from '../shared/bands'
import { fromDisplay, ruleLimits, toDisplay, unitSuffix } from '../shared/rule-text'
import type { Band, Rule, ThresholdRule } from '../shared/rules'
import { BANDS, bandName } from '../shared/rules'
import type { Unit } from '../shared/units'
import { decimalsFor } from '../shared/units'

/**
 * A rule's numbers, open for changing.
 *
 * Only the numbers. What a rule reads, who it judges and what it is called stay
 * put for now — this is for "that limit is wrong", which is the thing a shop
 * arrives wanting to say, and it is the change that has to be a keystroke away
 * because every one of them re-judges the part behind it.
 *
 * Shown in whichever unit the header is set to and stored in millimetres, which
 * is what lets an inch shop and a metric shop trade a set.
 */
const NumberBox = ({
  id,
  label,
  value,
  metric,
  unit,
  onChange,
}: {
  id: string
  label: string
  value: number | undefined
  metric: Rule['metric']
  unit: Unit
  onChange: (value: number | undefined) => void
}) => (
  <label className="flex min-w-0 flex-1 flex-col gap-1">
    <span className="truncate text-2xs text-zinc-400">{label}</span>
    <Input
      aria-label={label}
      className="h-7 w-full px-2 text-xs tabular-nums"
      id={id}
      inputMode="decimal"
      name={id}
      step="any"
      type="number"
      value={value === undefined ? '' : toDisplay(value, metric, unit).toFixed(decimalsFor(unit))}
      onChange={(event) => {
        const typed = event.target.value.trim()
        // An emptied box is "no refusal", not zero — which would refuse
        // everything the moment somebody cleared the field to retype it.
        onChange(typed === '' ? undefined : fromDisplay(Number(typed), metric, unit))
      }}
    />
  </label>
)

/**
 * The four limits and the refusal, in a row, each labelled by the band it
 * closes — then the spans they add up to, in the band colours.
 *
 * Read left to right the row is the scale itself, which is what a shop is
 * arguing with. The chips underneath are the same numbers as ranges: typing a
 * limit changes two spans at once, and without them the effect of a keystroke
 * is two boxes away from the number being typed.
 */
const Thresholds = ({
  rule,
  unit,
  onChange,
}: {
  rule: ThresholdRule
  unit: Unit
  onChange: (rule: Rule) => void
}) => {
  const names = rule.bandNames

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        {rule.thresholds.map((threshold, at) => (
          <NumberBox
            key={BANDS[at]}
            id={`${rule.id}-band-${at}`}
            label={`${bandName(BANDS[at] as Band, undefined, names)} to`}
            metric={rule.metric}
            onChange={(value) => {
              if (value === undefined) return
              const thresholds = [...rule.thresholds] as ThresholdRule['thresholds']
              thresholds[at] = value
              onChange({ ...rule, thresholds })
            }}
            unit={unit}
            value={threshold}
          />
        ))}

        <NumberBox
          id={`${rule.id}-no-go`}
          label={`${bandName('no go', undefined, names)} past`}
          metric={rule.metric}
          onChange={(value) => {
            // A refusal is optional: without one the scale simply keeps going,
            // and "rats up to 12" is a hard job while "no go past 15" is where
            // it stops being a job at all.
            const { noGo: _dropped, ...rest } = rule
            onChange(value === undefined ? rest : { ...rule, noGo: value })
          }}
          unit={unit}
          value={rule.noGo}
        />
      </div>

      <ul className="flex flex-wrap gap-1">
        {ruleLimits(rule, unit).map((limit) => (
          <li
            key={limit.band}
            className="flex items-center gap-1 rounded bg-zinc-800/70 px-1.5 py-0.5 text-3xs text-zinc-300"
          >
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: bandCss(limit.band) }}
            />
            <span className="tabular-nums">{limit.range}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const RuleNumbers = ({
  rule,
  unit,
  onChange,
}: {
  rule: Rule
  unit: Unit
  onChange: (rule: Rule) => void
}) => (
  <div className="mt-1.5 flex flex-col gap-2 rounded border border-zinc-800 bg-zinc-900/60 p-2">
    {/* The name is a shop's own word for the limit, so it is editable where the
        limit is. Renaming one is how "Milling L/D ratio" becomes "how far the
        cutter hangs out", which is what the people reading it call it. */}
    <label className="flex flex-col gap-1">
      <span className="text-2xs text-zinc-400">what to call it</span>
      <Input
        aria-label={`What to call ${rule.name}`}
        className="h-7 w-full px-2 text-xs"
        id={`${rule.id}-name`}
        name={`${rule.id}-name`}
        value={rule.name}
        onChange={(event) => onChange({ ...rule, name: event.target.value })}
      />
    </label>

    {rule.type === 'threshold' ? <Thresholds onChange={onChange} rule={rule} unit={unit} /> : null}

    {rule.type === 'match' ? (
      <label className="flex flex-col gap-1 text-2xs text-zinc-400">
        {/* A list rather than a scale: 3 mm is a stock bull nose and 2.8 mm is a
            ball endmill crawling over the floor, however close the numbers look. */}
        <span>Sizes held, in {unit}</span>
        <Input
          aria-label="Sizes held"
          className="h-6 px-1.5 text-2xs tabular-nums"
          id={`${rule.id}-standards`}
          name={`${rule.id}-standards`}
          value={rule.standards.map((size) => toDisplay(size, rule.metric, unit)).join(', ')}
          onChange={(event) =>
            onChange({
              ...rule,
              standards: event.target.value
                .split(',')
                .map((piece) => Number(piece.trim()))
                .filter((size) => Number.isFinite(size))
                .map((size) => fromDisplay(size, rule.metric, unit)),
            })
          }
        />
      </label>
    ) : null}

    <div className="flex items-center gap-3">
      <label className="flex items-center gap-1.5 text-2xs text-zinc-400">
        <span>Counts for</span>
        <Input
          aria-label={`How much ${rule.name} counts`}
          className="h-6 w-16 px-1.5 text-2xs tabular-nums"
          id={`${rule.id}-weight`}
          name={`${rule.id}-weight`}
          inputMode="numeric"
          type="number"
          value={rule.weight}
          onChange={(event) => onChange({ ...rule, weight: Number(event.target.value) || 0 })}
        />
      </label>

      <label className="flex items-center gap-1.5 text-2xs text-zinc-400">
        <input
          checked={rule.enabled}
          onChange={(event) => onChange({ ...rule, enabled: event.target.checked })}
          type="checkbox"
        />
        <span>Applies</span>
      </label>
    </div>

    <details>
      <summary className="cursor-pointer text-3xs text-zinc-500 underline decoration-dotted">
        What this shop calls the bands
      </summary>
      <div className="mt-1 flex flex-col gap-1">
        {BANDS.map((band) => (
          <label key={band} className="flex items-center gap-1.5 text-2xs">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: bandCss(band) }}
            />
            <Input
              aria-label={`What to call ${band}`}
              className="h-6 flex-1 px-1.5 text-2xs"
              id={`${rule.id}-name-${band.replace(' ', '-')}`}
              name={`${rule.id}-name-${band.replace(' ', '-')}`}
              placeholder={band}
              value={rule.bandNames?.[band] ?? ''}
              onChange={(event) =>
                onChange({
                  ...rule,
                  bandNames: { ...rule.bandNames, [band]: event.target.value },
                })
              }
            />
          </label>
        ))}
      </div>
    </details>
  </div>
)
