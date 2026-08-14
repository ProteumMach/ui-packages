import type { Rule, RuleSet } from './rules'

/**
 * Named rule sets, kept in the browser.
 *
 * A shop's thresholds belong to a material or a machine — aluminium in the Haas
 * is not titanium in the Brother — so sets are named, several are kept, and one
 * of them is the set the app opens with. The stored shape carries a version, so
 * a later change to `Rule` migrates rather than throwing somebody's numbers
 * away: these are an afternoon's work to arrive at.
 */

export interface StoredRuleSets {
  version: number
  sets: Array<RuleSet>
  /** Which set a new session starts on. */
  defaultId?: string | undefined
}

export const RULES_VERSION = 1

const KEY = 'part-viewer:rule-sets'

export const EMPTY: StoredRuleSets = { sets: [], version: RULES_VERSION }

/**
 * Whatever was stored, read as leniently as it can honestly be read.
 *
 * A set whose rules cannot be read is dropped on its own rather than taking
 * every other set with it, and anything unreadable leaves the shipped sets in
 * place instead of failing the page.
 */
export const migrateRules = (raw: string): StoredRuleSets | null => {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return null
  }

  const stored = { ...parsed } as Partial<StoredRuleSets>

  if (!Array.isArray(stored.sets)) {
    return null
  }

  return {
    version: RULES_VERSION,
    ...(stored.defaultId === undefined ? {} : { defaultId: stored.defaultId }),
    sets: stored.sets
      .filter(
        (set): set is RuleSet =>
          typeof set === 'object' && set !== null && Array.isArray(set.rules),
      )
      .map((set): RuleSet => {
        // Rules were all sliding scales before the other shapes existed, and a
        // set saved then has no type on them. Naming it here is what keeps
        // those sets working rather than evaluating to nothing.
        const rules: Array<Rule> = []

        for (const rule of set.rules) {
          if (typeof rule === 'object' && rule !== null && 'type' in rule) {
            rules.push(rule)
          } else {
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see above
            rules.push({ ...(rule as object), type: 'threshold' } as Rule)
          }
        }

        return Object.assign({}, set, { rules })
      }),
  }
}

export const loadSets = (): StoredRuleSets => {
  try {
    const raw = globalThis.localStorage?.getItem(KEY)

    return (raw ? migrateRules(raw) : null) ?? EMPTY
  } catch {
    return EMPTY
  }
}

export const writeSets = (stored: StoredRuleSets): void => {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(stored))
  } catch {
    // A blocked or full store costs the save, not the session — the set is
    // still live in memory and still judging the part on screen.
  }
}

/**
 * Whether two sets say the same thing.
 *
 * By value rather than by reference, because the working copy is rebuilt on
 * every keystroke: what a shop wants to know is whether the numbers differ from
 * what they saved, not whether the object is the same one.
 */
export const sameRules = (left: RuleSet, right: RuleSet): boolean =>
  JSON.stringify(left.rules) === JSON.stringify(right.rules) &&
  // What the plan may spend on orientations is part of the set, so changing it
  // is an unsaved change like any other. Without this the Save button stayed
  // grey after moving the threshold, and the number went back on next load.
  JSON.stringify(left.plan ?? null) === JSON.stringify(right.plan ?? null) &&
  left.name === right.name

/** A copy under a new identity, for "save as". */
export const copyAs = (
  set: RuleSet,
  name: string,
  /** The shipped set this was copied from, so a later Save can find it again. */
  from?: string,
): RuleSet => ({
  id: globalThis.crypto?.randomUUID?.() ?? `set-${name}`,
  name,
  rules: set.rules.map((rule) => ({ ...rule })),
  ...(from ? { from } : {}),
})
