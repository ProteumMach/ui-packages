import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PartFeature } from './contracts'

import { DEFAULT_RULES, DEFAULT_RULE_SET, PRESET_SETS, SHIPPED_VERSION } from './rule-presets'
import { type StoredRuleSets, copyAs, loadSets, sameRules, writeSets } from './saved-rules'
import type { FeatureVerdict, PartScore, PlanLimits, Rule, RuleSet } from './rules'
import { evaluatePart, scorePart } from './rules'

/**
 * The rule set the app is judging with, and the unit it is being read in.
 *
 * Both survive a reload, because a shop's thresholds are the thing it spends an
 * afternoon on and losing them to a refresh would be the app's worst habit. The
 * store is `localStorage` and nothing more: rule sets belong to a machinist and
 * a browser at this stage, not to an account.
 */

const RULES_KEY = 'part-viewer:rules'
const SHIPPED_KEY = 'part-viewer:rules.shipped'

/**
 * A rule set read back from storage, or nothing.
 *
 * Deliberately incurious about the shape: a set written by an older build can
 * be missing fields a newer rule has, and the evaluator already treats a rule
 * it cannot read as one that does not apply. What it will not do is throw on
 * startup — a corrupt entry loses the rules, not the app.
 */
const readStored = (): RuleSet | null => {
  try {
    const raw = globalThis.localStorage?.getItem(RULES_KEY)

    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !Array.isArray((parsed as { rules?: unknown }).rules)
    ) {
      return null
    }

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see above
    return parsed as RuleSet
  } catch {
    return null
  }
}

const write = (key: string, value: unknown): void => {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value))
  } catch {
    // A full or blocked store is not worth interrupting the session for; the
    // rules stay live in memory either way.
  }
}

/**
 * Rules the panel can edit without editing the set they came from.
 *
 * A preset is a module-level constant, and the panel writes thresholds in
 * place — without this, loading SendCutSend twice would show whatever was done
 * to it the first time.
 */
const copyRules = (rules: ReadonlyArray<Rule>): Array<Rule> => {
  const copies: Array<Rule> = []

  for (const rule of rules) {
    copies.push({ ...rule })
  }

  return copies
}

export interface RulesState {
  /** Sets a shop saved, alongside the ones that ship. */
  savedSets: ReadonlyArray<RuleSet>
  /** Which set a new session opens on. */
  defaultId: string | undefined
  /** Whether the working copy differs from what was saved under its name. */
  dirty: boolean
  /** Renames the working copy, without saving it. */
  renameSet: (name: string) => void
  /** Writes the working copy back over the set it came from. */
  saveSet: () => void
  /** Keeps the working copy as a new named set, and switches to it. */
  saveAsNew: (name: string) => void
  deleteSet: (id: string) => void
  /** Makes the working copy the set every new session starts on. */
  makeDefault: () => void
  /** Every feature judged, in report order. */
  verdicts: Array<FeatureVerdict>
  score: PartScore
  ruleSet: RuleSet
  presets: ReadonlyArray<RuleSet>
  /** Replaces one rule, matched by id. */
  updateRule: (rule: Rule) => void
  /**
   * What the arrangement may spend on orientations.
   *
   * Part of the set rather than a rule in it: "how readily this shop
   * re-fixtures" belongs with its thresholds — a shop with a pallet changer
   * buys a setup far more cheaply than one with a vice — but it is about the
   * plan as a whole rather than about any feature.
   */
  updatePlan: (limits: PlanLimits) => void
  addRule: () => void
  removeRule: (id: string) => void
  loadPreset: (id: string) => void
  resetRules: () => void
}

/**
 * A stored rule set, with each shipped rule's audience brought up to date.
 *
 * The working copy lives in the browser so an afternoon of tuning survives a
 * reload — which also means a session that has one never receives a shipped
 * fix. A set written before `undercut_filleted_tslot` was named went on
 * skipping it, and the app looked unchanged after the fix landed.
 *
 * Only `featureTypes` is taken, and only for rules the shipped set still has by
 * id. Which features a rule looks at is this app's mapping onto the kernel's
 * type names, and it goes stale when the kernel adds one. The thresholds, the
 * weights, the bands and whether a rule is on are the shop's, and none of them
 * are touched.
 */
export const withShippedAudiences = (stored: RuleSet): RuleSet => {
  const shipped = new Map(DEFAULT_RULES.map((rule) => [rule.id, rule]))
  const rules: Array<Rule> = []

  for (const rule of stored.rules) {
    const original = shipped.get(rule.id)

    rules.push(original ? { ...rule, featureTypes: original.featureTypes } : rule)
  }

  return { ...stored, rules }
}

export const useRules = (
  features: ReadonlyArray<PartFeature>,
  /** The part's bounding box, for the rules that judge the part itself. */
  boundingBox?: ReadonlyArray<number>,
): RulesState => {
  const [stored, setStored] = useState<StoredRuleSets>(loadSets)
  const [ruleSet, setRuleSet] = useState<RuleSet>(() => {
    // What was being edited when the tab closed comes back first: an afternoon
    // of thresholds should survive a reload whether or not it was saved.
    const working = readStored()

    if (working) {
      // Unless it is the shipped set and the shipped set has moved on. A stored
      // copy of the defaults is not a decision anybody made, and keeping it
      // means a shipped fix never arrives — the reason a rule that skipped
      // `undercut_filleted_tslot` went on skipping it after the fix landed.
      const seededFrom = Number(globalThis.localStorage?.getItem(SHIPPED_KEY) ?? '0')

      if (working.id !== DEFAULT_RULE_SET.id || seededFrom === SHIPPED_VERSION) {
        return working
      }
    }

    const saved = loadSets()

    return (
      saved.sets.find((set) => set.id === saved.defaultId) ??
      PRESET_SETS.find((set) => set.id === saved.defaultId) ??
      DEFAULT_RULE_SET
    )
  })

  // Noted once the migration above has run, so it runs once rather than on
  // every mount. Without somewhere to write it the audiences are simply
  // refreshed again next time, which is the harmless direction.
  useEffect(() => {
    try {
      globalThis.localStorage?.setItem(SHIPPED_KEY, String(SHIPPED_VERSION))
    } catch {
      // A blocked store costs the note, not the rules.
    }
  }, [])

  const commit = useCallback((next: RuleSet) => {
    setRuleSet(next)
    write(RULES_KEY, next)
  }, [])

  const keep = useCallback((next: StoredRuleSets) => {
    setStored(next)
    writeSets(next)
  }, [])

  const updateRule = useCallback(
    (rule: Rule) => {
      commit({
        ...ruleSet,
        rules: ruleSet.rules.map((existing) => (existing.id === rule.id ? rule : existing)),
      })
    },
    [commit, ruleSet],
  )

  const addRule = useCallback(() => {
    // A threshold on reach, which is the measurement every feature carries —
    // a new rule that applies to nothing reads as broken before it has been
    // filled in.
    const rule: Rule = {
      // Unique for the lifetime of the set, so deleting a rule and adding
      // another cannot resurrect the deleted one's identity.
      id: globalThis.crypto?.randomUUID?.() ?? `rule-${ruleSet.rules.length}`,
      type: 'threshold',
      name: 'New rule',
      metric: 'depthBelowPartTop',
      direction: 'higher is harder',
      thresholds: [1, 2, 3, 4],
      weight: 2,
      enabled: true,
      featureTypes: [],
      note: '',
    }

    commit({ ...ruleSet, rules: [...ruleSet.rules, rule] })
  }, [commit, ruleSet])

  const removeRule = useCallback(
    (id: string) => {
      commit({
        ...ruleSet,
        rules: ruleSet.rules.filter((rule) => rule.id !== id),
      })
    },
    [commit, ruleSet],
  )

  const loadPreset = useCallback(
    (id: string) => {
      const found =
        PRESET_SETS.find((set) => set.id === id) ?? stored.sets.find((set) => set.id === id)

      if (found) {
        // A copy, so editing a loaded set does not edit the stored one until it
        // is saved.
        commit({ ...found, rules: copyRules(found.rules) })
      }
    },
    [commit, stored],
  )

  const updatePlan = useCallback(
    (plan: PlanLimits) => {
      commit({ ...ruleSet, plan })
    },
    [commit, ruleSet],
  )

  const renameSet = useCallback(
    (name: string) => {
      commit({ ...ruleSet, name })
    },
    [commit, ruleSet],
  )

  /**
   * Writes the working copy back over the set it came from.
   *
   * A shipped preset is not written over — those are somebody's published
   * guidelines and the point of citing them is that they stay as published — so
   * editing one and saving keeps it as a set of your own under the same name.
   */
  const saveSet = useCallback(() => {
    const shipped = PRESET_SETS.some((set) => set.id === ruleSet.id)
    /*
     * Saving a shipped set keeps a copy — but the *same* copy each time.
     *
     * The shipped ones stay as published, so Save cannot write over them. What
     * it must not do either is make a fresh copy on every press: a shop that
     * tuned the defaults three times ended up with three sets called "Toolpath
     * defaults" and no way to tell them apart, which reads as Save being
     * broken. A copy remembers where it came from, and the next Save finds it.
     */
    const mine = shipped ? stored.sets.find((set) => set.from === ruleSet.id) : undefined
    const saving = shipped
      ? mine
        ? { ...mine, rules: ruleSet.rules.map((rule) => ({ ...rule })) }
        : copyAs(ruleSet, `${ruleSet.name} (yours)`, ruleSet.id)
      : ruleSet
    const sets = stored.sets.some((set) => set.id === saving.id)
      ? stored.sets.map((set) => (set.id === saving.id ? saving : set))
      : [...stored.sets, saving]

    keep({ ...stored, sets })

    if (shipped) {
      commit(saving)
    }
  }, [commit, keep, ruleSet, stored])

  const saveAsNew = useCallback(
    (name: string) => {
      const saved = copyAs(ruleSet, name)

      keep({ ...stored, sets: [...stored.sets, saved] })
      commit(saved)
    },
    [commit, keep, ruleSet, stored],
  )

  const deleteSet = useCallback(
    (id: string) => {
      keep({
        ...stored,
        sets: stored.sets.filter((set) => set.id !== id),
        ...(stored.defaultId === id ? { defaultId: undefined } : {}),
      })
    },
    [keep, stored],
  )

  /**
   * Makes the working copy the set every new session starts on.
   *
   * Saves it first where it has not been saved: "these are the defaults now" is
   * one decision, and making somebody press two buttons to say it is the app
   * splitting hairs it invented.
   */
  const makeDefault = useCallback(() => {
    const shipped = PRESET_SETS.some((set) => set.id === ruleSet.id)
    const saving = shipped ? ruleSet : ruleSet
    const sets = stored.sets.some((set) => set.id === saving.id)
      ? stored.sets.map((set) => (set.id === saving.id ? saving : set))
      : shipped
        ? stored.sets
        : [...stored.sets, saving]

    keep({ ...stored, sets, defaultId: saving.id })
  }, [keep, ruleSet, stored])

  /** What this working copy was last saved as, when it was saved at all. */
  const origin = [...PRESET_SETS, ...stored.sets].find((set) => set.id === ruleSet.id)

  const resetRules = useCallback(() => {
    commit({ ...DEFAULT_RULE_SET, rules: copyRules(DEFAULT_RULE_SET.rules) })
  }, [commit])

  // Every feature against every rule on each change. A few hundred features by
  // a dozen rules is a few thousand comparisons — cheap enough to redo on a
  // threshold drag, which is what makes the recolour feel immediate.
  const verdicts = useMemo(
    () => evaluatePart(ruleSet.rules, features, boundingBox, ruleSet.plan?.machine),
    [boundingBox, features, ruleSet],
  )

  return {
    verdicts,
    score: useMemo(() => scorePart(verdicts), [verdicts]),
    ruleSet,
    presets: PRESET_SETS,
    savedSets: stored.sets,
    defaultId: stored.defaultId,
    // Compared against what is stored under this id: a preset that has been
    // edited is dirty against the preset, and a saved set against its save.
    dirty: !origin || !sameRules(origin, ruleSet),
    renameSet,
    saveSet,
    saveAsNew,
    deleteSet,
    makeDefault,
    updateRule,
    updatePlan,
    addRule,
    removeRule,
    loadPreset,
    resetRules,
  }
}
