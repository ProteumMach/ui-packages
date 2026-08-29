---
'@toolpath/viewer': minor
---

Bound how far the viewer's wheel may travel, so it can no longer leave the
viewport empty.

Both cameras could do it. An orthographic `camera.zoom` reached 1e30 in sixty
notches and a perspective camera dived inside the part in eight, because
`minDistance` defaulted to `Number.EPSILON` and `maxZoom` to `Infinity`. Fit
recovers from either, but Fit is a double middle click that nothing on screen
advertises.

One rule now covers both: the wheel may take the part from a quarter of its
fitted size to ten times it. Under an orthographic camera that scale is the
frustum, so it lands on `zoom`; under a perspective camera apparent size is the
inverse of distance, so it lands on `distance`.

- New `cameraLimits(projection, size, bounds, margin?)` and `targetBoundary(bounds, into, margin?)`
  in `render/camera.ts`, both pure and derived from the scene bounds, plus the
  `CameraLimits` type and the `MIN_FRAME_RATIO` / `MAX_FRAME_RATIO` constants.
- New `ExtendedCameraControls#applyLimits(limits, boundary?)`. `Viewer` calls it
  wherever the scene is re-measured or the viewport resized, so a second part
  does not inherit the first one's idea of far.
- The orbit target is confined to a boundary. Zoom-to-cursor moves the target
  and went on moving it after the zoom clamp bit — forty notches walked the
  target of a 50 mm part out to (2124, −2697), which no zoom clamp can catch.
- `dollySpeed` 1.15 and `restThreshold` 0.005, matching the legacy viewer. The
  wheel step is only tolerable alongside the clamps, so the two land together.
