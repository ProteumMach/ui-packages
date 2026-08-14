import { useState } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { Button, Input } from '@toolpath/ui'
import { bandCss } from '../shared/bands'
import { METRICS } from '../shared/metrics'
import type { RuleHit } from '../shared/rule-text'
import {
  displayDecimals,
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
  'h-7 rounded border border-zinc-700 bg-zinc-900 px-1.5 text-2xs text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-info'

const NumberBox = ({
  id,
  label,
  value,
  metric,
  unit,
  raw = false,
  width = 'w-16',
  onChange,
}: {
  id: string
  label: string
  value: number | undefined
  metric: Rule['metric']
  unit: Unit
  /** Unitless — a weight or a count, which no conversion touches. */
  raw?: boolean
  width?: string
  onChange: (value: number | undefined) => void
}) => (
  <div className="flex min-w-0 flex-col gap-0.5">
    {/* A div rather than a label: the caption names a control that labels
        itself, and two labels on one box is one too many for a screen reader. */}
    <span className="truncate text-2xs text-zinc-400">{label}</span>
    <Input
      aria-label={label}
      className={`${width} tabular-nums`}
      id={id}
      inputMode="decimal"
      name={id}
      size="md"
      suffix={raw ? undefined : unitSuffix(metric, unit)}
      type="number"
      // Trailing zeros stripped, which is not cosmetic: rendered as `3.00`, a box
      // rewrites itself between keystrokes — type `1` and it becomes `1.00` with
      // the caret after the zeros, so `12` arrives as `1.002`.
      value={
        value === undefined
          ? ''
          : String(
              Number(
                toDisplay(value, raw ? undefined : metric, unit).toFixed(
                  raw ? 0 : displayDecimals(metric, unit),
                ),
              ),
            )
      }
      onChange={(event) => {
        const typed = event.target.value.trim()

        // An emptied box is "not set", not zero — which would refuse everything
        // the moment somebody cleared the field to retype it.
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

/** The five bands as dots, named on hover — one line, whatever the width. */
const BandDots = ({ rule, unit }: { rule: Rule; unit: Unit }) => {
  const limits = ruleLimits(rule, unit)

  if (limits.length === 0) return null

  return (
    <ul className="flex flex-wrap items-center gap-1">
      {limits.map((limit) => (
        <li
          key={limit.band}
          className="flex shrink-0 items-center gap-1 rounded bg-zinc-800/70 px-1.5 py-0.5 text-3xs tabular-nums text-zinc-300"
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

    return (
      <div className="flex flex-wrap items-center gap-1">
        {rule.thresholds.map((threshold, at) => (
          <NumberBox
            key={BANDS[at]}
            id={`${rule.id}-band-${at}`}
            label={`${bandName(BANDS[at] as Band, undefined, rule.bandNames)} to`}
            metric={rule.metric}
            onChange={(value) => write(at, value)}
            unit={unit}
            value={threshold}
          />
        ))}
        <NumberBox
          id={`${rule.id}-no-go`}
          label={`${bandName('no go', undefined, rule.bandNames)} past`}
          metric={rule.metric}
          onChange={(value) => {
            const { noGo: _dropped, ...rest } = rule
            onChange(value === undefined ? rest : { ...rule, noGo: value })
          }}
          unit={unit}
          value={rule.noGo}
        />
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
    <div className="flex flex-wrap items-center gap-1">
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
  <select
    aria-label={label}
    className={SELECT}
    id={id}
    onChange={(event) => onChange(event.target.value as Band)}
    value={value}
  >
    {BANDS.map((band) => (
      <option key={band} value={band}>
        {band}
      </option>
    ))}
  </select>
)

/** What a rule reads, who it judges, and its shape. Decided once, so folded away. */
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

  return (
    <div className="mt-1.5 flex flex-col gap-2 rounded border border-zinc-800 bg-zinc-900/60 p-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <select
          aria-label="Shape"
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

        {rule.type === 'baseline' ? null : (
          <select
            aria-label="Reads"
            className={`${SELECT} max-w-48`}
            onChange={(event) =>
              onChange({ ...rule, metric: event.target.value as Rule['metric'] } as Rule)
            }
            value={rule.metric}
          >
            {METRICS.map((metric) => (
              <option key={metric.id} value={metric.id}>
                {metric.label}
              </option>
            ))}
          </select>
        )}

        <Input
          aria-label="Custom arithmetic"
          className="min-w-48 flex-1 font-mono"
          id={`${rule.id}-expression`}
          name={`${rule.id}-expression`}
          placeholder="arithmetic, e.g. depth / requiredCutter"
          size="md"
          value={rule.expression ?? ''}
          onChange={(event) => {
            const { expression: _dropped, ...rest } = rule
            onChange(event.target.value === '' ? rest : { ...rule, expression: event.target.value })
          }}
        />
      </div>

      <div className="flex flex-wrap gap-1">
        <span className="text-2xs text-zinc-400">
          {chosen.size === 0 ? 'every feature type' : `${chosen.size} types`}
        </span>
        {types.map((type) => (
          <button
            key={type}
            aria-pressed={chosen.has(type)}
            className={`rounded px-1.5 py-0.5 text-3xs ${
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
      </div>

      <details>
        <summary className="cursor-pointer text-2xs text-zinc-500">band names</summary>
        <div className="mt-1 flex flex-wrap gap-1">
          {BANDS.map((band) => (
            <Input
              key={band}
              aria-label={`What to call ${band}`}
              className="w-20"
              id={`${rule.id}-name-${band.replace(' ', '-')}`}
              name={`${rule.id}-name-${band.replace(' ', '-')}`}
              placeholder={band}
              size="md"
              value={rule.bandNames?.[band] ?? ''}
              onChange={(event) =>
                onChange({ ...rule, bandNames: { ...rule.bandNames, [band]: event.target.value } })
              }
            />
          ))}
        </div>
      </details>

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
  types,
  unit,
  open,
  focusedTag,
  onOpen,
  onChange,
  onRemove,
  onChoose,
  onHover,
}: {
  rule: Rule
  hits: readonly RuleHit[]
  types: readonly string[]
  unit: Unit
  open: boolean
  focusedTag: string | null
  onOpen: () => void
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
          aria-label={`What ${rule.name} reads and judges`}
          className="shrink-0 text-zinc-500 hover:text-zinc-200"
          data-row={rule.id}
          onClick={onOpen}
          type="button"
        >
          <CaretDownIcon className={`size-3 transition ${open ? '' : '-rotate-90'}`} />
        </button>

        <span
          className={`min-w-0 flex-1 truncate text-xs ${
            rule.enabled ? 'text-zinc-200' : 'text-zinc-500'
          }`}
        >
          {rule.name}
        </span>

        {hits.length > 0 ? (
          <span className="shrink-0 text-3xs tabular-nums text-zinc-500" title="Readings it caught">
            {hits.length}
          </span>
        ) : null}
      </div>

      <div className="ml-4 mt-1 flex flex-col gap-2 rounded border border-zinc-800 bg-zinc-900/50 p-2">
        <Limits onChange={onChange} rule={rule} unit={unit} />
        <BandDots rule={rule} unit={unit} />

        <div className="flex items-end gap-2">
          <NumberBox
            id={`${rule.id}-weight`}
            label="weight"
            metric={undefined}
            onChange={(value) => onChange({ ...rule, weight: value ?? 0 })}
            raw
            unit={unit}
            value={rule.weight}
            width="w-16"
          />
          <Button
            onClick={() => onChange({ ...rule, enabled: !rule.enabled })}
            size="sm"
            title="Stop this rule judging anything, without deleting it"
            variant={rule.enabled ? 'secondary' : 'info'}
          >
            {rule.enabled ? 'switch off' : 'switched off'}
          </Button>
        </div>
      </div>

      {/* What the limit actually cost, which is what somebody looks at before
          deciding whether the limit or the part is wrong. */}
      {shown.length > 0 ? (
        <ul className="mt-1" onMouseLeave={() => onHover([])}>
          {shown.map((hit) => (
            <li key={hit.tag}>
              <button
                className={`flex w-full items-center gap-2 rounded py-0.5 pl-4 pr-1 text-left text-2xs ${
                  hit.tag === focusedTag
                    ? 'bg-info/15 text-info'
                    : 'text-zinc-400 hover:bg-zinc-800/60'
                }`}
                data-row={hit.tag}
                onClick={() => onChoose(hit.tag)}
                onFocus={() => onHover([hit.tag])}
                onMouseEnter={() => onHover([hit.tag])}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: bandCss(hit.band) }}
                />
                <span className="min-w-0 flex-1 truncate">{hit.label}</span>
                <span className="shrink-0 text-zinc-500">{hit.direction}</span>
                <span className="shrink-0 tabular-nums text-zinc-500">{hit.regions}f</span>
              </button>
            </li>
          ))}

          {/* The fifth feature a rule bit on is as interesting as the first to
              somebody auditing it, and "and 20 more" with no way to see them is
              a number to be taken on trust. */}
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

      {open ? (
        <Settings onChange={onChange} onRemove={onRemove} rule={rule} types={types} unit={unit} />
      ) : null}
    </li>
  )
}
