---
'@toolpath/tool-scraper': patch
---

Refuse two more inputs a scrape cannot serve, and fill two cells that were left
empty: a Kennametal header whose columns reduce to one name no longer silently
drops a column's data, a `toolpath-scrape kennametal` constant column that is
not `Name=Value` is refused instead of dropped, a Destiny Tool record's `vendor`
carries the brand's published name rather than its catalog key, and an inch
tapping collet's drive square is projected into `Square_mm` the way its
diameter already was.
