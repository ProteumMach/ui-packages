# Tool scraper

Scrapes cutting-tool and toolholding geometry from vendor catalogs into per-vendor CSVs.

Python ≥3.11, **no runtime dependencies**. One vendor-neutral core plus one adapter per
manufacturer under `src/toolpath_scraper/vendors/`; two adapters share the core and never each
other, which `tests/test_vendor_boundary.py` asserts from the package tree.

**Scraped output is not committed.** A CSV is the vendor's data and a working file, not source —
and this repository is public, which is a second reason independent of size.

## Vendors

| Vendor             | Transport                                        | What it publishes     |
| ------------------ | ------------------------------------------------ | --------------------- |
| Kennametal / WIDIA | AEM variant-table GET, parsed with `HTMLParser`  | tools and toolholding |
| REGO-FIX           | Elasticsearch proxy POST + per-part DIN 4000 XML | toolholding           |
| Destiny Tool       | Firestore REST, paginated                        | solid end mills       |

## Scraping

Every command prints the resolved scrape root before it does anything, and writes a receipt beside
what it produces — the source URL, the family code, a timestamp, the row count and the scraper
version.

```sh
export TOOLPATH_SCRAPE_ROOT=~/toolpath-scrapes      # default: ./scrape-out, gitignored

toolpath-kennametal-scrape 100003658 "$TOOLPATH_SCRAPE_ROOT/kennametal/csv/godrill_3xd_metric.csv"
toolpath-kennametal-materials godrill_3xd_metric.csv
toolpath-regofix-scrape holders "$TOOLPATH_SCRAPE_ROOT/regofix/csv/regofix_bt30_pg_holders.csv"
toolpath-destinytool-scrape "$TOOLPATH_SCRAPE_ROOT/destinytool/csv/destinytool_end_mills_inch.csv"
```

`toolpath-kennametal-scrape --help` lists the rest.

## The record

Geometry lands in **ISO 13399** codes — `DC`, `OAL`, `LCF`, `RE`, `NOF`, `SIG`, `TP` — the
machine-tool industry's own interchange dictionary. CAM vendors implement subsets of it, which is
why these names also appear in Fusion's tool JSON. `records.GEOMETRY_FIELDS` carries each code's
definition and names the three that are Autodesk's rather than the standard's.

Vendor CSVs keep the **vendor's** own column labels. Nothing reads a vendor's CSV but that
vendor's adapter, and `conventions.py` holds the short list of rules that do hold across all of
them.

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
pnpm test:scraper          # from the repository root
```

Nothing in the suite reaches a vendor. Tests that read a scraped CSV skip with a named reason where
no scrape exists; set `TOOLPATH_REQUIRE_CORPUS=1` on a machine that keeps one to turn those skips
into failures.
