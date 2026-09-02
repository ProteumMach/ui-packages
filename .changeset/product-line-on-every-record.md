---
'@toolpath/tool-scraper': minor
---

`ToolRecord` carries a `productLine` — the vendor's own name for the product
line a part belongs to, or `null` where the vendor names none. Three of the five
cutting-tool adapters fill it.

Every vendor here publishes a product line and no two published it in the same
place, so what a consumer could filter on was an accident of which vendor a
record came from. `null` is the vendor's silence rather than an empty name, the
same three-state rule `materialGroups` keeps with `unspecified`; `toolRecord`
refuses `''` outright.

- **EMUGE-FRANKEN** reads it from a column it already scrapes, at no request
  cost. Each of the three categories is partitioned exactly by one of the
  vendor's own facets — `product line` for milling, `Geometry` for drilling and
  tapping — so the value is a read rather than a choice between the 43
  overlapping product-family pages the vendor's marketing publishes. Milling
  passes through verbatim (`FRANKEN TOP-Cut VAR`); a drilling or tapping
  geometry code is mapped onto the title of the vendor's own article page for
  it (`MULTI` → `MultiDRILL`, `Z` → `Rekord B-Z Taps`), and a code with no such
  page keeps the code.
- **Kennametal and WIDIA** read it from the family page's `h1`, which the
  variants table does not state anywhere. `scrapeFamily` takes a new
  `familyTitle` option that fetches it; the whole title reaches the CSV under
  the new vendor-neutral `FAMILY_TITLE_COLUMN`, and its leading `•` segment
  becomes the product line. **Off by default** — it is a second request per
  family, and a caller that only wants dimensions should not pay for one. The
  `toolpath-scrape kennametal` command turns it on.
- **Destiny Tool** maps its `series` column, which the adapter has scraped
  since it was written and nothing had read.

Harvey Tool records carry `null`: its product-line title is already this
record's `description`, and a second copy of one string is what that field's own
docstring refuses.
