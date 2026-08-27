---
'@toolpath/tool-scraper': minor
---

Add `@toolpath/tool-scraper`: scrape cutting-tool and toolholding geometry from Kennametal, WIDIA,
REGO-FIX and Destiny Tool catalogs into records.

The main entry point returns rows and never touches the filesystem, so a Node backend can embed it;
CSV serialization, the provenance sidecar and the bulk CAD mirror live behind
`@toolpath/tool-scraper/node`. The transport is a `Fetcher` a caller supplies, so retries, proxies
and rate limits stay the consumer's decision. A `toolpath-scrape` command line drives every vendor.
