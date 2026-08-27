# @toolpath/tool-scraper

Scrapes cutting-tool and toolholding geometry from vendor catalogs into records.

Node ≥20, ESM, one runtime dependency. One vendor-neutral core plus one adapter per manufacturer
under `src/vendors/`; two adapters share the core and never each other, which
`tests/vendor-boundary.test.ts` asserts from the package tree rather than from a list.

**Scraped output is not committed.** A CSV is the vendor's data and a working file, not source —
and this repository is public, which is a second reason independent of size.

## Install

```sh
pnpm add @toolpath/tool-scraper
```

## Vendors

| Vendor             | Transport                                        | What it publishes     |
| ------------------ | ------------------------------------------------ | --------------------- |
| Kennametal / WIDIA | AEM variant-table GET, parsed with `htmlparser2` | tools and toolholding |
| REGO-FIX           | Elasticsearch proxy POST + per-part DIN 4000 XML | toolholding           |
| Destiny Tool       | Firestore REST, paginated                        | solid end mills       |

## Two entry points

**`@toolpath/tool-scraper` returns records.** Every scrape hands back rows and enough provenance to
say where they came from; nothing in it touches the filesystem, so a backend can embed it and do
what it likes with the result.

```ts
import { createFetcher } from '@toolpath/tool-scraper'
import { scrapeFamily } from '@toolpath/tool-scraper/vendors/kennametal'

const fetcher = createFetcher() // or your own: retries, proxy, rate limits
const { header, rows, source } = await scrapeFamily(fetcher, '100003658')
```

The transport is a parameter, not a module global. Supply your own `Fetcher` and the vendor
adapters read through it — which is also how every test in this package runs without a network.

**`@toolpath/tool-scraper/node` writes files.** CSV serialization, the provenance sidecar, the
scrape-root resolution and the bulk CAD mirror all need `fs`, so they are a separate entry point and
a consumer that only wants records never imports them.

## Command line

Every command prints the resolved scrape root before it does anything, and writes a receipt beside
what it produces — the source URL, the family code, a timestamp, the row count and the scraper
version.

```sh
export TOOLPATH_SCRAPE_ROOT=~/toolpath-scrapes      # default: ./scrape-out, gitignored

toolpath-scrape kennametal 100003658 "$TOOLPATH_SCRAPE_ROOT/kennametal/csv/godrill_3xd_metric.csv"
toolpath-scrape materials godrill_3xd_metric.csv
toolpath-scrape regofix holders "$TOOLPATH_SCRAPE_ROOT/regofix/csv/regofix_bt30_pg_holders.csv"
toolpath-scrape destinytool "$TOOLPATH_SCRAPE_ROOT/destinytool/csv/destinytool_end_mills_inch.csv"
```

`toolpath-scrape --help` lists the rest.

## The record

Geometry lands in **ISO 13399** codes — `DC`, `OAL`, `LCF`, `RE`, `NOF`, `SIG`, `TP` — the
machine-tool industry's own interchange dictionary. CAM vendors implement subsets of it, which is
why these names also appear in Fusion's tool JSON. `records.GEOMETRY_FIELDS` carries each code's
definition and names the three that are Autodesk's rather than the standard's.

Vendor CSVs keep the **vendor's** own column labels. Nothing reads a vendor's CSV but that vendor's
adapter, and `conventions.ts` holds the short list of rules that do hold across all of them.

Every per-family constant no vendor table states carries its provenance — whether it was
vendor-stated, derived or assumed, and by whom on what date. The types enforce it: an assumed fact
without a note, a date and initials does not compile.

## Documentation

- [`docs/ADDING-A-VENDOR.md`](docs/ADDING-A-VENDOR.md) — the runbook.
- [`docs/KENNAMETAL_CAD_API.md`](docs/KENNAMETAL_CAD_API.md),
  [`docs/KENNAMETAL_SPEEDFEED_API.md`](docs/KENNAMETAL_SPEEDFEED_API.md),
  [`docs/REGOFIX_PRODUCTFINDER_API.md`](docs/REGOFIX_PRODUCTFINDER_API.md) — how each endpoint was
  found, and the dead ends tried first.
- [`../../docs/TOOL-SCRAPER-PLAN.md`](../../docs/TOOL-SCRAPER-PLAN.md) — the structure, the evidence
  behind it, and what has landed.

## Tests

```sh
pnpm --filter @toolpath/tool-scraper test
```

Nothing in the suite reaches a vendor: `tests/setup.ts` replaces the global `fetch` with one that
throws, so a test that forgets its stub fails loudly instead of quietly paging a vendor's catalog.

Tests that read a scraped CSV skip with a named reason where no scrape exists; set
`TOOLPATH_REQUIRE_CORPUS=1` on a machine that keeps one to turn those skips into failures.
