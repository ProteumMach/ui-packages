import { useState } from 'react'
import type { ReactNode } from 'react'
import { CaretDownIcon, PencilSimpleIcon } from '@phosphor-icons/react'
import { Button, Input } from '@toolpath/ui'
import { bandCss } from '../shared/bands'
import { KindIcon } from './feature-icons'
import { METRICS } from '../shared/metrics'
import type { RuleHit } from '../shared/rule-text'
import { costlyCount, worstOf } from '../shared/rules-summary'
import type { FeatureScore } from '../shared/feature-score'
import { ScoreBadge } from './score-badge'
import {
  displayDecimals,
  formatMetric,
  fromDisplay,
  ruleLimits,
  toDisplay,
  unitSuffix,
} from '../shared/rule-text'
import type { Band, FlagRule, Rule, RuleType, ThresholdRule } from '../shared/rules'
import { BANDS, FLAG_TESTS, RULE_TYPES, asType, bandName } from '../shared/rules'
import type { Unit } from '../shared/units'
import { decimalsFor } from '../shared/units'

/**
 * A rule, editable.
 *
 * The limits are on the row itself rather than behind a press: moving one is
 * the thing a shop is here to do, and putting the commonest change behind a
 * click makes every other change look equally likely. Everything that is
 * decided once — what it reads, who it judges, its shape, its arithmetic —
 * lives under `more`.
 */

const SELECT =
  'h-7 rounded border border-zinc-700 bg-transparent px-1.5 text-2xs text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-info'

/**
 * A number being typed, which is not the same thing as a number.
 *
 * A controlled box that re-renders the parsed value cannot hold what somebody
 * is halfway through typing: `0.` parses to 0 and comes back as "0", taking the
 * point with it, so `0.156` is unreachable — the box eats the keystroke that
 * would have got there. And rounding the value for display fights the same
 * fight, turning `0.156` into `0.2` between one digit and the next.
 *
 * So while a box has focus it shows exactly what was typed, and only the parsed
 * value leaves. On blur the draft is dropped and the stored number comes back
 * formatted, which is where rounding belongs.
 */
const NumberBox = ({
  id,
  label,
  band,
  placeholder,
  value,
  metric,
  unit,
  raw = false,
  width = 'w-24',
  onChange,
}: {
  id: string
  label: string
  band?: Band | undefined
  /** What an empty box says, where empty is a real answer. */
  placeholder?: string | undefined
  value: number | undefined
  metric: Rule['metric']
  unit: Unit
  /** Unitless — a weight or a count, which no conversion touches. */
  raw?: boolean
  width?: string
  onChange: (value: number | undefined) => void
}) => {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = raw ? undefined : metric

  // Four decimals, trailing zeros stripped: enough for a thousandth of an inch
  // with room under it, and never more digits than the number has.
  const settled =
    value === undefined ? '' : String(Number(toDisplay(value, shown, unit).toFixed(raw ? 0 : 4)))

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      {/* A div rather than a label: the caption names a control that labels
          itself, and two labels on one box is one too many for a screen reader. */}
      <span className="flex items-center gap-1 truncate text-2xs text-zinc-400">
        {band ? (
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full"
            style={{ background: bandCss(band) }}
          />
        ) : null}
        {label}
      </span>
      <Input
        aria-label={label}
        className={`${width} tabular-nums`}
        id={id}
        inputMode="decimal"
        name={id}
        placeholder={placeholder}
        size="md"
        suffix={raw ? undefined : unitSuffix(metric, unit)}
        type="text"
        value={draft ?? settled}
        onBlur={() => setDraft(null)}
        onChange={(event) => {
          const typed = event.target.value
          setDraft(typed)

          if (typed.trim() === '') {
            // An emptied box is "not set", not zero — which would refuse
            // everything the moment somebody cleared the field to retype it.
            onChange(undefined)
            return
          }

          const next = Number(typed)
          // A half-typed number — "0.", "-", "1e" — is not a change of mind, so
          // the last good value stands until the next digit lands.
          if (Number.isFinite(next)) onChange(fromDisplay(next, shown, unit))
        }}
      />
    </div>
  )
}

/**
 * A limit and the span it makes, in one column.
 *
 * The span sits under the box that sets it and shares its width, so the two
 * stay together when the panel is narrowed and the row wraps — a range that
 * reflows out from under its own number is worse than no range at all. Italic
 * and small because it is derived: it says what the number above it means, and
 * it is not another thing to type into.
 */
const ThresholdColumn = ({ range, children }: { range?: string; children: ReactNode }) => (
  <div className="flex w-24 flex-col gap-0.5">
    {children}
    <span className="truncate text-2xs italic tabular-nums text-zinc-500" title={range}>
      {range}
    </span>
  </div>
)

/** The five bands as dots, named on hover — one line, whatever the width. */
const BandDots = ({ rule, unit }: { rule: Rule; unit: Unit }) => {
  const limits = ruleLimits(rule, unit)

  if (limits.length === 0) return null

  return (
    <ul className="flex flex-wrap items-center gap-1">
      {limits.map((limit) => (
        <li
          key={limit.band}
          className="flex shrink-0 items-center gap-1 rounded bg-zinc-900 px-1.5 py-0.5 text-2xs tabular-nums text-zinc-300"
          title={`${limit.name} ${limit.range}`}
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full"
            style={{ background: bandCss(limit.band) }}
          />
          {limit.range}
        </li>
      ))}
    </ul>
  )
}

/** The limits themselves, always open. */
const Limits = ({
  rule,
  unit,
  onChange,
}: {
  rule: Rule
  unit: Unit
  onChange: (rule: Rule) => void
}) => {
  if (rule.type === 'threshold') {
    const write = (at: number, value: number | undefined) => {
      if (value === undefined) return
      const thresholds = [...rule.thresholds] as ThresholdRule['thresholds']
      thresholds[at] = value
      onChange({ ...rule, thresholds })
    }

    const limits = ruleLimits(rule, unit)

    return (
      <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
        {rule.thresholds.map((threshold, at) => (
          <ThresholdColumn key={BANDS[at]} range={limits[at]?.range}>
            <NumberBox
              band={BANDS[at]}
              id={`${rule.id}-band-${at}`}
              label={`${bandName(BANDS[at] as Band, undefined, rule.bandNames)} to`}
              metric={rule.metric}
              onChange={(value) => write(at, value)}
              unit={unit}
              value={threshold}
            />
          </ThresholdColumn>
        ))}
        <ThresholdColumn range={limits.at(-1)?.range}>
          <NumberBox
            band="no go"
            id={`${rule.id}-no-go`}
            label={`${bandName('no go', undefined, rule.bandNames)} past`}
            metric={rule.metric}
            onChange={(value) => {
              const { noGo: _dropped, ...rest } = rule
              onChange(value === undefined ? rest : { ...rule, noGo: value })
            }}
            placeholder="none"
            unit={unit}
            value={rule.noGo}
          />
        </ThresholdColumn>
      </div>
    )
  }

  if (rule.type === 'range') {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {rule.spans.map((span, at) =>
          ([0, 1] as const).map((edge) => (
            <NumberBox
              key={`${BANDS[at]}-${edge}`}
              id={`${rule.id}-span-${at}-${edge}`}
              label={`${BANDS[at]} ${edge === 0 ? 'from' : 'to'}`}
              metric={rule.metric}
              onChange={(value) => {
                const spans = [...rule.spans] as typeof rule.spans
                const [from, to] = span
                spans[at] = edge === 0 ? [value ?? 0, to] : [from, value ?? 0]
                onChange({ ...rule, spans })
              }}
              unit={unit}
              value={span[edge]}
            />
          )),
        )}
      </div>
    )
  }

  if (rule.type === 'match') {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <Input
          aria-label="Sizes held"
          className="min-w-40 flex-1 tabular-nums"
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
        <NumberBox
          id={`${rule.id}-tolerance`}
          label="within"
          metric={rule.metric}
          onChange={(value) => onChange({ ...rule, tolerance: value ?? 0 })}
          unit={unit}
          value={rule.tolerance}
        />
      </div>
    )
  }

  if (rule.type === 'flag') {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <select
          aria-label="Test"
          className={SELECT}
          value={rule.op ?? '≠'}
          onChange={(event) => onChange({ ...rule, op: event.target.value as FlagRule['op'] })}
        >
          {FLAG_TESTS.map((test) => (
            <option key={test} value={test}>
              {test}
            </option>
          ))}
        </select>
        <NumberBox
          id={`${rule.id}-against`}
          label="against"
          metric={rule.metric}
          onChange={(value) => onChange({ ...rule, against: value ?? 0 })}
          unit={unit}
          value={typeof rule.against === 'number' ? rule.against : 0}
        />
        <BandSelect
          id={`${rule.id}-raises`}
          label="raises"
          onChange={(raises) => onChange({ ...rule, raises })}
          value={rule.raises}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {Object.entries(rule.bands).map(([type, band]) => (
        <span key={type} className="flex items-center gap-1 text-2xs text-zinc-400">
          {type.replaceAll('_', ' ')}
          <BandSelect
            id={`${rule.id}-baseline-${type}`}
            label={`${type} starts at`}
            onChange={(next) => onChange({ ...rule, bands: { ...rule.bands, [type]: next } })}
            value={band as Band}
          />
        </span>
      ))}
    </div>
  )
}

/**
 * A band, chosen.
 *
 * Carries the band's own colour, because a column of identical dropdowns
 * reading "rats rats rats meh" is a list somebody has to read word by word to
 * find the one that differs.
 */
const BandSelect = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: Band
  onChange: (band: Band) => void
}) => (
  <span className="inline-flex items-center gap-1">
    <span
      aria-hidden="true"
      className="size-1.5 shrink-0 rounded-full"
      style={{ background: bandCss(value) }}
    />
    <select
      aria-label={label}
      className={SELECT}
      id={id}
      onChange={(event) => onChange(event.target.value as Band)}
      style={{ color: bandCss(value) }}
      value={value}
    >
      {BANDS.map((band) => (
        <option key={band} className="text-zinc-200" value={band}>
          {band}
        </option>
      ))}
    </select>
  </span>
)

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-2xs text-zinc-400">{label}</span>
    {children}
  </div>
)

/** Every part of a rule, in the shape the feature picker settled on. */
const Settings = ({
  rule,
  types,
  unit,
  onChange,
  onRemove,
}: {
  rule: Rule
  types: readonly string[]
  unit: Unit
  onChange: (rule: Rule) => void
  onRemove: () => void
}) => {
  const chosen = new Set(rule.featureTypes)
  const metric = rule.type === 'baseline' ? undefined : rule.metric

  return (
    <div className="ml-4 mt-1 flex flex-col gap-2 rounded border border-info/40 bg-info/5 p-2">
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Name">
          <Input
            aria-label="Rule name"
            className="w-48"
            id={`${rule.id}-name`}
            name={`${rule.id}-name`}
            size="md"
            value={rule.name}
            onChange={(event) => onChange({ ...rule, name: event.target.value })}
          />
        </Field>

        <NumberBox
          id={`${rule.id}-weight`}
          label="Weight"
          metric={undefined}
          onChange={(value) => onChange({ ...rule, weight: value ?? 0 })}
          raw
          unit={unit}
          value={rule.weight}
          width="w-16"
        />

        <Field label="Shape">
          <select
            aria-label="Rule shape"
            className={SELECT}
            onChange={(event) => onChange(asType(rule, event.target.value as RuleType))}
            value={rule.type}
          >
            {RULE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Reads">
          {/* A baseline reads the kind of feature rather than a measurement.
              Saying so here beats hiding the control: "what does this rule
              read" is asked of every rule, and a gap where the answer should be
              reads as a control somebody forgot to fill in. */}
          {rule.type === 'baseline' ? (
            <select aria-label="Measurement" className={`${SELECT} max-w-64`} disabled value="type">
              <option value="type">The kind of feature</option>
            </select>
          ) : (
            <select
              aria-label="Measurement"
              className={`${SELECT} max-w-64`}
              onChange={(event) => onChange({ ...rule, metric: event.target.value as never })}
              value={rule.metric}
            >
              {METRICS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                  {entry.field ? ` — ${entry.field}` : ''}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      {rule.type === 'threshold' ? (
        <div className="flex flex-wrap items-end gap-2">
          <Field label="Direction">
            <select
              aria-label="Which way the numbers get worse"
              className={SELECT}
              onChange={(event) =>
                onChange({ ...rule, direction: event.target.value as ThresholdRule['direction'] })
              }
              value={rule.direction}
            >
              <option value="higher is harder">higher is harder</option>
              <option value="lower is harder">lower is harder</option>
            </select>
          </Field>

          <Limits onChange={onChange} rule={rule} unit={unit} />
        </div>
      ) : null}

      {rule.type === 'range' ? (
        <div className="flex flex-col gap-1">
          {rule.spans.map((span, at) => (
            <div key={BANDS[at]} className="flex items-center gap-2">
              <span className="flex w-16 items-center gap-1 text-2xs text-zinc-300">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full"
                  style={{ background: bandCss(BANDS[at] ?? null) }}
                />
                {BANDS[at]}
              </span>
              <NumberBox
                id={`${rule.id}-span-${at}-from`}
                label={`${BANDS[at]} from`}
                metric={metric}
                onChange={(value) => {
                  const spans = [...rule.spans] as typeof rule.spans
                  spans[at] = [value ?? 0, span[1]]
                  onChange({ ...rule, spans })
                }}
                unit={unit}
                value={span[0]}
              />
              <span className="text-2xs text-zinc-500">to</span>
              <NumberBox
                id={`${rule.id}-span-${at}-to`}
                label={`${BANDS[at]} to`}
                metric={metric}
                onChange={(value) => {
                  const spans = [...rule.spans] as typeof rule.spans
                  spans[at] = [span[0], value ?? 0]
                  onChange({ ...rule, spans })
                }}
                unit={unit}
                value={span[1]}
              />
            </div>
          ))}
          <label className="flex items-center gap-1.5 text-2xs text-zinc-300">
            <input
              checked={rule.refuseOutside}
              className="size-3 accent-info"
              onChange={(event) => onChange({ ...rule, refuseOutside: event.target.checked })}
              type="checkbox"
            />
            Outside every span is a no go
          </label>
        </div>
      ) : null}

      {rule.type === 'match' ? (
        <div className="flex flex-col gap-2">
          <Field label="Sizes held">
            <div className="flex flex-wrap items-center gap-1">
              {rule.standards.map((size, at) => (
                <span key={`${size}-${at}`} className="flex items-center gap-0.5">
                  <NumberBox
                    id={`${rule.id}-size-${at}`}
                    label={`Size ${at + 1}`}
                    metric={metric}
                    onChange={(value) => {
                      const standards = [...rule.standards]
                      standards[at] = value ?? 0
                      onChange({ ...rule, standards })
                    }}
                    unit={unit}
                    value={size}
                  />
                  <button
                    aria-label={`Remove size ${at + 1}`}
                    className="px-0.5 text-2xs text-zinc-500 hover:text-danger"
                    onClick={() =>
                      onChange({ ...rule, standards: rule.standards.filter((_, i) => i !== at) })
                    }
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ))}
              <Button
                onClick={() => onChange({ ...rule, standards: [...rule.standards, 0] })}
                size="sm"
                variant="secondary"
              >
                Add size
              </Button>
            </div>
          </Field>

          <div className="flex flex-wrap items-end gap-2">
            <NumberBox
              id={`${rule.id}-tolerance`}
              label="Tolerance"
              metric={metric}
              onChange={(value) => onChange({ ...rule, tolerance: value ?? 0 })}
              unit={unit}
              value={rule.tolerance}
            />
            <Field label="On the list">
              <BandSelect
                id={`${rule.id}-matched`}
                label="Where a match lands"
                onChange={(matched) => onChange({ ...rule, matched })}
                value={rule.matched}
              />
            </Field>
            <Field label="Off the list">
              <BandSelect
                id={`${rule.id}-unmatched`}
                label="Where anything else lands"
                onChange={(unmatched) => onChange({ ...rule, unmatched })}
                value={rule.unmatched}
              />
            </Field>
          </div>
        </div>
      ) : null}

      {rule.type === 'flag' ? (
        <div className="flex flex-wrap items-end gap-2">
          <Field label="Fires when it">
            <select
              aria-label="Test"
              className={SELECT}
              onChange={(event) => {
                if (event.target.value === 'is set') {
                  const { op: _o, against: _a, ...rest } = rule
                  onChange(rest)
                  return
                }
                onChange({
                  ...rule,
                  op: event.target.value as FlagRule['op'],
                  against: rule.against ?? 0,
                })
              }}
              value={rule.op ?? 'is set'}
            >
              <option value="is set">is set</option>
              {FLAG_TESTS.map((test) => (
                <option key={test} value={test}>
                  {test}
                </option>
              ))}
            </select>
          </Field>

          {rule.op ? (
            <NumberBox
              id={`${rule.id}-against`}
              label="this"
              metric={metric}
              onChange={(value) => onChange({ ...rule, against: value ?? 0 })}
              unit={unit}
              value={typeof rule.against === 'number' ? rule.against : 0}
            />
          ) : null}

          <Field label="When it fires">
            <BandSelect
              id={`${rule.id}-raises`}
              label="Where a flagged feature lands"
              onChange={(raises) => onChange({ ...rule, raises })}
              value={rule.raises}
            />
          </Field>
        </div>
      ) : null}

      {rule.type === 'baseline' ? (
        <div className="flex flex-col gap-1">
          {Object.entries(rule.bands).map(([type, band]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="flex-1 text-2xs text-zinc-300">{type.replaceAll('_', ' ')}</span>
              <BandSelect
                id={`${rule.id}-baseline-${type}`}
                label={`Where ${type} starts`}
                onChange={(next) => onChange({ ...rule, bands: { ...rule.bands, [type]: next } })}
                value={band as Band}
              />
              <button
                aria-label={`Stop judging ${type}`}
                className="px-0.5 text-2xs text-zinc-500 hover:text-danger"
                onClick={() => {
                  const bands = { ...rule.bands }
                  delete bands[type as keyof typeof bands]
                  onChange({ ...rule, bands })
                }}
                type="button"
              >
                ×
              </button>
            </div>
          ))}
          <select
            aria-label="Add a feature type"
            className={SELECT}
            onChange={(event) =>
              onChange({ ...rule, bands: { ...rule.bands, [event.target.value]: 'meh' } })
            }
            value=""
          >
            <option value="">Add a feature type…</option>
            {types
              .filter((type) => !(type in rule.bands))
              .map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll('_', ' ')}
                </option>
              ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <span className="text-2xs text-zinc-400">
          Applies to {chosen.size === 0 ? 'every feature type' : `${chosen.size} types`}
        </span>
        <div className="flex flex-wrap gap-1">
          {types.map((type) => (
            <button
              key={type}
              aria-pressed={chosen.has(type)}
              className={`rounded px-1.5 py-0.5 text-2xs ${
                chosen.has(type) ? 'bg-info/25 text-info' : 'bg-zinc-800 text-zinc-400'
              }`}
              onClick={() =>
                onChange({
                  ...rule,
                  featureTypes: chosen.has(type)
                    ? rule.featureTypes.filter((each) => each !== type)
                    : [...rule.featureTypes, type],
                })
              }
              type="button"
            >
              {type.replaceAll('_', ' ')}
            </button>
          ))}
          <button
            aria-pressed={chosen.size === 0}
            className={`rounded px-1.5 py-0.5 text-2xs ${
              chosen.size === 0 ? 'bg-info/25 text-info' : 'bg-zinc-800 text-zinc-400'
            }`}
            onClick={() => onChange({ ...rule, featureTypes: [] })}
            type="button"
          >
            Every type
          </button>
        </div>
      </div>

      <Field label="Custom arithmetic">
        <Input
          aria-label="Custom expression"
          className="w-full font-mono"
          id={`${rule.id}-expression`}
          name={`${rule.id}-expression`}
          placeholder="e.g. depthBelowPartTop / requiredCutter"
          size="md"
          value={rule.expression ?? ''}
          onChange={(event) => {
            const { expression: _dropped, ...rest } = rule
            onChange(event.target.value === '' ? rest : { ...rule, expression: event.target.value })
          }}
        />
      </Field>

      <Field label="Note">
        <Input
          aria-label="Rule note"
          className="w-full"
          id={`${rule.id}-note`}
          name={`${rule.id}-note`}
          size="md"
          value={rule.note}
          onChange={(event) => onChange({ ...rule, note: event.target.value })}
        />
      </Field>

      <div className="flex justify-end">
        <Button onClick={onRemove} size="sm" variant="danger">
          Delete rule
        </Button>
      </div>
    </div>
  )
}

export const RuleCard = ({
  rule,
  hits,
  scores,
  types,
  unit,
  open,
  editing,
  focusedTag,
  onOpen,
  onEdit,
  onChange,
  onRemove,
  onChoose,
  onHover,
}: {
  rule: Rule
  hits: readonly RuleHit[]
  scores: ReadonlyMap<string, FeatureScore>
  types: readonly string[]
  unit: Unit
  /** Whether the rule is showing anything at all below its name. */
  open: boolean
  /** Whether what a rule reads and judges is open for changing. */
  editing: boolean
  focusedTag: string | null
  onOpen: () => void
  onEdit: () => void
  onChange: (rule: Rule) => void
  onRemove: () => void
  onChoose: (tag: string) => void
  onHover: (tags: string[]) => void
}) => {
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? hits : hits.slice(0, 4)

  return (
    <li className="border-b border-zinc-800/60 py-1.5 last:border-b-0">
      <div className="flex items-center gap-1.5">
        <button
          aria-expanded={open}
          aria-label={`${rule.name}: limits and what it caught`}
          className="shrink-0 text-zinc-500 hover:text-zinc-200"
          data-row={rule.id}
          onClick={onOpen}
          type="button"
        >
          <CaretDownIcon className={`size-3 transition ${open ? '' : '-rotate-90'}`} />
        </button>

        <span
          className={`min-w-0 flex-1 truncate ${rule.enabled ? 'text-zinc-200' : 'text-zinc-500'}`}
        >
          {rule.name}
        </span>

        {/* How hard this rule is being on this part, and how much of that a
            shop would mind: the two numbers somebody scans a list of limits
            for. A rule with nothing to say says so, rather than showing a zero
            that reads like a verdict. */}
        {hits.length === 0 ? (
          <span className="shrink-0 text-2xs italic text-zinc-500">nothing to measure</span>
        ) : (
          <>
            <span
              className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-2xs"
              style={{ background: `${bandCss(worstOf(hits))}22`, color: bandCss(worstOf(hits)) }}
            >
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full"
                style={{ background: bandCss(worstOf(hits)) }}
              />
              {bandName(worstOf(hits) ?? 'easy')}
            </span>
            <span
              className="shrink-0 tabular-nums text-zinc-500"
              title="Readings a shop would mind, of the readings it made"
            >
              {costlyCount(hits)} costly · {hits.length}
            </span>
          </>
        )}

        <button
          aria-label={`Edit ${rule.name}`}
          aria-pressed={editing}
          className={`shrink-0 rounded p-1 ${
            editing ? 'bg-info/20 text-info' : 'text-zinc-500 hover:text-zinc-200'
          }`}
          onClick={onEdit}
          title="What it reads, who it judges, its shape"
          type="button"
        >
          <PencilSimpleIcon className="size-3" />
        </button>

        <label className="flex shrink-0 items-center" title="Whether this rule judges anything">
          <span className="sr-only">{rule.name} applies</span>
          <input
            checked={rule.enabled}
            className="size-3 accent-info"
            onChange={(event) => onChange({ ...rule, enabled: event.target.checked })}
            type="checkbox"
          />
        </label>
      </div>

      {open ? (
        <>
          {editing ? (
            <Settings
              onChange={onChange}
              onRemove={onRemove}
              rule={rule}
              types={types}
              unit={unit}
            />
          ) : (
            <div className="ml-4 mt-1 rounded border border-zinc-800 bg-transparent p-2">
              <Limits onChange={onChange} rule={rule} unit={unit} />
            </div>
          )}

          {/* What the limit actually cost, which is what somebody looks at
              before deciding whether the limit or the part is wrong. */}
          {shown.length > 0 ? (
            <ul className="mt-1" onMouseLeave={() => onHover([])}>
              {shown.map((hit) => (
                <li key={hit.tag}>
                  <button
                    className={`flex w-full items-center gap-2 rounded py-0.5 pl-4 pr-1 text-left text-2xs ${
                      hit.tag === focusedTag
                        ? 'bg-info/15 text-info'
                        : 'text-zinc-400 hover:bg-zinc-900'
                    }`}
                    data-row={hit.tag}
                    onClick={() => onChoose(hit.tag)}
                    // Arrowing onto a row opens it on the right, so the keyboard
                    // thumbs through features rather than moving a highlight
                    // somebody then has to press to read.
                    onFocus={() => onChoose(hit.tag)}
                    onMouseEnter={() => onHover([hit.tag])}
                    type="button"
                  >
                    {/* The drawing of the type, as every other list of
                        features in the app shows it — the band is already on
                        the score at the other end of the row. */}
                    <span className="shrink-0 text-zinc-500">
                      <KindIcon featureType={hit.featureType} kind="Other" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{hit.label}</span>
                    <span className="shrink-0 text-zinc-500">{hit.direction}</span>
                    <span className="shrink-0 tabular-nums text-zinc-500">{hit.regions}f</span>
                    <ScoreBadge score={scores.get(hit.tag)} />
                  </button>
                </li>
              ))}

              {/* The fifth feature a rule bit on is as interesting as the first
                  to somebody auditing it, and "and 20 more" with no way to see
                  them is a number to be taken on trust. */}
              {hits.length > 4 ? (
                <li>
                  <button
                    className="pl-4 text-3xs text-zinc-500 underline decoration-dotted"
                    onClick={() => setShowAll((all) => !all)}
                    type="button"
                  >
                    {showAll ? 'fewer' : `and ${hits.length - 4} more`}
                  </button>
                </li>
              ) : null}
            </ul>
          ) : null}
        </>
      ) : null}
    </li>
  )
}
