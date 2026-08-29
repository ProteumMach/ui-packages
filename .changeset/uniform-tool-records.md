---
'@toolpath/tool-scraper': major
---

`ToolRecord` is now the package's shipped output, and its shape changed.

- `toRecords(familyName, scrape, options?)` on the `./registry` subpath maps one family's scrape to
  `ToolRecord[]`, checking the identity and mapped columns against the header first. Every command
  previously ended at a vendor-labelled CSV.
- `grade` is removed. `coating` replaces it and carries the vendor's own coating string, `''` where
  none is published; the carbide grade a Kennametal table publishes reaches no record.
- `brand` and `guid` are new. `toolRecord()` mints `guid` as `recordGuid(brand, materialNumber)`
  itself, so an adapter cannot get it wrong and the guid is derivable from a record.
- `materialGroups` is `readonly string[] | null`: `null` is "we do not know what this tool is for",
  `[]` is a vendor index that rates the part for nothing, non-empty is a rating. New
  `materialGroupsSource` is never absent — the new `UNSPECIFIED` label in the first case, otherwise
  `vendor-stated` or `derived` — and the label and the null go together or the record is refused.
  Every Harvey record is `unspecified`: its material index is published per part, not in a variant
  table, and varies by coating within a family, so nothing a scrape reads can stand in for it.
- Every mapper now reads `unit`, `bmc` and `coolantThrough` as required family facts. Harvey's
  `family.unit!`, Destiny Tool's hardcoded `'inches'`, and the `?? false` / `?? ''` fallbacks are
  gone, and the three Kennametal tap families state `coolantThrough` rather than the mapper
  assuming it.
- REGO-FIX row order no longer depends on the machine's locale.
