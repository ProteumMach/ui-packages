---
'@toolpath/viewer': patch
---

`useTapGuard` now shares one tracker per canvas.

Each call used to attach its own capture-phase `pointerdown` listener to the canvas and record the
same point from it, and the viewer makes two calls — one in the scene to judge a middle-button
gesture, one on the part to judge a click on a face. A consumer calling the hook inside `<Viewer>`
made a third. They all answered identically, so this changes no verdict; it is one listener per
press instead of one per caller.

Called outside a `<Viewer>` the hook still owns a tracker of its own, so using it in a scene of your
own is unchanged.

`screenLength` moves from `render/section.ts` to `render/camera.ts`. It is a camera and viewport
utility rather than a section-view one, and both the section handle and the orbit target marker size
themselves with it. It is exported from the package root exactly as before — same name, same
signature — and the package has no deep import paths, so nothing downstream moves.
