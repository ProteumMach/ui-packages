---
'@toolpath/tool-drawing': minor
---

Take the input contract from `@toolpath/tool-support` instead of declaring it.

`Provenance`, `ViewerTool`, `ViewerHolder` and `ViewerHolderProfile` are now
aliases of the shared domain types, and `isHolderProfile` is re-exported from it.
Every name stays exported from `.` and `/geometry` with the same shape, so no
adapter and no import moves — but a consumer's own `Tool` and this package's
`ViewerTool` are now the same type rather than two identical declarations that
were free to drift apart. They had: the stickout a details table printed and the
one the dimension line drew disagreed by a factor of two on an ordinary tool.

`ViewerAssembly` stays this package's own shape. `@toolpath/tool-support`'s
`Assembly` also carries the collet, which a drawing reads only through the
holder's series and protrusion.

**`@toolpath/tool-support` is a new runtime dependency.** It is the reason this is
a minor rather than a patch: it takes no dependencies and no peers of its own and
imports no React and no DOM, but it is install cost a consumer inherits.
`/geometry` is still free of React and of the DOM, and `tests/subpaths.test.ts`
now asserts that from the import graph rather than leaving it to inspection.
