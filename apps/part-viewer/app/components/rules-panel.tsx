import { useState } from 'react'
import { Button } from '@toolpath/ui'
import { bandCss } from '../shared/bands'
import { RuleNumbers } from './rule-editor'
import type { RulesState } from '../shared/use-rules'
import { ruleAudience, ruleLimits, ruleReads } from '../shared/rule-text'
import type { Rule } from '../shared/rules'
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
const RuleRow = ({
  rule,
  unit,
  open,
  onOpen,
  onChange,
}: {
  rule: Rule
  unit: Unit
  open: boolean
  onOpen: () => void
  onChange: (rule: Rule) => void
}) => {
  const limits = ruleLimits(rule, unit)

  return (
    <li className="border-b border-zinc-800/60 py-2 last:border-b-0">
      <div className="flex items-baseline gap-2">
        {/* Pressing the name opens its numbers under it. Only the numbers:
            this is for "that limit is wrong", and every keystroke re-judges the
            part behind the panel. */}
        <button
          aria-expanded={open}
          className={`flex-1 text-left text-xs hover:text-info ${
            rule.enabled ? 'text-zinc-200' : 'text-zinc-500'
          }`}
          onClick={onOpen}
          type="button"
        >
          {rule.name}
        </button>
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

      {/* The chips are the same numbers the editor is showing, so while it is
          open they would be on screen twice — which is what made the panel
          unreadable rather than dense. */}
      {limits.length > 0 && !open ? (
        <ul className="mt-1 flex flex-wrap gap-1">
          {limits.map((limit) => (
            <li
              key={limit.band}
              className="flex items-center gap-1 rounded bg-zinc-800/60 px-1.5 py-0.5 text-3xs text-zinc-300"
            >
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: bandCss(limit.band) }}
              />
              <span>{limit.name}</span>
              <span className="tabular-nums text-zinc-400">{limit.range}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-1 text-2xs leading-5 text-zinc-500">{rule.note}</p>

      {open ? <RuleNumbers onChange={onChange} rule={rule} unit={unit} /> : null}
    </li>
  )
}

export const RulesPanel = ({ rules, unit }: { rules: RulesState; unit: Unit }) => {
  const [openRule, setOpenRule] = useState<string | null>(null)
  const set = rules.ruleSet
  const sets = [...rules.presets, ...rules.savedSets]

  return (
    <aside className="size-full overflow-y-auto bg-zinc-900/40 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-info">Rules</p>

      {/* A shop's thresholds belong to a material and a machine — aluminium in
        the Haas is not titanium in the Brother — so which set is in force is a
        choice, not a setting somebody made once. */}
      <div className="mt-1 flex items-center gap-2">
        <select
          aria-label="Rule set"
          className="h-8 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-sm text-zinc-100"
          onChange={(event) => rules.loadPreset(event.target.value)}
          value={sets.some((each) => each.id === set.id) ? set.id : ''}
        >
          {sets.some((each) => each.id === set.id) ? null : (
            <option value="">{set.name} (unsaved)</option>
          )}
          {sets.map((each) => (
            <option key={each.id} value={each.id}>
              {each.name}
            </option>
          ))}
        </select>

        {rules.dirty ? (
          <Button
            onClick={() => {
              const name = globalThis.prompt('Save these limits as', `${set.name} (ours)`)
              if (name) rules.saveAsNew(name)
            }}
            size="sm"
            variant="secondary"
          >
            Save as…
          </Button>
        ) : null}
      </div>

      {rules.dirty ? (
        // A shipped preset is somebody's published guidelines, and the point of
        // citing them is that they stay as published — so a change to one is
        // saved as a copy rather than written back over it.
        <p className="mt-1 text-2xs text-warning">
          Changed, and not saved to a set.{' '}
          <button className="underline" onClick={rules.resetRules} type="button">
            Put back
          </button>
        </p>
      ) : null}
      <p className="mt-2 text-2xs leading-5 text-zinc-400">
        {set.rules.length} limits, judged against the Engine&rsquo;s own measurements. Nothing here
        is re-analysed — a rule reads numbers the report already carries, which is why the part
        recolours the moment one changes.
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
          <RuleRow
            key={rule.id}
            onChange={rules.updateRule}
            onOpen={() => setOpenRule((open) => (open === rule.id ? null : rule.id))}
            open={openRule === rule.id}
            rule={rule}
            unit={unit}
          />
        ))}
      </ul>
    </aside>
  )
}
