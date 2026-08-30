---
'@toolpath/viewer': minor
'@toolpath/ui': patch
---

`ShapeKind` and `KnownShapeKind` are now exported from `@toolpath/viewer`. They type
`PartModelRegion.shapeKind`, which was already public and whose type a consumer had no way to
write down — the same gap `FeatureType` and `KnownFeatureType` were already exported to close.

Everything else here is plumbing that was exported and imported by nothing, found by `pnpm knip`
and now module-private: the `Context` objects and provider value types behind `@toolpath/ui`'s
combobox, menu, table, tabs, toggle, breadcrumbs and link, its `ROW_HEIGHT` constants and the
inner `Table` that `TableRoot` wraps; and `IndexableFeature` in the viewer. Neither package's
entry point changes shape, but `@toolpath/ui` ships `src`, so the files a consumer receives
differ. An unused `ThreePoint` alias and an unused `three-stdlib` devDependency are gone.
