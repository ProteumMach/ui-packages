---
'@toolpath/viewer': patch
---

Fix four gesture defects in the orthographic viewer work.

A double click built its pick **after** re-aiming the orbit. `retarget` calls
`setLookAt`, which writes the controls' _end_ target, and the pick reads that
same end value back — so the pick's view direction came out as
`camera.position - hitPoint` rather than `camera.position - orbitTarget`. On a
face near the edge of a framed part that is degrees away from the direction
the eye is looking along, and a double click could rank a different owner than
a single click on the very same face. The pick is now built first.

The middle-button re-centre had no drag guard, and the middle button is TRUCK:
every pan ends in the `auxclick` the gesture is assembled from, so two pans
released near enough to each other paired into a double, called Fit and threw
away the pan just made. It now takes the same tap guard the left button has.

`retarget` paired `camera.position` — where the camera has got to so far —
with the controls' _end_ target. While an earlier transition was still easing,
the camera-to-target offset it exists to preserve was wrong by whatever was
left of that move and the view shifted instead of holding the angle and
distance it had. Both halves of the pose now come from the controls.

An orbit released over the part left its double-click pair pending. The click
guard swallows that release, and it returned before the pairing tracker was
touched, so a click, an orbit, and a click within the double-tap window of the
_first_ one paired those two and re-aimed the view with a whole drag in
between. The pointer leaving the mesh already broke the pair, but an orbit over
a part that fills the viewport never leaves it. A swallowed release now breaks
the pair too.
