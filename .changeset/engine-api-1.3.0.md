---
'@toolpath/api': minor
---

Regenerate the TypeScript SDK for Engine API 1.3.0.

Tool holder import: upload a holder's CAD file, derive its collision envelope, and export it as an
Autodesk Fusion tool library.

- Five new endpoints — `POST /v1/holders`, `PATCH /v1/holders/{id}`, `GET /v1/holders/{id}`,
  `GET /v1/holders/{id}/fusion`, and `GET /v1/holder-libraries/fusion`.
- A job can now name a holder as well as a part, so `holderUuid` and `importId` join `partUuid` and
  `reportId` on job responses, and `GET /v1/jobs` gains a `holderId` filter beside `partId`.
- `PATCH /v1/parts/{id}` now answers `409 idempotency_key_reused` when an `Idempotency-Key` was
  already spent on a different part or a different product. Retrying the same request still replays
  the original job; what changed is that reusing a key across operations no longer returns a job id
  belonging to something else.

This release is additive. No existing response changes shape: a job that names a part still carries
its `partUuid` and `reportId`, and a client that never creates a holder never receives a holder job.
`partUuid` is declared nullable so one schema can describe either subject, which widens the
generated SDK's type to `string | null` — TypeScript consumers that dereference it will want a null
check, or can read the new `holderUuid` to tell the two subjects apart.
