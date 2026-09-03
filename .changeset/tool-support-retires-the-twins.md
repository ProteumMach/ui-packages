---
'@toolpath/tool-support': minor
'@toolpath/tool-drawing': minor
'@toolpath/tool-scraper': minor
---

Retire the arithmetic that was written twice.

Four functions had two copies each, in packages that could not import one
another, and each copy carried a note saying it must agree with its twin. Only
one of the four had a test comparing them, and nothing enforced the rest.

`@toolpath/tool-support` now publishes all four:

- **`hasNeck`** — whether the section between the flutes and the shank is a neck
  to draw and to sweep. One copy drew the picture and the other decided the
  verdict: _"If the rule ever changes, it changes in both places or the picture
  and the verdict disagree about the same tool."_
- **`shankOf`** and **`Shank`** — whether the shank behind the flutes is reduced
  against the cut. A different question from `hasNeck`, and both are needed: a
  relief wider than the cut is a neck to draw and not a reduced shank.
- **`heightAt`** — the tallest material within an offset of the cut. The
  clearance verdict and the drawn staircase both read it, and neither could
  depend on the other.
- **`belowGageLine`** — the measured silhouette from the spindle face out, with
  the crossing interpolated rather than snapped to the nearest vertex.

`@toolpath/tool-drawing` takes `hasNeck` and `heightAt` from there. `ReachCurve`
is now the shared type — still declared structurally, so a curve off a report
still satisfies it with no adapter and the overlay still pulls in no Toolpath
schema. `heightAt`, `ReachCurve`, `wallFaceAt`, `Margins` and `NO_MARGINS` all
stay exported from `/clearance` unchanged.

`@toolpath/tool-scraper` takes `ProfileDatum` and `ProfilePoint` from there.
`HolderProfile`, `ProfilesDocument` and `PROFILES_VERSION` do not move: a
measurement record carries the gauge lengths and the taper class a scrape
resolved, and its version tracks that document's shape rather than the shape of
one silhouette.

A new test in `@toolpath/tool-drawing` asserts the remaining half of the
gage-line pair — that trimming a silhouette at the spindle face and splitting it
there interpolate the same crossing. That was a note in both files and is now a
check, in the only package that can see both sides.
