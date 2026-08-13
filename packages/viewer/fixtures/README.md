# Part report fixtures

Captured Engine reports, used to test the viewer's model layer against real data
rather than against hand-built shapes that agree with the code by construction.

Presigned query strings are redacted — they carried an access key id and expire
after fifteen minutes — so **use a fixture's URLs for nothing**. They are all
dead.

| File                            | Kernel  | What it is good for                                                                                                                                                                 |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reports/local-0.3.0-cube.json` | `0.3.0` | The complete sample: 24 features, 6 regions, 12 triangles, 4 candidate directions. **Every region has 5–8 owning features** — the measured fact the whole selection model rests on. |
| `reports/local-0.3.0-demo.json` | `0.3.0` | A synthetic stub with a **curved** region (`Cylinder`), 2 features, 3 regions, 96 triangles.                                                                                        |

## What the cube pins down

24 features over 6 regions from 4 candidate directions (±Y, ±Z) gives **5–8
owning features per region**, observed rather than derived. The two ±X regions
have no direction facing them, so they collect a `wall` and a `profile` from all
four directions and no `face` at all.

That is why `region → feature` is one-to-many everywhere in this package, and
why a viewport click has to carry its alternatives rather than resolve to one
answer.
