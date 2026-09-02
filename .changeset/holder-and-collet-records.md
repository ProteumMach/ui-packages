---
'@toolpath/tool-scraper': minor
---

Mint holder and collet records. `HolderRecord` and `ColletRecord` join `ToolRecord` as
package output, and `registry.toHolding(family, scrape)` maps one toolholding family's rows
onto them through the adapter its brand binds — Kennametal and WIDIA, REGO-FIX, and MariTool
(holders only). A brand with no mapper for a kind is unchanged: its families still bind,
scrape and write a receipt.

New public exports from the root entry point: `HolderRecord`, `ColletRecord`,
`HoldingRecord`, `HoldingIdentity`, `HolderMapper`, `ColletMapper`, `HoldingMapper`,
`HoldingMappers`, `ToolholdingKind`, `ClampingMode`, `CLAMPING_MODES`, `BORE_CLAMPINGS`,
`ContactMode`, `CONTACT_MODES`, `holderRecord`, `colletRecord`, `checkHolder`,
`checkCollet`, `dim`, `millimeters`, `asUnit`, `checkUnitAgreement`, `contactMode`,
`clampingMode`, `unitSystem`, `holdingFact`, `published`, and
`conventions.COLLET_DESIGNATION_COLUMN`; from `./registry`, `HOLDING_ADAPTERS`,
`boundHolding` and `toHolding`; from each of `./vendors/kennametal`, `./vendors/regofix` and
`./vendors/maritool`, that vendor's `HOLDING_MAPPERS`, plus MariTool's `parseShankSize`,
`SHANK_SIZE_LABEL` and `COLLET_NUT_DIAMETER_LABEL`.

`BoundToolholding` gains `kind` and an optional `records` mapper.
