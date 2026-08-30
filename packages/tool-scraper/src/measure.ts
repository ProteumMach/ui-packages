/**
 * Reading a machinist's number, and the one constant between the two systems.
 *
 * Three vendors publish dimensions the way a printed catalog does — `.250`,
 * `3/4`, `1-1/2` — and until this module each adapter had its own reader for
 * that grammar. They disagreed on real inputs: REGO-FIX's `parseSize` handled
 * no mixed number at all, so `1-1/2` reached `Number()` as `NaN` and was
 * refused; Destiny Tool's `parseFractionInches` branched on a `.` first, so
 * `1.5-1/2` was refused there and read as 2 by Harvey's. And they disagreed on
 * *how* they refused — two threw `RangeError`, one answered `null`.
 *
 * That is the same shape `fetch.createFetcher` and `scrape.pause` were pulled
 * out for, and the same argument: four copies of four lines is not expensive,
 * four copies of the **decisions** in them is, because the decisions are the
 * part that has to be consistent. A dimension string is the last thing in this
 * package that should mean two things.
 *
 * ## The reader answers `null`; the caller decides what that costs
 *
 * {@link fractionValue} is the primitive, and it never throws: whether an
 * unreadable cell is a skipped row, a warning or a refusal is a vendor's call,
 * and every adapter here already makes it differently for good reasons. Harvey
 * skips a `-` cell because the column does not apply to that row; REGO-FIX
 * refuses, because a collet with no size is not a part. Pushing that decision
 * into the reader would take it away from the module that knows.
 *
 * **`MM_PER_INCH` lives here and not in a vendor.** It was declared and
 * exported twice — `vendors/harvey/value.ts` and `vendors/regofix/scrape.ts`
 * — so `@toolpath/tool-scraper/vendors/harvey` and `.../vendors/regofix` each
 * published their own copy of 25.4. That is exactly what `conventions.CAD_COLUMN`
 * was moved up for, and what `tests/vendor-boundary.test.ts` now refuses by name.
 */

import type { UnitSystem } from './conventions.js'

/** Exact by definition: the inch has been 25.4 mm since 1959. */
export const MM_PER_INCH = 25.4

/**
 * A decimal, a simple fraction or a mixed number — and nothing else.
 *
 * Deliberately strict, because it is used without a pre-guard. The whole-number
 * part of a mixed number is `\d+` rather than a decimal so that a **range** like
 * `.035-.040` — which Destiny Tool really does publish, in description text —
 * cannot parse as `0.035 + 0.040`. A range is not a measurement, and reading one
 * as a sum is the kind of quiet wrong number this package exists to avoid.
 */
const NUMERIC = /^(?:(\d+)-)?(\d*\.?\d+)(?:\/(\d*\.?\d+))?$/

/**
 * `.250` -> 0.25, `3/4` -> 0.75, `1-1/2` -> 1.5, `2` -> 2.
 *
 * Null where the token is not one of those four shapes — including a division
 * by zero, which arrives finite-looking as `Infinity` and would otherwise
 * travel into a row as a dimension.
 *
 * Unit-free on purpose: what system the number is in is the caller's, from the
 * family's declared `unit` or from a unit the cell states outright. A reader
 * that guessed would be the mistake `conventions.UNIT_SUFFIX` exists to prevent.
 */
export function fractionValue(token: string): number | null {
  const parsed = NUMERIC.exec(token.trim())
  if (parsed === null) return null

  const [, whole, numerator, denominator] = parsed
  const part =
    denominator === undefined ? Number(numerator) : Number(numerator) / Number(denominator)
  const value = (whole === undefined ? 0 : Number(whole)) + part
  return Number.isFinite(value) ? value : null
}

/** `value`, converted from `from` to `to`. A no-op when they agree. */
export function convertLength(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value
  return to === 'inches' ? value / MM_PER_INCH : value * MM_PER_INCH
}
