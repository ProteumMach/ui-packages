import { directionColor, directionIndexOf } from '@toolpath/viewer'
import type { PartFeature } from './report'

/**
 * What the part is coloured by while nothing is selected.
 *
 * `plain` is the default and is not "colour off" — it is "no standing
 * opinion". Selection, hover and the faces being held still paint over it; what
 * changes is whether the part carries an answer to a question nobody has asked
 * yet.
 */
export type PaintMode = 'plain' | 'directions'

export const PAINT_MODES: readonly PaintMode[] = ['plain', 'directions']

/** How strongly the standing wash covers the part, under everything else. */
export const PAINT_WEIGHT = 0.7

const STORAGE_KEY = 'part-viewer.paint'

/**
 * The mode persists across parts and pages: what the part is coloured by is the
 * first thing anybody changes, and having to change it again on every part
 * turns a preference into a chore.
 */
export function loadPaintMode(storage: Pick<Storage, 'getItem'> | null): PaintMode {
  const stored = storage?.getItem(STORAGE_KEY)
  return stored === 'directions' ? 'directions' : 'plain'
}

export function savePaintMode(storage: Pick<Storage, 'setItem'> | null, mode: PaintMode): void {
  storage?.setItem(STORAGE_KEY, mode)
}

export interface FeatureWash {
  readonly tag: string
  readonly color: number
  readonly weight: number
}

/**
 * The standing wash for a mode.
 *
 * In `directions`, every feature takes its machining direction's colour — the
 * same colour that direction's arrow wears, and the same one its row carries.
 * That triple is the point of the palette: it is an identity, not a ranking.
 *
 * A feature whose direction is not among the part's candidates is left bare
 * rather than given a colour of its own. Nothing observed produces one, and
 * inventing a tenth colour for it would say the part has a way up that the
 * arrows do not show.
 */
export function paintWash(
  mode: PaintMode,
  features: readonly PartFeature[],
  candidateDirections: readonly { x: number; y: number; z: number }[],
): FeatureWash[] {
  if (mode !== 'directions') return []

  const washes: FeatureWash[] = []
  for (const feature of features) {
    const index = directionIndexOf({ candidateDirections }, feature.machiningDirection)
    if (index === -1) continue
    washes.push({ tag: feature.featureTag, color: directionColor(index), weight: PAINT_WEIGHT })
  }
  return washes
}
