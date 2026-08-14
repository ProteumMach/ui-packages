import { useState } from 'react'
import { Button } from '@toolpath/ui'
import { RuleCard } from './rule-editor'
import type { RulesState } from '../shared/use-rules'
import type { Unit } from '../shared/units'

/**
 * The limits the part is being judged against, and every one of them editable.
 *
 * The numbers are on the rows rather than behind a press, because moving one is
 * what a shop is here for. What a rule reads, who it judges and its shape are
 * under `more`: decided once, and in the way when they are not being decided.
 */
export const RulesPanel = ({
  rules,
  types,
  unit,
}: {
  rules: RulesState
  /** The feature types this part actually has, for aiming a rule. */
  types: readonly string[]
  unit: Unit
}) => {
  const [openRule, setOpenRule] = useState<string | null>(null)
  const set = rules.ruleSet
  const sets = [...rules.presets, ...rules.savedSets]

  return (
    <aside className="size-full overflow-y-auto bg-zinc-900/40 p-3">
      <div className="flex items-center gap-1.5">
        {/* A shop's thresholds belong to a material and a machine, so which set
            is in force is a choice rather than a setting made once. */}
        <select
          aria-label="Rule set"
          className="h-8 min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100"
          onChange={(event) => rules.loadPreset(event.target.value)}
          value={sets.some((each) => each.id === set.id) ? set.id : ''}
        >
          {sets.some((each) => each.id === set.id) ? null : (
            <option value="">{set.name} — unsaved</option>
          )}
          {sets.map((each) => (
            <option key={each.id} value={each.id}>
              {each.name}
            </option>
          ))}
        </select>

        <Button onClick={rules.addRule} size="sm" variant="secondary">
          Add rule
        </Button>
      </div>

      {rules.dirty ? (
        // A shipped preset is somebody's published guidelines, so a change to
        // one is kept as a copy rather than written back over it.
        <div className="mt-1.5 flex items-center gap-2 text-2xs text-warning">
          <span className="flex-1">Changed, not saved</span>
          <button className="underline" onClick={rules.resetRules} type="button">
            Put back
          </button>
          <button
            className="underline"
            onClick={() => {
              const name = globalThis.prompt('Save these limits as', `${set.name} (ours)`)
              if (name) rules.saveAsNew(name)
            }}
            type="button"
          >
            Save as…
          </button>
        </div>
      ) : null}

      <ul className="mt-2">
        {set.rules.map((rule) => (
          <RuleCard
            key={rule.id}
            onChange={rules.updateRule}
            onOpen={() => setOpenRule((open) => (open === rule.id ? null : rule.id))}
            onRemove={() => rules.removeRule(rule.id)}
            open={openRule === rule.id}
            rule={rule}
            types={types}
            unit={unit}
          />
        ))}
      </ul>
    </aside>
  )
}
