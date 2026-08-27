/**
 * The console entry point, and the receipt every scrape leaves beside its CSV.
 *
 * `run` is exported and takes its console and its transport, so these drive
 * the real command paths without a subprocess and without a vendor — the same
 * seam every other test in this suite uses.
 *
 * The scrape root is pointed at a temporary directory per test, because the
 * default is derived from the package's own location and a test that wrote
 * there would leave a scrape in the working tree.
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HOLDER_FAMILIES } from '../src/families/index.js'
import { toCsv } from '../src/node/csv.js'
import { SCRAPE_ROOT_ENV, describeRoot, familyCsv } from '../src/node/paths.js'
import * as receipts from '../src/node/receipts.js'
import { run } from '../src/node/cli.js'
import { asFetcher, recorder, stub } from './stubs.js'

/** A family whose CSV the in-place commands can be pointed at. */
const TAPS = 'khsst_spiral_point_plug_inch.csv'

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'toolpath-scrape-'))
  process.env[SCRAPE_ROOT_ENV] = root
})

afterEach(() => {
  delete process.env[SCRAPE_ROOT_ENV]
})

/** A fetcher that refuses every request, for the paths that need none. */
const noNetwork = stub()

describe('every command states where scraped data lands', () => {
  it.each([
    [],
    ['--help'],
    ['kennametal'],
    ['regofix'],
    ['destinytool'],
    ['thread-pitch'],
    ['cad'],
    ['materials'],
    ['mirror-cad'],
  ])('announces the root for %j', async (...argv) => {
    // Somebody reading the usage text is the person most likely to be about to
    // point a scrape at the wrong place.
    const { io, out } = recorder()

    await run(argv as string[], io, noNetwork)

    expect(out[0]).toContain('scrape root:')
  })

  it('says whether the root came from the environment', () => {
    expect(describeRoot()).toContain(`${SCRAPE_ROOT_ENV} set`)
    expect(describeRoot()).toContain(root)

    delete process.env[SCRAPE_ROOT_ENV]
    expect(describeRoot()).toContain(`${SCRAPE_ROOT_ENV} default`)
  })
})

describe('the kennametal command', () => {
  const TABLE = `<table>
    <tr><th class="collab-checkbox-header"></th><th>Material Number</th>
        <th class="CatNo">ISO Catalog Number</th>
        <th class="X metric">D1</th></tr>
    <tr><td></td><td>4151623</td><td>B041</td><td>1</td></tr>
    <tr><td></td><td>4151624</td><td>B042</td><td>2</td></tr>
  </table>`

  const serving = (html: string) => asFetcher({ text: vi.fn(async () => html) })

  it('rejects an unknown brand', async () => {
    const { io, err } = recorder()

    expect(await run(['kennametal', '--brand', 'sandvik', '1', 'x.csv'], io)).toBe(2)
    expect(err.join('\n')).toContain('unknown brand: sandvik')
  })

  it('requires a code and an output path', async () => {
    const { io } = recorder()

    expect(await run(['kennametal', '100003658'], io)).toBe(2)
  })

  it('rejects a known brand that is not on the AEM platform', async () => {
    // Checked against every brand, so `--brand regofix` passed and the scraper
    // built a URL with `undefined` where the AEM component node goes.
    const { io, err } = recorder()

    expect(await run(['kennametal', '--brand', 'regofix', 'CODE', 'out.csv'], io, noNetwork)).toBe(
      2,
    )
    expect(err.join('\n')).toContain('unknown brand: regofix')
    expect(err.join('\n')).toContain('kennametal, widia')
  })

  it('needs a value after --brand', async () => {
    const { io, err } = recorder()

    expect(await run(['kennametal', '--brand'], io)).toBe(2)
    expect(err.join('\n')).toContain('--brand needs a value')
  })

  it('refuses a constant column that is not Name=Value', async () => {
    // A quoting slip — `"Thread System" metric` — used to be filtered out, so
    // the scrape wrote a CSV with the column missing and exited 0. Refusing
    // here is what every other bad input in this package gets.
    const out = join(root, 'fam.csv')
    const { io, err } = recorder()

    expect(await run(['kennametal', '100003658', out, 'Thread System'], io, serving(TABLE))).toBe(2)
    expect(err.join('\n')).toContain('constant column "Thread System" is not Name=Value')
    expect(existsSync(out)).toBe(false)
  })

  it('defaults to kennametal, and appends tag columns', async () => {
    const out = join(root, 'fam.csv')
    const { io } = recorder()

    expect(
      await run(['kennametal', '100003658', out, 'Thread System=metric'], io, serving(TABLE)),
    ).toBe(0)

    const written = readFileSync(out, 'utf8')
    expect(written.split('\r\n')[0]).toBe('Material Number,ISO Catalog Number,D1_mm,Thread System')
    expect(written).toContain('4151623,B041,1,metric')
  })

  it('leaves a receipt naming what it fetched', async () => {
    const out = join(root, 'fam.csv')
    const { io, out: logged } = recorder()

    await run(['kennametal', '100003658', out], io, serving(TABLE))

    const receipt = receipts.read(out)
    expect(receipt?.brand).toBe('kennametal')
    expect(receipt?.rows).toBe(2)
    expect(receipt?.familyCode).toBe('100003658')
    expect(receipt?.source).toContain('www.kennametal.com')
    expect(receipt?.source).toContain('100003658')
    expect(receipt?.scrapedAt).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\+00:00$/)
    expect(logged.join('\n')).toContain('wrote 2 rows')
    expect(logged.join('\n')).toContain('receipt: fam.csv.scrape.json')
  })

  it('records WIDIA’s host and not Kennametal’s', async () => {
    const out = join(root, 'w.csv')
    const { io } = recorder()

    await run(['kennametal', '--brand', 'widia', '103354322', out], io, serving(TABLE))

    const receipt = receipts.read(out)
    expect(receipt?.brand).toBe('widia')
    expect(receipt?.source).toContain('www.widia.com')
    expect(receipt?.source).not.toContain('kennametal.com')
  })

  it('refuses a scrape that disagrees with the hand count', async () => {
    // Two independently-arrived-at numbers. Every other count in a pipeline
    // like this is computed from the file it is checking, so a scrape that
    // silently lost rows agrees with itself.
    const out = join(root, 'godrill_3xd_metric.csv')
    const { io } = recorder()

    await expect(run(['kennametal', '100003658', out], io, serving(TABLE))).rejects.toThrow(
      /wrote 2 rows where this family declares 259/,
    )
  })
})

describe('receipts', () => {
  it('replaces rather than accumulates', () => {
    // A receipt describes the file sitting next to it; a history of scrapes
    // that produced files no longer there is a log, not a receipt.
    const csv = join(root, 'x.csv')
    writeFileSync(csv, 'a\r\n')

    receipts.write(csv, { brand: 'regofix', source: 'https://a', rows: 1 })
    receipts.write(csv, { brand: 'regofix', source: 'https://b', rows: 2 })

    expect(receipts.read(csv)?.source).toBe('https://b')
    expect(receipts.read(csv)?.rows).toBe(2)
  })

  it('reads a CSV with no receipt as null rather than refusing it', () => {
    // A CSV somebody scraped before receipts existed is still a usable CSV,
    // and refusing it would be refusing data over its paperwork.
    const csv = join(root, 'orphan.csv')
    writeFileSync(csv, 'a\r\n')

    expect(receipts.read(csv)).toBeNull()
    expect(existsSync(receipts.pathFor(csv))).toBe(false)
  })

  it('stamps a caller-supplied moment, so a test is not a clock', () => {
    const csv = join(root, 'x.csv')

    receipts.write(csv, {
      brand: 'regofix',
      source: 'https://a',
      rows: 1,
      now: new Date('2026-08-26T12:34:56.789Z'),
    })

    expect(receipts.read(csv)?.scrapedAt).toBe('2026-08-26T12:34:56+00:00')
  })

  it('records no family code where the vendor has none', () => {
    // REGO-FIX and Destiny Tool scrape a set of index filters, so it is null
    // rather than an empty string, which would read as a code left blank.
    const csv = join(root, 'x.csv')

    receipts.write(csv, { brand: 'destinytool', source: 'https://a', rows: 1 })

    expect(receipts.read(csv)?.familyCode).toBeNull()
  })

  it('sorts its keys, so a re-scrape diffs only where it differs', () => {
    const csv = join(root, 'x.csv')

    receipts.write(csv, { brand: 'regofix', source: 'https://a', rows: 1 })

    const keys = Object.keys(JSON.parse(readFileSync(receipts.pathFor(csv), 'utf8')) as object)
    expect(keys).toEqual([...keys].sort())
  })
})

describe('the in-place commands', () => {
  it('rejects a CSV that is not a holder family', async () => {
    const { io } = recorder()

    await expect(run(['cad', 'nope.csv'], io, noNetwork)).rejects.toThrow(/unknown holder CSV/)
  })

  it('rejects the cad step on a holder that is not a Kennametal one', async () => {
    // `annotateCadUrls` posts to Kennametal's CDS and rewrites CAD_STEP_URL on
    // every row, so running it over the REGO-FIX holders sent that vendor's
    // SKUs to Kennametal and blanked the URLs its own scrape had filled in.
    const { io, err } = recorder()
    const name = Object.keys(HOLDER_FAMILIES).find((n) => n.startsWith('regofix'))
    expect(name).toBeDefined()

    expect(await run(['cad', name!], io, noNetwork)).toBe(2)
    expect(err.join('\n')).toContain('cad step is')
  })

  it('rejects a CSV that is not a tool family', async () => {
    const { io } = recorder()

    await expect(run(['materials', 'nope.csv'], io, noNetwork)).rejects.toThrow(
      /unknown family CSV/,
    )
  })

  it('derives a thread pitch in each row’s own system', async () => {
    // The CLI resolves the path through the family's own brand, so the file
    // has to be written where that resolves to — a typed directory is ignored
    // precisely so one vendor's receipt cannot land in another's.
    const path = familyCsv(TAPS)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(
      path,
      toCsv(
        ['Material Number', 'D1-TDZ', 'Z', 'Thread System'],
        [
          {
            'Material Number': '1',
            'D1-TDZ': '#4-40',
            Z: '2',
            'Thread System': 'inch',
          },
        ],
      ),
    )

    const { io, out } = recorder()
    expect(await run(['thread-pitch', TAPS], io, noNetwork)).toBe(0)

    const written = readFileSync(path, 'utf8')
    expect(written.split('\r\n')[0]).toBe('Material Number,D1-TDZ,Thread Pitch,Z,Thread System')
    expect(written).toContain('1,#4-40,0.025,2,inch')
    expect(out.join('\n')).toContain(`${TAPS}: 1 rows updated`)
  })
})

describe('unknown input', () => {
  it('refuses an unknown command with a usage message', async () => {
    const { io, err } = recorder()

    expect(await run(['convert'], io, noNetwork)).toBe(2)
    expect(err.join('\n')).toContain('unknown command "convert"')
    expect(err.join('\n')).toContain('usage: toolpath-scrape')
  })
})
