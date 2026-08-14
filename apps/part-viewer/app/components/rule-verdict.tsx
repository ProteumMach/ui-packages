import { bandCss } from '../shared/bands'
import { formatMetric, ruleWorking } from '../shared/rule-text'
import type { FeatureVerdict, Rule } from '../shared/rules'
import { bandName, readEveryRule, scoreFeature } from '../shared/rules'
import { PART_METRICS, metricFormula } from '../shared/metrics'
import type { PartFeature } from '../shared/contracts'
import type { Unit } from '../shared/units'

/**
 * "This part does not fit the machine" is true of every feature on it and
 * actionable from none of them, so a part-wide rule is left off the feature.
 */
const isPartWide = (rule: Rule): boolean =>
  rule.type !== 'baseline' && PART_METRICS.has(rule.metric)

/**
 * What the rules made of this feature, and what they read to decide.
 *
 * Two lists, and the second is the reason this is worth building: the rules
 * that spoke, and the rules that **stayed silent**. A rule that agreed and a
 * rule that never ran read identically on a feature that scored well, and with
 * a datasheet as sparse as the Engine's that difference is most of the answer.
 * Somebody looking at a feature that came out easy wants to know whether the
 * rules they care about agreed or simply never looked.
 */
export const RuleVerdict = ({
  feature,
  rules,
  verdict,
  unit,
}: {
  feature: PartFeature
  rules: readonly Rule[]
  verdict: FeatureVerdict
  unit: Unit
}) => {
  const score = scoreFeature(verdict)
  const results = verdict.results.filter((result) => !isPartWide(result.rule))
  const readings = readEveryRule(
    rules.filter((rule) => !isPartWide(rule)),
    feature.featureType,
    verdict.metrics,
  )
  const silent = readings.filter((reading) => reading.band === null)

  return (
    <section className="mt-4 border-t border-zinc-800 pt-3">
      <h3 className="text-2xs font-bold uppercase tracking-wider text-zinc-500">Difficulty</h3>

      <div className="mt-1.5 flex items-center gap-2">
        <span
          className="rounded px-1.5 py-0.5 text-2xs font-semibold text-zinc-950"
          style={{ background: bandCss(verdict.band) }}
        >
          {verdict.band === null ? 'unjudged' : bandName(verdict.band)}
        </span>
        {score === null ? null : (
          <span className="text-2xs text-zinc-400">
            scores{' '}
            <span className="font-semibold tabular-nums text-zinc-100">
              {(score * 100).toFixed(0)}
            </span>{' '}
            across {results.length} {results.length === 1 ? 'rule' : 'rules'}
          </span>
        )}
      </div>

      {results.length === 0 ? (
        <p className="mt-1.5 text-2xs text-zinc-400">
          No rule reached this feature. That is not the same as easy — every rule and what it read
          is below.
        </p>
      ) : (
        <ul className="mt-1.5 flex flex-col gap-1">
          {results.map((result) => (
            <li
              key={result.rule.id}
              className="border-l-2 pl-2"
              style={{ borderColor: bandCss(result.band) }}
              // What the rule is for, the arithmetic behind its number, and the
              // limits it was judged against. Behind a hover rather than under
              // every row, which is what kept the panel readable at sixteen
              // rules.
              title={ruleWorking(
                result,
                unit,
                metricFormula(result.rule.metric ?? 'depth', feature),
              )}
            >
              <div className="flex items-baseline gap-2 text-xs">
                <span className="min-w-0 flex-1 truncate text-zinc-300">{result.rule.name}</span>
                <span className="shrink-0 tabular-nums text-zinc-400">
                  {result.rule.type === 'baseline'
                    ? bandName(result.band)
                    : formatMetric(result.value, result.rule.metric, unit)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {silent.length === 0 ? null : (
        <details className="mt-2">
          <summary className="cursor-pointer text-2xs text-zinc-500 underline decoration-dotted">
            {silent.length} {silent.length === 1 ? 'rule' : 'rules'} said nothing
          </summary>
          <ul className="mt-1 flex flex-col gap-0.5">
            {silent.map((reading) => (
              <li
                key={reading.rule.id}
                className="flex items-baseline justify-between gap-2 text-2xs text-zinc-500"
              >
                <span className="min-w-0 truncate">{reading.rule.name}</span>
                <span className="shrink-0">{reading.silence}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
