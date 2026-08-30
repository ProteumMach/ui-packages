/**
 * One display cell -> a number, or an honest reason there is none.
 *
 * Harvey publishes values the way a printed catalog does, because the table is
 * a printed catalog: `.1250 (1/8)` is a decimal with the fraction a machinist
 * orders by beside it, `1-1/2` is a mixed number, `3 mm` is a metric shank on
 * an imperial page, and `-` means the column does not apply to that row.
 *
 * **One rule covers the whole grammar: the value is the leading token, and
 * anything in parentheses is Harvey's own equivalent annotation.** Every shape
 * measured across all 12,799 parts is in `docs/HARVEY_PRODUCT_TABLE.md` §4;
 * this module is that section as code.
 *
 * ## Read `d`, never `v`
 *
 * Each cell also carries `v`, which looks pre-parsed and is the wrong field: it
 * changes unit basis *within a single row*. On the metric ball page, `v` is the
 * inch equivalent for the cutter diameter and the raw millimetre number for the
 * length of cut. Anything reading it gets a clean conversion with wrong numbers
 * in it — the exact failure `conventions.UNIT_SUFFIX` exists to prevent.
 *
 * ## A stated unit wins over the column's
 *
 * 46 cells across six otherwise-imperial families state a metric value outright
 * — `3 mm` in a `SHANK DIAMETER` column on an inch page, a metric-shank tool
 * listed among imperial ones. {@link dimension} converts those into the family's
 * declared unit and warns, naming the part. It does **not** treat a
 * parenthesised `(3 mm)` that way: that is an annotation on an inch value, and
 * converting it would turn `.1181 in` into `3 in`.
 */

import type { UnitSystem } from '../../conventions.js'
import { convertLength, fractionValue } from '../../measure.js'
import { consoleWarn, type Warn } from '../../scrape.js'

/**
 * Footnote references Harvey appends to a value or a tool number. 62 cells
 * carry one; each points at a note printed under the table, and none of them is
 * part of the number.
 */
const FOOTNOTE = /[*!†]+$/

/** Harvey's own equivalent, in parentheses at the end: `(1/8)`, `(3 mm)`. */
const ANNOTATION = /\s*\(([^)]*)\)\s*$/

/** `(1.5x)`, `(30x)` — the vendor's reach- or length-to-diameter ratio. */
const RATIO = /^(\d*\.?\d+)x$/

/**
 * A mixed number, a simple fraction or a decimal, with an optional unit.
 *
 * The alternation is ordered longest-first on purpose: `\d*\.?\d+` alone
 * matches the `3` of `3-3/4` and would leave the rest unread, which parses a
 * 3.75-inch tool as a 3-inch one.
 */
const NUMBER = /^(\d+-\d+\/\d+|\d*\.?\d+\/\d+|\d*\.?\d+)\s*(mm|°)?$/

/** What one display cell says. */
export interface HarveyValue {
  /** The leading numeric token, in whatever {@link stated} says. */
  readonly value: number | null
  /** The unit the token states outright. Null where it states none. */
  readonly stated: UnitSystem | null
  /** True where the token is an angle in degrees rather than a length. */
  readonly degrees: boolean
  /** Harvey's parenthesised equivalent, verbatim — `1/8`, `3 mm`, `N.P.T.`. */
  readonly annotation: string | null
  /** The multiplier a `(1.5x)` cell states, and nothing else. */
  readonly ratio: number | null
  /** Text with no numeric reading at all: `I`, `II`, `III`, `LONG`. */
  readonly code: string | null
}

const NOTHING: HarveyValue = {
  value: null,
  stated: null,
  degrees: false,
  annotation: null,
  ratio: null,
  code: null,
}

/**
 * One cell's display text, read.
 *
 * An empty cell and a `-` both come back as {@link NOTHING}. They mean slightly
 * different things to a reader of the catalog — "nothing published" and "does
 * not apply" — and the same thing to anything building a record, which is that
 * there is no number here and 0 is not a substitute for one.
 */
export function parseValue(display: string): HarveyValue {
  const text = display.trim().replace(FOOTNOTE, '').trim()
  if (text === '' || text === '-') return NOTHING

  const annotated = ANNOTATION.exec(text)
  const annotation = annotated?.[1]?.trim() ?? null
  const head = annotated ? text.slice(0, annotated.index).trim() : text

  if (head === '') {
    const ratio = annotation === null ? null : RATIO.exec(annotation)
    if (ratio) return { ...NOTHING, ratio: Number(ratio[1]) }
    return { ...NOTHING, annotation }
  }

  const number = NUMBER.exec(head)
  // `measure.fractionValue` is stricter than {@link NUMBER} in one place — it
  // refuses a division by zero — so a token that matched here can still have no
  // reading, and that is a code cell rather than a number.
  const value = number === null ? null : fractionValue(number[1]!)
  if (number === null || value === null) return { ...NOTHING, annotation, code: head }

  const unit = number[2]
  return {
    value,
    stated: unit === 'mm' ? 'millimeters' : null,
    degrees: unit === '°',
    annotation,
    ratio: null,
    code: null,
  }
}

/**
 * One cell as a length in `unit`, or null where it publishes none.
 *
 * A cell that states its own unit and disagrees with the family's is converted
 * and warned about rather than refused: the value is right, the column's suffix
 * is right, and the 46 cells this happens on are real tools somebody can order.
 * Refusing would drop them; trusting the column's unit would publish a 3-inch
 * shank.
 *
 * An angle reaching a dimensional column is refused, because that is a header
 * that has moved rather than a value that is odd.
 */
export function dimension(
  display: string,
  unit: UnitSystem,
  what: string,
  warn: Warn = consoleWarn,
): number | null {
  const parsed = parseValue(display)
  if (parsed.value === null) return null

  if (parsed.degrees) {
    warn(
      `  WARNING: ${what}: ${JSON.stringify(display)} is an angle in a column ` +
        `read as a length — skipped`,
    )
    return null
  }

  if (parsed.stated !== null && parsed.stated !== unit) {
    warn(
      `  WARNING: ${what}: ${JSON.stringify(display)} states ${parsed.stated} ` +
        `in a family published in ${unit} — converted`,
    )
    return convertLength(parsed.value, parsed.stated, unit)
  }

  return parsed.value
}

/** One cell as a whole count — a flute or tooth number. Null where blank. */
export function count(display: string): number | null {
  const parsed = parseValue(display)
  if (parsed.value === null || !Number.isInteger(parsed.value)) return null
  return parsed.value
}
