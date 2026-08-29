/**
 * Harvey rows -> {@link ToolRecord}.
 *
 * The CSV a Harvey scrape writes holds the vendor's own **display strings** —
 * `.250 (1/4)`, `1-1/2`, `3 mm`, `-` — rather than parsed numbers, because the
 * file is the receipt and Harvey's own fractional and metric annotations are
 * part of what it published. So this module is where a cell becomes a number,
 * through `value.ts`; the closest precedent in this package is Destiny Tool's
 * fractional-inch reader, not Kennametal's, whose columns are already decimals.
 *
 * ## What Harvey does not publish
 *
 * **No second identifier.** One `Tool #` per part, which fills both the material
 * number and the catalog number on a record — see
 * `conventions.IDENTITY_DEVIATIONS.harvey`.
 *
 * **No carbide grade.** `substrate` comes from the family's `bmc` fact and the
 * `COATING` column fills `coating`, exactly as Destiny Tool's coating id does.
 *
 * **No workpiece-material index a scrape can reach.** Nothing in a variant
 * table rates a tool to ISO 513 groups, so every Harvey record is labelled
 * `records.UNSPECIFIED` — *we do not know what this tool is for*, which is a
 * different claim from Kennametal's swept taps being rated for nothing.
 *
 * The per-part page does publish one, and it is **per part and not per family**:
 * a 192-request probe on 2026-08-29 found `harvey_endmill_005.csv` splitting by
 * coating column, uncoated tools rated for steel, stainless, cast iron and
 * titanium where the amorphous-diamond-coated tools of the same geometry are
 * rated for aluminium, wood and composites alone. That is correct metallurgy —
 * diamond cannot cut ferrous — and flattening it to one answer per family would
 * put a diamond-coated end mill under steel. So there is no family fact to
 * write, and the two keyseat pages titled for a material class do not get one
 * either: the "For Non - Ferrous Materials" line's own part pages rate it for
 * steel and stainless steel, so the title does not predict the index.
 * `docs/HARVEY_PRODUCT_TABLE.md` §1.5 has the measurement and what reaching it
 * would cost.
 *
 * **No corner radius on a ball nose.** A ball family publishes no radius column
 * at all, so `RE` comes from the family's `profile` fact — see
 * {@link cornerRadius}. That is a per-family constant with provenance rather
 * than a string match on a description, because Harvey states the profile once,
 * in the page title, for the whole product line.
 */

import type { UnitSystem } from '../../conventions.js'
import { VendorResponseError } from '../../errors.js'
import { fact, familyBrand, type BoundFamily, type RecordMappers } from '../../family.js'
import { BRANDS } from '../../identity.js'
import { toolRecord, type ColumnMap, type GeometryName, type ToolRecord } from '../../records.js'
import { consoleWarn, type MapperOptions, type ScrapedRow } from '../../scrape.js'
import { COATING_COLUMN, DESCRIPTION_COLUMN, TOOL_NUMBER_COLUMN } from './scrape.js'
import { count, dimension } from './value.js'

/** The `profile` fact value that means a ball nose. Harvey's own word. */
export const BALL_PROFILE = 'Ball'

/**
 * The family's declared unit, refused rather than asserted when it is absent.
 *
 * Every Harvey family declares one — the `harvey` CLI command will not scrape a
 * family without it — so `familyUnits` would return exactly this one and a
 * tap's two-system case cannot arise here. It was `family.unit!` until
 * 2026-08-29, which is the same claim with no check behind it: a family added
 * without the fact would have read `undefined` straight into
 * `dimensionalColumn` and asked the CSV for a column called `CUTTER DIA._`.
 */
function unitOf(family: BoundFamily): UnitSystem {
  return fact(family, 'unit', family.unit)
}

/** One mapped column's display cell, or undefined where the family maps none. */
function cell(row: ScrapedRow, family: BoundFamily, canonical: GeometryName): string | undefined {
  const column = family.columns.column(canonical, unitOf(family))
  return column === null ? undefined : row[column]
}

/** A dimension the endmill contract requires, refusing a row that lacks it. */
function required(
  row: ScrapedRow,
  family: BoundFamily,
  canonical: GeometryName,
  what: string,
  options: MapperOptions,
): number {
  const raw = cell(row, family, canonical)
  const value = raw === undefined ? null : dimension(raw, unitOf(family), what, options.warn)
  if (value === null) {
    throw new VendorResponseError(
      what,
      `publishes no ${canonical} — its cell is ${JSON.stringify(raw ?? '')}`,
    )
  }
  return value
}

/** A dimension the contract does not require. Null where the family maps none. */
function optional(
  row: ScrapedRow,
  family: BoundFamily,
  canonical: GeometryName,
  what: string,
  options: MapperOptions,
): number | null {
  const raw = cell(row, family, canonical)
  return raw === undefined ? null : dimension(raw, unitOf(family), what, options.warn)
}

/**
 * The corner radius, in priority order.
 *
 * 1. The family's own radius column where it has one — `CORNER RADIUS` on the
 *    corner-radius lines, `RADIUS` on the full-radius keyseat cutters.
 * 2. `DC / 2` on a ball nose. Harvey publishes no radius column on any of its
 *    twelve ball families, and the radius of a ball end *is* half the diameter,
 *    so this is arithmetic rather than a guess — the `profile` fact is what says
 *    the family is one.
 * 3. `0` — a real square end — otherwise.
 *
 * A mapped column whose cell is blank falls through to 2 or 3 rather than
 * refusing the row: `RE` is optional on the endmill contract precisely because
 * a square-end row's blank radius is an answer.
 */
export function cornerRadius(
  row: ScrapedRow,
  family: BoundFamily,
  what: string,
  dc: number,
  options: MapperOptions,
): number {
  const stated = optional(row, family, 'RE', what, options)
  if (stated !== null) return stated
  return family.profile === BALL_PROFILE ? dc / 2 : 0
}

/**
 * The flute count.
 *
 * One column whichever way the table encoded it: `vendors/harvey/scrape.ts`
 * writes `FLUTES` from the row's own column on a `TOOL #` table and from the
 * coating group's sub-label on a matrix one, so nothing downstream has to know
 * which shape the page used.
 *
 * Null is a real answer on the two deburring families, which publish
 * right- and left-hand tooth counts and no flute count at all.
 */
export function flutes(row: ScrapedRow, family: BoundFamily): number | null {
  const raw = cell(row, family, 'NOF')
  return raw === undefined ? null : count(raw)
}

/** One orderable Harvey tool. */
export function endmillRecord(
  row: ScrapedRow,
  family: BoundFamily,
  _columns: ColumnMap,
  options: MapperOptions = {},
): ToolRecord {
  const warn = options.warn ?? consoleWarn
  const what = row[TOOL_NUMBER_COLUMN] ?? ''
  if (what === '') {
    throw new VendorResponseError(family.id, `has a row with no ${TOOL_NUMBER_COLUMN}`)
  }

  const opts: MapperOptions = { warn }
  const dc = required(row, family, 'DC', what, opts)
  const fluteLength = required(row, family, 'LCF', what, opts)

  // Harvey's reach columns are the distance from the tip to the full shank,
  // which is what `shoulder-length` names. A family with no reach column is a
  // plain tool whose usable length below the shank is its flute length — the
  // same convention Destiny Tool's mapper uses.
  const reach = optional(row, family, 'shoulder-length', what, opts)
  const neck = optional(row, family, 'shoulder-diameter', what, opts)

  const geometry: Partial<Record<GeometryName, number>> = {
    DC: dc,
    RE: cornerRadius(row, family, what, dc, opts),
    SFDM: required(row, family, 'SFDM', what, opts),
    OAL: required(row, family, 'OAL', what, opts),
    LCF: fluteLength,
    'shoulder-length': reach ?? fluteLength,
    'shoulder-diameter': neck ?? dc,
  }

  const nof = flutes(row, family)
  if (nof !== null) geometry.NOF = nof

  return toolRecord({
    brand: familyBrand(family),
    vendor: BRANDS[familyBrand(family)].vendor,
    materialNumber: what,
    catalogNumber: what,
    description: row[DESCRIPTION_COLUMN] ?? '',
    kind: 'endmill',
    unit: unitOf(family),
    substrate: fact(family, 'bmc', family.bmc),
    coating: row[COATING_COLUMN] ?? '',
    // `materialGroups` and its source are left to the factory's `null`: see the
    // module docstring for what a Harvey part page publishes and why none of it
    // can be stated per family.
    coolantThrough: fact(family, 'coolantThrough', family.coolantThrough),
    geometry,
  })
}

export const RECORD_MAPPERS: RecordMappers = { endmill: endmillRecord }
