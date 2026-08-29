# @toolpath/tool-scraper

## 0.1.0

### Minor Changes

- 987c3a9: Export the types the package's own signatures are written in. The main entry
  point now exports `ScrapeResult` and `ScrapedRow` — the return type of every
  scrape and the parameter of `toCsv`, `annotateCadUrls` and `addThreadPitch` —
  along with `BoundFamily`, `Warn`, `FetcherOptions`, `HttpError`, `statusOf` and
  `AEM_BRANDS`, none of which a consumer could name before. Each entry point now
  re-exports its modules whole, so a symbol cannot be public in a module and
  invisible from the package.

  `REQUEST_DELAY_MS` is one constant on the main entry point rather than a copy
  per looping step; `@toolpath/tool-scraper/vendors/kennametal` no longer exports
  its own.

- 92a9645: Add `@toolpath/tool-scraper`: scrape cutting-tool and toolholding geometry from Kennametal, WIDIA,
  REGO-FIX and Destiny Tool catalogs into records.

  The main entry point returns rows and never touches the filesystem, so a Node backend can embed it;
  CSV serialization, the provenance sidecar and the bulk CAD mirror live behind
  `@toolpath/tool-scraper/node`. The transport is a `Fetcher` a caller supplies, so retries, proxies
  and rate limits stay the consumer's decision. A `toolpath-scrape` command line drives every vendor.

### Patch Changes

- 987c3a9: Refuse two more inputs a scrape cannot serve, and fill two cells that were left
  empty: a Kennametal header whose columns reduce to one name no longer silently
  drops a column's data, a `toolpath-scrape kennametal` constant column that is
  not `Name=Value` is refused instead of dropped, a Destiny Tool record's `vendor`
  carries the brand's published name rather than its catalog key, and an inch
  tapping collet's drive square is projected into `Square_mm` the way its
  diameter already was.
- ec90d59: Refuse the inputs each scrape step cannot serve rather than carrying them into
  a record: an unreadable thread designation or collet size, a `Thread System`
  tag that is neither `metric` nor `inch`, a non-integer flute count, and a
  `--brand` or `cad` target that is not on the AEM platform. A record's `vendor`
  carries the brand's published name, and a 404 from the CAD endpoint reads as
  the vendor publishing no model.
