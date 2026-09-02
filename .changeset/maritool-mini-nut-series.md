---
'@toolpath/tool-scraper': patch
---

Join a MariTool mini-nut holder to the collet it takes. `ER25M` in a `Collet Size` cell is
the mini collet nut series, and the collet a mini nut closes is a plain ER25, so
`colletSeries` resolves it and `CAT40-ER25-3.0MD` and `BT30-ER25-60M` now write `CST: ER25`
instead of joining to no collet family. The vendor's own `Collet Size` cell is untouched, so
the CSV still records which parts carry a mini nut. A `Collet Size` designation that is
neither a series nor a known nut is still written through as the vendor designated it, and
still warns.
