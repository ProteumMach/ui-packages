import { describe, expect, test } from 'vitest'
import { formatMetric, ruleAudience, ruleLimits, ruleReads, ruleWorking } from './rule-text'
import type { RuleResult, ThresholdRule } from './rules'

const drilling: ThresholdRule = {
  id: 'drilling-ld',
  type: 'threshold',
  name: 'Drilling L/D',
  metric: 'drillingLD',
  direction: 'higher is harder',
  thresholds: [3, 5, 8, 12],
  weight: 14,
  enabled: true,
  featureTypes: ['blind_hole', 'through_hole'],
  note: 'Reach down to the bottom of the hole over its diameter.',
}

describe('formatMetric', () => {
  test('converts lengths and leaves ratios alone', () => {
    // A 5:1 pocket is 5:1 in any shop, and a chamfer is 45° in both.
    expect(formatMetric(25.4, 'depth', 'mm')).toBe('25.40 mm')
    expect(formatMetric(25.4, 'depth', 'in')).toBe('1.000 in')
    expect(formatMetric(4, 'drillingLD', 'in')).toBe('4.00:1')
    expect(formatMetric(45, 'chamferAngle', 'in')).toBe('45.0°')
  })

  test('says nothing rather than zero when there is no measurement', () => {
    expect(formatMetric(null, 'depth', 'mm')).toBe('—')
  })
})

describe('ruleLimits', () => {
  test('lays out the bands a measurement was judged against', () => {
    const limits = ruleLimits(drilling, 'mm')

    expect(limits).toEqual([
      'easy 0.00:1 – 3.00:1',
      'alright 3.00:1 – 5.00:1',
      'meh 5.00:1 – 8.00:1',
      'rats 8.00:1 – ∞',
    ])
  })

  test('opens at zero and closes at infinity, whichever way the rule runs', () => {
    // Every measurement a rule reads bottoms out at zero, so "∞ – 3:1" for the
    // easy band would read as a limit nobody wrote. A rule where lower is
    // harder simply has its easy band at the top.
    const falling = ruleLimits({ ...drilling, direction: 'lower is harder' as const }, 'mm')

    expect(falling[0]).toBe('easy 3.00:1 – ∞')
    expect(falling.at(-1)).toContain('0.00:1')
  })

  test('shows the refusal as its own step once there is one', () => {
    expect(ruleLimits({ ...drilling, noGo: 15 }, 'mm').at(-1)).toBe('no go 15.00:1 – ∞')
  })

  test('uses a shop’s own words for the bands', () => {
    expect(ruleLimits(drilling, 'mm', { rats: 'call me' }).join(' ')).toContain('call me')
  })

  test('has nothing to lay out for a rule with no scale', () => {
    expect(ruleLimits({ ...drilling, type: 'baseline', bands: {} } as never, 'mm')).toEqual([])
  })
})

describe('ruleWorking', () => {
  const result = { rule: drilling, band: 'alright', value: 4 } as RuleResult

  test('says what the rule is for, how the number came about, and what it was judged against', () => {
    const working = ruleWorking(result, 'mm', 'partZMax − zMin ÷ facts.diameter')

    // A number a shop cannot trace is one they have to take on faith.
    expect(working).toContain('Reach down to the bottom')
    expect(working).toContain('facts.diameter')
    expect(working).toContain('easy')
  })

  test('prefers a rule’s own arithmetic to the metric’s', () => {
    // A rule written as a sum reads several measurements at once, so no one
    // metric's formula is the answer.
    const own = { ...result, rule: { ...drilling, expression: 'depth / requiredCutter' } }

    expect(ruleWorking(own as RuleResult, 'mm', 'ignored')).toContain('depth / requiredCutter')
  })
})

describe('what a rule says about itself', () => {
  test('names who it applies to without listing twenty types', () => {
    expect(ruleAudience(drilling)).toBe('blind hole, through hole')
    expect(ruleAudience({ ...drilling, featureTypes: [] })).toBe('every feature')
    expect(ruleAudience({ ...drilling, featureTypes: Array(9).fill('wall') })).toBe(
      '9 feature types',
    )
  })

  test('names what it reads', () => {
    expect(ruleReads(drilling)).toBe('Drilling L/D')
    expect(ruleReads({ ...drilling, type: 'baseline', bands: {} } as never)).toContain('kind of')
  })
})
