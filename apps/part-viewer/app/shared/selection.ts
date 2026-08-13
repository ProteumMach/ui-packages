import { focusForPick, type PartPick } from '@toolpath/viewer'
import { holdFace, sharedReadings } from './picks'

/**
 * What the viewport has been asked about, and what is being read because of it.
 *
 * Held apart from the feature list on purpose: a click resolves to five to
 * eight readings, so "what was clicked" and "what is being read" are different
 * questions and answering them with one value is where this goes wrong.
 */
export interface SelectionState {
  /** The faces being held, most recent last. */
  readonly picks: readonly PartPick[]
  /** The readings those faces share, best first. */
  readonly candidates: readonly string[]
  readonly focused: string | null
}

export const NOTHING_SELECTED: SelectionState = { picks: [], candidates: [], focused: null }

/**
 * A click on the part.
 *
 * Plain, it replaces what was held. With a modifier it adds a face, and the
 * candidates narrow to the readings that own every held face — two walls of a
 * pocket resolve to the pocket.
 *
 * Clicking the same face again walks its readings, and walking back onto the
 * one already being read clears the selection. That last rule is deliberately
 * limited to the same face: a click on a *different* face that happens to
 * resolve to the same reading is still a click on something, and clearing there
 * makes a feature that spans two faces impossible to keep selected.
 */
export function pickFace(state: SelectionState, pick: PartPick | null): SelectionState {
  if (!pick) return NOTHING_SELECTED

  const adding = pick.modifiers.meta || pick.modifiers.ctrl
  const held = adding ? holdFace(state.picks, pick) : [pick]
  if (held.length === 0) return NOTHING_SELECTED

  if (held.length > 1) {
    const candidates = sharedReadings(held)
    return { picks: held, candidates, focused: candidates[0] ?? null }
  }

  const previous = state.picks.length === 1 ? (state.picks[0]?.region ?? null) : null
  const focused = focusForPick(pick, previous, state.focused)

  if (previous === pick.region && focused !== null && focused === state.focused) {
    return NOTHING_SELECTED
  }

  return { picks: held, candidates: [...pick.ranked], focused }
}

/** Moves through the candidates with the keyboard, wrapping at both ends. */
export function stepCandidate(state: SelectionState, step: number): SelectionState {
  if (state.candidates.length === 0) return state

  const at = state.focused === null ? -1 : state.candidates.indexOf(state.focused)
  const next = (at + step + state.candidates.length) % state.candidates.length

  return { ...state, focused: state.candidates[next] ?? null }
}

/** The faces being held, for painting them so a second click has something to aim at. */
export function heldRegions(state: SelectionState): number[] {
  return state.picks.map((pick) => pick.region)
}
