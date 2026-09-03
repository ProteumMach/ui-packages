---
'@toolpath/tool-scraper': minor
---

Take the units, provenance and geometry vocabulary from `@toolpath/tool-support`
instead of declaring it.

Every name this package published keeps its name and its meaning:

- `UnitSystem` is now the shared type. The same two strings were spelled two
  other ways downstream, with a lookup table between them on ingest.
- `MM_PER_INCH` and `convertLength` are re-exported from the domain package.
  Moving the constant into this package's core stopped two of its own subpaths
  shipping a copy each; it did nothing about the third copy standing downstream,
  and `@toolpath/tool-support` now holds the whole tree to one `25.4`.
- `SOURCES` and `FactSource` are the shared `PROVENANCE` and `Provenance` under
  this package's own names, so the order an assumptions document is read in
  cannot drift from the vocabulary a drawing marks a derived dimension by.
- `GEOMETRY_FIELDS` takes each field's definition and ISO code from the shared
  dictionary, one explicit pick at a time. **The mappable names are unchanged:**
  still the same ten, seven ISO and three Autodesk's. The dictionary also knows
  `LBH`, `LD` and `LSCN`, and none of them is mappable — an adapter permitted to
  map a column to `LBH` could supply a tool claiming a stickout nobody set.

`GeometryField` stays this package's own interface, unchanged. The shared one
carries a required `unit` and is `readonly` throughout, and adopting it outright
would have stopped a consumer that builds one — `{ definition, iso }` — from
compiling. The entries still `satisfies` the shared shape, so a field renamed
upstream is a compile error here, and each entry's `unit` is readable off
`GEOMETRY_FIELDS` for a consumer that wants it.

`HolderRecord`, `ColletRecord` and `ToolRecord` do not move. They are the record
seam — what a vendor published, under a guid this package minted — rather than
the domain shape.

`@toolpath/tool-support` is a new runtime dependency. It takes no dependencies
and no peers of its own.
