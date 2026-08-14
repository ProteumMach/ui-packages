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
  raw = false,
  onChange,
}: {
  id: string
  label: string
  value: number | undefined
  metric: Rule['metric']
  unit: Unit
  /** Unitless — a weight or a count, which no conversion touches. */
  raw?: boolean
  onChange: (value: number | undefined) => void
}) => (
  <div className="flex min-w-0 flex-col gap-0.5">
    {/* A div rather than a label: the caption names a control that labels
        itself, and two labels for one box is one too many for a screen reader. */}
    <span className="truncate text-2xs text-zinc-400">{label}</span>
    <Input
      aria-label={label}
      className="w-24 tabular-nums"
      id={id}
      inputMode="decimal"
      name={id}
      size="md"
      suffix={raw ? undefined : unitSuffix(metric, unit)}
      type="number"
      // Trailing zeros stripped, which is not cosmetic: rendered as `3.00`, a
      // box rewrites itself between keystrokes — type `1` and it becomes
      // `1.00` with the caret at the end, so the next digit lands after the
      // zeros and typing `12` gives `1.002`.
      value={
        value === undefined
          ? ''
          : String(
              Number(toDisplay(value, raw ? undefined : metric, unit).toFixed(decimalsFor(unit))),
            )
      }
      onChange={(event) => {
        const typed = event.target.value.trim()

        // An emptied box is "no refusal", not zero — which would refuse
        // everything the moment somebody cleared the field to retype it.
        if (typed === '') {
          onChange(undefined)
          return
        }

        const next = Number(typed)
        if (Number.isFinite(next)) onChange(fromDisplay(next, raw ? undefined : metric, unit))
      }}
    />
  </div>
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
  <div className="mt-1.5 flex flex-col gap-2 rounded border border-info/40 bg-info/5 p-2">
    {rule.type === 'threshold' ? <Thresholds onChange={onChange} rule={rule} unit={unit} /> : null}

    {rule.type === 'match' ? (
      <label className="flex flex-col gap-0.5">
        {/* A list rather than a scale: 3 mm is a stock bull nose and 2.8 mm is a
            ball endmill crawling over the floor, however close the numbers look. */}
        <span className="text-2xs text-zinc-400">sizes held, in {unit}</span>
        <Input
          aria-label="Sizes held"
          className="tabular-nums"
          id={`${rule.id}-standards`}
          name={`${rule.id}-standards`}
          size="md"
          value={rule.standards
            .map((size) => Number(toDisplay(size, rule.metric, unit).toFixed(decimalsFor(unit))))
            .join(', ')}
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

    <div className="flex flex-wrap items-end gap-2">
      <NumberBox
        id={`${rule.id}-weight`}
        label="weight"
        metric={undefined}
        onChange={(value) => onChange({ ...rule, weight: value ?? 0 })}
        raw
        unit={unit}
        value={rule.weight}
      />

      {/* A button rather than a checkbox: it says what pressing it does, and
          which state the rule is in now, which a box beside a word leaves you
          to work out. */}
      <Button
        onClick={() => onChange({ ...rule, enabled: !rule.enabled })}
        size="sm"
        title="Stop this rule judging anything, without deleting it"
        variant={rule.enabled ? 'secondary' : 'info'}
      >
        {rule.enabled ? 'switch off' : 'switched off'}
      </Button>
    </div>

    {/* Folded away: a shop's own words for the bands are set once and then left
        alone, and five more boxes open by default is what made this a wall. */}
    <details>
      <summary className="cursor-pointer text-2xs text-zinc-500 underline decoration-dotted">
        what this shop calls the bands
      </summary>
      <div className="mt-1 flex flex-wrap gap-2">
        {BANDS.map((band) => (
          <div key={band} className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1 text-2xs text-zinc-400">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full"
                style={{ background: bandCss(band) }}
              />
              {band}
            </span>
            <Input
              aria-label={`What to call ${band}`}
              className="w-24"
              id={`${rule.id}-name-${band.replace(' ', '-')}`}
              name={`${rule.id}-name-${band.replace(' ', '-')}`}
              placeholder={band}
              size="md"
              value={rule.bandNames?.[band] ?? ''}
              onChange={(event) =>
                onChange({ ...rule, bandNames: { ...rule.bandNames, [band]: event.target.value } })
              }
            />
          </div>
        ))}
      </div>
    </details>
  </div>
)
