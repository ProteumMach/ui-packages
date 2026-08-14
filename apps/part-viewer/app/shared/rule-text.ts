import { METRICS, type MetricId, metricQuantity } from './metrics'
import type { Band, Rule } from './rules'
import { bandName, bandRanges, rangeSpectrum } from './rules'
import { MODEL_UNIT, type Unit, convertArea, convertLength, decimalsFor } from './units'

/**
 * Rule verdicts, in words.
 *
 * Kept apart from the components so the same wording and the same rounding are
 * used wherever a verdict appears, and so what a rule says can be tested
 * without rendering anything.
 */

/**
 * A measurement in the unit being read, with what it is.
 *
 * Rules are stored in millimetres whatever the shop that wrote them was
 * thinking, so this is where a number becomes inches. Ratios, counts and angles
 * convert to nothing: a 5:1 pocket is 5:1 in any shop, and a chamfer is 45° in
 * both.
 */
export function formatMetric(
  value: number | null,
  metric: MetricId | undefined,
  unit: Unit,
): string {
  if (value === null) return '—'

  switch (metricQuantity(metric)) {
    case 'length':
      return `${convertLength(value, 'mm', unit).toFixed(decimalsFor(unit))} ${unit}`
    case 'area':
      return `${convertArea(value, 'mm', unit).toFixed(decimalsFor(unit))} ${unit}²`
    case 'angle':
      return `${value.toFixed(1)}°`
    case 'ratio':
      return `${value.toFixed(2)}:1`
    default:
      return value.toFixed(value % 1 === 0 ? 0 : 2)
  }
}

/** One band of a rule, and the span of measurements that lands in it. */
export interface RuleLimit {
  readonly band: Band
  /** What this shop calls the band. */
  readonly name: string
  /** The span, in the unit being read. */
  readonly range: string
}

/**
 * Where each band of a rule begins and ends, for showing what a measurement was
 * judged against.
 *
 * An open bottom is zero and an open top is infinity, whichever way the rule
 * runs: every measurement a rule reads — a length, a ratio, a count — bottoms
 * out at zero, and "∞ – 3:1" for the easy band reads as a limit nobody wrote.
 * The same reasoning the scoring already uses for the open end of a scale.
 */
export function ruleLimits(
  rule: Rule,
  unit: Unit,
  names?: Partial<Record<Band, string>>,
): RuleLimit[] {
  if (rule.type !== 'threshold' && rule.type !== 'range') return []

  const edge = (value: number | null, end: 'from' | 'to') => {
    if (value !== null) return formatMetric(value, rule.metric, unit)

    return end === 'from' ? formatMetric(0, rule.metric, unit) : '∞'
  }

  return (rule.type === 'threshold' ? bandRanges(rule) : rangeSpectrum(rule))
    .filter((span) => span.reachable)
    .map((span) => ({
      band: span.band,
      name: bandName(span.band, names, rule.bandNames),
      range: `${edge(span.from, 'from')} – ${edge(span.to, 'to')}`,
    }))
}

/** What a rule applies to, in words rather than a list of twenty type names. */
export function ruleAudience(rule: Rule): string {
  if (rule.featureTypes.length === 0) return 'every feature'
  if (rule.featureTypes.length > 4) return `${rule.featureTypes.length} feature types`

  return rule.featureTypes.map((type) => type.replaceAll('_', ' ')).join(', ')
}

/** What a rule reads, named as the panel names it. */
export function ruleReads(rule: Rule): string {
  if (rule.expression) return rule.expression
  if (rule.type === 'baseline') return 'the kind of feature it is'

  return METRICS.find((metric) => metric.id === rule.metric)?.label ?? rule.metric ?? ''
}

/**
 * A stored number as it is typed and read.
 *
 * Rules are stored in millimetres whatever the shop that wrote them was
 * thinking, so this pair is the only place a threshold becomes inches and the
 * only place a typed number becomes millimetres again. Getting them out of step
 * is how an inch shop's 0.125 quietly becomes 0.125 mm.
 *
 * Ratios, counts and angles convert to nothing: a 5:1 pocket is 5:1 in any
 * shop, and a chamfer is 45° in both.
 */
export function toDisplay(value: number, metric: MetricId | undefined, unit: Unit): number {
  const quantity = metricQuantity(metric)

  if (quantity === 'length') return convertLength(value, MODEL_UNIT, unit)
  if (quantity === 'area') return convertArea(value, MODEL_UNIT, unit)

  return value
}

export function fromDisplay(value: number, metric: MetricId | undefined, unit: Unit): number {
  const quantity = metricQuantity(metric)

  if (quantity === 'length') return convertLength(value, unit, MODEL_UNIT)
  if (quantity === 'area') return convertArea(value, unit, MODEL_UNIT)

  return value
}

/** What to write after a threshold box, or nothing where the number is bare. */
export function unitSuffix(metric: MetricId | undefined, unit: Unit): string {
  switch (metricQuantity(metric)) {
    case 'length':
      return unit
    case 'area':
      return `${unit}²`
    case 'angle':
      return '°'
    case 'ratio':
      return ':1'
    default:
      return ''
  }
}
