import { describe, expect, test } from 'vitest'
import { EMPTY, RULES_VERSION, copyAs, migrateRules, sameRules } from './saved-rules'
import { DEFAULT_RULE_SET } from './rule-presets'
import type { Rule, RuleSet } from './rules'

/**
 * A shop's thresholds are an afternoon's work to arrive at, so the reading is
 * deliberately lenient: what can be salvaged is, and what cannot is dropped on
 * its own rather than taking the rest of somebody's sets with it.
 */

const stored = (sets: unknown, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ version: RULES_VERSION, sets, ...extra })

const set = (over: Partial<RuleSet> = {}): RuleSet => ({
  id: 'mine',
  name: 'Aluminium in the Haas',
  rules: [...DEFAULT_RULE_SET.rules],
  ...over,
})

describe('migrateRules', () => {
  test('reads back what was written', () => {
    const read = migrateRules(stored([set()], { defaultId: 'mine' }))

    expect(read?.sets).toHaveLength(1)
    expect(read?.defaultId).toBe('mine')
    expect(read?.version).toBe(RULES_VERSION)
  })

  test('drops one unreadable set rather than every set', () => {
    const read = migrateRules(stored([set(), { id: 'broken' }, set({ id: 'other' })]))

    // Losing a shop's whole library because one entry went bad is the failure
    // worth engineering against.
    expect(read?.sets.map((each) => each.id)).toEqual(['mine', 'other'])
  })

  test('names the shape of a rule saved before the shapes existed', () => {
    // Every rule was a sliding scale once. Left untyped, such a rule evaluates
    // to nothing and the set silently stops judging.
    const old = { id: 'ld', name: 'L/D', metric: 'drillingLD', thresholds: [3, 5, 8, 12] }
    const read = migrateRules(stored([{ id: 'mine', name: 'Old', rules: [old] }]))

    expect(read?.sets[0]?.rules[0]).toMatchObject({ id: 'ld', type: 'threshold' })
  })

  test('leaves the shipped sets in place when the store holds nonsense', () => {
    for (const nonsense of ['', 'not json', '[]', '{"sets":"no"}', 'null']) {
      expect(migrateRules(nonsense)).toBe(null)
    }
    expect(EMPTY.sets).toEqual([])
  })
})

describe('sameRules', () => {
  test('ignores which set it is, since a copy is still a copy', () => {
    expect(sameRules(set(), set({ id: 'other' }))).toBe(true)
  })

  test('counts a rename as a change, because Save has to offer to keep it', () => {
    // Not rule equality for its own sake: this drives whether there is
    // anything to save, and a renamed set with untouched numbers still has
    // something worth writing down.
    expect(sameRules(set(), set({ name: 'Titanium in the Brother' }))).toBe(false)
  })

  test('notices a threshold somebody moved', () => {
    const moved = set({
      rules: DEFAULT_RULE_SET.rules.map(
        (rule, at): Rule =>
          at === 0 && rule.type === 'threshold'
            ? { ...rule, thresholds: [1, 2, 3, 4] as [number, number, number, number] }
            : rule,
      ),
    })

    expect(sameRules(set(), moved)).toBe(false)
  })
})

describe('copyAs', () => {
  test('copies a shipped set rather than writing over it', () => {
    const copy = copyAs(DEFAULT_RULE_SET, 'Ours')

    // A shipped preset is somebody's published guidelines, and the point of
    // citing them is that they stay as published.
    expect(copy.id).not.toBe(DEFAULT_RULE_SET.id)
    expect(copy.name).toBe('Ours')
    expect(copy.rules).toEqual(DEFAULT_RULE_SET.rules)
  })
})
