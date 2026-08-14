import { METRICS, type MetricId, metricQuantity } from './metrics'
import type { Band, Rule, RuleResult } from './rules'
import { bandName, bandRanges, rangeSpectrum } from './rules'
import { type Unit, convertArea, convertLength, decimalsFor } from './units'

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

/** Where each band of a rule begins and ends, for showing what it was judged against. */
export function ruleLimits(
  rule: Rule,
  unit: Unit,
  names?: Partial<Record<Band, string>>,
): string[] {
  if (rule.type !== 'threshold' && rule.type !== 'range') return []

  // An open bottom is zero and an open top is infinity, whichever way the rule
  // runs: every measurement a rule reads — a length, a ratio, a count — bottoms
  // out at zero, and "∞ – 3:1" for the easy band reads as a limit nobody wrote.
  // The same reasoning the scoring already uses for the open end of a scale.
  const edge = (value: number | null, end: 'from' | 'to') => {
    if (value !== null) return formatMetric(value, rule.metric, unit)

    return end === 'from' ? formatMetric(0, rule.metric, unit) : '∞'
  }

  return (rule.type === 'threshold' ? bandRanges(rule) : rangeSpectrum(rule))
    .filter((span) => span.reachable)
    .map(
      (span) =>
        `${bandName(span.band, names, rule.bandNames)} ${edge(span.from, 'from')} – ${edge(span.to, 'to')}`,
    )
}

/**
 * Everything behind one rule's verdict, in the order somebody asks it.
 *
 * What the rule is for, how its number was arrived at, and where that number
 * fell among the limits. The middle one is the whole argument for showing the
 * Engine's own measurements: a number a shop cannot trace is one they have to
 * take on faith, and this is what makes it traceable without leaving the panel.
 */
export function ruleWorking(
  result: RuleResult,
  unit: Unit,
  /** The arithmetic the metric performed, from `metricFormula`. */
  formula?: string | undefined,
  names?: Partial<Record<Band, string>>,
): string {
  const lines = [result.rule.note]

  // A rule written as a sum reads several measurements at once, so its own
  // arithmetic is the answer rather than any one metric's.
  const working = result.rule.expression ?? formula
  if (working && result.rule.type !== 'baseline') lines.push(working)

  const limits = ruleLimits(result.rule, unit, names)
  if (limits.length > 0) lines.push(limits.join('\n'))

  return lines.filter(Boolean).join('\n\n')
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
