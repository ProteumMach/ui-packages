/**
 * The bulk STEP mirror — a maintainer's tool, not part of the library.
 *
 * A vendor's CAD step resolves each part's permanent URL and writes it into
 * `conventions.CAD_COLUMN`. This reads that column back and downloads every
 * file — and it is vendor-neutral for the same reason the column is: two
 * adapters write it and neither owns it.
 *
 * **It is here rather than beside the lookup, and that is a decision.** Three
 * things make it a poor fit for a package a Node backend imports:
 *
 * 1. It is filesystem-bound by nature. There is no sensible "return the data
 *    instead" version — a family is roughly a megabyte of STEP, and more at
 *    scale.
 * 2. It is a batch job with rate-limit pauses, not a request-scoped call.
 *    Eight-plus seconds of serial fetch-and-sleep inside a request handler is
 *    the wrong shape; putting it in a worker is the consumer's decision, not
 *    this package's.
 * 3. These are the vendor's CAD binaries. The stance is that they are mirrored
 *    locally for measuring a holder and never redistributed, and a public
 *    module offering a one-call bulk downloader is a different exposure than a
 *    command a maintainer runs.
 *
 * What a consumer wants is the URL — to link to, or to fetch one of on demand
 * — which is what the annotate step already gives it. The seam was there
 * before this split: the column exists precisely so downloading is a separate,
 * later, optional step.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { CAD_COLUMN } from '../conventions.js'
import type { Fetcher } from '../fetch.js'
import { REQUEST_DELAY_MS, consoleWarn, pause, type ScrapedRow, type Warn } from '../scrape.js'

/**
 * A catalog number as one path segment.
 *
 * REGO-FIX's catalog number is the vendor's own title — `BT 30 / PG 25 x 075`
 * — and a separator in it was being honoured as one: `downloadStep` creates
 * the parent directory, so the file landed in a `BT 30 ` subdirectory instead
 * of flat in `outDir`, against what this module promises. The number stays
 * readable, which is the whole reason the file is named for it.
 */
function fileName(catalogNumber: string): string {
  return catalogNumber.replaceAll(/[/\\]/g, '-')
}

/** One STEP file onto disk. Returns the bytes written. */
export async function downloadStep(fetcher: Fetcher, url: string, dest: string): Promise<number> {
  // Straight to `dest` rather than through a temp file: these are ~54 KB
  // static CDN objects, and a half-written one is caught by whatever tries to
  // import it, not by anything here.
  const data = await fetcher.bytes(url)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, data)
  return data.byteLength
}

/** One mirrored file. */
export interface MirroredStep {
  catalogNumber: string
  bytes: number
}

/**
 * Every STEP model a holder scrape names, into `outDir`, one file per row.
 *
 * Named for the catalog number rather than the material number, because the
 * filename is what a human reads and `BT30ER16060M` says what the part is
 * where `1258023` does not.
 *
 * **`outDir` is a required argument and never inferred.** These files are a
 * local working copy, they are gitignored, and a default that pointed into a
 * tracked directory would be the one mistake that silently commits ~3 MB of
 * vendor binaries.
 *
 * A row with no CAD URL is skipped rather than failed — that is
 * `lightweightStepUrl`'s documented null case arriving here — and a skipped
 * row spends no delay, because the count that matters is downloads and a
 * family that is mostly blank should not sleep its way through the gaps.
 */
export async function mirrorFamilySteps(
  fetcher: Fetcher,
  rows: readonly ScrapedRow[],
  outDir: string,
  delayMs: number = REQUEST_DELAY_MS,
  warn: Warn = consoleWarn,
): Promise<MirroredStep[]> {
  const written: MirroredStep[] = []

  for (const row of rows) {
    const url = (row[CAD_COLUMN] ?? '').trim()
    if (!url) continue

    const catalogNumber = row['ISO Catalog Number'] ?? ''
    if (!catalogNumber) {
      warn(`  SKIPPED a row with a CAD URL and no catalog number to name it`)
      continue
    }

    if (written.length > 0) await pause(delayMs)
    const bytes = await downloadStep(fetcher, url, join(outDir, `${fileName(catalogNumber)}.stp`))
    written.push({ catalogNumber, bytes })
  }

  return written
}
