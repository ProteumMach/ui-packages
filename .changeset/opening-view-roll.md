---
'@toolpath/viewer': patch
---

Fixed the opening view arriving rolled off `CAD_CAMERA_UP`.

Every part opened turned about 51° about the view axis, in both projections.
Nothing else was wrong — camera position, orbit target, distance, zoom and the
clipping planes were all exactly the fitted start pose — which is why it read as
"the part is oriented oddly" rather than as a camera fault, and why only a
click-on-the-part test caught it.

Two causes, both about `up` being inherited rather than stated:

- **The camera limits were applied before the pose they belong to.** `measure()`
  applied them, so `frame()` ran a `setBoundary` at the top — and `setBoundary`
  marks the controls for update, while an update under free orbit re-derives the
  up vector from wherever the camera is looking _now_. Ahead of the look-at that
  is the outgoing pose. The `Viewer` resize effect did the same at mount, with
  `defaultBounds()`: a unit sphere at the origin, so a part sitting anywhere else
  was handed a target boundary a few millimetres wide around a point it does not
  contain. `measure()` is now a measurement only, `frame()` applies the limits
  after the look-at, and the resize effect waits for the opening frame before
  applying them. The clamps themselves are unchanged and still re-derive
  wherever the scene is re-measured.
- **A reset did not square the up vector.** `resetContent` — which is the opening
  frame, the Reset control and the reframe on a projection switch — passed no
  `up`, so a roll had no way back. It now passes `CAD_CAMERA_UP`, which is what
  the legacy viewer does at the same point. Fit and Zoom to still keep the
  orientation they were given, deliberately.

Also exported `adaptedUp(view, up, into)` from `render/camera.ts`, the pure
re-squaring the controls run on every update. It is a projection and therefore
path-dependent — a camera carries the roll of every pose it has passed through —
which is the reason a canonical pose has to state its own `up`. `ExtendedCameraControls`
now calls it, so the property is pinned by a test rather than by a comment.
