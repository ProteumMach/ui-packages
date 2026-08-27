/**
 * The bulk STEP mirror: one row's CAD URL -> one file on disk.
 *
 * It lives in `node/` rather than beside the Kennametal CAD lookup because it
 * is vendor-neutral — it reads `conventions.CAD_COLUMN`, which REGO-FIX fills
 * in too — and because writing files is the half of this package a backend
 * embedding it never imports.
 */

import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { mirrorFamilySteps } from '../src/node/cad-mirror.js'
import { stub } from './stubs.js'

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
