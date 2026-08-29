/**
 * Which adapter serves which family — the composition root.
 *
 * `families/` is the config table and `vendors/` are the adapters; this is the
 * one module that knows both, and it exists so that neither has to. Putting
 * the binding in the config table made the table import a manufacturer, which
 * `tests/vendor-boundary.test.ts` refuses for good reason: the table is read
 * by every test, and none of those should drag a vendor's scraper in behind it.
 *
 * **This is the seam a per-vendor distribution would replace with an
 * entry-point registry.** When a vendor package can be installed from outside
 * the tree, the {@link ADAPTERS} table below becomes a lookup over those and
 * nothing else here changes shape. Until then one repository holds every
 * adapter, which is what lets one commit change the record contract and every
 * adapter together.
 *
 * ## Binding is lazy, not an import side effect
 *
 * A mapping fault has to surface as an error naming the family, not as a
 * missing-key fault from inside a mapper on row 1 of a scrape that already
 * ran. Binding at import would buy that and charge for it: a consumer that
 * imports one helper should not pay to validate a catalog it never reads.
 *
 * So it is memoised instead: the first call to {@link boundFamilies} validates
 * every family and every fact, and the failure still names the family and the
 * key. What changes is only *when* — first use rather than import — and every
 * entry point into this package goes through here.
 */

import { checkIdentityColumns } from './conventions.js'
import {
  familyBrand,
  type BoundFamily,
  type BoundToolholding,
  type RecordMappers,
} from './family.js'
import { COLLET_FAMILIES, FAMILIES, HOLDER_FAMILIES } from './families/index.js'
import { ScraperConfigError } from './errors.js'
import { checkFact, type Fact } from './provenance.js'
import { checkColumnMap, checkColumnsExist, type ToolRecord } from './records.js'
import type { MapperOptions, ScrapeResult } from './scrape.js'
import { RECORD_MAPPERS as DESTINYTOOL } from './vendors/destinytool/records.js'
import { RECORD_MAPPERS as HARVEY } from './vendors/harvey/records.js'
import { RECORD_MAPPERS as KENNAMETAL } from './vendors/kennametal/records.js'

/**
 * Brand -> its row-to-record mappers, by tool kind.
 *
 * One entry serves two brands: Kennametal and WIDIA are the same AEM platform
 * and the same table vocabulary, so one adapter covers both, exactly as one
 * scraper does. A brand absent from here can still be scraped — REGO-FIX ships
 * toolholding and no cutting tools, and only cutting tools go through a column
 * map.
 */
export const ADAPTERS: Record<string, RecordMappers> = {
  kennametal: KENNAMETAL,
  widia: KENNAMETAL,
  destinytool: DESTINYTOOL,
  harvey: HARVEY,
}

/**
 * Check every fact of one family and project its value onto the config under
 * its own key.
 *
 * **This is what stops a fact being a second source of truth.** The fact is
 * the only authored copy; the plain key is a projection with one owner.
 * Readers keep saying `family.unit` and never learn about provenance, which is
 * right — provenance is evidence for a person and a gate, not an input to
 * arithmetic.
 *
 * `FamilyDefinition` declares no constant keys, so a family that also set the
 * plain key is a compile error and there is nothing left to check at runtime.
 */
function project<T extends object>(table: string, name: string, cfg: T): T {
  const facts = (cfg as { facts?: Record<string, Fact> }).facts ?? {}
  const projected: Record<string, unknown> = { ...(cfg as object) }
  for (const [key, fact] of Object.entries(facts)) {
    checkFact(`${table} ${name}`, key, fact)
    projected[key] = fact.value
  }
  return projected as T
}

let families: Map<string, BoundFamily> | null = null
let toolholding: Map<string, BoundToolholding> | null = null

/**
 * Every cutting-tool family, validated and bound to its record mapper.
 *
 * Memoised, so calling it twice is free and a fault is reported once.
 */
export function boundFamilies(): Map<string, BoundFamily> {
  if (families !== null) return families

  const bound = new Map<string, BoundFamily>()
  for (const [name, cfg] of Object.entries(FAMILIES)) {
    const brand = cfg.brand ?? 'kennametal'
    const mappers = ADAPTERS[brand]
    if (mappers === undefined) {
      throw new ScraperConfigError(
        name,
        `brand ${JSON.stringify(brand)} has no record adapter — a vendor ` +
          `that ships cutting tools needs one ` +
          `(known: ${Object.keys(ADAPTERS).sort().join(', ')})`,
      )
    }

    const records = mappers[cfg.kind]
    if (records === undefined) {
      throw new ScraperConfigError(
        name,
        `brand ${JSON.stringify(brand)} has no ${cfg.kind} mapper ` +
          `(it maps: ${Object.keys(mappers).sort().join(', ')})`,
      )
    }

    const projected = project('tool', name, cfg)
    bound.set(name, {
      ...projected,
      columns: checkColumnMap(name, cfg.kind, cfg.columns),
      records,
    } as BoundFamily)
  }

  families = bound
  return bound
}

/**
 * Every holder and collet family, with its facts checked and projected.
 *
 * They bind no adapter — only cutting tools go through a column map — but
 * their facts pass the same gate: a taper or a clamping mode is a per-family
 * constant no variant table states, exactly like a drill's flute count.
 */
export function boundToolholding(): Map<string, BoundToolholding> {
  if (toolholding !== null) return toolholding

  const bound = new Map<string, BoundToolholding>()
  for (const [table, families_] of [
    ['holder', HOLDER_FAMILIES],
    ['collet', COLLET_FAMILIES],
  ] as const) {
    for (const [name, cfg] of Object.entries(families_)) {
      bound.set(name, project(table, name, cfg) as BoundToolholding)
    }
  }

  toolholding = bound
  return bound
}

/** One bound cutting-tool family by CSV name. */
export function boundFamily(name: string): BoundFamily {
  const cfg = boundFamilies().get(name)
  if (cfg === undefined) {
    throw new ScraperConfigError(
      name,
      `unknown cutting-tool family (known: ` + `${[...boundFamilies().keys()].sort().join(', ')})`,
    )
  }
  return cfg
}

/**
 * One family's scrape, as {@link ToolRecord}s — the package's uniform output.
 *
 * **This is what a consumer wants and what nothing shipped until now.** Every
 * CLI command ends at a vendor-labelled CSV, and a CSV is the receipt: four
 * vendors, four column vocabularies, and a `D1_mm` that means one thing in
 * Kennametal's table and another in ISO 13399's dictionary. The adapters that
 * resolve that have been here the whole time and only the tests called them.
 *
 * It lives in the registry rather than beside `toolRecord` because it needs
 * both halves — the config table and the vendor mappers — and the main entry
 * point deliberately imports no vendor. Reach it through the `./registry`
 * subpath.
 *
 * The two checks run **before the first row**, in the order a failure is
 * cheapest to read:
 *
 * 1. {@link checkIdentityColumns} — a re-scrape whose part-number column was
 *    renamed still parses, still has the right row count, and mints every guid
 *    off an empty string.
 * 2. {@link checkColumnsExist} — a mapped column the CSV does not carry names
 *    the family and the field here, instead of naming one row out of ninety-three
 *    from inside a mapper.
 *
 * `familyName` is the CSV filename the catalog is keyed by
 * (`'harvey_endmill_025.csv'`), which is what `boundFamily` takes.
 */
export function toRecords(
  familyName: string,
  scrape: ScrapeResult,
  options?: MapperOptions,
): ToolRecord[] {
  const cfg = boundFamily(familyName)

  checkIdentityColumns(familyBrand(cfg), scrape.header)
  checkColumnsExist(familyName, cfg, scrape.header)

  return scrape.rows.map((row) => cfg.records(row, cfg, cfg.columns, options))
}

/**
 * Forget what has been bound.
 *
 * For tests that put a family in front of the gate. Nothing in a running
 * scrape should need it — the tables are module constants, so a second bind
 * would produce the same answer.
 */
export function resetBindings(): void {
  families = null
  toolholding = null
}
