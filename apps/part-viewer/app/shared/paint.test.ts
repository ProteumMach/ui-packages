import { DIRECTION_COLORS } from '@toolpath/viewer'
import { describe, expect, it } from 'vitest'
import { loadPaintMode, paintWash, savePaintMode } from './paint'
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
