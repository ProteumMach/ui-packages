# Bringing `@toolpath/viewer` to feature-picker parity

**Goal:** make the 3D viewer on `toolpath@pc-part-viewer` behave like the one on
`tp-ui@pc-feature-picker`, **staying on React Three Fiber**.

Status: **Phases A and B landed.** Phase A (PRs 1–5) is merged to `main`; Phase
B (PRs 6–10) is on `paul/viewer-camera` → `paul/viewer-chrome` →
`paul/viewer-directions` → `paul/viewer-surface`. Only Phase C is left, and it
is app work rather than viewer work.

---

## 1. Where the two viewers stand today

|                     | `toolpath` / `pc-part-viewer`                              | `tp-ui` / `pc-feature-picker`                                                                                  |
| ------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Package             | `packages/viewer` (`@toolpath/viewer`, MIT, published)     | `packages/viewer` (private)                                                                                    |
| Size                | ~960 LOC src, ~230 LOC tests                               | ~9,100 LOC src, ~4k LOC tests + fixtures                                                                       |
| Architecture        | React Three Fiber, declarative                             | framework-free imperative three.js core + thin React mount                                                     |
| Camera              | drei `OrbitControls` + CAD helpers                         | `camera-controls`, `toolpath` / `fusion` schemes, persp + ortho                                                |
| Highlighting        | 3 materials, geometry draw-groups rebuilt per state change | one mesh, one material, one draw call; a per-region RGBA state texture painted by `(color, weight)`            |
| Highlight semantics | `selected` / `hovered` only                                | 8-layer weighted stack: paint mode, sharp corners, proposal, in-proposal focus, painting, selection, hover     |
| Picking             | R3F raycast → `featureIds` of one region                   | own `Picker` for part / arrows / handle / cube, plus owner **ranking and cycling**                             |
| Overlays            | drei `GizmoViewport`, `gridHelper`, `axesHelper`           | own view cube (chamfered zones), grid, axes, direction arrows, section view + drag handle                      |
| Model layer         | `engine/region-mapping.ts` (40 LOC)                        | `model/` — `PartModel`, `RegionIndex`, normals, directions, typed errors, validating normalizer                |
| Docs                | README                                                     | `apps/feature-picker/docs/` — `highlighting.md`, `interactions.md`, `build/viewer.md` are the behavioural spec |

## 2. How the port works with R3F kept

`tp-ui`'s viewer is 9,100 LOC, but most of it is **not** about being imperative.
Splitting it by what it actually is:

**Ports essentially verbatim** — no scene ownership, no framework assumptions
(~3,900 LOC):

- `model/{types,region-index,normals,directions,errors}.ts`
- `core/theme.ts` — part/hover/selection colours, nine-colour direction cycle
- `core/selection.ts` — `bestOwner`, `cycleOwner`, `FEATURE_TYPE_RANKS`
- `core/camera.ts` — fit distance, projection, start position (pure math)
- `core/loaders.ts` — GLB → geometry with the report/mesh agreement check
- the buffer builders in `core/part.ts` — `buildRegionAttribute`,
  `buildRegionTexels`, and the `MeshLambertMaterial` + `onBeforeCompile` that
  reads the state texture
- the geometry/zone maths inside the overlays — `cubeZones`, `cubeRegion`,
  `viewVector`, `viewUp`, `sectionBounds`, `sectionFromPick`, `sectionDepth`,
  `dragPlane`, `screenLength`, `arrowPlacement`

**Gets re-expressed in R3F** (~5,200 LOC, and it shrinks):

| `tp-ui`                                                                                | Becomes                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/viewer.ts` (2,014 LOC) — renderer, scene mounting, resize, RAF loop, ~40 setters | `<Canvas>` + `useThree` + `useFrame` + `invalidate`; the setters become props on components. Already half-present as `viewer.tsx`.                                                                        |
| `core/controls.ts` (401 LOC)                                                           | drei `<CameraControls>` — drei 10.7.8 already depends on `camera-controls@^3.1.0`, the same library. Only the `toolpath` / `fusion` mouse-button presets and the free-orbit / zoom-to-cursor config port. |
| `core/picking.ts` (275 LOC)                                                            | R3F's own pointer events per object. The Picker exists because vanilla three has no event system; the part that survives is region → owners resolution.                                                   |
| `core/events.ts` (78 LOC)                                                              | callback props. Deleted.                                                                                                                                                                                  |
| `overlays/view-cube.ts` (703 LOC)                                                      | drei `<GizmoHelper>` for the corner viewport, with the ported cube geometry and zone maths as its children.                                                                                               |
| `overlays/{axes,grid}.ts`                                                              | the existing `primitives.tsx`, restyled to `theme.ts`.                                                                                                                                                    |
| `overlays/{directions,section-*}.ts`                                                   | R3F components; clipping via `gl.localClippingEnabled` and material `clippingPlanes`.                                                                                                                     |

So the parity work is **not** "reimplement 9k LOC declaratively". The
load-bearing ideas — the state-texture highlighting, the layer stack, owner
ranking, the report normalizer, the section and cube maths — are all
framework-free and come across as they are. What gets rewritten is mostly the
imperative plumbing R3F already provides.

**The one hard rule:** highlight painting stays a texture write held in a ref.
It must not become React state — a hover repainting through a render pass is the
regression that undoes the whole point. Keep `frameloop="demand"` and call
`invalidate()` after a paint, exactly as `part-mesh.tsx` does today.

**Not ported:** `tp-ui`'s `packages/viewer/src/api/*`. It is a second HTTP
client for the Engine API, and this repo has `@toolpath/api` generated from
`openapi/openapi.json`. Only the _normalizer_ (report → `PartModel`) comes
across, re-homed under the existing `src/engine/` adapter boundary.

**Kept from the current implementation:** `engine/geometry-cache.ts` (a
reference-counted LRU `tp-ui` does not have), the `<Viewer>` / `ViewerHandle`
shape, and the Suspense + error-boundary loading path.

**Retired:** `buildPartRenderGroups` / `buildPartMaterialGroups` /
`applyPartMaterialGroups` and the three-material scheme, superseded by PR 3.

Data is not a blocker: the public `PartReportResponse` already carries
`kernelVersion`, `regions[]` (`idx`, `triangleStart`, `triangleEnd`),
`features[]` (`featureTag`, `regionIdxs`, `featureType`, `machiningDirection`)
and `candidateDirections`. No API change is needed anywhere in this plan.

## 3. Target layout

```
packages/viewer/src/
  index.ts            public React surface
  model/              types, region-index, normals, directions, errors   (no three, no React)
  render/             theme, selection ranking, camera math, part buffers + material
  components/         viewer, part-mesh, axes, grid, view-cube, direction-arrows, section
  engine/             normalize, mesh-loader, geometry-cache, engine-part
```

## 4. PR breakdown

Three phases, ~13 PRs. Sizes are rough src-diff LOC excluding tests.

Because the component API survives, **the app keeps working after every PR** and
most PRs are visible in the running app — there is no big-bang cut-over.

Conventions for every port PR: convert to this repo's style (no semicolons,
single quotes, `.js` import specifiers), bring the corresponding `tp-ui` tests
across, keep `pnpm check-types` / `test` / `build` green.

### Phase A — the renderer (PRs 1–5) — **done**

**PR 1 — the pure layer** · `paul/viewer-pure-layer` ✅ Port
`model/{types,region-index,normals,directions,errors}.ts`, `core/theme.ts` and
`core/selection.ts` verbatim (modulo style). No three, no React, no scene.
Nothing consumes it yet. Tests port unchanged: `region-index`, `directions`,
`theme`, `selection`. The easiest PR here to review, and the vocabulary
everything later uses.

**PR 2 — Engine adapter: report → `PartModel`, and mesh loading** ·
`paul/viewer-engine-adapter` ✅ Port the normalizer out of `api/report.ts` as
`engine/normalize.ts`, typed against `@toolpath/api`'s `PartReportResponse`
instead of a hand-rolled guard set — keeping the `MIN_KERNEL_VERSION` 0.3.0
gate, `PartReportFormatError` (which collects every problem, not the first) and
`UnsupportedKernelVersionError`. Port `core/loaders.ts` for its report/mesh
agreement check, which `mesh-loader.ts` lacks today, folding in the existing
GLB→STL fallback. `region-mapping.ts` stays until PR 10. _Decide here:_ copy
`tp-ui`'s `packages/viewer/fixtures` (reports + meshes) as the shared test
corpus. Recommended — the agreement test needs a real pair.

**PR 3 — `<PartMesh>` becomes one mesh, one material** · `paul/viewer-part-mesh`
✅ The core parity change, in R3F. Port `buildRegionAttribute` /
`buildRegionTexels` and the `onBeforeCompile` material; attach the region
attribute to the geometry and the `DataTexture` as a uniform; expose
`paintRegion` / `paintFeature` / `clearPaint` through a ref, each write followed
by `invalidate()`. Delete the material-group path. Selection and hover keep
working through the new mechanism, so behaviour is unchanged and performance is
not — a good PR to attach a before/after draw-call count to. Tests:
`part.test.ts`, adapted.

**PR 4 — the highlight layer stack** · `paul/viewer-highlights` ✅ Props for
`selection`, `hover`, `candidates`, `highlights` (feature → colour + weight) and
`regionHighlights`, painted weakest-first in the order `highlighting.md` §2
specifies. Now that a layer is a texel write, this is mostly ordering logic plus
its test.

**PR 5 — picking, ranking and cycling** · `paul/viewer-picking` ✅ Resolve an
R3F pointer hit to region → owners; rank owners with PR 1's `selection.ts`; emit
`onPick` with `owners` alongside `best` so a consumer cannot wire the viewport
up without seeing the ambiguity. Implements "clicking one face repeatedly walks
its readings" (`interactions.md` §3.5) and an empty-space click reporting
`null`. Tests: `picking`, `selection` integration.

### Phase B — camera and chrome (PRs 6–10)

PRs 7, 8 and 9 are independent of each other and can land in any order or in
parallel.

**PR 6 — camera and controls** · ~350 LOC + tests Swap drei `OrbitControls` →
drei `CameraControls`; port the `toolpath` / `fusion` mouse-button presets,
free-orbit, zoom-to-cursor, and the fit / projection / start-position maths from
`core/camera.ts`. Adds the ortho ⇄ perspective toggle. Keeps
`ViewerHandle.fit/reset/setView`. _Watch:_ `camera-controls` binds to one three
instance — get the peer-dep and pnpm dedupe right here, or it fails silently
later.

**PR 7 — axes, grid, view cube** · ~450 LOC + tests Restyle the axes and grid to
`theme.ts`; replace drei's `GizmoViewport` with the ported cube inside a
`<GizmoHelper>` — chamfered zones, named views, hover feedback — and wire
`onViewChange`. _Optional trim:_ if chamfer-zone picking is not wanted,
`GizmoViewcube` gets most of the way for ~50 LOC; the ported cube is what makes
corner and edge views clickable.

**PR 8 — direction arrows** · ~350 LOC + tests Port `arrowPlacement` and render
the arrows as an R3F component: `activeDirection`, `shownDirection`,
`previewDirection`, `namedDirections`, `onPickDirection`, and the nine-colour
cycle from `theme.ts`. Fed by `candidateDirections` and `machiningDirection`,
both already in the public report.

**PR 9 — section view** · ~600 LOC + tests Port the section maths; render the
cap and the drag handle as components; enable `gl.localClippingEnabled` and feed
`clippingPlanes` to the part material. Props: axis sweep, plane-from-pick,
depth, flip, plus `onSectionChange`. Self-contained and droppable if the part
viewer does not need cutaways.

**PR 10 — surface and docs** · small Re-cut `index.ts` exports and the
`package.json` `exports` map, delete `region-mapping.ts` and the last of the
material-group code, migrate `examples/react-viewer/src/main.tsx`, rewrite
`packages/viewer/README.md`, bump the version. Mostly red diff.

### Phase C — app-level interaction parity (PRs 11–13)

Half of what makes the feature picker feel the way it does is which layers
`feature-picker.tsx` hands down, and when.

**The Directions page has its own plan now —
[directions-plan.md](directions-plan.md)** — which supersedes what PRs 11–13
sketch for that page and answers open question 1 with "here is what it would
cost, in eleven PRs, with stop points". These are `apps/part-viewer` changes,
specified by `highlighting.md` and `interactions.md`. Scope is a judgement call
— the part viewer is a report-inspection app, not a planning app, so this phase
should be trimmed rather than ported wholesale.

**PR 11 — selection model** · multi-select with ⌘/Ctrl (intersection of owners —
port `src/features/face-picks.ts`), a candidate list beside the part, guessed vs
chosen focus (`interactions.md` §4: a guessed focus paints nothing - unless
specifically inferring features (see `inference.md`)), Escape and empty-space
clearing.

**PR 12 — paint modes** · the Plain / Directions / Difficulty control at the
viewport's top-left, `localStorage` persistence, and the owner-wins rules from
`highlighting.md` §3. Difficulty needs a band source and the part viewer has no
rules engine, so this likely reduces to Plain + Directions.

**PR 13 — chrome and polish** · view-cube-driven named views, projection toggle,
control-scheme setting, `zoomToFeature` from a feature row, keyboard nav in the
feature list.

## 4b. What Phase A actually did differently

- **The app moved earlier than planned.** Keeping the R3F component API meant
  `apps/part-viewer` and `examples/react-viewer` could follow each PR instead of
  waiting for a cut-over, so both are already on `PartModel`, the candidate
  layer, and ranked picks. There is no big-bang migration left to do.
- **`region-mapping.ts` and `mesh-loader.ts` went in PR 3, not PR 10.** Both
  were superseded outright; leaving them would have been dead code with tests.
- **No `datasheet` on `PartModelFeature`.** The public report carries none —
  datasheets come from a separate endpoint — so the field was dropped rather
  than ported.
- **The example is the end-to-end test.** Its Playwright run exercises the
  shader path against real WebGL, which is the only place the texture
  highlighting can actually be observed working.

## 4c. What Phase B added beyond the plan

- **Region-aware shading.** The Engine's mesh ships positions only, so normals
  are invented. Averaging within a region and never across one gives a bore that
  shades smoothly and an edge that stays hard — better than either app had, and
  possible only because the report says which triangles are one surface.
- **Overlays are excluded from framing.** The section cap is wider than the
  part's diagonal and the direction arrows sit outside it, so a Fit that
  measured either framed the overlay instead of the part. Found by a test, not
  by inspection.
- **The section is a mode, not a permanent overlay.** Its handle stands over the
  part's centre, which is exactly where an orbit drag starts, so leaving it on
  swallows the gesture.

## 5. Sequencing notes

- PRs 1–2 touch no consumer and can be reviewed as a batch.
- PR 3 is the one to spend review time on; it is where the architecture actually
  changes and where the win is measurable.
- Everything through PR 8 is the real "works like the feature picker" bar. PR 9
  and all of Phase C are droppable.
- Test porting is not uniform: the pure-module tests (PR 1, 2, and the maths in
  7–9) come across unchanged, while `tp-ui`'s tests that drive the imperative
  `Viewer` need rewriting against the component API. Budget for that in PRs 3–6.

## 6. Open questions

1. **How much of Phase C does the part viewer want?** Proposals, rules, and
   pick-by-direction may have no meaning in a report-inspection app.
2. **Fixtures** — copy `tp-ui`'s `packages/viewer/fixtures` (reports + meshes),
   or generate an equivalent from the public API? The loader agreement check and
   the normalizer both need a real report/mesh pair.
3. **View cube depth** (PR 7): ported chamfer zones, or drei's `GizmoViewcube`?
4. **Provenance** — `tp-ui`'s viewer is `private: true`; this one is MIT and
   published. Same org, so a formality, but worth signing off before PR 1 rather
   than after PR 10.
5. **Docs** — ~~`highlighting.md` and `interactions.md` are the specification
   for Phase C and should come across (adapted) rather than stay in the other
   repo.~~ **Done:** `apps/part-viewer/docs/` now carries both, adapted —
   written about this app, with a section in each naming where it knowingly
   differs from the picker and what that difference cost there.
