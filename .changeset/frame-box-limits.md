---
'@toolpath/viewer': minor
---

Make `frameBox` reach the framing it was asked for.

The wheel clamps land on the scene's fitted framing, and a view of something
much smaller than the part is nowhere near it — framing a 3 mm hole in a 100 mm
plate needs about 37× and the ceiling is 10×. Both cameras refused it, in
opposite directions. Under an orthographic camera `zoomTo` clamped to `maxZoom`,
so the feature was framed at roughly a quarter of the size requested and the
call reported success. Under a perspective one `setLookAt` writes the distance
without consulting `minDistance` while the wheel's own dolly enforces it, so a
close framing stood until the first notch of the wheel and then jumped
_outward_, against the gesture.

`frameBox` now re-derives the clamps about the framing before reaching for it.

`cameraLimits` takes an optional fifth argument for this: the bounds the view is
framed on, when that is not the whole scene. The band is widened to take in both
rather than moved onto the framing — reaching further in must not cost the reach
back out, or framing a hole would put the part that contains it beyond the
wheel. Called without it the function is unchanged, and a framing the size of
the scene gives the scene's own band back.

The orbit target's boundary still comes from the scene, so panning off a framed
feature still works.

The widening survives a resize. The clamps are re-derived whenever the viewport
changes — a window drag, a panel opening, a sidebar toggle — and that
re-derivation used to fall back to the scene's own band, undoing the framing.
Nothing moved at the time, because `camera-controls` clamps at its call sites
rather than in `update`, so the symptom arrived on the next wheel notch as
exactly the two failures above.
