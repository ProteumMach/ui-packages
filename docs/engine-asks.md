# What the viewer needs from the Engine

Two fields. Both are things the Engine knows and does not say, and in both cases
the viewer currently guesses — badly enough to be visible on a real part.

Written from the consuming side: what the field is, what we do with it, and what
it costs to be without it.

## 1. Which surface a region was cut from

**Ask:** one optional integer on `Region`, stable within a report.

```jsonc
{
  "idx": 41,
  "shapeKind": "Torus",
  "area": 118.4,
  "triangleStart": 9032,
  "triangleEnd": 9104,
  "surfaceIdx": 17, // ← the analytic surface this region belongs to
}
```

Two regions sharing a `surfaceIdx` are two parts of one surface. Regions with
different ones are different surfaces, however smoothly they meet.

### Why

The Engine splits a surface where that makes a better machining plan — a floor
cut in two so each half can be reached from a different direction. Features
depend on those splits and we would not want them undone.

But a split is not an edge of the part, and the viewer draws its lines and
shades its facets from the region table. So every split drew a line down a flat
floor and creased the shading along it, and a part with good machining data
looked like a part modelled badly.

### What we do without it

Infer, from the facets: two regions merge if they meet along an edge, are the
same `shapeKind`, and their facets there face within a degree.

**Planes only.** On a curved surface the inference cannot be made safely, because
a fillet split down the middle and a fillet running tangentially into a shaft are
identical from the facets alone — the disagreement across the boundary is one
tessellation step in both cases. Any window wide enough to merge the split rubs
out the junction, and losing a line the part has is the worse mistake. So curved
splits still show their lines today.

### What it would buy

Exactness, and for every kind. `visualSurfaces` already prefers the stated
grouping where a report carries one — the code is in and tested, so the field
arriving is the whole change. It would also let the highlight cover a split face
without the "is anyone else claiming this?" check it needs today.

## 2. A cutter band on the types that report none

**Ask:** populate `facts.cd` — or say why it is absent — on the types that
currently omit it. Filleted T-slots are the case we hit; there may be others.

### Why

`facts.cd.ignore.min` is the terminal tool: the widest cutter that still reaches
the tightest corner. Half of it is the radius the geometry demands. Confirmed
against Fusion twice — a corner measuring 3.302 mm reports 6.616, and a pocket
the Engine says has no blend at all reports 3.429 for a radius of 1.71.

Every milling rule reads it: milling L/D, the preferred milling radius range, and
the minimum radius the panel shows.

### What we do without it

Nothing, deliberately. Where no band is reported the metric is `null` and the
rules that read it stand down, so those features go unjudged.

That is a loss of coverage and it is the better of two bad options. The viewer
used to fall back to `facts.cd.terminalCornerRadius × 2`, which put a filleted
T-slot's milling L/D at **23:1** — because `terminalCornerRadius` reports the
_floor blend_, not a corner a cutter has to fit. On every part looked at so far
it equals `facts.filletRadius` exactly.

Which raises a smaller question worth an answer either way: **is
`terminalCornerRadius` meant to be the tightest internal corner?** The name says
so and the data does not. If it is meant to be the floor blend, the name is
misleading; if it is meant to be the corner, it is wrong on every part we have.
