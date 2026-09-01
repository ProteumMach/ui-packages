/**
 * The two EMUGE-FRANKEN tables, held to each other.
 *
 * `FAMILIES` says what a family *is* and `SCRAPE_TARGETS` says what it fetches,
 * and they are two tables because `FamilyDefinition` has no word for "a
 * category narrowed by one facet" and should not grow one for a single vendor.
 * Two tables keyed by the same names is only safe while something checks that
 * they are: a target with no family scrapes into a CSV nothing declares, and a
 * family with no target is a name the CLI accepts and then cannot fetch.
 */

import { describe, expect, it } from 'vitest'

import { BRANDS } from '../src/identity.js'
import { FAMILIES, SCRAPE_TARGETS } from '../src/families/emuge.js'
import { boundFamily } from '../src/registry.js'

const NAMES = Object.keys(FAMILIES)

describe('the family table and the target table', () => {
  it('are keyed by exactly the same CSV names', () => {
    expect(Object.keys(SCRAPE_TARGETS).sort()).toEqual(NAMES.sort())
  })

  it('declares a brand this package knows, on every family', () => {
    for (const [name, cfg] of Object.entries(FAMILIES)) {
      expect(Object.keys(BRANDS), name).toContain(cfg.brand)
      expect(cfg.brand, name).toBe('emuge')
    }
  })

  it('states a category code, and a facet only where the catalog splits', () => {
    // Milling is the one category EMUGE publishes in both unit systems, so it
    // is the one whose families carry a facet. Drilling and tapping are
    // millimetres throughout and take the whole category.
    for (const [name, target] of Object.entries(SCRAPE_TARGETS)) {
      expect(target.category, name).toMatch(/^F[BFG]\d{2}$/)
    }

    const faceted = Object.entries(SCRAPE_TARGETS).filter(([, t]) => 'facet' in t)
    expect(faceted.map(([name]) => name).sort()).toEqual([
      'emuge_end_mills_inch.csv',
      'emuge_end_mills_mm.csv',
    ])
    for (const [name, target] of faceted) {
      expect((target as { facet: { code: string } }).facet.code, name).toBe(
        'feature-HYBCL_PRODUKTMERKMALE-AMM_EINHS',
      )
    }
  })

  it('gives the two end mill families one category and two facets of it', () => {
    // Same `familyCode` on both, which is right — they are two facets of one
    // vendor category rather than two categories — so the facet is the only
    // thing that keeps their scrapes apart.
    const inch = SCRAPE_TARGETS['emuge_end_mills_inch.csv']
    const metric = SCRAPE_TARGETS['emuge_end_mills_mm.csv']

    expect(inch.category).toBe(metric.category)
    expect(inch.facet.value).not.toBe(metric.facet.value)
  })
})

describe('what each family binds to', () => {
  it('binds a mapper for its kind, and a unit to read its columns in', () => {
    for (const name of NAMES) {
      const cfg = boundFamily(name)

      expect(typeof cfg.records, name).toBe('function')
      expect(['inches', 'millimeters'], name).toContain(cfg.unit)
    }
  })

  it('counts its rows independently of any scrape', () => {
    // The one key nothing reads at scrape time: `node/receipts.checkRows`
    // compares it to what a run wrote, so a scrape that silently lost rows
    // cannot agree with itself.
    for (const [name, cfg] of Object.entries(FAMILIES)) {
      expect(cfg.rows, name).toBeGreaterThan(0)
    }
  })
})
