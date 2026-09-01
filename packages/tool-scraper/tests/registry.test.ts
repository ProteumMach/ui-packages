/**
 * The binding: config table on one side, adapters on the other.
 *
 * `registry` is the one module that knows both. The Python bound at package
 * import; this binds on first use and memoises, so a family that maps a field
 * no vendor publishes is still a failure naming the family rather than a
 * missing-key fault from inside a mapper on row 1 of a scrape that already
 * ran. These are what say the binding happened and what it refuses.
 *
 * The catalog-wide cases at the foot are the valuable half: they hold over
 * every one of the 37 real families, so a family added next month without
 * provenance for the constants its table never states fails here.
 */

import { describe, expect, it } from 'vitest'

import { ScraperConfigError } from '../src/errors.js'
import { familyBrand, familyId } from '../src/family.js'
import { ALL_FAMILIES, COLLET_FAMILIES, FAMILIES, HOLDER_FAMILIES } from '../src/families/index.js'
import { BRANDS, recordGuid, type BrandName } from '../src/identity.js'
import { ColumnMap, REQUIRED_GEOMETRY, type ToolKind } from '../src/records.js'
import type { ScrapeResult, ScrapedRow } from '../src/scrape.js'
import {
  ADAPTERS,
  boundFamilies,
  boundFamily,
  boundToolholding,
  toRecords,
} from '../src/registry.js'

describe('what binding produces', () => {
  it('gives every family a validated map and an adapter', () => {
    const bound = boundFamilies()

    expect(bound.size).toBeGreaterThan(0)
    for (const [name, cfg] of bound) {
      expect(cfg.columns, name).toBeInstanceOf(ColumnMap)
      expect(cfg.records, name).toBeTypeOf('function')
    }
  })

  it('gives every brand that ships cutting tools an adapter', () => {
    for (const [name, cfg] of Object.entries(FAMILIES)) {
      expect(Object.keys(ADAPTERS), name).toContain(cfg.brand ?? 'kennametal')
    }
  })

  it('covers the kinds its families declare', () => {
    for (const [name, cfg] of boundFamilies()) {
      const mappers = ADAPTERS[cfg.brand ?? 'kennametal']
      expect(mappers?.[cfg.kind], name).toBeTypeOf('function')
    }
  })

  it('is memoised, so binding twice is the same object', () => {
    expect(boundFamilies()).toBe(boundFamilies())
    expect(boundToolholding()).toBe(boundToolholding())
  })

  it('refuses an unknown family by listing what it knows', () => {
    expect(() => boundFamily('nothing.csv')).toThrow(ScraperConfigError)
    expect(() => boundFamily('nothing.csv')).toThrow(/unknown cutting-tool family/)
  })
})

describe('a scrape, as records', () => {
  /** A ball family with no radius column: `harvey_endmill_025.csv`. */
  const FAMILY = 'harvey_endmill_025.csv'

  function row(over: Partial<Record<string, string>> = {}): ScrapedRow {
    return {
      'Tool #': '14916',
      Description: 'Miniature End Mills - Ball - Extra Long Length',
      Coating: 'AlTiN COATED',
      FLUTES: '4',
      'CUTTER DIA._in': '.250 (1/4)',
      LOC_in: '.375',
      'OVERALL REACH_in': '4.375',
      'SHANK DIA._in': '1/4',
      OAL_in: '6',
      ...over,
    }
  }

  function scrape(rows: ScrapedRow[], header = Object.keys(row())): ScrapeResult {
    return { header, rows, source: 'https://example.test', familyCode: null }
  }

  it('maps every row of the scrape it is handed', () => {
    // The uniform output the package produces and nothing shipped until now:
    // four vendors' CSVs in four column vocabularies, one record type out.
    const records = toRecords(FAMILY, scrape([row(), row({ 'Tool #': '14917' })]), {
      warn: () => {},
    })

    expect(records).toHaveLength(2)
    expect(records[0]?.vendor).toBe('Harvey Tool')
    expect(records[0]?.brand).toBe('harvey')
    expect(records[0]?.guid).toBe(recordGuid('harvey', '14916'))
    expect(records[0]?.geometry.DC).toBe(0.25)
  })

  it('refuses a header whose identity column moved, before the first row', () => {
    // The failure this prevents is silent: a re-scrape whose part-number column
    // was renamed still parses, still has the right row count, and mints every
    // guid off an empty string.
    const header = Object.keys(row()).filter((column) => column !== 'Tool #')

    expect(() => toRecords(FAMILY, scrape([row()], header))).toThrow(ScraperConfigError)
    expect(() => toRecords(FAMILY, scrape([row()], header))).toThrow(/identity column/)
  })

  it('refuses a header missing a mapped column, naming the family and the field', () => {
    // From inside a mapper this names one row out of ninety-three; here it names
    // the family and the canonical field, which is what a person can act on.
    const header = Object.keys(row()).filter((column) => column !== 'OAL_in')

    expect(() => toRecords(FAMILY, scrape([row()], header))).toThrow(/OAL -> OAL_in/)
  })

  it('refuses an unknown family rather than mapping nothing', () => {
    expect(() => toRecords('nothing.csv', scrape([]))).toThrow(/unknown cutting-tool family/)
  })
})

describe('fact projection', () => {
  it('projects a fact value onto the config under its own key', () => {
    // Readers say `family.unit` and never learn about provenance — provenance
    // is evidence for a person and a gate, not an input to arithmetic.
    const godrill = boundFamily('godrill_3xd_metric.csv')

    expect(godrill.unit).toBe('millimeters')
    expect(godrill.flutes).toBe(2)
    expect(godrill.pointAngle).toBe(140)
    expect(godrill.coolantThrough).toBe(false)
    expect(godrill.nonFerrous).toBe(false)
    expect(godrill.bmc).toBe('carbide')
  })

  it('keeps every projected key agreeing with its fact', () => {
    // The projection is what stops a fact being a second source of truth: the
    // fact is the only authored copy. This holds over the whole catalog.
    for (const [name, cfg] of boundFamilies()) {
      for (const [key, fact] of Object.entries(cfg.facts ?? {})) {
        expect(cfg[key as keyof typeof cfg], `${name}: ${key}`).toBe(fact.value)
      }
    }
    for (const [name, cfg] of boundToolholding()) {
      for (const [key, fact] of Object.entries(cfg.facts ?? {})) {
        expect(cfg[key as keyof typeof cfg], `${name}: ${key}`).toBe(fact.value)
      }
    }
  })

  it('cannot be given a constant twice', () => {
    // The Python refused a family that set a constant both as a plain key and
    // as a fact — two copies that agree today and drift the first time
    // somebody edits the obvious one. `FamilyDefinition` declares no constant
    // keys, so it does not compile now and there is nothing left to check.
    // @ts-expect-error `unit` is a fact, not a plain key
    const bad: FamilyDefinition = {
      id: 'x',
      rows: 1,
      kind: 'drill' as ToolKind,
      columns: {},
      unit: 'inches',
    }
    expect(bad).toBeDefined()
  })
})

describe('the catalog sources what no table states', () => {
  it('gives every family provenance for its per-kind constants', () => {
    // Listed per kind rather than as one set, because what a table omits
    // differs: a tap has no `unit` — its rows carry their own `Thread System`
    // — and no `flutes` constant, because it publishes a `Z` column. It does
    // need `coolantThrough`: the tap mapper hardcoded `false` until 2026-08-29,
    // which is the same claim with nothing standing behind it.
    const required: Record<ToolKind, string[]> = {
      drill: ['unit', 'flutes', 'pointAngle', 'coolantThrough', 'nonFerrous', 'bmc'],
      endmill: ['unit', 'coolantThrough', 'bmc'],
      tap: ['bmc', 'coolantThrough'],
    }

    // **Unless the vendor states it per part, in which case a fact would be
    // the wrong thing** — the same rule the holder discriminants are held to
    // below, and for the same reason: a family constant standing beside a
    // scraped column masks a scrape that lost the column. Listed by brand so a
    // new vendor's silence is a decision somebody made. EMUGE-FRANKEN states
    // the cutting material, the coolant supply and a drill's point angle on
    // every part's own record, so all three are columns; a tap's `unit` is a
    // fact there and not on a Kennametal tap, because EMUGE publishes every
    // tap dimension in millimetres whatever the thread standard.
    const SCRAPED: Partial<Record<BrandName, readonly string[]>> = {
      emuge: ['bmc', 'coolantThrough', 'pointAngle'],
    }

    for (const [name, cfg] of Object.entries(FAMILIES)) {
      const facts = Object.keys(cfg.facts ?? {})
      const scraped = SCRAPED[familyBrand(cfg)] ?? []
      for (const key of required[cfg.kind]) {
        if (scraped.includes(key)) {
          expect(facts, `${name}: ${key} is scraped, so a fact would mask it`).not.toContain(key)
        } else {
          expect(facts, `${name}: missing ${key}`).toContain(key)
        }
      }
    }
  })

  it('gives every holder and collet provenance for its discriminants', () => {
    // `taper`, `clamping` and `style` are constants no variant table states —
    // which is why they are config, and therefore why each needs a source.
    //
    // **Unless the vendor states them per part, in which case a fact would be
    // the wrong thing.** A family constant standing beside a scraped column
    // masks a scrape that lost the column, so the two are alternatives rather
    // than belt and braces. Which brands scrape which discriminant is listed
    // here by name, so a new vendor's silence is a decision somebody made:
    // MariTool files one CSV per taper and mixes all three holder styles in
    // it, and its HSK family holds nine spindle sizes, so none of the three is
    // expressible as a constant. REGO-FIX is the same case one column narrower
    // — see the `contact` claim below.
    const SCRAPED: Partial<Record<BrandName, readonly string[]>> = {
      maritool: ['taper', 'clamping', 'style'],
    }

    expect(Object.keys(HOLDER_FAMILIES).length).toBeGreaterThan(0)
    expect(Object.keys(COLLET_FAMILIES).length).toBeGreaterThan(0)

    for (const [name, cfg] of Object.entries(HOLDER_FAMILIES)) {
      const facts = Object.keys(cfg.facts ?? {})
      const scraped = SCRAPED[familyBrand(cfg)] ?? []
      for (const key of ['taper', 'clamping', 'style']) {
        if (scraped.includes(key)) {
          expect(facts, `${name}: ${key} is scraped, so a fact would mask it`).not.toContain(key)
        } else {
          expect(facts, name).toContain(key)
        }
      }
    }
    for (const [name, cfg] of Object.entries(COLLET_FAMILIES)) {
      expect(Object.keys(cfg.facts ?? {}), name).toContain('style')
    }
  })

  it('states how each holder family meets the spindle, or scrapes it', () => {
    // `contact` has no default on purpose. BTKV30 is the same JIS B 6339 cone
    // as BT30 and seats on the spindle face as well, so a family added without
    // it would be recorded as plain-taper on no evidence. REGO-FIX has none
    // because it publishes both forms in one group and the scraper reads it
    // per row.
    const contacts = Object.values(HOLDER_FAMILIES)
      .map((cfg) => cfg.facts?.contact?.value)
      .filter((v): v is string => v !== undefined)

    expect(contacts.length).toBeGreaterThan(0)
    for (const contact of contacts) {
      expect(['taper', 'face']).toContain(contact)
    }
  })
})

describe('family ids', () => {
  it('is its brand and its vendor-local name', () => {
    expect(familyId(FAMILIES['destinytool_end_mills_inch.csv']!)).toBe('destinytool:end-mills-inch')
  })

  it('is unique and URL-safe across the catalog', () => {
    // The colon is deliberate: it is a legal `pchar` in a path segment
    // (RFC 3986), so `/family/destinytool:end-mills-inch` needs no encoding and
    // stays one route parameter. The local half is kebab-case so nothing
    // downstream has to decide between a stem's underscores and a URL's
    // hyphens.
    const ids = Object.values(FAMILIES).map(familyId)

    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      const [brand, local] = id.split(':')
      expect(Object.keys(BRANDS), id).toContain(brand as BrandName)
      expect(local, id).toMatch(/^[a-z0-9-]+$/)
      expect(encodeURI(id), id).toBe(id)
    }
  })
})

describe('the tables themselves', () => {
  it('names every family for the CSV it is scraped into', () => {
    for (const table of [FAMILIES, HOLDER_FAMILIES, COLLET_FAMILIES]) {
      for (const name of Object.keys(table)) {
        expect(name, name).toMatch(/\.csv$/)
      }
    }
  })

  it('states a hand-counted row total per family', () => {
    // `rows` is what a human counted, and it is the one key no code needs. It
    // is an independent restatement: every other count is computed from the
    // same file it checks, so a scrape that silently lost rows agrees with
    // itself.
    for (const table of [FAMILIES, HOLDER_FAMILIES, COLLET_FAMILIES]) {
      for (const [name, cfg] of Object.entries(table)) {
        expect(Number.isInteger(cfg.rows), name).toBe(true)
        expect(cfg.rows, name).toBeGreaterThan(0)
      }
    }
  })

  it('refuses a CSV name two of the three claim', () => {
    // `merge` exists for exactly this and `ALL_FAMILIES` was built with a
    // spread, so a shared name resolved silently to whichever came last — and
    // this is the table that decides which brand's directory a CSV is written
    // to.
    const names = [
      ...Object.keys(FAMILIES),
      ...Object.keys(HOLDER_FAMILIES),
      ...Object.keys(COLLET_FAMILIES),
    ]

    expect(Object.keys(ALL_FAMILIES)).toHaveLength(names.length)
    expect(new Set(names).size).toBe(names.length)
  })

  it('maps every canonical field its kind requires', () => {
    // The other half of `checkColumnMap`, held over the real catalog rather
    // than a fixture.
    for (const [name, cfg] of boundFamilies()) {
      for (const field of REQUIRED_GEOMETRY[cfg.kind]) {
        expect(cfg.columns.mapped(), name).toContain(field)
      }
    }
  })
})
