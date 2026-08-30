---
'@toolpath/tool-scraper': major
---

Four things two vendors each declared for themselves now have one home, and a check that keeps it
that way.

- New `measure` module on the main entry point: `MM_PER_INCH`, `fractionValue` for the decimal,
  fraction and mixed-number grammar every vendor publishes, and `convertLength`. It replaces three
  adapter-local readers that disagreed — REGO-FIX refused `1-1/2`, Destiny Tool refused `1.5-1/2`,
  Harvey read both — and two exported copies of 25.4.
- **`MM_PER_INCH` is gone from `./vendors/harvey` and `./vendors/regofix`.** Import it from the
  package root.
- `unionHeader` moves to the main entry point and is gone from `./vendors/regofix` and
  `./vendors/maritool`. It was byte-identical in both.
- `conventions` gains `DESCRIPTION_COLUMN`, `CONTACT_COLUMN`, `COLLET_SERIES_COLUMN` and
  `GAGE_COLUMNS` — the CSV columns two vendors each write and neither owns, beside `CAD_COLUMN` for
  the same reason. `./vendors/maritool` no longer exports its own copies of them, and
  `./vendors/harvey` no longer exports `DESCRIPTION_COLUMN`.

Harvey's record mapper now reads the `ColumnMap` its caller passes rather than `family.columns`,
which is what `registry.toRecords` has just validated. `cornerRadius` and `flutes` on
`./vendors/harvey` take that map as a new third argument.

`tests/vendor-boundary.test.ts` now fails on a name exported by two manufacturers that is not part
of the adapter contract, so the next one of these is caught rather than reviewed.
