/**
 * One EMUGE-FRANKEN property — its label and its value — read.
 *
 * The API answers every measurement as a `{ property, value }` pair of display
 * strings, and both halves need work before they can be a CSV column and a
 * number:
 *
 * ```json
 * { "property": "cutting diameter Ød₁ [inch]", "value": "1 1/2 \"" }
 * { "property": "overall length l₁",           "value": "38 mm" }
 * { "property": "point angle",                 "value": "140 deg" }
 * ```
 *
 * ## The unit is in the value; the label's tag is unreliable
 *
 * `cutting length l₂ [mm]` carries a unit tag and `overall length l₁` and
 * `neck diameter Ød₃` do not, on the same part, in the same response. So a
 * label's tag is stripped for the column name — the CSV states the unit once,
 * in `conventions.UNIT_SUFFIX`'s suffix, and a label that carried `[mm]` as
 * well would state it twice — and the reading of the unit comes from the value,
 * which states one on every measurement seen.
 *
 * A stated unit that disagrees with the family's is converted and warned about
 * rather than refused, the same call `vendors/harvey/value.ts` makes: the value
 * is right and the column's suffix is right, so dropping the row would lose a
 * part somebody can order.
 *
 * ## What is deliberately not read
 *
 * **A range.** `helix angle` is `35-38 deg` and `clamping diameter ØD₁` is
 * `2 - 10 mm`; `measure.fractionValue` would read the first as `73`, because
 * its mixed-number form is `1-1/2` and `35-38` fits it with the denominator
 * absent. {@link NUMBER} admits no hyphenated form at all — EMUGE writes a
 * mixed number space-separated, `1 1/2` — so a range has no reading here, and
 * the columns those two land in are unmapped receipt columns anyway.
 *
 * **A tolerance.** `<=0,003 mm`, `± 0,0008 "`. These carry a German decimal
 * comma where every dimensional value uses a dot, and they lead with a
 * comparator. Guessing at what a comma means in a number this package is about
 * to publish is exactly the kind of quiet wrong answer `measure.ts` refuses to
 * make; they get no reading and stay in the CSV as the vendor's own text.
 */

import { type UnitSystem } from '../../conventions.js'
import { convertLength, fractionValue } from '../../measure.js'
import { consoleWarn, type Warn } from '../../scrape.js'

/** A label's trailing unit tag: `[mm]`, `[inch]`, `[in]`. */
const LABEL_UNIT = /\s*\[(?:mm|in|inch)\]\s*$/i

/**
 * A decimal, a simple fraction, or a mixed number written with a **space**,
 * followed by the unit the value states.
 *
 * Ordered longest-first, because `\d*\.?\d+` alone matches the `1` of `1 1/2`
 * and would leave the rest unread — a 1.5 inch tool published as a 1 inch one.
 *
 * No hyphenated mixed number: see the module docstring. `"` is EMUGE's inch
 * mark and `deg` its degree word; both are written with a leading space in
 * every value seen, and the `\s*` tolerates one that is not.
 */
const NUMBER = /^(\d+\s+\d+\/\d+|\d*\.?\d+\/\d+|\d*\.?\d+)\s*(mm|"|deg)?$/

/** What a value states about itself: a length system, or degrees. */
export type StatedUnit = UnitSystem | 'degrees'

/** One value string, read. */
export interface EmugeMeasure {
  /** The number it states, in {@link EmugeMeasure.stated}. Null where none. */
  readonly value: number | null
  /** The unit the value names outright. Null where it names none. */
  readonly stated: StatedUnit | null
}

const NOTHING: EmugeMeasure = { value: null, stated: null }

const UNITS: Record<string, StatedUnit> = {
  mm: 'millimeters',
  '"': 'inches',
  deg: 'degrees',
}

/**
 * A property label with its unit tag removed — the CSV's bare label.
 *
 * `'cutting diameter Ød₁ [inch]'` -> `'cutting diameter Ød₁'`. Everything else
 * about the label is left exactly as the vendor wrote it, subscripts and `Ø`
 * included: the CSV is the receipt, and the tag is the one part of it that the
 * column's own `_mm`/`_in` suffix already says.
 */
export function bareLabel(property: string): string {
  return property.replace(LABEL_UNIT, '').trim()
}

/**
 * One value string -> its number and the unit it states.
 *
 * `''`, a range, a tolerance and any other text come back stating nothing —
 * there is no number there and 0 is not a substitute for one.
 */
export function parseMeasure(display: string): EmugeMeasure {
  const text = display.trim()
  if (text === '') return NOTHING

  const matched = NUMBER.exec(text)
  if (matched === null) return NOTHING

  // A space-separated mixed number is the one shape `fractionValue` does not
  // take: its own form is `1-1/2`. Normalising here rather than widening the
  // core reader keeps the hyphen shape — and the `35-38` range that shape would
  // swallow — out of this vendor entirely.
  const value = fractionValue(matched[1]!.replace(/\s+/, '-'))
  if (value === null) return NOTHING

  const unit = matched[2]
  return { value, stated: unit === undefined ? null : UNITS[unit]! }
}

/**
 * One value as a length in `unit`, or null where it publishes none.
 *
 * An angle reaching a length column is refused rather than converted: that is a
 * property that has moved, not a value that is odd.
 */
export function measureIn(
  display: string,
  unit: UnitSystem,
  what: string,
  warn: Warn = consoleWarn,
): number | null {
  const { value, stated } = parseMeasure(display)
  if (value === null) return null

  if (stated === 'degrees') {
    warn(
      `  WARNING: ${what}: ${JSON.stringify(display)} is an angle in a column ` +
        `read as a length — skipped`,
    )
    return null
  }

  if (stated !== null && stated !== unit) {
    warn(
      `  WARNING: ${what}: ${JSON.stringify(display)} states ${stated} in a ` +
        `family published in ${unit} — converted`,
    )
    return convertLength(value, stated, unit)
  }

  return value
}

/** One value as a whole count — a flute number. Null where there is none. */
export function wholeCount(display: string): number | null {
  const { value } = parseMeasure(display)
  if (value === null || !Number.isInteger(value)) return null
  return value
}
