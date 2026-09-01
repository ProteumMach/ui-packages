---
'@toolpath/tool-scraper': major
---

A `tap` record may carry no flute count. `RECORD_GEOMETRY.tap` lists `NOF`
under `sometimes` rather than `always`, so `toolRecord` no longer refuses a tap
whose mapper supplies none, and a consumer cannot read `geometry.NOF` on a tap
without checking for it.

Kennametal's taps publish a `Z` column and still fill it; the relaxation is for
a vendor that publishes no tap flute count anywhere a scrape can reach.
