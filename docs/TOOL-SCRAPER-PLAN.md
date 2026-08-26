# Tool scraper — structure and port plan

_Written 2026-08-26, from a read of this repo and of `tool_catalog/packages/scraper`
(`/Users/justingray/toolpath/new_code/tool_catalog`), against one question: what shape should
vendor tool scraping take here, and how does the existing code get in._

**Status: step 1 in progress.** Steps are checked off in "The port" below as they land.

## What is being ported

`tool_catalog/packages/scraper` is the `tooling_scraper` distribution — 14k lines, 504 tests green
in 2.2s, Python ≥3.11, **zero runtime dependencies**. It scrapes three vendors and converts what it
scrapes into Fusion 360 tool libraries and an assembly catalog.

Three vendors, three unrelated transports:

| Vendor             | Transport                                        | What it imports from the core |
| ------------------ | ------------------------------------------------ | ----------------------------- |
| Destiny Tool       | Firestore REST, paginated                        | nothing — pure stdlib         |
| Kennametal / WIDIA | AEM variant-table GET, parsed with `HTMLParser`  | `identity.BRANDS`             |
| REGO-FIX           | Elasticsearch proxy POST + per-part DIN 4000 XML | `toolholding.CAD_COLUMN`      |

## One package, not one per vendor

The three adapters share no code with each other. That is not a reading of the source — it is
asserted by `tests/test_vendor_boundary.py`, which derives its module lists from the package tree
and fails when a core module imports a vendor or a vendor imports another vendor. That test comes
across intact and is the reason the layout can be trusted without packaging enforcing it.

Sharing nothing with each other is not an argument for separate distributions, because all three
lean on a small common core. Measured: the transports need `BRANDS`, `CAD_COLUMN` and
`ISO_MATERIAL_GROUPS` — three symbols. The CSV-to-record mappers add `ColumnMap`, `ToolRecord` and
thread-designation parsing. Splitting by vendor yields N distributions that exist to depend on a
core for a handful of constants, N release cadences, and a cross-repository change every time the
record contract moves — which it will, repeatedly, while vendors are still being added.

`tool_catalog/docs/MULTI-VENDOR-PLAN.md` reaches the same conclusion and records why: "keep the
well-maintained vendors in-tree. A monorepo is what lets one PR change the record contract and every
adapter together." Its phase D is the split into separately installable distributions, deliberately
not done. `registry.py` names the seam where an entry-point lookup would replace the in-process
`ADAPTERS` dict, so the split stays a packaging change rather than a refactor whenever a vendor
needs to ship on its own.

## The split that is worth making: acquisition, not conversion

`tooling_scraper` is two products in one distribution.

**Acquisition** — `vendors/*/scrape.py`, `cad.py`, `materials.py`, `thread_column.py`, plus
`identity`, `records`, `provenance`, `thread`, `registry` and `cli`. Stdlib only. This is what comes
here.

**Conversion** — `fusion.py`, `presets.py`, `profiles.py`, `toolholding.py`, `census.py`,
`assumptions.py`, and the vendored byte-for-byte copy of BetterToolLib. This is the Fusion-library
and assembly-catalog build: a different product, the half that depends on the 105 MB `tool-data`
package, and the source of nearly all of the corpus dependence measured below. It stays where it is.
If it is wanted here later it is a second package, not a widening of this one.

## Layout

```
packages/tool-scraper/
  pyproject.toml            uv_build, matching packages/sdk-python
  src/toolpath_scraper/
    identity.py             brands, per-vendor uuid5 namespaces, product links
    records.py              ToolRecord, ColumnMap, canonical geometry, ISO groups
    provenance.py           Fact, and the assumed/derived/vendor-stated gate
    thread.py               thread designation parsing — a standard, not a vendor's
    conventions.py          NEW — CAD_COLUMN and the _mm/_in CSV conventions
    fetch.py                NEW — the polite stdlib GET all three transports copy today
    registry.py             brand -> adapter
    families/               scrape targets and column maps, one module per vendor
    cli.py                  the scrape subcommands
    vendors/
      kennametal/           scrape, cad, materials, thread_column, records
      regofix/              scrape
      destinytool/          scrape, records
  tests/
```

The distribution is `toolpath-tool-scraper` and the import package is `toolpath_scraper`. The import
name is not `toolpath`: `packages/sdk-python` already publishes that, and a scraper is not part of
the API bindings.

Two moves the layout forces, both of which are corrections rather than costs:

- **`CAD_COLUMN` comes up into the core.** It sits in `toolholding.py` today — a conversion module —
  and two vendors reach into it. `test_vendor_boundary.py`'s own docstring records this leak
  happening once in the other direction, when `toolholding.py` imported the constant from
  `vendors/kennametal/cad.py` for a day.
- **`families.py` splits.** Its 1258 lines mix scrape targets (`family_code`, `rows`) with
  conversion config (`columns`, `facts`). Only the first half belongs here.

## Scraped data is not committed

Measured rather than assumed: the package was copied to a scratch directory with `data/` deleted and
the suite re-run.

| Suite                                                   | Without the corpus    |
| ------------------------------------------------------- | --------------------- |
| Kennametal scrape                                       | 12 / 12 pass          |
| Destiny Tool scrape                                     | 45 / 45 pass          |
| REGO-FIX scrape                                         | 31 / 36 pass          |
| CLI                                                     | 27 / 27 pass          |
| identity, vendor drift                                  | 15 / 15 pass          |
| toolholding, census, materials, csv-to-fusion, profiles | 146 failed, 25 errors |

The scrapers are corpus-independent because their tests already mock the network at one seam —
`urllib.request.urlopen`, or `scrape.fetch` — and feed inline HTML and JSON fixtures. **The test
harness this plan needs already exists and is ported unchanged.** Every failure above is in the
conversion half, which is out of scope anyway.

What remains is an 11-test tail of _corpus-assertion_ tests — `test_every_scraped_holder_satisfies_
the_taper_arithmetic`, `test_every_holder_scraped_so_far_has_a_model`, and their neighbours. Those
check the scraped corpus, not the scraper, so they belong with the data. The source repo already has
the right idiom: `test_vendor_drift.py` skips **with a named reason and the environment variable
that overrides it** when the BetterToolLib checkout is absent. That pattern is reused here, so a
machine holding a corpus checks it and CI skips and says why. A silent pass would be worse than no
test.

Mechanically, `csv_dir()` is hardcoded to `PKG_ROOT/data/<brand>/csv` today. A `TOOL_CATALOG_DATA_ROOT`
environment variable already exists for _outputs_; this package mirrors it for inputs as
`TOOLPATH_SCRAPE_ROOT`, defaults to a gitignored directory, prints the resolved root on every run,
and carries the ignore rules that keep a scrape out of `git status`.

## The port

Each step ends green on `pnpm check`.

- [ ] **1 — Skeleton.** `packages/tool-scraper/` with its `pyproject.toml`, `.gitignore` and
      `.prettierignore` entries, and the root `lint`/`test` scripts extended to reach it. One
      packaging test that imports the package, so the gate is live from the first commit rather than
      passing over an empty directory.
- [ ] **2 — The core, unchanged.** `identity`, `records`, `provenance`, `thread` move as-is;
      `CAD_COLUMN` lands in `conventions.py`. Their tests come with them.
- [ ] **3 — The boundary test, before any vendor.** `test_vendor_boundary.py` with its tree-derived
      lists and its `test_the_tree_is_the_shape_these_rules_assume` guard. The guard fails at this
      point for having nothing to iterate over, which is the guard working, and goes green as step 4
      lands.
- [ ] **4 — Vendors, one commit each, cheapest first.** Destiny Tool (no core imports, 45
      self-contained tests), then Kennametal (`scrape`, `cad`, `materials`, `thread_column`), then
      REGO-FIX (the 478-line one). Adapter, its tests and its `families/` entries per commit, green
      before the next starts.
- [ ] **5 — The data root.** `TOOLPATH_SCRAPE_ROOT`, the 11 corpus-assertion tests converted to
      skip-with-reason, and `cli.py` narrowed to the scrape subcommands. Gate: the full suite green
      on a fresh clone with no corpus anywhere on the machine.
- [ ] **6 — CI and documentation.** pytest into `pnpm check` (`_quality.yml` already provisions uv
      0.11.28 and Python 3.11). The three vendor API notes — `KENNAMETAL_CAD_API.md`,
      `KENNAMETAL_SPEEDFEED_API.md`, `REGOFIX_PRODUCTFINDER_API.md` — come across as they are; they
      record how each endpoint was found and are the most expensive thing here to rediscover. A
      package README and a runbook for adding a vendor.
- [ ] **7 — Amend `AGENTS.md`.** Its Changeset table names only the three npm packages, and
      Changesets releases neither `packages/sdk-python` nor this package. The table needs a row or an
      explicit exclusion, or the next contributor guesses.

Live-network tests live in `tests/live/` behind an environment variable and stay out of CI. Reaching
three vendors' endpoints on every pull request is slow and impolite.

## Two open decisions

Neither blocks a start; both change later work.

1. **Scope.** This plan ports the acquisition half only. Adding the conversion half roughly doubles
   the work, brings the vendored BetterToolLib copy and its drift tripwire, and reintroduces the
   corpus dependence measured above.
2. **Public exposure.** This repository is public, MIT, and publishes to npm. These scrapers encode
   endpoints found by reading vendors' application bundles, and the REGO-FIX module documents three
   data faults on the vendor's own site. That is a different exposure than the private monorepo they
   live in today, and it is worth a deliberate yes. It is also a second reason, independent of size,
   to keep the CSVs out: they are vendor data.
