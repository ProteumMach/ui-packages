/**
 * Kennametal rows -> {@link ToolRecord}. The adapter half of the record seam.
 *
 * Everything here knows Kennametal's column vocabulary and nothing here knows
 * what a record becomes. The reverse is true of whatever consumes one: it
 * knows no vendor at all.
 *
 * What stayed on this side of the line, and why each is a *vendor* fact rather
 * than a domain one:
 *
 * - **Which column holds a canonical field.** Declared per family as
 *   `columns: { DC: 'D1', … }` and resolved through `ColumnMap`, which appends
 *   the unit suffix. A vendor with different labels declares different labels.
 * - **Where the identity strings live.** `Material Number` and `ISO Catalog
 *   Number` are Kennametal's header text — the labels
 *   `conventions.IDENTITY_COLUMNS` took as the convention because this vendor
 *   was first, and which Destiny Tool then did not follow.
 * - **Which column is the grade.** A drill and an end mill carry a carbide
 *   `Grade`; a tap has no carbide grade and carries `Coating`, the surface
 *   treatment, in the record's `grade` field. That is Kennametal's table
 *   shape, not a rule about taps everywhere.
 * - **That a tap's unit system is per row.** `Thread System` is a constant tag
 *   column this package appends at scrape time, and a metric and an inch tap
 *   can sit in one family — so a tap's `unit` is read per row where a drill's
 *   and an end mill's come from config.
 * - **The optional columns.** `Re`, `L3` and `D3` are present on some families
 *   and absent on others, and the *absence* means something specific: no
 *   corner radius is a square end (RE 0); no `L3` on a plain-shank tool means
 *   AP1MAX is the shoulder length too; no `D3` means the shoulder is the
 *   cutting diameter. Those three fallbacks are Kennametal-table facts and
 *   they stay here.
 *
 * What deliberately stays out: whether a corner radius makes a tool a bull
 * nose, `LB` and `assemblyGaugeLength` being `OAL` on a bare tool, and every
 * cutting preset. Those are true of a tool, not of a table.
 */

import type { UnitSystem } from '../../conventions.js'
import { ScraperConfigError, VendorResponseError } from '../../errors.js'
import { familyBrand, type BoundFamily, type RecordMappers } from '../../family.js'
import { BRANDS } from '../../identity.js'
import { toolRecord, type ColumnMap, type GeometryName, type ToolRecord } from '../../records.js'
import type { ScrapedRow } from '../../scrape.js'
import { threadMajorDiameter, type ThreadSystem } from '../../thread.js'
import { MATERIALS_COLUMN, materialClasses } from './materials.js'

/**
 * Kennametal's identity columns. Named here rather than inline so a table that
 * renames one fails in a single place.
 */
export const MATERIAL_NUMBER = 'Material Number'
export const CATALOG_NUMBER = 'ISO Catalog Number'

/**
 * One canonical dimension, or null when this family maps or publishes none.
 *
 * Null is a real state and the callers distinguish it: an absent `Re` is a
 * square-end tool, an absent `L3` is a plain shank. It is never a silent zero,
 * because a zero corner radius and an unpublished one are the same number and
 * different facts.
 */
function dim(
  row: ScrapedRow,
  columns: ColumnMap,
  canonical: GeometryName,
  unit: UnitSystem,
): number | null {
  const column = columns.column(canonical, unit)
  if (column === null) return null
  const raw = row[column]
  if (raw === undefined || raw.trim() === '') return null
  const value = Number(raw)
  if (!Number.isFinite(value)) {
    throw new VendorResponseError(column, `${JSON.stringify(raw)} is not a number`)
  }
  return value
}

/**
 * A dimension the kind requires. `checkColumnMap` has already refused a family
 * that maps none, so what this catches is a *row* the vendor left empty —
 * which is a scrape problem, not a config one, and says so.
 */
function require_(
  row: ScrapedRow,
  columns: ColumnMap,
  canonical: GeometryName,
  unit: UnitSystem,
  what: string,
): number {
  const value = dim(row, columns, canonical, unit)
  if (value === null) {
    throw new VendorResponseError(
      what,
      `no value for ${canonical} in column ` + `${JSON.stringify(columns.column(canonical, unit))}`,
    )
  }
  return value
}

/** A per-family constant a mapper cannot proceed without. */
function fact<T>(family: BoundFamily, key: string, value: T | undefined): T {
  if (value === undefined) {
    throw new ScraperConfigError(family.id, `a ${family.kind} family must state ${key} as a fact`)
  }
  return value
}

/**
 * The `Thread System` tag, refusing anything that is not one of the two.
 *
 * Read here and nowhere else, because the two readers of a cast tag defaulted
 * in *opposite* directions: this module took anything that was not `'inch'` as
 * metric, and `thread.threadMajorDiameter` took anything that was not
 * `'metric'` as inch. A missing, empty or capitalised tag then produced a
 * record whose `DC` was parsed in inches and whose `TP`/`SFDM`/`OAL`/`LCF`
 * came from the `_mm` columns — the silent unit mix `conventions` exists to
 * make impossible.
 */
function threadSystem(row: ScrapedRow, what: string): ThreadSystem {
  const value = row['Thread System'] ?? ''
  if (value !== 'metric' && value !== 'inch') {
    throw new VendorResponseError(
      what,
      `Thread System is ${JSON.stringify(value)}, not "metric" or "inch" — ` +
        `a tap family states it as a constant column on the scrape`,
    )
  }
  return value
}

/** An integer column the vendor always publishes — the flute count. */
function count(row: ScrapedRow, column: string, what: string): number {
  const value = Number.parseInt(row[column] ?? '', 10)
  if (!Number.isInteger(value)) {
    throw new VendorResponseError(what, `no integer in column ${JSON.stringify(column)}`)
  }
  return value
}

/**
 * A drill, in the family's native unit system per its `unit` fact.
 *
 * Every drill table publishes both unit columns, so `unit` is config and never
 * inferred: it decides which column is read and what a machinist is shown.
 * Getting it wrong converts cleanly and prints 5.9531 mm where the part
 * ordered is a 15/64 in KenDrill TXD.
 *
 * L4 (max drilling depth) and L5 (point length) are mapped by no family and
 * reach no record — but L5 is not inert, because it is what pins `pointAngle`
 * on a family whose table states none. See `families/kennametal.ts`.
 */
export function drillRecord(row: ScrapedRow, family: BoundFamily, columns: ColumnMap): ToolRecord {
  const unit = fact(family, 'unit', family.unit)
  const what = row[MATERIAL_NUMBER] ?? ''

  return toolRecord({
    vendor: BRANDS[familyBrand(family)].vendor,
    materialNumber: what,
    catalogNumber: row[CATALOG_NUMBER] ?? '',
    description: row[CATALOG_NUMBER] ?? '',
    kind: 'drill',
    unit,
    substrate: fact(family, 'bmc', family.bmc),
    grade: row['Grade'] ?? '',
    materialGroups: materialClasses(row[MATERIALS_COLUMN]),
    coolantThrough: fact(family, 'coolantThrough', family.coolantThrough),
    nonFerrous: fact(family, 'nonFerrous', family.nonFerrous),
    geometry: {
      DC: require_(row, columns, 'DC', unit, what),
      SFDM: require_(row, columns, 'SFDM', unit, what),
      OAL: require_(row, columns, 'OAL', unit, what),
      LCF: require_(row, columns, 'LCF', unit, what),
      NOF: fact(family, 'flutes', family.flutes),
      SIG: fact(family, 'pointAngle', family.pointAngle),
    },
  })
}

/**
 * A tap, in **its own** native unit system rather than the family's.
 *
 * `Thread System` is a constant column the scraper tags on, because the table
 * does not state it; metric taps read the mm columns and inch taps the inch
 * ones. `Thread Pitch` is already native-unit — derived from `D1-TDZ` by
 * `thread-column.addThreadPitch` — which is why `TP` is dimensional but
 * unsuffixed.
 *
 * `DC` is **derived, not read**: a tap table publishes a thread designation
 * (`#2-56`, `M6 X 1`) and no major-diameter column, so the major diameter is
 * parsed out of the designation. That is arithmetic over a standard, which is
 * why `threadMajorDiameter` sits in the core.
 */
export function tapRecord(row: ScrapedRow, family: BoundFamily, columns: ColumnMap): ToolRecord {
  const system = threadSystem(row, row[MATERIAL_NUMBER] ?? '')
  const unit: UnitSystem = system === 'inch' ? 'inches' : 'millimeters'
  const tdz = row['D1-TDZ'] ?? ''
  const what = row[MATERIAL_NUMBER] ?? ''

  return toolRecord({
    vendor: BRANDS[familyBrand(family)].vendor,
    materialNumber: what,
    catalogNumber: row[CATALOG_NUMBER] ?? '',
    // The designation is part of what a tap *is*, and the catalog number alone
    // does not carry the size.
    description: `${row[CATALOG_NUMBER] ?? ''} ${tdz}`,
    kind: 'tap',
    unit,
    substrate: fact(family, 'bmc', family.bmc),
    // A tap has no carbide grade; the record's grade carries the coating.
    grade: row['Coating'] ?? '',
    materialGroups: materialClasses(row[MATERIALS_COLUMN]),
    coolantThrough: false,
    geometry: {
      DC: threadMajorDiameter(tdz, system),
      TP: require_(row, columns, 'TP', unit, what),
      SFDM: require_(row, columns, 'SFDM', unit, what),
      OAL: require_(row, columns, 'OAL', unit, what),
      LCF: require_(row, columns, 'LCF', unit, what),
      NOF: count(row, 'Z', what),
    },
  })
}

/**
 * A solid end mill, native unit per the family's `unit` fact.
 *
 * Three optional columns, and each absence carries a meaning this table
 * assigns rather than one the domain does:
 *
 * - **no `Re`** → a square-end family, corner radius 0;
 * - **no `L3`** → nothing below the flutes to reach past, so the maximum flute
 *   length is the shoulder length too (the WIDIA VariMill tables);
 * - **no `D3`** → a plain shank, so the shoulder is the cutting diameter.
 *
 * Whether a radius makes it a bull nose is a consumer's call, not this one.
 */
export function endmillRecord(
  row: ScrapedRow,
  family: BoundFamily,
  columns: ColumnMap,
): ToolRecord {
  const unit = fact(family, 'unit', family.unit)
  const what = row[MATERIAL_NUMBER] ?? ''
  const dc = require_(row, columns, 'DC', unit, what)
  const fluteLength = require_(row, columns, 'LCF', unit, what)

  return toolRecord({
    vendor: BRANDS[familyBrand(family)].vendor,
    materialNumber: what,
    catalogNumber: row[CATALOG_NUMBER] ?? '',
    description: row[CATALOG_NUMBER] ?? '',
    kind: 'endmill',
    unit,
    substrate: fact(family, 'bmc', family.bmc),
    grade: row['Grade'] ?? '',
    materialGroups: materialClasses(row[MATERIALS_COLUMN]),
    coolantThrough: fact(family, 'coolantThrough', family.coolantThrough),
    geometry: {
      DC: dc,
      RE: dim(row, columns, 'RE', unit) ?? 0,
      SFDM: require_(row, columns, 'SFDM', unit, what),
      OAL: require_(row, columns, 'OAL', unit, what),
      LCF: fluteLength,
      'shoulder-length': dim(row, columns, 'shoulder-length', unit) ?? fluteLength,
      'shoulder-diameter': dim(row, columns, 'shoulder-diameter', unit) ?? dc,
      NOF: count(row, 'Z', what),
    },
  })
}

export const RECORD_MAPPERS: RecordMappers = {
  drill: drillRecord,
  tap: tapRecord,
  endmill: endmillRecord,
}
