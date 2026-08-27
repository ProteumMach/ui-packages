/**
 * The ten defects a review of this package turned up, each pinned by the case
 * that used to pass through them.
 *
 * Grouped by the seam that leaked rather than by file, because that is what
 * each one has in common: a value crossing from a vendor's data into a record,
 * a path or a URL, with nothing on the boundary refusing the shape it could
 * not serve. Every case below is the *old* behaviour written as an
 * expectation of the new one.
 */

import { describe, expect, it } from 'vitest'
import { mkdtempSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { HttpError, type Fetcher } from '../src/fetch.js'
import { VendorResponseError } from '../src/errors.js'
import { AEM_BRANDS } from '../src/identity.js'
import { ALL_FAMILIES, COLLET_FAMILIES, FAMILIES, HOLDER_FAMILIES } from '../src/families/index.js'
import { checkColumnMap, type ToolKind } from '../src/records.js'
import type { BoundFamily, FamilyFacts } from '../src/family.js'
import type { ScrapedRow } from '../src/scrape.js'
import { threadMajorDiameter } from '../src/thread.js'
import { parseSize } from '../src/vendors/regofix/scrape.js'
import { tapRecord } from '../src/vendors/kennametal/records.js'
import { annotateCadUrls } from '../src/vendors/kennametal/cad.js'
import { mirrorFamilySteps } from '../src/node/cad-mirror.js'
import { run } from '../src/node/cli.js'

/**
 * A fetcher whose every method refuses, narrowed the way the other suites do.
 *
 * `Fetcher.json` is generic, so an object literal cannot satisfy it directly —
 * `as unknown as Fetcher` is the idiom `kennametal-cad.test.ts` already uses.
 */
function stub(overrides: Record<string, unknown> = {}): Fetcher {
  return {
    bytes: () => Promise.reject(new Error('unused')),
    text: () => Promise.reject(new Error('unused')),
    json: () => Promise.reject(new Error('unused')),
    postJson: () => Promise.reject(new Error('unused')),
    ...overrides,
  } as unknown as Fetcher
}

const NO_FETCH = stub()

/** Collects what the CLI printed, in place of stdout. */
function recorder() {
  const out: string[] = []
  const err: string[] = []
  return { io: { log: (m: string) => out.push(m), error: (m: string) => err.push(m) }, out, err }
}

function family(kind: ToolKind, labels: Record<string, string>, facts: FamilyFacts = {}) {
  return {
    id: 'x',
    rows: 1,
    kind,
    brand: 'kennametal' as const,
    columns: checkColumnMap('x.csv', kind, labels),
    records: () => {
      throw new Error('unused')
    },
    ...facts,
  } satisfies BoundFamily
}

describe('a designation that cannot be read', () => {
  it('is refused rather than returned as NaN', () => {
    // Both used to fall through to arithmetic on NaN and hand back a diameter
    // of NaN, where every other unreadable shape in this function throws.
    expect(() => threadMajorDiameter('#abc-40', 'inch')).toThrow(RangeError)
    expect(() => threadMajorDiameter('1/-20', 'inch')).toThrow(RangeError)
  })

  it('is refused by the REGO-FIX size parser too, for the same reason', () => {
    expect(() => parseSize('3/')).toThrow(RangeError)
    expect(() => parseSize('')).toThrow(RangeError)
    expect(parseSize('1/4')).toBe(0.25)
  })
})

describe('a tap whose Thread System is not one of the two', () => {
  const cfg = family('tap', { SFDM: 'D', OAL: 'L', LCF: 'L3', TP: 'Thread Pitch' }, { bmc: 'hss' })

  // A designation each system can actually read, so the only thing the bad
  // cases below vary is the tag itself.
  const row = (system: string, tdz = 'M6X1'): ScrapedRow => ({
    'Material Number': '1',
    'ISO Catalog Number': 'T100',
    Coating: 'TiN',
    'D1-TDZ': tdz,
    'Thread System': system,
    'Thread Pitch': '1',
    Z: '3',
    D_mm: '6.3',
    L_mm: '80',
    L3_mm: '20',
    D_in: '0.25',
    L_in: '3',
    L3_in: '1',
  })

  it('is refused instead of mixing units within one record', () => {
    // This module read anything that was not `inch` as metric while
    // `thread.ts` read anything that was not `metric` as inch, so a blank tag
    // produced a record whose DC was in inches and whose OAL came from `_mm`.
    for (const bad of ['', 'Inch', 'Metric', 'imperial']) {
      expect(() => tapRecord(row(bad), cfg, cfg.columns), bad).toThrow(VendorResponseError)
    }
  })

  it('still accepts the two the vendor actually states', () => {
    expect(tapRecord(row('metric'), cfg, cfg.columns).unit).toBe('millimeters')
    expect(tapRecord(row('inch', '#2-56'), cfg, cfg.columns).unit).toBe('inches')
  })
})

describe("a record's vendor field", () => {
  it("is the brand's published name, not this package's internal key", () => {
    // `vendor` is what a downstream consumer displays and joins on; `widia` is
    // a key in this package's own table and not a thing the vendor calls itself.
    const cfg = family(
      'tap',
      { SFDM: 'D', OAL: 'L', LCF: 'L3', TP: 'Thread Pitch' },
      { bmc: 'hss' },
    )
    const row: ScrapedRow = {
      'Material Number': '1',
      'ISO Catalog Number': 'T100',
      Coating: 'TiN',
      'D1-TDZ': 'M6X1',
      'Thread System': 'metric',
      'Thread Pitch': '1',
      Z: '3',
      D_mm: '6.3',
      L_mm: '80',
      L3_mm: '20',
    }

    expect(tapRecord(row, cfg, cfg.columns).vendor).toBe('Kennametal')
    expect(tapRecord(row, { ...cfg, brand: 'widia' }, cfg.columns).vendor).toBe('WIDIA')
  })
})

describe('the CAD annotation', () => {
  const scrape = {
    header: ['Material Number'],
    rows: [{ 'Material Number': '1' }, { 'Material Number': '2' }],
    source: 'https://example.invalid',
    familyCode: null,
  }

  it('reads a 404 as "the vendor publishes none" and keeps going', async () => {
    // The docstring promises a row that finds no model keeps an empty cell and
    // is never dropped. A 404 used to throw out of the loop and abandon the
    // file part-annotated, past the CLI's catch and onto a stack trace.
    const fetcher = stub({
      json: (url: string) =>
        url.includes('id=1')
          ? Promise.reject(new HttpError(url, 404))
          : Promise.resolve({ cadAvailable: true, staticURLs: { 'stp-lwm': 'x.stp' } }),
    })

    const { scrape: annotated, found } = await annotateCadUrls(fetcher, scrape, 0)

    expect(found).toBe(1)
    expect(annotated.rows).toHaveLength(2)
    expect(annotated.rows[0]?.['CAD_STEP_URL']).toBe('')
    expect(annotated.rows[1]?.['CAD_STEP_URL']).toBe('x.stp')
  })

  it('still stops the run on any other status', async () => {
    // A 500 is a failed request, not a vendor saying it has no model.
    const fetcher = stub({ json: (url: string) => Promise.reject(new HttpError(url, 500)) })

    await expect(annotateCadUrls(fetcher, scrape, 0)).rejects.toThrow(HttpError)
  })
})

describe('the STEP mirror', () => {
  it('writes one flat file per row even when the catalog number has a slash', async () => {
    // REGO-FIX's catalog number is the vendor's title — `BT 30 / PG 25 x 075`
    // — and the separator in it was honoured as one, so the file landed inside
    // a `BT 30 ` directory rather than flat in outDir as promised.
    const out = mkdtempSync(join(tmpdir(), 'mirror-'))
    const fetcher = stub({ bytes: () => Promise.resolve(new Uint8Array([1, 2, 3])) })
    const rows = [
      {
        CAD_STEP_URL: 'https://example.invalid/a.stp',
        'ISO Catalog Number': 'BT 30 / PG 25 x 075',
      },
    ]

    const written = await mirrorFamilySteps(fetcher, rows, out, 0, () => {})

    expect(existsSync(join(out, 'BT 30 - PG 25 x 075.stp'))).toBe(true)
    expect(existsSync(join(out, 'BT 30 '))).toBe(false)
    // The row still reports the vendor's own number, not the sanitised one.
    expect(written[0]?.catalogNumber).toBe('BT 30 / PG 25 x 075')
  })
})

describe('the merged family table', () => {
  it('refuses a CSV name two of the three tables claim', () => {
    // `merge` exists for exactly this and `ALL_FAMILIES` was built with a
    // spread, so a shared name resolved silently to whichever came last — and
    // this is the table that decides which brand's directory a CSV is written to.
    const names = [
      ...Object.keys(FAMILIES),
      ...Object.keys(HOLDER_FAMILIES),
      ...Object.keys(COLLET_FAMILIES),
    ]

    expect(Object.keys(ALL_FAMILIES)).toHaveLength(names.length)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('the CLI refusing what it cannot serve', () => {
  it('rejects a --brand that is not on the AEM platform', async () => {
    // Checked against every brand, so `--brand regofix` passed and the scraper
    // built a URL with `undefined` where the AEM component node goes.
    const { io, err } = recorder()

    expect(await run(['kennametal', '--brand', 'regofix', 'CODE', 'out.csv'], io, NO_FETCH)).toBe(2)
    expect(err.join('\n')).toContain('unknown brand: regofix')
    expect(err.join('\n')).toContain('kennametal, widia')
  })

  it('rejects the cad step on a holder that is not a Kennametal one', async () => {
    // `annotateCadUrls` posts to Kennametal's CDS and rewrites CAD_STEP_URL on
    // every row, so running it over the REGO-FIX holders sent that vendor's
    // SKUs to Kennametal and blanked the URLs its own scrape had filled in.
    const { io, err } = recorder()
    const name = Object.keys(HOLDER_FAMILIES).find((n) => n.startsWith('regofix'))
    expect(name).toBeDefined()

    expect(await run(['cad', name!], io, NO_FETCH)).toBe(2)
    expect(err.join('\n')).toContain('cad step is')
  })

  it('keeps the AEM brand list and the type in step', () => {
    expect([...AEM_BRANDS].sort()).toEqual(['kennametal', 'widia'])
  })
})
