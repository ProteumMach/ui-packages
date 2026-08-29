---
'@toolpath/viewer': major
---

**Double-clicking the part now orbits about what was clicked, and it is on by default.** A consumer
who upgrades and passes nothing gets a double left click that moves the camera where one previously
did nothing to the view. `<Viewer retargetOnDoubleClick={false}>` turns it off. Double **middle**
click still re-frames.

The point moves to the middle of the view at the same size and from the same angle, and stays the
pivot until something else moves it — which is what makes an orthographic viewport navigable, since
the wheel there scales a frustum rather than travelling toward anything.

The move is immediate rather than eased. The damping these controls ship with settles a transition
inside one frame, so nothing about the gesture announces itself; turn on `showOrbitTarget` if the
pivot moving needs to be visible.

**`PartPick` gains `doubled`, a required `boolean`.** Reading it is safe, but anything that
_constructs_ a `PartPick` — a fixture, a mock, a test double — stops compiling until the field is
supplied. It is true on the click that completed a double click. The gesture does not withhold that
pick: what a second click on a face means belongs to the app — a list that walks through a face's
readings and an editor that puts a face in and takes it out again both want something different, and
only the app knows which it is showing. Reported rather than interpreted, the same bargain
`modifiers` makes.

A double click also no longer pairs across a trip away from the part. Clicking a face, pressing
something in a panel and clicking the same face again is three gestures, and it lands well inside
the pairing window; `DoubleTapTracker.reset()` is how a caller says the pair was broken by something
the clock cannot see.
