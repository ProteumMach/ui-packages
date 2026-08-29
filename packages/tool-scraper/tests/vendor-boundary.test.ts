/**
 * The layout, asserted from the package tree rather than from a list.
 *
 * The claim this package rests on is that its adapters share the core and
 * never each other — so a REGO-FIX change cannot break a Kennametal scrape,
 * and a constant two vendors both need has one home. A rostered test would go
 * stale the first time somebody added a file; these derive their module lists
 * by walking `src/`, so a new adapter is covered the moment it lands. The
 * count is deliberately not written down here for the same reason.
 *
 * ## How imports are read
 *
 * TypeScript's own compiler API, which is already a devDependency:
 * `ts.preProcessFile` returns every import specifier in a file without type
 * checking it or resolving anything. That is the counterpart of the Python's
 * `ast.walk` over `Import`/`ImportFrom`, and it costs no new dependency —
 * which matters, because a structural guard that needed a linter plugin to run
 * is a guard somebody switches off.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '../src')
const VENDORS = join(SRC, 'vendors')

/**
 * The files whose job **is** to know every vendor, and nothing else.
 *
 * A composition root wires the parts together; it is the one place a
 * dependency on all of them is the point rather than a leak. `registry.ts` is
 * the module that maps a brand to the adapter serving it; `node/cli.ts` is the
 * console entry point, so one command can drive any adapter. Neither holds
 * pipeline logic — they bind and parse argv — which is what keeps the
 * exception narrow.
 *
 * **`index.ts` is deliberately not here.** It re-exports the core surface and
 * reaches a vendor only through `registry`, so it is held to the same rule as
 * any other core module. Listing it would licence a direct vendor import into
 * the package's front door for no reason anything needs.
 *
 * `families/` is not here either. In the source package it briefly did the
 * binding, which made the config table import a manufacturer, and the table is
 * read by every test — none of which should drag a vendor's scraper in behind
 * it. That test is this one.
 *
 * Named rather than pattern-matched, so adding a third is a deliberate edit
 * here with a reason beside it.
 */
const COMPOSITION_ROOTS = ['registry.ts', 'node/cli.ts']

/** Every `.ts` file under `where`. */
function modules(where: string): string[] {
  const found: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir).sort()) {
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) walk(path)
      else if (entry.endsWith('.ts')) found.push(path)
    }
  }
  try {
    walk(where)
  } catch {
    return []
  }
  return found
}

/** The import specifiers this file names, relative paths included. */
function importsOf(path: string): string[] {
  const info = ts.preProcessFile(readFileSync(path, 'utf8'), true, true)
  return info.importedFiles.map((f) => f.fileName)
}

/** Which module each import resolves to, as a path relative to `src/`. */
function importedModules(path: string): string[] {
  return importsOf(path)
    .filter((spec) => spec.startsWith('.'))
    .map((spec) => relative(SRC, resolve(dirname(path), spec)))
}

const ALL = modules(SRC)
const CORE = ALL.filter((p) => !p.startsWith(VENDORS))
const VENDOR_MODULES = modules(VENDORS)

/** The manufacturer directories under `vendors/`. */
const BRANDS = readdirSync(VENDORS)
  .filter((name) => !name.startsWith('_') && !name.startsWith('.'))
  .filter((name) => statSync(join(VENDORS, name)).isDirectory())
  .sort()

const rel = (path: string) => relative(SRC, path)

describe('the tree is the shape these rules assume', () => {
  it('has the core modules the rules are written against', () => {
    // Guards `CORE`. A tree that moved would leave the rules below iterating
    // nothing, and they would report that as a pass.
    const names = new Set(CORE.map(rel))

    for (const module of [
      'identity.ts',
      'records.ts',
      'provenance.ts',
      'thread.ts',
      'conventions.ts',
    ]) {
      expect(names, module).toContain(module)
    }
  })

  it('has one directory per manufacturer, each with a scraper', () => {
    // Derived rather than rostered, for the same reason the module lists are:
    // an adapter that lands in the wrong shape has to fail here, not be absent
    // from a list nobody updated. A directory that fetches nothing is a
    // vendor's name attached to no transport.
    expect(BRANDS.length).toBeGreaterThan(0)

    for (const brand of BRANDS) {
      const files = readdirSync(join(VENDORS, brand))
      expect(files, brand).toContain('scrape.ts')
    }
  })

  it('gives every manufacturer a subpath a consumer can import', () => {
    // The direction `tests/packaging.test.ts` cannot check. That one walks
    // `exports` and proves each entry has a module behind it, which catches a
    // subpath added for a file that is not there. The failure this catches is
    // the other one: an adapter that builds into `dist`, ships in the tarball,
    // and cannot be reached — `import '@toolpath/tool-scraper/vendors/maritool'`
    // throws ERR_PACKAGE_PATH_NOT_EXPORTED at a consumer, and nothing before
    // that says so. Derived from the tree rather than rostered, so the sixth
    // vendor is covered without anybody remembering this test exists.
    const manifest = JSON.parse(readFileSync(join(SRC, '../package.json'), 'utf8')) as {
      exports: Record<string, { types: string; import: string }>
    }

    for (const brand of BRANDS) {
      expect(existsSync(join(VENDORS, brand, 'index.ts')), `${brand} has no index.ts`).toBe(true)
      expect(
        Object.keys(manifest.exports),
        `src/vendors/${brand} builds and ships, but no ./vendors/${brand} subpath ` +
          `exports it — a consumer cannot import it`,
      ).toContain(`./vendors/${brand}`)
      expect(manifest.exports[`./vendors/${brand}`]).toEqual({
        types: `./dist/vendors/${brand}/index.d.ts`,
        import: `./dist/vendors/${brand}/index.js`,
      })
    }
  })

  it('names a composition root that really is one', () => {
    // An exception nobody uses is an exception that has quietly stopped being
    // needed.
    for (const root of COMPOSITION_ROOTS) {
      const path = join(SRC, root)
      const reaches = importedModules(path).some((m) => m.startsWith('vendors/'))
      expect(
        reaches,
        `${root} is listed as a composition root but imports no adapter — ` +
          `drop it from COMPOSITION_ROOTS`,
      ).toBe(true)
    }
  })
})

describe('only a composition root imports a vendor', () => {
  it.each(CORE.filter((p) => !COMPOSITION_ROOTS.includes(rel(p))).map((p) => [rel(p), p] as const))(
    '%s imports no adapter',
    (name, path) => {
      // A core module that needs a vendor's constant is telling you the constant
      // belongs in the core — that is exactly what `CAD_COLUMN` was, and moving
      // it up is what this test forces.
      const imported = importedModules(path).filter((m) => m.startsWith('vendors/'))

      expect(
        imported,
        `${name} imports ${imported.join(', ')} — a core module must not ` +
          `depend on one manufacturer`,
      ).toEqual([])
    },
  )

  it('lets the core name a vendor in a string, but not reach one', () => {
    // The rule stated one layer down. `identity.BRANDS` is keyed on brand
    // names and `conventions.IDENTITY_DEVIATIONS` names Destiny Tool outright
    // — a core module knowing *that a vendor exists* is the core doing its
    // job. A core module knowing *how* one serves a table is the leak.
    for (const path of CORE) {
      if (COMPOSITION_ROOTS.includes(rel(path))) continue
      const reaches = importedModules(path).some((m) => m.startsWith('vendors/'))
      expect(reaches, rel(path)).toBe(false)
    }
  })
})

describe('no vendor imports another vendor', () => {
  it.each(VENDOR_MODULES.map((p) => [relative(VENDORS, p), p] as const))(
    '%s stays inside its own manufacturer',
    (name, path) => {
      const own = relative(VENDORS, path).split('/')[0]

      for (const imported of importedModules(path)) {
        if (!imported.startsWith('vendors/')) continue
        const other = imported.split('/')[1]
        expect(
          other,
          `${name} imports ${imported} — adapters share the core, never ` + `each other`,
        ).toBe(own)
      }
    },
  )

  it('really do share no code, stated once as a total', () => {
    // The claim the whole layout rests on. REGO-FIX's scraper is an
    // Elasticsearch proxy plus a DIN 4000 reader, Kennametal's is an AEM table
    // client and Destiny Tool's is a Firestore client; if any two ever grew a
    // common module it would belong in the core, not in one of them.
    for (const brand of BRANDS) {
      const imported = modules(join(VENDORS, brand)).flatMap(importedModules)

      for (const other of BRANDS) {
        if (other === brand) continue
        expect(
          imported.filter((m) => m.startsWith(`vendors/${other}/`)),
          brand,
        ).toEqual([])
      }
    }
  })
})
