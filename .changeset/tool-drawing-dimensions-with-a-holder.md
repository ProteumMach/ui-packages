---
'@toolpath/tool-drawing': minor
---

Fix the dimension lines on an assembly with a holder.

- An extension line now starts at the solid it measures. It started at the
  widest radius anywhere in the stack, which on an assembly is the holder
  flange — twenty millimetres out from the shank being dimensioned — so every
  line began in the margin and pointed at nothing.
- Two lengths that are the same span are drawn as one line rather than as two
  identical ladders on opposite flanks — the stickout against the below-holder
  length, and against the flute length on a tool stood out to its flutes. The
  first code named keeps the line and the others light it, so
  `highlight="stickout"` still works; `LengthDimension` gains an optional
  `aliases` for the other codes a line answers to.
- The lanes no longer reserve room for arrowheads that never reach the edge of
  the drawing. A width dimensioned well inside the silhouette — a shank inside
  a flange — cost an arrow's length of margin on both flanks, paid for out of
  the drawing's scale.
- A shank width is placed clear of the seated collet rather than under it.
- A below-holder length that ends inside the holder is no longer dimensioned.
  `LBH` is the tool's number and `assembly.stickout` is the caller's; where the
  tool is stood out less than the clamping rule assumed, the line ran past the
  nose and into the holder body.
