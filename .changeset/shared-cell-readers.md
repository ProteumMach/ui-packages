---
'@toolpath/tool-scraper': minor
---

Publish the readers a display-string adapter shares. `measure.asLength` and
`measure.asCount` turn one read cell into a length or a count — converting a
stated unit the family does not publish, refusing an angle in a length column —
and `columns.columnReaders` binds a vendor's reader to the three steps between a
`GeometryName` and a number. Both were duplicated verbatim in the Harvey Tool
and EMUGE-FRANKEN adapters, warnings and refusal wording included.

Adds `asLength`, `asCount`, `Measured`, `StatedUnit`, `columnReaders`,
`ColumnReaders` and `LengthReader` to the package entry point. No existing
signature changes.
