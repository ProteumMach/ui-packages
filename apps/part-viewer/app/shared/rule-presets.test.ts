import { describe, expect, test } from 'vitest'
import type { PartFeature } from './contracts'
import { DEFAULT_RULES, DEFAULT_RULE_SET, PRESET_SETS, SHIPPED_VERSION } from './rule-presets'
import { evaluateFeature, evaluatePart, scoreFeature, scorePart } from './rules'
import { withShippedAudiences } from './use-rules'

/**
 * The shipped numbers are a shop's judgement rather than an example, so what is
 * pinned here is that they survive the port intact and that the set actually
 * judges a part — not whether any particular threshold is right.
 */

const feature = (over: Record<string, unknown> = {}) =>
  ({
    featureTag: 'hole-1',
    featureType: 'blind_hole',
    regionIdxs: [0],
    machiningDirection: { x: 0, y: 0, z: 1 },
    axis: { x: 0, y: 0, z: 1 },
    datasheet: {
      facts: { kind: 'Hole', diameter: 6.35 },
      zMax: 0,
      zMin: -25.4,
      partZMax: 0,
    },
    ...over,
  }) as unknown as PartFeature

describe('the shipped set', () => {
  test('ships the prototype’s own rules, rule for rule', () => {
    expect(DEFAULT_RULES).toHaveLength(15)
    expect(DEFAULT_RULES.filter((rule) => rule.type === 'threshold')).toHaveLength(9)
    expect(DEFAULT_RULES.filter((rule) => rule.type === 'match')).toHaveLength(4)
  })

  test('keeps the numbers somebody argued over', () => {
    const drilling = DEFAULT_RULES.find((rule) => rule.id === 'drilling-ld')

    // Past about 4:1 a standard drill wants pecking or a longer series. These
    // are the product; adjusting one because it looks odd on a fixture is not
    // a port.
    expect(drilling).toMatchObject({ thresholds: [3, 5, 8, 12], direction: 'higher is harder' })
  })

  test('says what every rule is for', () => {
    // A threshold nobody can explain is a threshold nobody can argue with.
    expect(DEFAULT_RULES.filter((rule) => !rule.note.trim())).toEqual([])
  })

  test('gives every rule its own id, so a saved set can be merged', () => {
    expect(new Set(DEFAULT_RULES.map((rule) => rule.id)).size).toBe(DEFAULT_RULES.length)
  })

  test('cites the set that came off somebody’s published page', () => {
    const cited = PRESET_SETS.find((set) => set.id === 'preset-sendcutsend')

    // A set of thresholds is only worth arguing with once it says whose it is.
    expect(cited?.source).toContain('sendcutsend.com')
  })
})

describe('judging a part with it', () => {
  test('reaches a verdict rather than staying silent throughout', () => {
    const verdict = evaluateFeature(DEFAULT_RULE_SET.rules, feature())

    // 25.4 deep in a 6.35 bore is 4:1 — something the shipped set has an
    // opinion about, which is the point of shipping it.
    expect(verdict.band).not.toBe(null)
    expect(verdict.results.length).toBeGreaterThan(0)
    expect(scoreFeature(verdict)).toBeGreaterThan(0)
  })

  test('counts what it could not judge instead of scoring it easy', () => {
    const unknown = feature({ featureType: 'wall', datasheet: null })
    const score = scorePart(evaluatePart(DEFAULT_RULE_SET.rules, [unknown]))

    // A feature the Engine described nothing about is not a feature that
    // passed. "0.94, and 200 unjudged" is a different statement from 0.94.
    expect(score.unjudged).toBe(1)
    expect(score.counts.easy).toBe(0)
  })
})

describe('SHIPPED_VERSION', () => {
  test('is a number a stored copy can be compared against', () => {
    // It goes up whenever a shipped rule's numbers change, or every existing
    // session keeps its stale copy and the fix looks like it never landed.
    expect(Number.isInteger(SHIPPED_VERSION)).toBe(true)
    expect(SHIPPED_VERSION).toBeGreaterThan(0)
  })
})

describe('who the shipped rules judge', () => {
  const audience = (id: string) =>
    new Set(DEFAULT_RULES.find((rule) => rule.id === id)?.featureTypes ?? [])

  test('counts a filleted pocket as the cavity it is', () => {
    // It was missing from the list the prototype used, so five rules skipped
    // it: the narrowest cut, wall height, sharp corners, the milling radius
    // range, and the floor radii it was reported against.
    for (const rule of [
      'min-cutout-width',
      'wall-height-ratio',
      'sharp-corners',
      'cutter-diameter',
      'standard-floor-radius',
    ]) {
      expect(audience(rule).has('filleted_pocket')).toBe(true)
    }
  })

  test('leaves the holes alone, which are not cavities to a cutter', () => {
    expect(audience('standard-drill-sizes').has('filleted_pocket')).toBe(false)
  })
})

describe('a set saved before this list changed', () => {
  test('takes the new audience without losing the numbers on it', () => {
    // Which features a rule looks at is this app's mapping onto the kernel's
    // type names, and it goes stale when the list is corrected. The thresholds
    // are the shop's and are not touched.
    const theirs = {
      id: 'theirs',
      name: 'Ours',
      rules: DEFAULT_RULES.map((rule) =>
        rule.id === 'standard-floor-radius'
          ? { ...rule, featureTypes: ['pocket'], weight: 99 }
          : rule,
      ),
    } as never

    const refreshed = withShippedAudiences(theirs)
    const floor = refreshed.rules.find((rule) => rule.id === 'standard-floor-radius')

    expect(floor?.featureTypes).toContain('filleted_pocket')
    expect(floor?.weight).toBe(99)
  })
})
