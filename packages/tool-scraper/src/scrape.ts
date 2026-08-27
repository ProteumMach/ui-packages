/**
 * What a scrape hands back.
 *
 * The Python's scrape functions each ended in `open(out_path, 'w')` and
 * returned a row count. That is right for a console script and wrong for a
 * library: a Node backend embedding this wants the rows, and writing a CSV is
 * one of several things it might then do with them.
 *
 * So a scrape returns this, and `@toolpath/tool-scraper/node` turns one into a
 * CSV and a receipt beside it. The two pieces of provenance a receipt needs —
 * where the rows came from, and under which vendor family code — travel with
 * the rows rather than being reconstructed by the caller, because finding the
 * request again is the most expensive part of adding a vendor.
 */

/** One scraped row: the vendor's own column labels, and its own strings. */
export type ScrapedRow = Readonly<Record<string, string>>

/** One family's scrape: the rows, and enough provenance to write a receipt. */
export interface ScrapeResult {
  /**
   * The CSV column order, positional.
   *
   * Kept beside the rows rather than derived from them: a row whose cell is
   * empty still has to occupy its column, and deriving the header from the
   * first row's keys would drop a column the vendor left blank on that row.
   */
  readonly header: readonly string[]
  readonly rows: readonly ScrapedRow[]
  /**
   * The URL the rows came from. A request, not a page: this is the thing to
   * re-issue when a column changes shape.
   */
  readonly source: string
  /**
   * The vendor's own family code where there is one. REGO-FIX and Destiny Tool
   * have none — their scrape target is a set of index filters — so it is null
   * rather than an empty string, which would read as a code the vendor left
   * blank.
   */
  readonly familyCode: string | null
}

/**
 * Where a scraper reports something it could not resolve but did not fail on.
 *
 * The Python printed these. A library must not: a backend wants them in its
 * own log, and a CLI wants them on stderr. Defaults to `console.warn` so the
 * CLI keeps behaving as the Python did without every call site passing one.
 */
export type Warn = (message: string) => void

/** Options every record mapper accepts. */
export interface MapperOptions {
  warn?: Warn
}

/** The default: what the Python's `print` did, on stderr where it belongs. */
export const consoleWarn: Warn = (message) => {
  console.warn(message)
}

/**
 * Wait between requests, skipped entirely at zero.
 *
 * Politeness, not rate-limit avoidance. It lived in the Kennametal adapter
 * because that is the only vendor whose scrape loops — and the vendor-boundary
 * test is what moved it: `node/cad-mirror.ts` needed it too, and a core module
 * reaching into one manufacturer for a three-line helper is exactly the leak
 * that rule exists to catch. Same call `conventions.CAD_COLUMN` got.
 */
export async function pause(ms: number): Promise<void> {
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms))
}
