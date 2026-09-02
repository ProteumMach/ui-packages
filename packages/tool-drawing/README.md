# Toolpath Tool Drawing

`@toolpath/tool-drawing` draws a cutting tool, and the holder it is clamped in,
as a 2D elevation: one silhouette turned about the tool axis, dimensioned, on
its own sheet. It is SVG and arithmetic — no runtime dependencies, React only as
a peer.

It is deliberately not `@toolpath/viewer`. That package shows a customer's part
in 3D; this one draws a catalog tool in 2D.

## Install

```sh
npm install @toolpath/tool-drawing react react-dom
```

## Exports

| Entry point                        | What it is                                              |
| ---------------------------------- | ------------------------------------------------------- |
| `@toolpath/tool-drawing`           | The component, the input contract, the framing options  |
| `@toolpath/tool-drawing/geometry`  | `assemblyOutline` and the profile generators — no React |
| `@toolpath/tool-drawing/clearance` | The optional clearance overlay                          |

`/geometry` is pure and server-safe: it touches no DOM and imports no React, so
a Node server can measure an assembly without paying for a renderer.

## Geometry

```ts
import { assemblyOutline } from '@toolpath/tool-drawing/geometry'

const outline = assemblyOutline({
  tool: { form: 'flat end mill', geometry: { DC: 6, LCF: 13, SFDM: 6, OAL: 57 } },
  holder: null,
  stickout: null,
})
```

`assemblyOutline` returns `null` rather than a picture when it cannot draw the
tool honestly — an unrecognised form, or a tool with no stated cutting diameter
or flute length. **Every number in a generated profile comes off a vendor
field.** There is no default taper angle, no assumed neck, no invented lead
chamfer. Where a number has to be assumed to draw at all — a drill point angle
the vendor never published — the segment says so in its `provenance`, and a
renderer is expected to show it.

## Two kinds of holder

`holder` is a union, and the two members are different inputs rather than two
grades of one:

```ts
// What a vendor's table states: a nose, a body, a flange.
holder: { noseDiameter: 28, noseLength: null, gaugeLength: 50, /* … */ }

// What the vendor's own CAD model measures: the silhouette, `[z, r]` in mm.
holder: { points: [[-48.4, 16], /* … */ [60, 8.5]], datum: 'gage-line', /* … */ }
```

A measured profile is **not** projected onto the parametric fields — the
V-flange groove and the thread relief are the reason to measure at all, and a
nose diameter and a body length cannot carry them. It is drawn as measured,
vertex for vertex, with its nose face at the stickout. `isHolderProfile`
narrows the union for an adapter that holds both.

On a `gage-line` profile the drawing splits at `z = 0` — the spindle face — so
everything above it is shaded as the spindle connection, exactly as the
parametric flange is. A `nose`-datumed profile has no spindle face to split on
and no gauge length to state, and the note under the drawing says so.

`geometry` keys are the scraper's own field names (`DC`, `SFDM`, `OAL`, `LCF`,
`RE`, `SIG`, `NOF`, `shoulder-diameter`, `shoulder-length`). They are not
renamed here: a translation table between two vocabularies is where an `SFDM`
silently becomes a `DC`.

## Drawing

```tsx
import { ToolDrawing } from '@toolpath/tool-drawing'
;<ToolDrawing assembly={assembly} theme="dark" />
```

The component measures its own panel, frames the assembly to fill it, and draws
along the panel's long axis — no orientation prop, no pan, no zoom. `theme` is a
prop rather than a hook because a package cannot reach the application's theme;
it defaults to `'dark'`.

A form the geometry has no shape for is **stated in words and named**, not drawn
as a plausible cylinder.

## Dimensions

```tsx
<ToolDrawing assembly={assembly} dimensions dimensionSides="both" formatLength={inches} />
```

Every stated length and width, each in its own lane, nested shortest-innermost
so no two lines cross, with each figure in the band just outboard of its own
lane. Only stated numbers are dimensioned. `formatLength` is yours, because the
unit a shop reads in is the application's.

## Clearance overlay

```tsx
import { ClearanceOverlay, tightestGaps, describeGaps } from '@toolpath/tool-drawing/clearance'
;<ToolDrawing assembly={assembly} collisions={collisions} verdict={{ clears, note }}>
  <ClearanceOverlay
    profile={profile}
    gaps={gaps}
    cuttingRadius={cuttingRadius}
    formatLength={formatLength}
  />
</ToolDrawing>
```

The overlay draws in the drawing's own coordinates and is given them: the
frame, the outline and the sheet reach it from the `<ToolDrawing>` around it.
It could not work them out for itself — the panel is measured by a
`ResizeObserver` inside that component, on an `<svg>` you never hold — so
passing them is only for overriding the frame, as a test framing a fixture
does. Drawn outside a `<ToolDrawing>` with none supplied, it throws rather than
inventing one.

**The overlay draws a verdict; it does not reach one.** Whether an assembly
clears a feature is a tool-selection question with callers that never draw
anything, so it stays with them: this takes the material profile, the
collisions and the two tightest gaps as data and owns every line drawn from
them — the wall, the hatch, the interrupted-view breaks, the clearance
dimensions and their readouts, and the paint on a section that is in the metal.

It is optional in three senses: a subpath of its own, so a consumer that never
imports it never pays for it; no Toolpath schema dependency, because the
reach-curve shape is declared structurally here; and omitting the props draws
the tool alone.

## Status

Geometry, layout, the renderer, the dimensions and the clearance overlay are
all in.
