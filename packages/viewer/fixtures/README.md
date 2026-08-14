# Part report and mesh fixtures

Sanitized Engine-shaped reports and meshes, used to test the viewer against
production-shaped data rather than hand-built shapes that agree with the code by
construction.

Fixture URLs are test-only. Any presigned query strings have been redacted, so
**do not use a fixture URL for anything**.

| File                             | Kernel  | What it is good for                                                                                                                                                                        |
| -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `reports/local-0.3.0-cube.json`  | `0.3.0` | The complete sample: 24 features, 6 regions, 12 triangles, 4 candidate directions. **Every region has 5–8 owning features** — the measured fact the whole selection model rests on.        |
| `reports/local-0.3.0-demo.json`  | `0.3.0` | A synthetic stub with a **curved** region (`Cylinder`), 2 features, 3 regions, 96 triangles.                                                                                               |
| `mesh/local-0.3.0-cube.glb`      | `0.3.0` | The mesh `local-0.3.0-cube.json`'s region ranges index into — same analysis run, 12 triangles, 8 points, `POSITION` only. The pair is what makes the report/mesh agreement check testable. |
| `reports/legacy-0.2.0-cube.json` | `0.2.0` | A sanitized pre-`regions[]` report, so the kernel-version gate is tested against a representative older report rather than a doctored newer one.                                           |

## What the cube pins down

24 features over 6 regions from 4 candidate directions (±Y, ±Z) gives **5–8
owning features per region**, observed rather than derived. The two ±X regions
have no direction facing them, so they collect a `wall` and a `profile` from all
four directions and no `face` at all.

That is why `region → feature` is one-to-many everywhere in this package, and
why a viewport click has to carry its alternatives rather than resolve to one
answer.
