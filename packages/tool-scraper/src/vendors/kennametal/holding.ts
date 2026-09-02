/**
 * Kennametal's and WIDIA's toolholding column vocabulary, and nothing else.
 *
 * The counterpart of `records.ts` for a holder and a collet: every decision
 * about *what a record is* lives in `holding.ts`, and what lives here is which
 * of this vendor's columns answers each question. That is the same line
 * `vendors/kennametal/records.ts` draws for cutting tools.
 *
 * ## What this platform states as a fact rather than a column
 *
 * Almost everything. `taper`, `contact`, `clamping`, `style` and `unit` are all
 * per-family constants here, declared in `families/kennametal.ts` with a
 * citation each, because Kennametal sells one interface and one clamping mode
 * per family — its dual-contact BT30 is a separate line (BTKV\*) with its own
 * family code. The two vendors whose holders vary row by row are the ones whose
 * mappers read a column instead.
 *
 * ## Two published columns this deliberately does not carry
 *
 * - **`L1FC`**, the BTKV30 line's "Gage Length Face Contact", 0.998 mm shorter
 *   than `L1` on every row. It is not a second measurement of one thing: it is
 *   the gage length *in a face-contact spindle*, so which of the two is true is
 *   a fact about the machine rather than about the holder. Carrying both would
 *   put two numbers named "gage" on one record with nothing to say which one
 *   stickout arithmetic should use. `contact` records that the holder has the
 *   geometry; `gaugeLength` stays `L1`. Promote it the day something reads a
 *   spindle's contact mode, and change `gaugeLength` with it rather than
 *   showing both.
 * - **Torque figures, actuation-screw drive size, weight and `D21`.** Published,
 *   and dropped under `records.ToolRecord`'s standing rule: add a field when
 *   something displays it, not before.
 */

import { CAD_COLUMN, COLLET_DESIGNATION_COLUMN, COLLET_SERIES_COLUMN } from '../../conventions.js'
import { familyBrand, type BoundToolholding } from '../../family.js'
import {
  checkUnitAgreement,
  clampingMode,
  colletRecord,
  contactMode,
  dim,
  holderRecord,
  holdingFact,
  published,
  type ColletRecord,
  type HolderRecord,
  type HoldingMappers,
} from '../../holding.js'
import { consoleWarn, type ScrapedRow, type Warn } from '../../scrape.js'
import { CATALOG_NUMBER, MATERIAL_NUMBER } from './records.js'

/**
 * The dimensional labels whose two unit columns are worth cross-checking.
 *
 * Every dimension either record carries, and no more: a label nothing reads
 * cannot produce a wrong number, so warning about it is noise. `holding.dim`
 * reads the native column and never the other one, which is what makes this a
 * report rather than a gate.
 */
const HOLDER_LABELS = ['D1', 'L1', 'L2', 'L9', 'V', 'D2', 'D11'] as const
const COLLET_LABELS = ['CCCN', 'CCCX', 'D1', 'BDX', 'LF', 'L'] as const

/** How a part names itself in a warning or a refusal. */
function subject(row: ScrapedRow): string {
  return `${row[CATALOG_NUMBER] ?? ''} (${row[MATERIAL_NUMBER] ?? ''})`
}

/** One Kennametal or WIDIA holder row -> one {@link HolderRecord}. */
function holder(
  row: ScrapedRow,
  family: BoundToolholding,
  options: { warn?: Warn } = {},
): HolderRecord {
  const warn = options.warn ?? consoleWarn
  const what = subject(row)
  const unit = holdingFact(family, 'unit', family.unit)

  for (const label of HOLDER_LABELS) checkUnitAgreement(row, label, what, warn)

  // Kennametal publishes no description column for toolholding, and `''` is the
  // honest answer where a vendor publishes none — `records.ToolRecord.description`
  // states the rule and the reason: a description that restates the catalog
  // number puts one string in two fields.
  return holderRecord({
    brand: familyBrand(family),
    materialNumber: published(row[MATERIAL_NUMBER], what, 'material number'),
    catalogNumber: published(row[CATALOG_NUMBER], what, 'catalog number'),
    description: '',
    unit,
    taper: holdingFact(family, 'taper', family.taper),
    contact: contactMode(holdingFact(family, 'contact', family.contact), what),
    clamping: clampingMode(holdingFact(family, 'clamping', family.clamping), what),
    style: holdingFact(family, 'style', family.style),
    colletSeries: row[COLLET_SERIES_COLUMN] || null,
    bore: dim(row, 'D1', unit),
    gaugeLength: published(dim(row, 'L1', unit), what, 'L1 gage length'),
    usableLength: dim(row, 'L2', unit),
    clampingLength: dim(row, 'L9', unit),
    adjustmentRange: dim(row, 'V', unit),
    bodyDiameter: dim(row, 'D2', unit),
    lockNutDiameter: dim(row, 'D11', unit),
    cadModelUrl: row[CAD_COLUMN] || null,
    // This platform publishes a STEP model and no 2D profile. A DXF column would
    // be a claim about the data, and false — the call `conventions.CAD_DXF_COLUMN`
    // records.
    cadDxfUrl: null,
  })
}

/** One Kennametal or WIDIA collet row -> one {@link ColletRecord}. */
function collet(
  row: ScrapedRow,
  family: BoundToolholding,
  options: { warn?: Warn } = {},
): ColletRecord {
  const warn = options.warn ?? consoleWarn
  const what = subject(row)
  const unit = holdingFact(family, 'unit', family.unit)

  for (const label of COLLET_LABELS) checkUnitAgreement(row, label, what, warn)

  return colletRecord({
    brand: familyBrand(family),
    materialNumber: published(row[MATERIAL_NUMBER], what, 'material number'),
    catalogNumber: published(row[CATALOG_NUMBER], what, 'catalog number'),
    description: '',
    unit,
    series: published(row[COLLET_DESIGNATION_COLUMN], what, 'collet series'),
    style: holdingFact(family, 'style', family.style),
    nominal: dim(row, 'D1', unit),
    clampMin: published(dim(row, 'CCCN', unit), what, 'CCCN clamping minimum'),
    clampMax: published(dim(row, 'CCCX', unit), what, 'CCCX clamping maximum'),
    bodyDiameter: dim(row, 'BDX', unit),
    functionalLength: dim(row, 'LF', unit),
    overallLength: dim(row, 'L', unit),
  })
}

/** The toolholding half of the adapter contract `registry` looks up by brand. */
export const HOLDING_MAPPERS: HoldingMappers = { holder, collet }
