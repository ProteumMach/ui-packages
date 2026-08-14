import { directionColor, directionIndexOf } from '@toolpath/viewer'
import type { PartFeature } from './report'
import { bandHex, paintOrder } from './bands'
import type { Band } from './rules'

/**
 * What the part is coloured by while nothing is selected.
 *
 * `plain` is the default and is not "colour off" — it is "no standing
 * opinion". Selection, hover and the faces being held still paint over it; what
 * changes is whether the part carries an answer to a question nobody has asked
 * yet.
 */
export type PaintMode = 'plain' | 'directions' | 'difficulty'

export const PAINT_MODES: readonly PaintMode[] = ['plain', 'directions', 'difficulty']

/**
 * The modes, in the order they are offered.
 *
 * Words rather than icons, unlike the rest of the toolbar: these are the
 * question the part is answering, and "no standing opinion" has no picture.
 */
export const PAINT_MODE_LABELS: readonly (readonly [PaintMode, string])[] = [
  ['plain', 'Plain'],
  ['directions', 'Directions'],
  ['difficulty', 'Difficulty'],
]

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
  return PAINT_MODES.find((mode) => mode === stored) ?? 'plain'
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
  /** What the rules made of each feature, for `difficulty`. */
  verdicts: readonly { tag: string; band: Band | null }[] = [],
): FeatureWash[] {
  if (mode === 'difficulty') return difficultyWash(verdicts)
  if (mode !== 'directions') return []

  const washes: FeatureWash[] = []
  for (const feature of features) {
    const index = directionIndexOf({ candidateDirections }, feature.machiningDirection)
    if (index === -1) continue
    washes.push({ tag: feature.featureTag, color: directionColor(index), weight: PAINT_WEIGHT })
  }
  return washes
}

/**
 * The part by how hard each feature is, in the five band colours.
 *
 * Painted easiest last, so where two features share a surface the gentler
 * reading is the one on screen: a face nobody has placed is shown at its best,
 * which is the best a shop could do if it held the part that way. Unjudged
 * paints first and loses to everything, since "nobody looked" should not cover
 * a colour that means something.
 */
function difficultyWash(verdicts: readonly { tag: string; band: Band | null }[]): FeatureWash[] {
  return [...verdicts]
    .sort((a, b) => paintOrder(b.band) - paintOrder(a.band))
    .map((verdict) => ({
      tag: verdict.tag,
      color: bandHex(verdict.band),
      weight: PAINT_WEIGHT,
    }))
}
