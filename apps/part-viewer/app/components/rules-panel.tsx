import { bandCss } from '../shared/bands'
import { ruleAudience, ruleLimits, ruleReads } from '../shared/rule-text'
import type { Rule, RuleSet } from '../shared/rules'
import { BANDS, bandName } from '../shared/rules'
import type { Unit } from '../shared/units'

/**
 * The limits the part is being judged against, in force right now.
 *
 * Read-only for the moment. A shop cannot argue with a number it cannot see,
 * and seeing them is the smaller half of that — but it is the half that stops
 * the colours on the part being a verdict from nowhere.
 *
 * Every rule says the same four things, in the order somebody asks them: what
 * it reads, who it applies to, where its bands fall, and how much it counts.
 */
const RuleRow = ({ rule, unit }: { rule: Rule; unit: Unit }) => {
  const limits = ruleLimits(rule, unit)

  return (
    <li className="border-b border-zinc-800/60 py-2 last:border-b-0">
      <div className="flex items-baseline gap-2">
        <span className={`flex-1 text-xs ${rule.enabled ? 'text-zinc-200' : 'text-zinc-500'}`}>
          {rule.name}
        </span>
        {rule.enabled ? null : (
          // A rule shipped switched off is a decision, not an omission, and
          // hiding it would leave somebody hunting for a limit that is there.
          <span className="rounded bg-zinc-800 px-1 py-0.5 text-3xs uppercase tracking-wide text-zinc-400">
            off
          </span>
        )}
        <span className="shrink-0 text-2xs tabular-nums text-zinc-500" title="How much it counts">
          ×{rule.weight}
        </span>
      </div>

      <p className="mt-0.5 text-2xs text-zinc-500">
        Reads {ruleReads(rule)} · {ruleAudience(rule)}
      </p>

      {limits.length > 0 ? (
        <ul className="mt-1 flex flex-wrap gap-1">
          {limits.map((limit, at) => (
            <li
              key={limit}
              className="flex items-center gap-1 rounded bg-zinc-800/60 px-1.5 py-0.5 text-3xs text-zinc-300"
            >
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: bandCss(BANDS[at] ?? null) }}
              />
              <span className="tabular-nums">{limit}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-1 text-2xs leading-5 text-zinc-500">{rule.note}</p>
    </li>
  )
}

export const RulesPanel = ({ set, unit }: { set: RuleSet; unit: Unit }) => (
  <aside className="size-full overflow-y-auto bg-zinc-900/40 p-4">
    <p className="text-xs font-bold uppercase tracking-wide text-info">Rules</p>
    <h2 className="mt-1 font-display text-2xl font-bold">{set.name}</h2>
    <p className="mt-2 text-2xs leading-5 text-zinc-400">
      {set.rules.length} limits, judged against the Engine&rsquo;s own measurements. Nothing here is
      re-analysed — a rule reads numbers the report already carries, which is why the part recolours
      the moment one changes.
    </p>
    {set.source ? (
      <p className="mt-1 text-2xs text-zinc-500">
        {/* A set of thresholds is only worth arguing with once it says whose it is. */}
        From {set.source}
      </p>
    ) : null}

    <div className="mt-3 flex flex-wrap gap-1">
      {BANDS.map((band) => (
        <span
          key={band}
          className="flex items-center gap-1 rounded bg-zinc-800/60 px-1.5 py-0.5 text-3xs text-zinc-300"
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full"
            style={{ background: bandCss(band) }}
          />
          {bandName(band, set.bandNames)}
        </span>
      ))}
    </div>

    <ul className="mt-3">
      {set.rules.map((rule) => (
        <RuleRow key={rule.id} rule={rule} unit={unit} />
      ))}
    </ul>
  </aside>
)
