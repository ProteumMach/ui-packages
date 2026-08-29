---
'@toolpath/viewer': major
---

**`<Viewer>` now opens orthographic.** `projection` defaults to `"orthographic"` where it defaulted
to `"perspective"`, so every consumer who has never passed the prop gets a different camera — and
nothing about the call site changes, which is exactly what makes it easy to miss. Pass
`projection="perspective"` to keep what you had.

It is what a machinist reads a part in: parallel edges stay parallel, so a wall that looks square is
square, and two features the same size measure the same size wherever they sit. Perspective stays
available and stays the better answer for reading a deep pocket as depth.

The default moved last rather than first. The orthographic path had never been switched on by a
consumer, and turning it on found an unbounded wheel in both directions and in both projections;
that is fixed, the pivot can no longer walk off the part, and the gestures that re-aim it — a double
click on a face, `showOrbitTarget` to see where it is — landed before this flipped.

Two things that do **not** change: the opening view direction under orthographic is its own, already
distinct from the perspective one, and every named view, the section handle, the scene aids and
feature framing behave the same under both cameras.
