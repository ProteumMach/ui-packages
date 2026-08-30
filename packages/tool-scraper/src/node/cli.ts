/**
 * The console entry point. Argv handling only — no scraping logic lives here.
 *
 * ```
 * toolpath-scrape kennametal      family page -> CSV
 * toolpath-scrape regofix         ProductFinder index -> toolholding CSV
 * toolpath-scrape destinytool     Firestore products -> End Mill CSV
 * toolpath-scrape harvey          one product page -> CSV
 * toolpath-scrape maritool        leaf categories -> toolholding CSV
 * toolpath-scrape thread-pitch    add the derived Thread Pitch column
 * toolpath-scrape cad             add the vendor CAD model column
 * toolpath-scrape materials       add the ISO workpiece-group column
 * toolpath-scrape mirror-cad      download the vendor STEP models
 * ```
 *
 * **One binary with subcommands.** Seven names in `node_modules/.bin` for one
 * package is not the idiom.
 *
 * **Every command prints the resolved scrape root before it does anything.**
 * The default is derived from this package's own location, which is right in a
 * working tree and meaningless in `node_modules`, so where a scrape lands is a
 * thing to state rather than to assume.
 *
 * The convert commands are not here. This package acquires; a Fusion library
 * or an assembly catalog is a different product, and none of it is in this
 * tree.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname } from 'node:path'

import { ScraperConfigError, VendorResponseError } from '../errors.js'
import { familyBrand } from '../family.js'
import { ALL_FAMILIES, FAMILIES, HOLDER_FAMILIES, familyConfig } from '../families/index.js'
import { createFetcher, type Fetcher } from '../fetch.js'
import { AEM_BRANDS, type AemBrandName, type BrandName } from '../identity.js'
import { boundFamily } from '../registry.js'
import { pause, REQUEST_DELAY_MS, type ScrapeResult } from '../scrape.js'
import { mirrorFamilySteps } from './cad-mirror.js'
import { parseCsv, toCsv } from './csv.js'
import { describeRoot, familyCsv, stepDir } from './paths.js'
import * as receipts from './receipts.js'
import { scrapeFamily } from '../vendors/kennametal/scrape.js'
import { annotateCadUrls } from '../vendors/kennametal/cad.js'
import { addMaterialGroups, groupsByMaterial } from '../vendors/kennametal/materials.js'
import { addThreadPitch } from '../vendors/kennametal/thread-column.js'
import { scrapeEndMills, DOCUMENTS_URL } from '../vendors/destinytool/scrape.js'
import { PRODUCT_PAGES } from '../families/harvey.js'
import { CATEGORY_ROOTS, discoverProducts } from '../vendors/harvey/catalog.js'
import { scrapeProduct } from '../vendors/harvey/scrape.js'
import { SEARCH_URL, scrapeCollets, scrapeHolders } from '../vendors/regofix/scrape.js'
import { LEAVES as MARITOOL_LEAVES } from '../families/maritool.js'
import {
  CATEGORY_ROOTS as MARITOOL_ROOTS,
  describe as describeCategory,
  discoverCategories,
  leavesOf,
} from '../vendors/maritool/catalog.js'
import { scrapeHolders as scrapeMaritoolHolders } from '../vendors/maritool/scrape.js'

/**
 * The PG series a BT 30 holder can take. PG 32 and PG 48 collets exist and no
 * BT 30 holder in this catalog accepts one, so scraping them would add parts
 * that fit nothing.
 */
const BT30_COLLET_SIZES = ['6', '10', '15', '25'] as const

const USAGE = `usage: toolpath-scrape <command> [args]

  kennametal [--brand kennametal|widia] FAMILY_CODE OUTPUT_CSV [Name=Value ...]
      One AEM family page -> a CSV. Trailing Name=Value args are appended to
      every row as constant columns, for facts the vendor table does not state
      (e.g. "Thread System=metric").

  regofix holders OUT.csv
  regofix collets "<PRODUCT GROUP>" OUT.csv
      The REGO-FIX ProductFinder index. \`holders\` takes every powRgrip BT/PG
      holder whose taper is BT 30 or BT+ 30, with geometry from each part's
      DIN 4000 document. \`collets\` takes one product group, restricted to PG
      sizes ${BT30_COLLET_SIZES.join(', ')} — the group is the vendor's own
      \`product_group_name\`, e.g. "Standard", "Coolant flush",
      "Tapping collet TAP".

  destinytool OUTPUT_CSV
      Pages the whole Destiny Tool \`products\` Firestore collection and writes
      every End Mill row.

  harvey FAMILY.csv [more.csv ...]
      One Harvey Tool product page -> a CSV. The page to fetch and the unit
      system come from the family's own config, so neither is typed again.
      One HTML row is up to nine orderable parts; expect more rows out than
      the vendor's table appears to have.

  harvey --catalog
      Walks the four Harvey category trees and prints every product page it
      finds, one per line. For noticing a page Harvey has added — a scrape
      needs none of it.

  maritool FAMILY.csv [more.csv ...]
      One MariTool taper -> a CSV. The leaf categories to page through come
      from the family's own config, so none of them is typed again. One
      request per listing page, then one per part for its Product
      Specifications table.

  maritool --catalog
      Walks the five MariTool taper trees and prints every category it finds,
      one per line, with its product count. For rechecking the leaf cPaths in
      \`families/maritool.ts\` — a scrape needs none of it.

  thread-pitch TAP.csv [more.csv ...]
      Adds a Thread Pitch column derived from D1-TDZ, in place. Safe to re-run.

  cad HOLDERS.csv [more.csv ...]
      Adds the vendor CAD model URL column, in place. One request per row
      against product-config.net; safe to re-run.

  materials FAMILY.csv [more.csv ...]
      Adds the ISO workpiece-group column, in place. One request per material
      group (32) per family; safe to re-run.

  mirror-cad HOLDERS.csv [more.csv ...]
      Downloads each row's STEP model into <root>/<brand>/step. Run \`cad\`
      first — a CSV with no CAD column yields nothing and says so.

An output path is used verbatim; scraped CSVs belong under the scrape root,
in <brand>/csv/. The in-place commands take a bare CSV name and resolve it
through the family's own brand.`

/** Everything the CLI prints, injectable so a test is not stdout. */
export interface Console_ {
  log: (message: string) => void
  error: (message: string) => void
}

const STDOUT: Console_ = {
  log: (message) => process.stdout.write(`${message}\n`),
  error: (message) => process.stderr.write(`${message}\n`),
}

/** Read one family's CSV off disk as a scrape result. */
function readCsv(name: string, source: string): ScrapeResult {
  const path = familyCsv(name)
  const { header, rows } = parseCsv(readFileSync(path, 'utf8'))
  return { header, rows, source, familyCode: null }
}

/** Write a scrape to `path`. */
function writeCsv(path: string, scrape: ScrapeResult): void {
  writeFileSync(path, toCsv(scrape.header, scrape.rows))
}

/**
 * Report a scrape and record its receipt.
 *
 * One function because the two belong together: a scrape that reported a count
 * and wrote no receipt would be exactly the state this package is trying to
 * stop existing — data with nothing saying where it came from.
 */
function wrote(out: string, brand: BrandName, scrape: ScrapeResult, io: Console_): void {
  writeCsv(out, scrape)
  const receipt = receipts.write(out, {
    brand,
    source: scrape.source,
    rows: scrape.rows.length,
    familyCode: scrape.familyCode,
  })

  io.log(`wrote ${scrape.rows.length} rows to ${out}`)
  io.log(`  receipt: ${basename(receipt)}`)

  const name = basename(out)
  // Through the merged table rather than three chained lookups, so a name two
  // tables both claim is refused where it is built instead of resolving here
  // to whichever happened to be checked first.
  const declared = ALL_FAMILIES[name]?.rows
  const written = receipts.read(out)
  if (declared !== undefined && written !== null) {
    receipts.checkRows(name, declared, written)
  }
}

/**
 * Argv as family CSV names, refusing anything unknown by name.
 *
 * A path's directory is ignored: the family's own brand decides where its CSV
 * lives, and honouring a typed directory would let one vendor's receipt be
 * written into another's.
 */
function namesIn(argv: string[], known: Record<string, unknown>, what: string): string[] {
  const names = argv.map((a) => basename(a))
  const unknown = names.filter((n) => !Object.hasOwn(known, n))
  if (unknown.length > 0) {
    throw new ScraperConfigError(
      unknown.join(', '),
      `unknown ${what} CSV (known: ${Object.keys(known).sort().join(', ')})`,
    )
  }
  return names
}

/** Run one command. Exported so the tests drive it without a subprocess. */
export async function run(
  argv: string[],
  io: Console_ = STDOUT,
  fetcher: Fetcher = createFetcher(),
): Promise<number> {
  // Somebody reading the usage text is the person most likely to be about to
  // point a scrape at the wrong place, so help gets the root too.
  io.log(describeRoot())

  const [command, ...rest] = argv
  if (command === undefined || command === '-h' || command === '--help') {
    io.log(USAGE)
    return 0
  }

  switch (command) {
    case 'kennametal':
      return kennametal(rest, io, fetcher)
    case 'regofix':
      return regofix(rest, io, fetcher)
    case 'destinytool':
      return destinytool(rest, io, fetcher)
    case 'harvey':
      return harvey(rest, io, fetcher)
    case 'maritool':
      return maritool(rest, io, fetcher)
    case 'thread-pitch':
      return threadPitch(rest, io)
    case 'cad':
      return cad(rest, io, fetcher)
    case 'materials':
      return materials(rest, io, fetcher)
    case 'mirror-cad':
      return mirrorCad(rest, io, fetcher)
    default:
      io.error(`unknown command ${JSON.stringify(command)}\n\n${USAGE}`)
      return 2
  }
}

async function kennametal(argv: string[], io: Console_, fetcher: Fetcher): Promise<number> {
  const args = [...argv]
  let brand: string = 'kennametal'

  const flag = args.indexOf('--brand')
  if (flag !== -1) {
    const value = args[flag + 1]
    if (value === undefined) {
      io.error(`--brand needs a value\n\n${USAGE}`)
      return 2
    }
    brand = value
    args.splice(flag, 2)
  }
  // Against the AEM brands rather than every brand: `scrapeFamily` reads
  // `Brand.node`, and a brand without one built a URL with `undefined` in the
  // path and died on the 404 instead of on this line.
  if (!AEM_BRANDS.includes(brand as AemBrandName)) {
    io.error(`unknown brand: ${brand} (known: ${[...AEM_BRANDS].sort().join(', ')})`)
    return 2
  }
  if (args.length < 2) {
    io.error(USAGE)
    return 2
  }

  const [code, out] = args as [string, string, ...string[]]
  // Refused rather than dropped: a quoting slip like `"Thread System" metric`
  // used to scrape, write the CSV and exit 0 with the column missing, and the
  // failure surfaced later in `addThreadPitch` against a file no longer being
  // written.
  const constants = args.slice(2)
  const malformed = constants.find((a) => a.indexOf('=') < 1)
  if (malformed !== undefined) {
    io.error(`constant column ${JSON.stringify(malformed)} is not Name=Value\n\n${USAGE}`)
    return 2
  }
  const tags = constants.map((a) => {
    const at = a.indexOf('=')
    return [a.slice(0, at), a.slice(at + 1)] as const
  })

  const scrape = await scrapeFamily(fetcher, code, brand as AemBrandName, tags)
  wrote(out, brand as BrandName, scrape, io)
  return 0
}

async function regofix(argv: string[], io: Console_, fetcher: Fetcher): Promise<number> {
  const [what, ...rest] = argv

  if (what === 'holders') {
    if (rest.length !== 1) {
      io.error(USAGE)
      return 2
    }
    const scrape = await scrapeHolders(fetcher, 'BT/PG', 'BT', {
      warn: io.error,
    })
    wrote(rest[0]!, 'regofix', { ...scrape, source: SEARCH_URL }, io)
    return 0
  }

  if (what === 'collets') {
    if (rest.length !== 2) {
      io.error(USAGE)
      return 2
    }
    const [group, out] = rest as [string, string]
    const scrape = await scrapeCollets(fetcher, group, BT30_COLLET_SIZES, {
      warn: io.error,
    })
    wrote(out, 'regofix', { ...scrape, source: SEARCH_URL }, io)
    return 0
  }

  io.error(`unknown subcommand ${JSON.stringify(what)}\n\n${USAGE}`)
  return 2
}

async function destinytool(argv: string[], io: Console_, fetcher: Fetcher): Promise<number> {
  if (argv.length !== 1) {
    io.error(USAGE)
    return 2
  }
  const scrape = await scrapeEndMills(fetcher)
  wrote(argv[0]!, 'destinytool', { ...scrape, source: DOCUMENTS_URL }, io)
  return 0
}

/**
 * One or more Harvey families, or the catalog walk.
 *
 * Paced between pages by the package's shared politeness delay, which the
 * per-page scrape does not do for itself: one family is one request, and a
 * caller scraping one has nothing to wait for.
 */
async function harvey(argv: string[], io: Console_, fetcher: Fetcher): Promise<number> {
  if (argv[0] === '--catalog') {
    const found = await discoverProducts(fetcher, CATEGORY_ROOTS, { warn: io.error })
    for (const path of found) io.log(path)
    io.log(`${found.length} product pages under ${CATEGORY_ROOTS.length} category trees`)
    return 0
  }

  if (argv.length === 0) {
    io.error(USAGE)
    return 2
  }

  const names = namesIn(argv, PRODUCT_PAGES, 'Harvey family')
  for (const [index, name] of names.entries()) {
    if (index > 0) await pause(REQUEST_DELAY_MS)
    const cfg = boundFamily(name)
    // Never undefined: `namesIn` refused anything `PRODUCT_PAGES` does not key,
    // and `tests/harvey-families.test.ts` holds the two tables to the same keys.
    const page = PRODUCT_PAGES[name]!
    if (cfg.unit === undefined) {
      throw new ScraperConfigError(name, 'declares no unit — every Harvey family publishes one')
    }
    const scrape = await scrapeProduct(fetcher, page, { unit: cfg.unit, warn: io.error })
    const out = familyCsv(name)
    // This command resolves its own output path rather than taking one, so the
    // brand's directory may not exist yet — unlike `kennametal`, where the path
    // is typed and its directory is the caller's to have made.
    mkdirSync(dirname(out), { recursive: true })
    wrote(out, 'harvey', scrape, io)
  }
  return 0
}

/**
 * One or more MariTool families, or the catalog walk.
 *
 * The scrape paces itself between every request it makes, so unlike `harvey`
 * there is nothing to pace between families here.
 */
async function maritool(argv: string[], io: Console_, fetcher: Fetcher): Promise<number> {
  if (argv[0] === '--catalog') {
    const found = await discoverCategories(fetcher, MARITOOL_ROOTS, { warn: io.error })
    for (const category of found) io.log(describeCategory(category))
    const leaves = leavesOf(found)
    io.log(
      `${found.length} categories under ${MARITOOL_ROOTS.length} taper trees, ` +
        `${leaves.length} of them leaves, ` +
        `${leaves.reduce((sum, leaf) => sum + leaf.products, 0)} products`,
    )
    return 0
  }

  if (argv.length === 0) {
    io.error(USAGE)
    return 2
  }

  for (const name of namesIn(argv, MARITOOL_LEAVES, 'MariTool family')) {
    // Never undefined: `namesIn` refused anything `MARITOOL_LEAVES` does not
    // key, and `tests/maritool.test.ts` holds the two tables to the same keys.
    const leaves = MARITOOL_LEAVES[name as keyof typeof MARITOOL_LEAVES]
    const scrape = await scrapeMaritoolHolders(fetcher, leaves, { warn: io.error })
    const out = familyCsv(name)
    // This command resolves its own output path rather than taking one, so the
    // brand's directory may not exist yet.
    mkdirSync(dirname(out), { recursive: true })
    wrote(out, 'maritool', scrape, io)
  }
  return 0
}

function threadPitch(argv: string[], io: Console_): number {
  if (argv.length === 0) {
    io.error(USAGE)
    return 2
  }
  for (const name of namesIn(argv, FAMILIES, 'family')) {
    const path = familyCsv(name)
    const updated = addThreadPitch(readCsv(name, path))
    writeCsv(path, updated)
    io.log(`${name}: ${updated.rows.length} rows updated`)
  }
  return 0
}

async function cad(argv: string[], io: Console_, fetcher: Fetcher): Promise<number> {
  if (argv.length === 0) {
    io.error(USAGE)
    return 2
  }
  for (const name of namesIn(argv, HOLDER_FAMILIES, 'holder')) {
    // `annotateCadUrls` is Kennametal's CDS lookup, not a vendor-neutral one —
    // it queries product-config.net and rewrites `CAD_COLUMN` on every row. Run
    // against a REGO-FIX holder it would post that vendor's SKUs to Kennametal
    // and blank the STEP URLs the REGO-FIX scrape had already filled in.
    // `mirror-cad` reads the column and *is* neutral; this writes it and is not.
    const brand = familyBrand(familyConfig(name))
    if (!AEM_BRANDS.includes(brand as AemBrandName)) {
      io.error(
        `${name}: the cad step is ${[...AEM_BRANDS].sort().join('/')}-only — ` +
          `${brand} publishes its own CAD URLs with the scrape`,
      )
      return 2
    }
    const path = familyCsv(name)
    const { scrape, found } = await annotateCadUrls(fetcher, readCsv(name, path))
    writeCsv(path, scrape)
    io.log(`${name}: ${found} CAD models`)
  }
  return 0
}

async function materials(argv: string[], io: Console_, fetcher: Fetcher): Promise<number> {
  if (argv.length === 0) {
    io.error(USAGE)
    return 2
  }
  // The family code and brand come from config, so a re-run needs neither
  // typed again.
  for (const name of namesIn(argv, FAMILIES, 'family')) {
    const cfg = boundFamily(name)
    if (cfg.familyCode === undefined) {
      throw new ScraperConfigError(
        name,
        'has no familyCode — the material sweep re-queries the family page ' +
          'and cannot without one',
      )
    }
    const path = familyCsv(name)
    const found = await groupsByMaterial(fetcher, cfg.familyCode, {
      brand: (cfg.brand ?? 'kennametal') as AemBrandName,
    })
    const { scrape, matched } = addMaterialGroups(readCsv(name, path), found)
    writeCsv(path, scrape)
    io.log(`${name}: ${matched} rows with a material group`)
  }
  return 0
}

async function mirrorCad(argv: string[], io: Console_, fetcher: Fetcher): Promise<number> {
  if (argv.length === 0) {
    io.error(USAGE)
    return 2
  }
  for (const name of namesIn(argv, HOLDER_FAMILIES, 'holder')) {
    const path = familyCsv(name)
    const brand = familyBrand(familyConfig(name))
    const written = await mirrorFamilySteps(
      fetcher,
      readCsv(name, path).rows,
      stepDir(brand),
      undefined,
      io.error,
    )
    const total = written.reduce((sum, f) => sum + f.bytes, 0)
    io.log(`${name}: ${written.length} STEP files, ${Math.floor(total / 1024)} KB`)
  }
  return 0
}

/** The process entry point: run, and turn a refusal into an exit code. */
export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  try {
    return await run(argv)
  } catch (error) {
    if (error instanceof ScraperConfigError || error instanceof VendorResponseError) {
      STDOUT.error(error.message)
      return 2
    }
    throw error
  }
}
