---
'@toolpath/api': patch
---

Regenerate the TypeScript SDK for Engine API 1.3.3.

`FeatureDatasheet` gains `pinchPoints`, from tp-kernel 0.7.3: the places a feature is at its
tightest, one disc per stretch of it that reaches the minimum clearance `cd` reports.

- Each entry is a `PinchPoint` — a `center` (`Vec2`, across the part rather than along the tool)
  and a `diameter`, which is the clearance there. A cylinder of that diameter standing at that
  center and spanning the datasheet's `zMin`..`zMax` is the widest tool that reaches the feature
  boundary at that spot, so the discs can be drawn directly onto a plan view.
- The list is ordered tightest first and capped at ten. It is empty for feature kinds whose
  clearance is not measured off a single medial axis — holes, facing passes, and the undercut and
  layered kinds — so empty means "nowhere to point at", never "nowhere is tight".
- **The field is documented optional and may be absent.** Only features enriched by this release
  onward carry it; parts processed earlier keep the datasheets they were stored with and are not
  re-enriched. Treat a missing `pinchPoints` the same as an empty one only if that suits you —
  the two are not equivalent, since absent means unmeasured rather than unmeasurable.

`PinchPoint` and `Vec2` are new components. Everything else on the datasheet is unchanged, and no
existing field changed name, type, or requiredness.
