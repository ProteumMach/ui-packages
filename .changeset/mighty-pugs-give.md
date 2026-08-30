---
'@toolpath/tool-scraper': minor
---

Add the MariTool vendor adapter: five toolholding families — CAT40, CAT50,
BT30, BT40 and HSK — covering 529 ER collet chucks, shrink-fit holders and
hydraulic chucks, and a `toolpath-scrape maritool` command that writes them.

New public surface: the `@toolpath/tool-scraper/vendors/maritool` entry point,
`maritool` in `identity.BRANDS` and `conventions.IDENTITY_DEVIATIONS`, and five
entries in `families.HOLDER_FAMILIES`. Nothing existing changes shape.

The gage length is promoted into an `L1_in`/`L1_mm` pair with exactly one cell
filled per row, and nothing is converted: MariTool publishes both unit systems
in that one column, within a single family and within a single category page.

MariTool ships toolholding, so like REGO-FIX it binds no record mapper: its
scrape ends at rows and a receipt, not at `ToolRecord`. The columns two
toolholding vendors now share — `Description`, `contact`, `CST` and the
`L1_in`/`L1_mm` pair — are named in `conventions` rather than in either
adapter, so a consumer joining the two catalogs has one spelling to read.
