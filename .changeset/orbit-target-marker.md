---
'@toolpath/viewer': minor
---

`<Viewer showOrbitTarget>` puts a small marker — a dot inside a ring — at the point the view turns
and zooms about. It is up while a gesture is running, flashes when the pivot moves on its own (a
cursor zoom walking it, a double click re-aiming it, a Fit putting it back), and fades. **Off by
default**, because it is an aid rather than furniture and a viewer that grew a dot in the middle of
every screenshot would be a surprise.

It answers "why did the part swing that way", which nothing else on screen does, and it makes a
wheel that has carried the pivot off the part legible while it is happening rather than afterwards.
Sized in CSS pixels through the same `screenLength` the section handle uses, so it holds its size
under both cameras.
