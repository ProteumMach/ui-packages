import { hasNeck } from './outline.js'
import type { ViewerAssembly } from './types.js'

/**
 * What a drawing of this tool dimensions, and where each dimension goes.
 *
 * **Pure, and here rather than in the component**, because where a dimension
 * line sits is arithmetic: which ones apply to this tool, what each one
 * measures, and — the part a component would get wrong quietly — which lane
 * each length runs in so that no two lines cross. The drawing turns these into
 * SVG and nothing else.
 *
 * The space is the outline's own: millimetres, `z` above the tip, `r` from the
 * axis. Every length is measured **from the tip**, which is where a machinist
 * measures from and where every rule in the sheet measures from.
 *
 * Only stated numbers are dimensioned. A drawing that carries a figure the
 * vendor never published is worse than one that carries fewer — the note under
 * the drawing already names what was assumed, and a dimension line looks like a
 * measurement whatever the note says.
 *
 * ## Sides are `minus` and `plus`, not `left` and `right`
 *
 * This model was written for a drawing that only ran vertically, where the two
 * flanks of the tool were reliably the left and right of the screen. They are
 * not any more: the frame lays a tool along whichever axis its panel is longer
 * on, so the `-r` flank is the screen's left in one orientation and its top in
 * the other. The names say which flank rather than where it lands, because the
 * where is `toX`/`toY`'s alone.
 */

/** A length along the axis, drawn beside the stack. */
export interface LengthDimension {
  readonly code: string
  /** From the tip, in millimetres — always 0 for now, kept for a dimension that is not. */
  readonly from: number
  readonly to: number
  /**
   * Which line out from the stack this one runs in, 0 nearest.
   *
   * Shortest innermost, so the lines nest instead of crossing — the rule a
   * drafting sheet follows and the reason this is worked out rather than
   * listed in a fixed order.
   */
  readonly lane: number
}

/** A width across the axis, drawn at its own height. */
export interface WidthDimension {
  readonly code: string
  /** Half-width, in millimetres: the dimension runs from `-radius` to `+radius`. */
  readonly radius: number
  /** Where up the tool it is measured, in millimetres above the tip. */
  readonly at: number
}

/**
 * An angle called out with a leader rather than measured between two lines.
 *
 * **A drill is its point** (Paul, 2026-09-01: "shouldn't a 2d rep of a drill be
 * showing me a tip angle?"). On a ⌀1 drill the cone is three tenths of a
 * millimetre tall — drawn to scale it is invisible, and the number is the only
 * way the drawing says 140° rather than 118°.
 */
export interface AngleDimension {
  readonly code: string
  readonly degrees: number
  /** Where the leader points: a radius from the axis and a height above the tip. */
  readonly at: { readonly r: number; readonly z: number }
}

export interface ToolDimensions {
  readonly lengths: ReadonlyArray<LengthDimension>
  readonly widths: ReadonlyArray<WidthDimension>
  readonly angles: ReadonlyArray<AngleDimension>
  /** The corner radius, called out on the corner rather than dimensioned across it. */
  readonly cornerRadius: number | null
}

/** Nothing to draw a dimension from. */
const EMPTY: ToolDimensions = { lengths: [], widths: [], angles: [], cornerRadius: null }

/**
 * The dimensions for one assembly.
 *
 * With a holder, the tool's overall length is left off: most of the shank is
 * inside the holder and a line to a face nobody can see reads as a mistake.
 * What replaces it is the number the holder brings — how far the tool stands
 * out of it.
 */
export const dimensionsFor = (assembly: ViewerAssembly): ToolDimensions => {
  const { tool, holder, stickout } = assembly
  const { DC, LCF, OAL, SFDM, RE } = tool.geometry
  if (DC === undefined || LCF === undefined) {
    return EMPTY
  }

  const shoulderLength = tool.geometry['shoulder-length']
  const shoulderDiameter = tool.geometry['shoulder-diameter']
  const necked = hasNeck(tool) && shoulderLength !== undefined && shoulderDiameter !== undefined

  const widths: Array<WidthDimension> = [{ code: 'DC', radius: DC / 2, at: 0 }]
  if (necked && shoulderDiameter !== undefined && shoulderLength !== undefined) {
    widths.push({
      code: 'shoulder-diameter',
      radius: shoulderDiameter / 2,
      // At the top of the relief, where the shank steps down to it: measured
      // in the middle it sat among the flute length and the corner radius,
      // which is the busiest inch of the drawing (Paul, 2026-09-01).
      at: shoulderLength,
    })
  }
  if (SFDM !== undefined) {
    // On the shank, and above the holder nose where there is one: a width
    // measured inside the holder is measured across a face nobody can see.
    const shankFrom = necked && shoulderLength !== undefined ? shoulderLength : LCF
    const shankTo = stickout ?? OAL ?? shankFrom
    widths.push({
      code: 'SFDM',
      radius: SFDM / 2,
      at: (shankFrom + Math.max(shankFrom, shankTo)) / 2,
    })
  }

  /** Every length this tool states, before they are put in lanes. */
  const spans: Array<{ code: string; from: number; to: number }> = [
    { code: 'LCF', from: 0, to: LCF },
  ]
  if (necked && shoulderLength !== undefined) {
    spans.push({ code: 'shoulder-length', from: 0, to: shoulderLength })
  }
  const below = tool.geometry.LBH
  if (below !== undefined && below > 0) {
    // What the shop's clamping rule leaves below the holder: the reach the
    // tool has, which is the number half the rules are about (Paul,
    // 2026-09-01).
    spans.push({ code: 'LBH', from: 0, to: below })
  }
  if (holder === null) {
    if (OAL !== undefined) {
      spans.push({ code: 'OAL', from: 0, to: OAL })
    }
  } else if (stickout !== null) {
    spans.push({ code: 'stickout', from: 0, to: stickout })
    /**
     * **No gauge length.** It is the spindle face to the holder nose, and
     * neither drawing reaches the spindle face — both stop a little past the
     * flange. A dimension to a face that is not on the drawing is the same
     * mistake as one to the end of a shank buried in the holder; the number
     * is in the holder's own details, where it can be read without a line
     * pointing at nothing.
     */
  }

  const lengths = spans
    .slice()
    .sort((a, b) => a.to - a.from - (b.to - b.from))
    .map((span, index) => ({ ...span, lane: index }))

  /**
   * The point angle, on the tools that have a point: the leader lands halfway
   * up the cone's own flank, which is where the angle is.
   */
  const SIG = tool.geometry.SIG
  const pointed =
    tool.form === 'drill' || tool.form === 'spot drill' || tool.form === 'center drill'
  const angles: Array<AngleDimension> =
    pointed && SIG !== undefined && SIG > 0
      ? [
          {
            code: 'SIG',
            degrees: SIG,
            at: { r: DC / 4, z: DC / 2 / Math.tan(((SIG / 2) * Math.PI) / 180) / 2 },
          },
        ]
      : []

  return {
    lengths,
    widths,
    angles,
    cornerRadius: RE !== undefined && RE > 0 ? RE : null,
  }
}

/** What a dimension is called on the drawing, where that is not its code. */
const DIMENSION_LABEL: Readonly<Record<string, string>> = {
  LBH: 'below holder',
  'shoulder-length': 'shoulder',
  'shoulder-diameter': 'shoulder ⌀',
  stickout: 'stickout',
  // A drill's included angle. "Tip angle" is what the table beside it calls
  // the same number (Paul, 2026-09-01).
  SIG: 'tip angle',
}

export const dimensionLabel = (code: string): string => DIMENSION_LABEL[code] ?? code

/**
 * How a length is written out.
 *
 * A function rather than a unit, because a unit system is the application's:
 * this package has no opinion on whether a shop reads millimetres or inches,
 * and owning one would mean owning its rounding too. Millimetres in, a string
 * out; the default is only so the package draws something on its own.
 */
export type FormatLength = (millimetres: number) => string

export const formatMillimetres: FormatLength = (millimetres) =>
  `${String(Math.round(millimetres * 100) / 100)} mm`

/** One label's box on the drawing, before anything has been moved. */
export interface LabelBox {
  readonly key: string
  /** The inboard edge across the axis, and how far the box reaches outward. */
  readonly across: number
  readonly width: number
  /** The end nearest the tip, and how far the box reaches along the axis. */
  readonly along: number
  readonly height: number
}

/**
 * The same labels, moved apart until none covers another.
 *
 * **Because a dimension is only worth drawing if it can be read** (Paul,
 * 2026-09-01). A tool 50 mm long with 4 mm of flute puts its flute length, its
 * relief and its cutting diameter inside the bottom tenth of the drawing, and
 * three figures land on each other however carefully each one is placed. Each
 * label carries a box, so the boxes can be stacked: the one nearest the tip
 * keeps its place, and anything that would cover it moves **away from the
 * tip**, which is where the drawing has room.
 *
 * Pure arithmetic over rectangles — no measuring of text and no reading of the
 * DOM, so it runs the same on a server as in a browser.
 *
 * **Along the axis, not up the screen.** The original moved a clash "up",
 * which was the same direction only because the tool was always drawn
 * standing. Away from the tip is what that meant, and it is what holds when
 * the tool is laid on its side.
 */
export const stackLabels = (
  boxes: ReadonlyArray<LabelBox>,
  gap = 0,
  /**
   * Boxes that cannot move: the drawing's own lines, so a figure rises clear
   * of an extension line rather than sitting on it (Paul, 2026-09-01 — the
   * figures moved in beside their own lanes, and the lines outboard of them
   * cross those bands).
   */
  fixed: ReadonlyArray<LabelBox> = [],
): Map<string, number> => {
  const placed: Array<LabelBox> = [...fixed]
  const moved = new Map<string, number>()
  const clashes = (one: LabelBox, two: LabelBox): boolean =>
    one.across < two.across + two.width &&
    two.across < one.across + one.width &&
    one.along < two.along + two.height + gap &&
    two.along < one.along + one.height + gap
  // Nearest the tip first: that label is the one nearest what it measures.
  for (const box of [...boxes].sort((a, b) => a.along - b.along)) {
    let along = box.along
    let clash = true
    while (clash) {
      clash = false
      for (const other of placed) {
        if (clashes({ ...box, along }, other)) {
          along = other.along + other.height + gap
          clash = true
          break
        }
      }
    }
    placed.push({ ...box, along })
    moved.set(box.key, along)
  }
  return moved
}

/**
 * Where every figure on the drawing stands.
 *
 * **Each figure beside its own line, in the band just outboard of it** (Paul,
 * 2026-09-01: "I'd love to put SFDM, LCF and shoulder dia closer to the part —
 * like, inside the below holder and OAL lines"). One column in the far margin
 * put the number for a dimension at the tool's edge as far from it as the
 * number for the overall length, and the eye has to travel the width of the
 * sheet to pair them up. So the margin is a series of bands: the widths sit in
 * the first, just past their arrows, and each length's figure sits in the band
 * outboard of its own lane.
 *
 * A band is only as wide as the widest figure in it, because the room it takes
 * comes out of the tool.
 */

/** Which flank of the tool a figure stands off. */
export type Side = 'minus' | 'plus'

/** The type a figure is set in, given the drawing's own size. */
export const figureType = (fontSize: number): number => fontSize * 0.85

/** How wide a figure of these lines is, set at that size. */
const figureWidth = (lines: ReadonlyArray<string>, type: number): number =>
  lines.length === 0 ? 0 : (Math.max(...lines.map((each) => each.length)) + 1) * type * 0.56

/** One figure, and the band it stands in. */
export interface DimensionFigure {
  readonly code: string
  readonly side: Side
  /** 0 is the band nearest the tool — the widths'; band `i + 1` is outboard of lane `i`. */
  readonly band: number
  /** The lane this figure's dimension runs in on its own side, or null for a width. */
  readonly lane: number | null
  readonly lines: ReadonlyArray<string>
  /** How far the figure reaches perpendicular to the tool axis. Bands are sized by this. */
  readonly across: number
  /** How far it reaches parallel to the tool axis. The stacker moves figures along this. */
  readonly along: number
}

/**
 * How tall a block of this many lines is, set at that type size.
 *
 * The renderer sets type at {@link figureType} and leads it at 1.15, with half
 * a line of padding above and below; this is that sum, and the two have to
 * agree or a figure's box is not the size of the figure in it.
 */
export const figureHeight = (lines: number, type: number): number =>
  type * 0.45 * 2 + type * 1.15 * lines

export interface DimensionLayout {
  readonly figures: ReadonlyArray<DimensionFigure>
  /** Per side, the width of every band, nearest the tool first. */
  readonly bands: Readonly<Record<Side, ReadonlyArray<number>>>
}

/** The room a side's bands take, measured out from the edge of the stack. */
export interface BandRoom {
  /** How far the width dimensions' arrows reach past the tool. */
  readonly arrow: number
  /** The clearance between a band and the line beside it. */
  readonly gap: number
}

/** Where a band's inboard edge is: the offset a figure in it reads outward from. */
export const bandOffset = (bands: ReadonlyArray<number>, band: number, room: BandRoom): number => {
  let at = room.arrow + room.gap
  for (let index = 0; index < band; index += 1) {
    at += (bands[index] ?? 0) + room.gap * 2
  }
  return at
}

/** Where a lane's line runs: just outboard of the band that carries its figure. */
export const laneOffset = (bands: ReadonlyArray<number>, lane: number, room: BandRoom): number =>
  bandOffset(bands, lane, room) + (bands[lane] ?? 0) + room.gap

/** Everything one side needs, out to the far edge of its last band. */
export const bandRoom = (bands: ReadonlyArray<number>, room: BandRoom): number =>
  bands.length === 0
    ? 0
    : bandOffset(bands, bands.length - 1, room) + (bands[bands.length - 1] ?? 0)

/** What one figure reads: the name, the number, and a corner radius under it. */
const linesOf = (
  model: ToolDimensions,
  format: FormatLength,
): Array<{ code: string; lines: Array<string> }> => [
  ...model.lengths.map((each) => ({
    code: each.code,
    lines: [dimensionLabel(each.code), format(each.to - each.from)],
  })),
  ...model.angles.map((each) => ({
    code: each.code,
    lines: [dimensionLabel(each.code), `${String(each.degrees)}°`],
  })),
  ...model.widths.map((each) => ({
    code: each.code,
    // Some labels carry the diameter sign already; none carries it twice.
    lines: [
      dimensionLabel(each.code).includes('⌀')
        ? dimensionLabel(each.code)
        : `${dimensionLabel(each.code)} ⌀`,
      format(each.radius * 2),
      // The corner radius belongs to the tip's diameter, and reads under it
      // rather than beside it.
      ...(each.at === 0 && model.cornerRadius !== null ? [`RE ${format(model.cornerRadius)}`] : []),
    ],
  })),
]

/**
 * Every figure, on the side and in the band it belongs to.
 *
 * The sides alternate — lengths by lane, widths by their own order — so
 * neither margin runs away with the whole drawing while the other stands
 * empty. Where the drawing has something beside it, everything stays on the
 * one flank.
 */
export const dimensionLayout = (
  model: ToolDimensions,
  format: FormatLength,
  fontSize: number,
  sides: 'one' | 'both' = 'one',
  /**
   * **Whether horizontal text runs parallel to the tool axis.**
   *
   * The one fact about the drawing's orientation that this model cannot do
   * without, and it is here rather than in the renderer so that it is stated
   * once, in a pure function, with a test on it.
   *
   * Everything else in this package is orientation-agnostic because a
   * millimetre is a millimetre whichever way the axis runs. Type is the
   * exception: **text does not rotate.** A figure two lines deep and twelve
   * characters wide is wide on the screen either way, so when the tool is laid
   * along the screen's width that figure reaches mostly *along* the tool, and
   * when the tool stands up it reaches *across* it. The bands are sized on the
   * across measure, so which of the two the type contributes decides how much
   * room the margins take — and getting it backwards pads the wrong axis by a
   * factor of about five.
   */
  textAlongAxis = false,
): DimensionLayout => {
  const type = figureType(fontSize)
  const said = new Map(linesOf(model, format).map((each) => [each.code, each.lines]))
  const extents = (lines: ReadonlyArray<string>) => {
    const wide = figureWidth(lines, type)
    const deep = figureHeight(lines.length, type)
    return textAlongAxis ? { across: deep, along: wide } : { across: wide, along: deep }
  }
  const across = [...model.widths, ...model.angles]
  const figures: Array<DimensionFigure> = [
    ...across.map((each, index) => {
      const side: Side = sides === 'both' && index % 2 === 1 ? 'plus' : 'minus'
      const lines = said.get(each.code) ?? []
      return { code: each.code, side, band: 0, lane: null, lines, ...extents(lines) }
    }),
    ...model.lengths.map((each) => {
      const side: Side = sides === 'both' && each.lane % 2 === 1 ? 'plus' : 'minus'
      const lane = sides === 'both' ? Math.floor(each.lane / 2) : each.lane
      const lines = said.get(each.code) ?? []
      return { code: each.code, side, band: lane + 1, lane, lines, ...extents(lines) }
    }),
  ]

  const bandsOn = (side: Side): Array<number> => {
    const mine = figures.filter((each) => each.side === side)
    const count = Math.max(0, ...mine.map((each) => each.band)) + 1
    return Array.from({ length: mine.length === 0 ? 0 : count }, (_, band) =>
      Math.max(0, ...mine.filter((each) => each.band === band).map((each) => each.across)),
    )
  }

  return { figures, bands: { minus: bandsOn('minus'), plus: bandsOn('plus') } }
}
