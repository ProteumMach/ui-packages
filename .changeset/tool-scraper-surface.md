---
'@toolpath/tool-scraper': minor
---

Export the types the package's own signatures are written in. The main entry
point now exports `ScrapeResult` and `ScrapedRow` — the return type of every
scrape and the parameter of `toCsv`, `annotateCadUrls` and `addThreadPitch` —
along with `BoundFamily`, `Warn`, `FetcherOptions`, `HttpError`, `statusOf` and
`AEM_BRANDS`, none of which a consumer could name before. Each entry point now
re-exports its modules whole, so a symbol cannot be public in a module and
invisible from the package.

`REQUEST_DELAY_MS` is one constant on the main entry point rather than a copy
per looping step; `@toolpath/tool-scraper/vendors/kennametal` no longer exports
its own.
