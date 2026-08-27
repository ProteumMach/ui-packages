---
'@toolpath/tool-scraper': patch
---

Refuse the inputs each scrape step cannot serve rather than carrying them into
a record: an unreadable thread designation or collet size, a `Thread System`
tag that is neither `metric` nor `inch`, a non-integer flute count, and a
`--brand` or `cad` target that is not on the AEM platform. A record's `vendor`
carries the brand's published name, and a 404 from the CAD endpoint reads as
the vendor publishing no model.
