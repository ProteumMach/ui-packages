---
'@toolpath/tool-support': minor
---

Take the clearance sweep, the feature section and the part vocabulary.

- `clearance`, `toolSilhouette`, `holderSilhouette`, `toolCollisions`,
  `describeCollision`, and `Clearance`, `Collision`, `SweptAssembly`. The
  verdict has a dozen callers that never draw anything, so it could not live in
  the drawing package; the lines an overlay draws _from_ a verdict still do.
- `sectionOutline`, `FLOOR_BAND`, `REACH`, and `Section`, `SectionKind`,
  `SectionPoint`, `FeatureSection`.
- `materialProfile` and `OutlinePoint` — the one reading of a reach curve with
  two consumers that are not both drawings.
- `assemblyAgainst`, `AssemblyFit` and `NOT_MODELLED`.

**The part vocabulary is named once.** `ASSEMBLY_PARTS` is the eight parts a
drawn or swept assembly is made of, and `SILHOUETTE_PARTS` is _derived_ from it
as the six a sweep checks — everything but the cutting end, because the cutting
end is what is cutting. Two spellings of those words stood before, one in a
drawing and one in a sweep, and a part renamed in either would have gone on
meaning the old thing in the other.

`Silhouette` and `@toolpath/tool-drawing`'s `OutlineSegment` both survive, and
that is deliberate: a sweep needs one radius from one height upward and a
drawing needs a polyline. They are different shapes for different questions and
neither projects onto the other. Only the naming was duplicated.

`Margins` and `NO_MARGINS` move with the sweep that reads them.

`SweptAssembly` takes the **parametric** holder rather than the holder union. A
measured `HolderProfile` is a hundred-odd vertices and sweeping one is a
function that does not exist yet; taking the union would let a caller hand over
a profile and get a verdict computed from nothing.
