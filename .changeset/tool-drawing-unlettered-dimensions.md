---
'@toolpath/tool-drawing': minor
---

The drawing no longer letters its dimensions. `<ToolDrawing dimensions>` draws
the linework — extension lines, dimension lines, arrowheads, and a drill point's
two flanks run out with an arc between them — and writes no numbers on the
sheet.

Which line is which is now said by pointing at it. `highlight` names the
dimension or dimensions to draw in the sheet's accent by ISO 13399 code, and
`onDimensionHover` reports the code under the pointer and `null` when it leaves,
so a consumer's own table of numbers and the drawing can light each other.

Removed, and a `0.x` minor is the channel that carries it — a `^0.2.0` range
does not accept `0.3.0`, so nobody takes this without asking for it:

- `formatLength` is gone from `ToolDrawingProps`. Nothing on the drawing is
  written out, so there is nothing to format. `@toolpath/tool-drawing/clearance`
  keeps its own `formatLength` — its readouts are still lettered.
- The figure and band layout is gone with it: `dimensionLayout`, `stackLabels`,
  `dimensionLabel`, `formatMillimetres`, `bandOffset`, `bandRoom`, `figureType`,
  `figureHeight`, and the types `DimensionFigure`, `DimensionLayout`, `LabelBox`,
  `BandRoom` and `FormatLength` are no longer exported. `laneOffset` now takes a
  lane number and a `LaneRoom` rather than a band table; `laneLayout` and
  `laneRoom` replace what the rest of them did.
- `Sheet` gains an `accent` colour. A hand-written sheet object needs the field.
