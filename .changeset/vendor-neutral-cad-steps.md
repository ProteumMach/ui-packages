---
'@toolpath/tool-scraper': minor
---

Make the CAD steps vendor-neutral, and add a `coverage` verb that reports which rows publish
a model without downloading any of them.

`mirrorFamilySteps` takes the brand: its signature is now
`(fetcher, rows, brand, outDir, delayMs?, warn?)`. It named each file from a hardcoded
`ISO Catalog Number`, which is Kennametal's column pair; MariTool publishes one number per
part under `Material Number` and no catalog designation, so all 357 of its published STEP
models were skipped with a warning that the row had no catalog number to name it. The column
now comes from the new `conventions.catalogColumn(brand)`.

`toolpath-scrape cad` no longer exits 2 on a vendor it cannot annotate. The step is
dispatched per brand instead of gated on the AEM brand list, and a brand with no lookup is a
no-op reporting what the CSV already carries. It exited 2 on the first non-Kennametal
family, which made the command impossible to run across a catalog holding more than one
vendor's holders.

New: `toolpath-scrape coverage [HOLDERS.csv ...]` reports rows, rows with a STEP model and
rows with a DXF, per holder family and as a total. It reads the scraped CSVs and makes no
requests. Backed by `cadCoverage(rows)` and `CadCoverage`, exported from
`@toolpath/tool-scraper/node`, plus `conventions.catalogColumn` from the root entry point.
