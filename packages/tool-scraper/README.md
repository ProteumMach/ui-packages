# Tool scraper

Scrapes cutting-tool geometry from vendor catalogs into per-vendor CSVs.

Python ≥3.11, **no runtime dependencies**. One vendor-neutral core plus one adapter per
manufacturer under `src/toolpath_scraper/vendors/`; two adapters share the core and never each
other.

**Scraped output is not committed.** A CSV is the vendor's data and a working file, not source.

## Status

Being ported from `tool_catalog/packages/scraper`, step by step. See
[`docs/TOOL-SCRAPER-PLAN.md`](../../docs/TOOL-SCRAPER-PLAN.md) for the structure, the evidence
behind it, and what has landed.

## Tests

```sh
pnpm test:scraper          # from the repository root
```
