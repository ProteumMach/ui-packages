import { DIRECTION_COLORS } from '@toolpath/viewer'
import { describe, expect, it } from 'vitest'
import { loadPaintMode, paintWash, savePaintMode } from './paint'
import { BAND_HEX, UNJUDGED_HEX } from './bands'
import type { PartFeature } from './report'

const feature = (tag: string, direction: { x: number; y: number; z: number }) =>
  ({
    featureTag: tag,
    featureType: 'wall',
    regionIdxs: [0],
    machiningDirection: direction,
  }) as PartFeature

const directions = [
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
]

describe('paintWash', () => {
  it('gives every feature the colour of the direction it is cut from', () => {
    const washes = paintWash(
      'directions',
      [feature('a', directions[0]!), feature('b', directions[1]!)],
      directions,
    )

    // The same colour identifies that direction on the part, on its arrow, and
    // on its row — an identity rather than a ranking.
    expect(washes.map((w) => w.color)).toEqual([DIRECTION_COLORS[0], DIRECTION_COLORS[1]])
  })

  it('paints nothing at all in plain', () => {
    expect(paintWash('plain', [feature('a', directions[0]!)], directions)).toEqual([])
  })

  it('leaves a feature bare when its direction is not one the part offers', () => {
    const washes = paintWash('directions', [feature('a', { x: 1, y: 0, z: 0 })], directions)

    // Bare rather than a tenth colour: a colour the arrows cannot show would
    // claim the part has a way up that it does not.
    expect(washes).toEqual([])
  })

  it('stays under the layers that answer "what did I just click"', () => {
    const [wash] = paintWash('directions', [feature('a', directions[0]!)], directions)

    expect(wash?.weight).toBeLessThan(1)
  })
})

describe('the mode persists', () => {
  it('round-trips through storage and defaults to plain', () => {
    const store = new Map<string, string>()
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    }

    expect(loadPaintMode(storage)).toBe('plain')
    savePaintMode(storage, 'directions')
    expect(loadPaintMode(storage)).toBe('directions')
  })

  it('survives having no storage at all', () => {
    expect(loadPaintMode(null)).toBe('plain')
    expect(() => savePaintMode(null, 'directions')).not.toThrow()
  })
})

describe('the difficulty wash', () => {
  const verdicts = [
    { tag: 'easy-1', band: 'easy' as const },
    { tag: 'refused-1', band: 'no go' as const },
    { tag: 'unjudged-1', band: null },
  ]

  it('gives every feature the colour of the band it landed in', () => {
    const wash = paintWash('difficulty', [], [], verdicts)

    expect(wash.find((each) => each.tag === 'easy-1')?.color).toBe(BAND_HEX.easy)
    expect(wash.find((each) => each.tag === 'refused-1')?.color).toBe(BAND_HEX['no go'])
  })

  it('gives a feature nothing judged a colour that is not the colour of easy', () => {
    const wash = paintWash('difficulty', [], [], verdicts)

    // "Nothing judged this" and "this is fine" are different statements, and a
    // part that shows them the same way is a part claiming to have been checked.
    expect(wash.find((each) => each.tag === 'unjudged-1')?.color).toBe(UNJUDGED_HEX)
    expect(UNJUDGED_HEX).not.toBe(BAND_HEX.easy)
  })

  it('paints the easiest reading last, so a shared surface shows its best', () => {
    const order = paintWash('difficulty', [], [], verdicts).map((each) => each.tag)

    // A face nobody has placed is shown at its best — the best a shop could do
    // if it held the part that way. Unjudged sits behind everything, since
    // "nobody looked" should not cover a colour that means something.
    expect(order).toEqual(['unjudged-1', 'refused-1', 'easy-1'])
  })

  it('says nothing in the other modes, whatever the rules made of the part', () => {
    expect(paintWash('plain', [], [], verdicts)).toEqual([])
  })
})
