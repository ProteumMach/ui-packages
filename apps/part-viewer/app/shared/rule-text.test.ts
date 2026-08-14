import { describe, expect, test } from 'vitest'
import { formatMetric, ruleAudience, ruleLimits, ruleReads } from './rule-text'
import type { ThresholdRule } from './rules'

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

  test('states no unit for a number whose unit it does not know', () => {
    // The inputs to an L/D are two lengths, and printing one as "6.35:1" states
    // a unit the Engine never reported.
    expect(formatMetric(6.35, undefined, 'mm')).toBe('6.35')
    expect(formatMetric(2, undefined, 'mm')).toBe('2')
  })
})

describe('ruleLimits', () => {
  test('lays out the bands a measurement was judged against', () => {
    const limits = ruleLimits(drilling, 'mm')

    expect(limits.map((limit) => `${limit.name} ${limit.range}`)).toEqual([
      'easy 0.00:1 – 3.00:1',
      'alright 3.00:1 – 5.00:1',
      'meh 5.00:1 – 8.00:1',
      'rats 8.00:1 – ∞',
    ])
    // The band is carried alongside its words, so a row can be marked as the
    // one a measurement landed in without matching on the text.
    expect(limits.map((limit) => limit.band)).toEqual(['easy', 'alright', 'meh', 'rats'])
  })

  test('opens at zero and closes at infinity, whichever way the rule runs', () => {
    // Every measurement a rule reads bottoms out at zero, so "∞ – 3:1" for the
    // easy band would read as a limit nobody wrote. A rule where lower is
    // harder simply has its easy band at the top.
    const falling = ruleLimits({ ...drilling, direction: 'lower is harder' as const }, 'mm')

    expect(falling[0]?.range).toBe('3.00:1 – ∞')
    expect(falling.at(-1)?.range).toContain('0.00:1')
  })

  test('shows the refusal as its own step once there is one', () => {
    const refused = ruleLimits({ ...drilling, noGo: 15 }, 'mm').at(-1)

    expect(refused).toMatchObject({ band: 'no go', range: '15.00:1 – ∞' })
  })

  test('uses a shop’s own words for the bands', () => {
    expect(ruleLimits(drilling, 'mm', { rats: 'call me' }).at(-1)?.name).toBe('call me')
  })

  test('has nothing to lay out for a rule with no scale', () => {
    expect(ruleLimits({ ...drilling, type: 'baseline', bands: {} } as never, 'mm')).toEqual([])
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
