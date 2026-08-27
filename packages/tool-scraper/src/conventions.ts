/**
 * What every vendor's CSV agrees on, written down so it can be checked.
 *
 * A scraped CSV keeps **that vendor's own column labels**. Relabelling them
 * into a shared vocabulary on the way into the file would put a lie in the
 * file whose whole job is to record what the vendor published, and the labels
 * really do not line up: Kennametal's `D1_mm` and Destiny Tool's `cutDia_in`
 * are the same measurement under names neither vendor would recognise in the
 * other's table. Nothing reads a vendor's CSV but that vendor's own adapter.
 *
 * So this is not a schema. It is the short list of conventions that hold
 * *across* the CSVs anyway, and the reason to make them explicit is that
 * vendor #3 already drifted from one:
 *
 * | Convention                                        | Held by                   |
 * | ------------------------------------------------- | ------------------------- |
 * | `_mm`/`_in` carries the unit on a dimension       | all three                 |
 * | Multi-value cells are space-separated             | all three                 |
 * | One row per orderable part                        | all three                 |
 * | `CAD_STEP_URL` names a CAD model where one exists | Kennametal, REGO-FIX      |
 * | Unmapped vendor codes keep a `DIN_` prefix        | REGO-FIX; rule is general |
 * | The identity columns                              | **broken** — see below    |
 *
 * Identity and units are the two worth enforcing; the rest are advisory, and
 * are here so that "advisory" is a decision on the page rather than an
 * omission.
 *
 * **A vendor's column label can collide with a real ISO 13399 code and mean
 * something else.** The standard defines `D1` as fixing hole diameter and `L`
 * as cutting edge length; Kennametal's tables use `D1` for the cutting
 * diameter and `L` for the overall length. The two vocabularies overlap on
 * `D1`, `L`, `B`, `H`, `RE`, `SIG` and `TP` among others, so anything that
 * reads a vendor CSV without going through that vendor's adapter can be
 * confidently wrong rather than obviously broken. See `records.GEOMETRY_FIELDS`
 * for the canonical side of that line.
 */

import { ScraperConfigError } from './errors.js'
import type { BrandName } from './identity.js'

/** Which unit system a family's dimensional columns are published in. */
export type UnitSystem = 'millimeters' | 'inches'

/**
 * The suffix a dimensional column carries, per unit system.
 *
 * **This is the whole of the unit rule, in one place, on purpose.** A vendor
 * adapter declares a bare label — `'D1'`, never `'D1_mm'` — and the core
 * appends the suffix from the family's declared unit. Choosing the suffix
 * inside an adapter is exactly the mistake a declared `unit` exists to
 * prevent, and a silent unit assumption is the likeliest way this data shows
 * someone a wrong number: a family tagged metric that publishes both columns
 * converts cleanly and reports 9.525 mm where a machinist ordered 3/8.
 */
export const UNIT_SUFFIX: Record<UnitSystem, string> = {
  millimeters: '_mm',
  inches: '_in',
}

/**
 * The CSV column holding a part's downloadable STEP model, for every vendor.
 *
 * Named for what it holds rather than for how one vendor names the format. It
 * was `CAD_STP_LWM` until 2026-08-08: `LWM` is CDS Visual's key for
 * Kennametal's lightweight model, and REGO-FIX publishes no such thing, so the
 * moment a second vendor wrote into this column the name became a claim about
 * the data that was false. That fact is still recorded in the Kennametal CAD
 * module, where it is true.
 *
 * It sits here rather than with either vendor because two of them write it and
 * neither owns it — the leak the vendor-boundary test exists to catch.
 */
export const CAD_COLUMN = 'CAD_STEP_URL'

/**
 * The prefix an unmapped vendor code keeps, so it cannot read as a dimension.
 *
 * REGO-FIX's per-part DIN 4000 XML publishes codes — `A2`, `B1`, `B2` — whose
 * meaning is not stated anywhere this package has been able to check. The
 * standing rule is to leave such a code unlabelled rather than guess at what
 * it measures, and a bare `A2` beside `L1_mm` reads as a labelled dimension.
 * `DIN_A2` reads as what it is: a vendor code, pending a source.
 */
export const DIN_PREFIX = 'DIN_'

/**
 * The columns that name one orderable part: its vendor-local number, and the
 * catalog designation a human orders by.
 *
 * `Material Number` is the guid seed — see `identity.recordGuid` — so this is
 * the one convention whose erosion is not cosmetic.
 */
export const IDENTITY_COLUMNS = ['Material Number', 'ISO Catalog Number'] as const

/**
 * Where a vendor's CSV does not use {@link IDENTITY_COLUMNS}, and what it uses
 * instead.
 *
 * **One entry, and it is a record of drift rather than a licence.** REGO-FIX
 * adopted Kennametal's identity labels; Destiny Tool passes Firestore's own
 * `itemNumber` straight through and publishes no catalog designation at all —
 * the convention was real but informal, and it eroded the first time a vendor
 * did not resemble the first two. Writing the deviation down is what makes the
 * fourth vendor's drift a decision somebody made rather than a thing that
 * happened.
 */
export const IDENTITY_DEVIATIONS: Partial<Record<BrandName, readonly string[]>> = {
  destinytool: ['itemNumber'],
}

/**
 * A vendor's bare column label, suffixed for `unit`.
 *
 * Throws rather than defaulting on an unknown unit system: the two callers
 * that could pass one are a family config and a CLI flag, and a typo that
 * silently picked millimetres would produce a clean conversion with the wrong
 * numbers in it. `unit` is typed as a plain string for the CLI's sake — the
 * flag arrives as one, and the check is the only thing between it and a
 * mis-suffixed column.
 */
export function dimensionalColumn(label: string, unit: string): string {
  if (!Object.hasOwn(UNIT_SUFFIX, unit)) {
    throw new ScraperConfigError(
      label,
      `unknown unit system ${JSON.stringify(unit)} ` +
        `(known: ${Object.keys(UNIT_SUFFIX).sort().join(', ')})`,
    )
  }
  return label + UNIT_SUFFIX[unit as UnitSystem]
}

/**
 * The columns that identify a part in `brand`'s CSV.
 *
 * {@link IDENTITY_COLUMNS} unless the brand is listed as a deviation, which is
 * a lookup rather than a guess: a caller cannot resolve this by inspecting a
 * header, because a header that is missing `Material Number` is
 * indistinguishable from a scrape that lost it.
 */
export function identityColumns(brand: BrandName): readonly string[] {
  return IDENTITY_DEVIATIONS[brand] ?? IDENTITY_COLUMNS
}

/**
 * Every identity column `brand` claims is really in the CSV header.
 *
 * The failure this prevents: a re-scrape whose part-number column moved or was
 * renamed produces a CSV that still parses, still has the right number of
 * rows, and mints every guid off an empty string.
 */
export function checkIdentityColumns(brand: BrandName, header: Iterable<string>): void {
  const present = new Set(header)
  const missing = identityColumns(brand)
    .filter((column) => !present.has(column))
    .sort()

  if (missing.length > 0) {
    throw new ScraperConfigError(
      brand,
      `identity column(s) absent from the CSV: ${missing.join(', ')}`,
    )
  }
}
