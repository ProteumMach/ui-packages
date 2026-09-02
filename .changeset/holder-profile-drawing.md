---
'@toolpath/tool-drawing': minor
---

Draw a holder from a measured profile. `ViewerAssembly.holder` accepts a
`ViewerHolderProfile` — the silhouette as `[z, r]` vertices in millimetres on a
`gage-line` or `nose` datum — alongside the parametric `ViewerHolder`, and
`isHolderProfile` narrows the union. The vertices are drawn as measured, nose
face at the stickout, split at the spindle face so the connection shades as it
does on a parametric holder.
