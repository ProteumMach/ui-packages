# What the viewer needs from the Engine

Things the Engine knows and does not say, where the viewer is left guessing —
badly enough to be visible on a real part. Written from the consuming side: what
the field is, what we do with it, and what it costs to be without it.

One of the two below has since shipped, and is kept here with what it fixed.

## 1. Which surface a region was cut from — **delivered**

Shipped as `splitOrigin` on `Region`, required, described as a "report-local
source-face group; equal values identify regions split from one B-rep face".

`visualSurfaces` groups by it wherever a report carries one, which is exact for
every kind of surface. The inference below still runs for a report captured
before the field existed — and only for planes, for the reason given there.

What it fixed: the Engine splits a surface where that makes a better machining
plan, and the viewer drew its lines and shaded its facets from the region table.
So every split drew a line down a flat floor and creased the shading along it,
and a part with good machining data looked like a part modelled badly. Curved
splits could not be merged at all, because from the facets alone a fillet split
down the middle and a fillet running tangentially into a shaft are identical.

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
