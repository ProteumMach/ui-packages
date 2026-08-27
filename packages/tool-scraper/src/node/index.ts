/**
 * The half of this package that touches the filesystem.
 *
 * A scrape returns rows; turning them into a CSV, writing the provenance
 * sidecar that goes beside one, resolving where a vendor's files live and
 * mirroring the vendor's CAD binaries all need `fs`, and a backend that only
 * wants records should not have to import any of it.
 *
 * So they are a separate entry point — `@toolpath/tool-scraper/node` — and the
 * main one stays what a library ought to be: functions in, values out.
 */

export { parseCsv, toCsv, type ParsedCsv } from './csv.js'

export {
  DEFAULT_SCRAPE_ROOT,
  SCRAPE_ROOT_ENV,
  csvDir,
  describeRoot,
  familyCsv,
  scrapeRoot,
  stepDir,
} from './paths.js'

export {
  SUFFIX,
  checkRows,
  pathFor,
  read,
  scraperVersion,
  write,
  type Receipt,
  type ReceiptInput,
} from './receipts.js'

export { downloadStep, mirrorFamilySteps, type MirroredStep } from './cad-mirror.js'

export { main, run, type Console_ } from './cli.js'
