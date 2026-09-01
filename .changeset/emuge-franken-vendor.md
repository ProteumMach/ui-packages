---
'@toolpath/tool-scraper': minor
---

Add an EMUGE-FRANKEN adapter covering end mills, drills and taps, published as
`@toolpath/tool-scraper/vendors/emuge` with an `emuge` CLI subcommand and four
families: `emuge_end_mills_inch.csv`, `emuge_end_mills_mm.csv`,
`emuge_drills.csv` and `emuge_taps.csv`.

`RECORD_GEOMETRY.tap` moves `NOF` from `always` to `sometimes`. A tap record may
now carry no flute count, because EMUGE-FRANKEN publishes none anywhere a scrape
can reach. Kennametal's taps read theirs from a `Z` column and are unchanged.
