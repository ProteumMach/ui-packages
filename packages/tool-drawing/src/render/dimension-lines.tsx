import type { Extent, Frame, Padding } from '../model/frame.js'
import { AWAY_FROM_TIP, TOWARD_MINUS, TOWARD_PLUS, TOWARD_TIP, arrowhead } from './arrows.js'
import {
  bandOffset,
  figureType,
  laneOffset,
  stackLabels,
  type BandRoom,
  type DimensionFigure,
  type DimensionLayout,
  type Side,
  type ToolDimensions,
} from '../model/dimensions.js'

/**
 * Dimensions, drawn the way a drawing draws them.
 *
 * **Every figure lives in a margin, never inside the drawing** (Paul,
 * 2026-09-01, after three goes at placing them among the lines). Anywhere
 * inside there is something to land on — the tool, a leader, a lane line,
 * another figure — and a rule of the form "beside its own line, unless"
 * produced exactly the smudge it was written to avoid.
 *
 * **But beside its own line.** The margin is a series of bands rather than one
 * column: the widths stand in the first, just past their arrows, and each
 * length's figure stands in the band outboard of its own lane, so the number
 * for the flute length is at the flute length rather than out beside the
 * overall length (Paul, 2026-09-01). `model/dimensions.ts` works out the
 * bands; this draws them, and keeps a figure off the extension lines that
 * cross its band by stacking it clear of them.
 *
 * **A width is dimensioned from outside.** A line drawn across a ⌀6 shank at
 * this scale is a line drawn *over the tool*, so the two arrows stand outside
 * the silhouette and point inward at the faces they measure, which is what a
 * drawing does with a dimension too narrow to hold them.
 *
 * ## Everything is placed in millimetres, and mapped last
 *
 * This took a screen-space frame — an `x(r)` and a `y(z)` — which is the same
 * thing as assuming the tool stands upright. Every placement here is now in
 * the outline's own space, radius and height, and reaches the sheet only
 * through `toX`/`toY`. Arrowheads are built from a direction in that space
 * rather than from `'up' | 'down' | 'left' | 'right'`, and the stacker moves a
 * clash *away from the tip* rather than *up*.
 */

export interface DimensionLinesProps {
  readonly model: ToolDimensions
  readonly layout: DimensionLayout
  readonly frame: Frame
  readonly outline: Extent
  readonly room: BandRoom
  /**
   * The chrome that was asked for, in pixels.
   *
   * The frame may have granted less — it caps chrome so annotation cannot
   * starve the drawing — and everything here is placed in the margin the frame
   * actually gave, scaled back in the same proportion. Drawn at the full
   * request against a capped margin, the outermost figures hang off the sheet.
   */
  readonly requested: Padding
  readonly ink: string
  readonly ground: string
}

export const DimensionLines = ({
  model,
  layout,
  frame,
  outline,
  room,
  requested,
  ink,
  ground,
}: DimensionLinesProps) => {
  const { fontSize, scale } = frame
  const head = fontSize * 0.9
  const type = figureType(fontSize)
  const lineHeight = type * 1.15
  const inset = type * 0.45

  /** A length in pixels, as the millimetres the drawing is drawn in. */
  const mm = (pixels: number) => pixels / scale
  const sign = (side: Side) => (side === 'minus' ? -1 : 1)
  /** How much of what this flank asked for it actually got. */
  const granted = (side: Side) => {
    const asked = side === 'minus' ? requested.minus : requested.plus
    const got = side === 'minus' ? frame.padding.minus : frame.padding.plus
    return asked > 0 ? got / asked : 1
  }
  const at = (r: number, z: number) => `${frame.toX(r, z).toFixed(2)},${frame.toY(r, z).toFixed(2)}`

  /** The edge of the drawn tool on one flank: where an extension line starts. */
  const edgeAt = (side: Side) => sign(side) * outline.radius
  /** Where a lane's line runs, as a signed radius. */
  const laneAt = (lane: number, side: Side) =>
    sign(side) * (outline.radius + mm(laneOffset(layout.bands[side], lane, room) * granted(side)))
  /** A band's inboard edge, which is where its figures read outward from. */
  const bandAt = (band: number, side: Side) =>
    sign(side) * (outline.radius + mm(bandOffset(layout.bands[side], band, room) * granted(side)))

  const placeOf = new Map(layout.figures.map((each) => [each.code, each]))

  /** Where a figure's leader starts: the thing on the tool that it names. */
  const wants = (figure: DimensionFigure): { r: number; z: number } => {
    if (figure.lane === null) {
      const angle = model.angles.find((each) => each.code === figure.code)
      if (angle) {
        // A leader onto the flank itself: the angle is between two faces, and
        // there is no room to draw it between them on a ⌀1 drill.
        return { r: angle.at.r * sign(figure.side), z: angle.at.z }
      }
      const width = model.widths.find((each) => each.code === figure.code)
      return { r: (width?.radius ?? 0) * sign(figure.side), z: width?.at ?? 0 }
    }
    const length = model.lengths.find((each) => each.code === figure.code)
    return {
      r: laneAt(figure.lane, figure.side),
      /**
       * **At the top of its dimension, not the middle of it** (Paul,
       * 2026-09-01). A figure halfway down a 50 mm dimension is level with
       * nothing on the tool; at the top it is level with the arrow it belongs
       * to.
       */
      z: Math.max(length?.from ?? 0, length?.to ?? 0),
    }
  }

  /** One figure's box, in millimetres: inboard edge across, and low end along. */
  const boxOf = (figure: DimensionFigure) => {
    const inboard = bandAt(figure.band, figure.side)
    const across = mm(figure.across * granted(figure.side))
    const along = mm(figure.along)
    return {
      // Outward from the band's inboard edge, on this flank.
      from: inboard,
      to: inboard + sign(figure.side) * across,
      across,
      along,
    }
  }

  /**
   * The lines a figure must not sit on: every extension line, which runs from
   * the tool out to its own lane and so crosses the bands inboard of it.
   *
   * They are given to the stacker as boxes that cannot move, so a figure with
   * nowhere to sit rises until it is clear rather than landing on one.
   */
  const obstacles = model.lengths.flatMap((each) => {
    const place = placeOf.get(each.code)
    if (place === undefined || place.lane === null) {
      return []
    }
    const lane = laneAt(place.lane, place.side)
    const edge = edgeAt(place.side)
    const thickness = mm(figureType(fontSize) * 0.7 * scale)
    return [each.from, each.to].map((height, index) => ({
      key: `line-${each.code}-${String(index)}`,
      across: Math.min(lane, edge),
      width: Math.abs(lane - edge),
      along: height - thickness / 2,
      height: thickness,
    }))
  })

  /** Where each figure ends up, once none covers another or a line. */
  const placed = stackLabels(
    layout.figures.map((figure) => {
      const box = boxOf(figure)
      const start = wants(figure)
      return {
        key: figure.code,
        across: Math.min(box.from, box.to),
        width: box.across,
        along: start.z,
        height: box.along,
      }
    }),
    mm(type * 0.5 * scale),
    obstacles,
  )

  return (
    <g data-dimensions>
      {model.lengths.map((each) => {
        const place = placeOf.get(each.code)
        if (place === undefined || place.lane === null) {
          return null
        }
        const lane = laneAt(place.lane, place.side)
        const edge = edgeAt(place.side)
        /**
         * Closer together than the arrows are long, they meet nose to nose —
         * so they go outside the line and point back in, which is what a
         * drawing does with a dimension too short to hold them.
         */
        const inside = Math.abs(each.to - each.from) >= head * 2.6
        const reach = head * 2.2
        return (
          <g key={each.code} data-dimension={each.code}>
            <line
              x1={frame.toX(lane, each.from)}
              y1={frame.toY(lane, each.from)}
              x2={frame.toX(edge, each.from)}
              y2={frame.toY(edge, each.from)}
              stroke={ink}
              strokeOpacity={0.4}
              strokeWidth={fontSize * 0.05}
            />
            <line
              x1={frame.toX(lane, each.to)}
              y1={frame.toY(lane, each.to)}
              x2={frame.toX(edge, each.to)}
              y2={frame.toY(edge, each.to)}
              stroke={ink}
              strokeOpacity={0.4}
              strokeWidth={fontSize * 0.05}
            />
            <line
              x1={frame.toX(lane, inside ? each.from : each.from - reach)}
              y1={frame.toY(lane, inside ? each.from : each.from - reach)}
              x2={frame.toX(lane, inside ? each.to : each.to + reach)}
              y2={frame.toY(lane, inside ? each.to : each.to + reach)}
              stroke={ink}
              strokeWidth={fontSize * 0.07}
            />
            <polygon
              points={arrowhead(lane, each.from, inside ? TOWARD_TIP : AWAY_FROM_TIP, head, frame)}
              fill={ink}
            />
            <polygon
              points={arrowhead(lane, each.to, inside ? AWAY_FROM_TIP : TOWARD_TIP, head, frame)}
              fill={ink}
            />
          </g>
        )
      })}

      {/*
        A width, dimensioned from outside: two barbs standing off the faces
        they measure, pointing in. Nothing is drawn across the tool.
      */}
      {model.widths.map((each) => {
        const stand = head * 2.4
        return (
          <g key={each.code} data-dimension={each.code}>
            <line
              x1={frame.toX(-each.radius - stand, each.at)}
              y1={frame.toY(-each.radius - stand, each.at)}
              x2={frame.toX(-each.radius, each.at)}
              y2={frame.toY(-each.radius, each.at)}
              stroke={ink}
              strokeWidth={fontSize * 0.07}
            />
            <polygon
              points={arrowhead(-each.radius, each.at, TOWARD_PLUS, head, frame)}
              fill={ink}
            />
            <line
              x1={frame.toX(each.radius, each.at)}
              y1={frame.toY(each.radius, each.at)}
              x2={frame.toX(each.radius + stand, each.at)}
              y2={frame.toY(each.radius + stand, each.at)}
              stroke={ink}
              strokeWidth={fontSize * 0.07}
            />
            <polygon
              points={arrowhead(each.radius, each.at, TOWARD_MINUS, head, frame)}
              fill={ink}
            />
          </g>
        )
      })}

      {/*
        The figures, each in its own band with a leader back to the line it
        belongs to. Drawn last, so nothing is drawn over them.
      */}
      {layout.figures.map((figure) => {
        const box = boxOf(figure)
        const start = wants(figure)
        const low = placed.get(figure.code) ?? start.z
        // The box, mapped: two opposite corners in millimetres become a
        // rectangle on the sheet, whichever way the axis runs.
        const one = { x: frame.toX(box.from, low), y: frame.toY(box.from, low) }
        const two = {
          x: frame.toX(box.to, low + box.along),
          y: frame.toY(box.to, low + box.along),
        }
        const rect = {
          x: Math.min(one.x, two.x),
          y: Math.min(one.y, two.y),
          width: Math.abs(one.x - two.x),
          height: Math.abs(one.y - two.y),
        }
        // The leader turns inboard of the band, where no figure stands.
        const turn = box.from - sign(figure.side) * mm(type * 0.5 * scale)
        const middleZ = low + box.along / 2
        /**
         * Which way the type reads out of the band.
         *
         * Asked of the frame rather than assumed: on a tool drawn along the
         * sheet both flanks sit at the same place across it, and the honest
         * answer there is centred. Nothing here branches on orientation — it
         * compares where the mapping actually put two points.
         */
        const anchorX = frame.toX(box.from, middleZ)
        const axisX = frame.toX(0, middleZ)
        const apart = Math.abs(anchorX - axisX) > mm(1)
        const textAnchor = apart ? (anchorX < axisX ? 'end' : 'start') : 'middle'
        const textX = apart ? anchorX : rect.x + rect.width / 2
        return (
          <g key={`figure-${figure.code}`} data-figure={figure.code}>
            <polyline
              points={`${at(start.r, start.z)} ${at(turn, start.z)} ${at(turn, middleZ)}`}
              fill="none"
              stroke={ink}
              strokeOpacity={0.35}
              strokeWidth={fontSize * 0.05}
            />
            <rect
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill={ground}
              rx={type * 0.2}
            />
            {figure.lines.map((line, index) => (
              <text
                key={line}
                x={textX}
                y={rect.y + inset + type * 0.85 + lineHeight * index}
                fontSize={type}
                textAnchor={textAnchor}
                fill={ink}
                fontFamily="ui-monospace, monospace"
              >
                {line}
              </text>
            ))}
          </g>
        )
      })}
    </g>
  )
}
