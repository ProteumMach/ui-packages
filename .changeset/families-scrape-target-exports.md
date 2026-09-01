---
'@toolpath/tool-scraper': minor
---

Export the per-vendor scrape-target tables, which no subpath reached.
`./families` points at the merged index, and that index re-exports `FAMILIES`,
`HOLDER_FAMILIES` and `COLLET_FAMILIES` and nothing else — so Harvey Tool's
`PRODUCT_PAGES`, MariTool's `LEAVES` and EMUGE-FRANKEN's `SCRAPE_TARGETS` built
into `dist`, shipped in the tarball, and threw `ERR_PACKAGE_PATH_NOT_EXPORTED`
at any consumer that imported them. Adds `./families/harvey`,
`./families/maritool` and `./families/emuge`.
