---
'@toolpath/api': patch
---

Regenerate the TypeScript SDK for Engine API 1.3.2.

Neither upload endpoint was ever limited to STEP, and the `filename` query parameter on
`POST /v1/parts` and `POST /v1/holders` now says so: its description names the extensions they
take.

- Both endpoints accept the same formats — STEP (`.step`, `.stp`), Parasolid (`.x_t`, `.x_b`),
  SolidWorks (`.sldprt`), CATIA V5 (`.catpart`), NX/Creo (`.prt`), and IGES (`.igs`, `.iges`).
- `filename` is what selects the reader — nothing inspects the bytes you upload — so its
  extension must match the file you send. **It is optional, and omitting it stores the upload as
  STEP**, which fails processing for any other format.

This release is documentation only. No endpoint, schema or response changes shape, and no
upload that worked before behaves differently.
