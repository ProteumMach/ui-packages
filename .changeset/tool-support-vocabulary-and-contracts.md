---
'@toolpath/tool-support': minor
---

A new package: the cutting-tool domain, shared by everything that speaks about
cutting tools.

`@toolpath/tool-support` takes no runtime dependencies and no peers, and imports
no React, no DOM, no `fs` and no Toolpath SDK — so a Node ingest script, a server
route and a React renderer can all depend on it. `tests/boundary.test.ts` asserts
that from the package tree and the manifest rather than from a list.

This first release is the vocabulary and the contracts:

- `UnitSystem`, `UNIT_SYSTEMS`, `MM_PER_INCH`, `convertLength`, `decimalsFor` and
  `UNIT_ABBREVIATION`. One vocabulary for an axis that had three names and two
  copies of the conversion constant.
- `Provenance`, `PROVENANCE` and `ProvenanceMap`, the one declaration of what had
  been three identical types.
- `GEOMETRY_FIELDS` and its `geometryField`, `isLengthField` and `convertGeometry`
  readers. The dictionary carries each code's unit kind, which is what decides
  whether a stated number converts with a unit system; an unpinned code is not
  given a meaning and is not converted.
- `TOOL_FORMS`, `ToolForm`, `MILLING_FORMS` and `isToolForm`.
- `Tool`, `Geometry`, and the holder as a union of the published `Holder` and the
  measured `HolderProfile`, discriminated by `isHolderProfile`.
- `Collet`, `Assembly`, `PROFILES_VERSION`, `ProfilePoint` and `ProfileDatum`.
- `ReachCurve` and `FeatureDemand`, both declared structurally so no part schema
  travels with them.

Nothing depends on it yet. That is deliberate: it is the last point at which the
surface can change freely.
