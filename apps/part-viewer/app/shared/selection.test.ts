import type { PartPick } from '@toolpath/viewer'
import { describe, expect, it } from 'vitest'
import {
  NOTHING_SELECTED,
  heldRegions,
  isEmptySelection,
  pickFace,
  stepCandidate,
} from './selection'

const pick = (region: number, ranked: string[], holding = false): PartPick => ({
  region,
  owners: ranked,
  ranked,
  best: ranked[0] ?? null,
  triangleIndex: region,
  point: [0, 0, 0],
  normal: [0, 0, 1],
  modifiers: { alt: false, ctrl: false, meta: holding, shift: false, secondary: false },
})

const wallA = pick(1, ['pocket', 'wall-a', 'profile'])
const wallB = pick(2, ['pocket', 'wall-b', 'profile'], true)

describe('pickFace', () => {
  it('offers a face’s readings and reads the best of them', () => {
    const state = pickFace(NOTHING_SELECTED, wallA)

    expect(state.candidates).toEqual(['pocket', 'wall-a', 'profile'])
    expect(state.focused).toBe('pocket')
  })

  it('narrows to the readings that own every held face', () => {
    const state = pickFace(pickFace(NOTHING_SELECTED, wallA), wallB)

    // The two walls own one face each and drop out; what is left covers both.
    expect(state.candidates).toEqual(['pocket', 'profile'])
    expect(heldRegions(state)).toEqual([1, 2])
  })

  it('releases a held face when it is clicked again', () => {
    const held = pickFace(pickFace(NOTHING_SELECTED, wallA), wallB)

    expect(heldRegions(pickFace(held, pick(2, ['pocket'], true)))).toEqual([1])
  })

  it('says nothing when held faces share no reading', () => {
    const state = pickFace(pickFace(NOTHING_SELECTED, wallA), pick(9, ['lonely'], true))

    expect(state.candidates).toEqual([])
    expect(state.focused).toBeNull()
  })

  it('walks the readings of one face on repeated clicks', () => {
    const first = pickFace(NOTHING_SELECTED, wallA)
    const second = pickFace(first, wallA)

    expect(first.focused).toBe('pocket')
    expect(second.focused).toBe('wall-a')
  })

  it('clears when a click lands back on the reading already being read', () => {
    let state = pickFace(NOTHING_SELECTED, pick(1, ['only']))
    state = pickFace(state, pick(1, ['only']))

    expect(state).toEqual(NOTHING_SELECTED)
  })

  /**
   * The rule above is limited to the same face on purpose. A feature spans
   * several faces, so clicking a second face of the one being read resolves to
   * the same reading — and clearing there makes it impossible to keep a
   * multi-face feature selected while looking around it.
   */
  it('keeps the selection when another face resolves to the same reading', () => {
    const first = pickFace(NOTHING_SELECTED, pick(1, ['pocket', 'wall-a']))
    const second = pickFace(first, pick(2, ['pocket', 'wall-b']))

    expect(second.focused).toBe('pocket')
    expect(heldRegions(second)).toEqual([2])
  })

  it('clears on a click that hits nothing', () => {
    expect(pickFace(pickFace(NOTHING_SELECTED, wallA), null)).toEqual(NOTHING_SELECTED)
  })
})

describe('isEmptySelection', () => {
  it('is true only when nothing is held, offered, or read', () => {
    expect(isEmptySelection(NOTHING_SELECTED)).toBe(true)
    expect(isEmptySelection(pickFace(NOTHING_SELECTED, wallA))).toBe(false)
    // A reading named in the list holds no faces, and is still a selection.
    expect(isEmptySelection({ picks: [], candidates: [], focused: 'pocket' })).toBe(false)
  })
})

describe('stepCandidate', () => {
  it('walks the candidates and wraps at both ends', () => {
    const state = pickFace(NOTHING_SELECTED, wallA)

    expect(stepCandidate(state, 1).focused).toBe('wall-a')
    expect(stepCandidate(stepCandidate(state, -1), 0).focused).toBe('profile')
  })

  it('does nothing when there is nothing to walk', () => {
    expect(stepCandidate(NOTHING_SELECTED, 1)).toEqual(NOTHING_SELECTED)
  })
})
