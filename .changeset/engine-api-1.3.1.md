---
'@toolpath/api': patch
---

Regenerate the TypeScript SDK for Engine API 1.3.1.

Part results now carry `turnability`: whether the part belongs on a lathe, read from the imported
part on every analyze run.

- `GET /v1/parts/{id}` gains a `turnability` field — either a `TurningAxis` (the axis's `direction`
  and `location`, the `areaFraction` of the surface one turning setup could finish, and the
  `volumeFraction` of the envelope of revolution the part keeps), or `NoAxis` when the kernel found
  no axis worth turning about, or `null` when no reading was taken.
- `null` and `NoAxis` are different answers. `NoAxis` is a result; `null` means the reading is
  absent — every part result produced before this release, and any run where the reading failed.
- The field does not depend on `featureDetails`. Unlike `directionZBounds`, it is populated on runs
  that skip feature enrichment.

This release is additive. No existing response changes shape.
