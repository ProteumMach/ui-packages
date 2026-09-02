import { useEffect, useRef, useState, type ReactNode } from 'react'
import { assemblyOutline } from '../model/outline.js'
import { frameFor, orientationFor, typeSizeFor, type Box, type Padding } from '../model/frame.js'
import {
  bandRoom,
  dimensionLayout,
  dimensionsFor,
  formatMillimetres,
  type BandRoom,
  type FormatLength,
} from '../model/dimensions.js'
import type { ViewerAssembly } from '../model/types.js'
import { SHEETS, assumedNames, sectionFill, type Theme } from './sheet.js'
import { joins, sectionPoints, silhouettePath } from './silhouette.js'
import { DimensionLines } from './dimension-lines.js'
import { DrawingProvider } from './drawing-context.js'

/**
 * The assembly, drawn.
 *
 * A side elevation from stated dimensions, fitted to the stack so the assembly
 * fills the panel. Nothing here measures or scales: {@link frameFor} settled
 * all of that, and this places what it decided.
 *
 * **Outlined, not blocked in** (Paul, 2026-09-01, against the drawings in the
 * geometry write-up): a drawing of a tool is a silhouette with its sections
 * shaded lightly, so a dimension line that crosses it stays readable.
 *
 * **Every line is solid**: flutes pale yellow, shank one light grey whatever
 * its provenance, the holder grey up to the spindle connection, which is
 * darker. What was derived or assumed is on the element as `data-provenance`,
 * and named in the note under the drawing.
 */
export interface ToolDrawingProps {
  readonly assembly: ViewerAssembly
  /**
   * The sheet to draw on. A package cannot reach the application's theme hook,
   * so the application passes its own; dark is the default because the sheet
   * that needed stating was the dark one.
   */
  readonly theme?: Theme
  /** The name over the drawing. Falls back to the tool's own label. */
  readonly caption?: string
  /**
   * Draw the dimensions: every stated length and width, on the tool.
   *
   * Off by default, because the drawing is also used small — on a card beside
   * a list, where a dimension line is noise. The panel that has room turns it
   * on (Paul, 2026-09-01).
   */
  readonly dimensions?: boolean
  /**
   * Which flanks the dimension lanes may use.
   *
   * **Both, wherever both are free** (Paul, 2026-09-01): four lengths stacked
   * down one side push the tool into the other half of the panel and read as a
   * ladder. Where the drawing has something beside it — a feature section —
   * the far flank belongs to that and the lanes stay on one.
   */
  readonly dimensionSides?: 'one' | 'both'
  /**
   * How a length is written out. Millimetres in, a string out.
   *
   * The application's, because the unit a shop reads in is the application's
   * and owning one would mean owning its rounding too.
   */
  readonly formatLength?: FormatLength
  /**
   * Extra room for chrome around the drawing, in pixels, on top of whatever
   * the dimension bands ask for.
   *
   * Per flank where the caller needs it asymmetrically — drawing a feature
   * section beside the tool means reserving the `plus` flank for it, and the
   * overlay draws in exactly the room reserved.
   */
  readonly padding?: number | Partial<Padding>
  /**
   * What the sweep found fouling the material, as data.
   *
   * The verdict itself is not this package's: whether an assembly clears is
   * answered by the caller's own engine, for a dozen callers that draw
   * nothing. This is that answer's picture — the sections it names are painted
   * as struck rather than as metal.
   *
   * **Matched by height as well as by part**, because one part can emit
   * several segments: a holder's stated body and the diameter carried up above
   * it are both `body`, and only one of them may be in the material.
   */
  readonly collisions?: ReadonlyArray<{ readonly part: string; readonly height: number }>
  /**
   * The clearance verdict, for the caption: whether it cleared, and a sentence
   * saying by how much. `@toolpath/tool-drawing/clearance` writes the sentence.
   */
  readonly verdict?: { readonly clears: boolean; readonly note?: string | null } | null
  /**
   * Drawn inside the sheet, over the tool: the clearance overlay, or anything
   * else the caller wants in the drawing's own coordinates.
   *
   * A child rather than a prop of its own, so this module never imports the
   * overlay and a consumer that does not draw one never loads it. The frame,
   * the outline and the sheet reach it through context — see
   * `drawing-context.tsx` for why a child cannot work them out for itself.
   */
  readonly children?: ReactNode
  readonly className?: string
}

/** Type-relative line weights, carried across from the drawing this replaces. */
const STROKE = { silhouette: 0.09, edge: 0.09, chord: 0.06, centre: 0.05 }

/** Room around a drawing that carries no dimensions, in pixels. */
const DEFAULT_PADDING = 16

/** What a section that fouls the material is painted: struck, not metal. */
const STRUCK = '#f87171'

export const ToolDrawing = ({
  assembly,
  theme = 'dark',
  caption,
  dimensions = false,
  dimensionSides = 'one',
  formatLength = formatMillimetres,
  padding = DEFAULT_PADDING,
  collisions,
  verdict,
  children,
  className,
}: ToolDrawingProps) => {
  const sheet = SHEETS[theme]
  /**
   * The shape of the panel, measured.
   *
   * Zero until the observer fires, and on a server. {@link frameFor} reads
   * that as "not measured yet" and frames against a plain landscape sheet, so
   * the first paint is a sensible drawing rather than a visibly wrong one that
   * jumps when the observer settles.
   */
  const element = useRef<SVGSVGElement>(null)
  const [box, setBox] = useState<Box>({ width: 0, height: 0 })
  useEffect(() => {
    const svg = element.current
    if (!svg || typeof ResizeObserver === 'undefined') {
      return
    }
    const watch = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect
      if (measured && measured.width > 0 && measured.height > 0) {
        setBox({ width: measured.width, height: measured.height })
      }
    })
    watch.observe(svg)
    return () => {
      watch.disconnect()
    }
  }, [])

  const { tool, holder } = assembly
  const name = caption ?? tool.label ?? tool.form
  const outline = assemblyOutline(assembly)

  /**
   * **An undrawable form is said in words, not drawn plausibly.**
   *
   * The whole of the honesty rule is that a shape nobody stated is not
   * invented, and a silent cylinder is how an invented shape ships: it
   * renders, it looks right, and it is wrong. So the two ways a drawing can
   * fail are told apart and both name what was being drawn — a reader who is
   * shown nothing is owed the reason.
   */
  if (outline === null) {
    const missing = tool.geometry.DC === undefined || tool.geometry.LCF === undefined
    return (
      <p
        data-undrawable={tool.form}
        className={className}
        style={{ background: sheet.ground, color: sheet.dimension, padding: '1rem', margin: 0 }}
      >
        {missing
          ? `${name} states no cutting diameter or flute length, so there is nothing to draw.`
          : `${name} is a ${tool.form}, and this drawing has no shape for that form — so it is not drawn, rather than drawn wrong.`}
      </p>
    )
  }

  /**
   * **The padding seam.**
   *
   * The bands are measured in type, and the type size is settled by the panel
   * alone — so a band's width in *pixels* does not depend on the scale, and
   * asking for the room they need cannot change the answer. That is the whole
   * reason padding is stated in pixels: in millimetres it would depend on the
   * scale, which depends on the padding, and the arithmetic would chase its
   * own tail. So the order is: measure the panel, size the type, lay the bands
   * out, total them, and only then build the frame.
   */
  const typePx = typeSizeFor(box)
  const model = dimensions ? dimensionsFor(assembly) : null
  const room: BandRoom = { arrow: typePx * 0.9 * 2.4, gap: typePx * 0.5 }
  const layout =
    model === null
      ? null
      : dimensionLayout(
          model,
          formatLength,
          typePx,
          dimensionSides,
          orientationFor(box) === 'horizontal',
        )
  const asked: Padding =
    typeof padding === 'number'
      ? { minus: padding, plus: padding, along: padding }
      : {
          minus: padding.minus ?? DEFAULT_PADDING,
          plus: padding.plus ?? DEFAULT_PADDING,
          along: padding.along ?? DEFAULT_PADDING,
        }
  const chrome: Padding =
    layout === null
      ? asked
      : {
          minus: asked.minus + bandRoom(layout.bands.minus, room) + room.gap,
          plus: asked.plus + bandRoom(layout.bands.plus, room) + room.gap,
          // Headroom for one figure's depth past each end: the stacker moves a
          // clash away from the tip, so the outermost figure of a crowded tool
          // ends up past the top of what it measures.
          along: asked.along + Math.max(0, ...layout.figures.map((each) => each.along)),
        }

  const frame = frameFor(outline, box, { padding: chrome })
  const { fontSize } = frame
  const assumed = assumedNames(outline.segments)
  const line = (r: number, z: number) => ({ x: frame.toX(r, z), y: frame.toY(r, z) })
  // A centreline runs a little past both ends of the part, as a drawing draws
  // one. Type-relative, so it keeps its proportion at any scale.
  const overhang = fontSize * 1.2
  const from = line(0, -overhang)
  const to = line(0, outline.height + overhang)

  return (
    <figure
      className={className}
      style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%', margin: 0 }}
    >
      <figcaption
        style={{
          display: 'flex',
          padding: '0.5rem 0.75rem',
          fontSize: '0.75rem',
          fontFamily: 'ui-monospace, monospace',
          color: sheet.dimension,
        }}
      >
        {name}
        {verdict ? (
          <span
            data-verdict={verdict.clears ? 'clears' : 'collides'}
            style={{ marginLeft: 'auto', color: verdict.clears ? sheet.dimension : STRUCK }}
          >
            {verdict.clears ? 'clears the part' : 'collides with the part'}
          </span>
        ) : null}
      </figcaption>
      {verdict?.note ? (
        <p
          data-verdict-note
          style={{
            padding: '0 0.75rem 0.25rem',
            fontSize: '0.625rem',
            color: sheet.dimension,
            margin: 0,
          }}
        >
          {verdict.note}
        </p>
      ) : null}
      <svg
        ref={element}
        role="img"
        aria-label={`${name}, drawn from its stated dimensions`}
        viewBox={frame.viewBox}
        style={{ background: sheet.ground, flex: 1, minHeight: 0, borderRadius: '0.25rem' }}
        /*
          **Do not change this.** `xMidYMid meet` fits the viewBox by the
          smaller of its own two ratios, and `frameFor` chooses `scale` so that
          the binding ratio is exactly `scale`. Under `none` the drawing
          stretches and every number the frame reports — the scale, and the
          type size derived from it — is a lie on one axis.
        */
        preserveAspectRatio="xMidYMid meet"
      >
        {/*
          Each segment mirrored about the axis: a body of revolution in
          elevation. The **fills** are per section, because a section that
          fouls the part is painted on its own; the **outline** is one stroke
          around the whole silhouette, so a join between two sections of the
          same radius is not drawn as an edge.

          **One per segment, not one per part.** A part can emit several
          segments — see `silhouette.ts` — so the key carries the index and
          nothing below groups by `data-part`.
        */}
        {outline.segments.map((segment, index) => {
          const struck = (collisions ?? []).some(
            (each) =>
              each.part === segment.part &&
              each.height >= Math.min(...segment.points.map((point) => point.z)) - 1e-6 &&
              each.height <= Math.max(...segment.points.map((point) => point.z)) + 1e-6,
          )
          return (
            <polygon
              key={`${segment.part}-${String(index)}`}
              data-part={segment.part}
              data-provenance={segment.provenance}
              {...(struck ? { 'data-struck': 'true' } : {})}
              points={sectionPoints(segment, frame)}
              fill={struck ? STRUCK : sectionFill(segment, sheet)}
              fillOpacity={struck ? 0.75 : 1}
              stroke="none"
            />
          )
        })}

        {joins(outline.segments).map((join, index) => {
          const start = line(-join.radius, join.z)
          const end = line(join.radius, join.z)
          return (
            <line
              key={`join-${join.part}-${String(index)}`}
              data-join={join.part}
              data-stepped={join.stepped ? 'true' : 'false'}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={sheet.ink}
              strokeOpacity={join.stepped ? 1 : 0.35}
              strokeWidth={fontSize * (join.stepped ? STROKE.edge : STROKE.chord)}
              {...(join.stepped
                ? {}
                : {
                    strokeDasharray: `${(fontSize * 0.5).toFixed(2)} ${(fontSize * 0.4).toFixed(2)}`,
                  })}
            />
          )
        })}

        {/* The silhouette, in one stroke: up the right side and down the left. */}
        <path
          data-silhouette
          d={silhouettePath(outline.segments, frame)}
          fill="none"
          stroke={sheet.ink}
          strokeWidth={fontSize * STROKE.silhouette}
          strokeLinejoin="round"
        />

        <DrawingProvider value={{ frame, outline, sheet }}>{children}</DrawingProvider>

        {model !== null && layout !== null ? (
          <DimensionLines
            model={model}
            layout={layout}
            frame={frame}
            outline={outline}
            room={room}
            requested={chrome}
            ink={sheet.dimension}
            ground={sheet.ground}
          />
        ) : null}

        {/*
          The centreline, as a drawing draws one: long, short, long — thin, and
          in the ink rather than in the tool's own grey (Paul, 2026-09-01).
        */}
        <line
          data-centreline
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={sheet.centre}
          strokeWidth={fontSize * STROKE.centre}
          strokeDasharray={`${(fontSize * 1.6).toFixed(2)} ${(fontSize * 0.5).toFixed(2)} ${(fontSize * 0.3).toFixed(2)} ${(fontSize * 0.5).toFixed(2)}`}
        />
      </svg>
      <p
        data-provenance-note
        style={{
          padding: '0 0.75rem 0.5rem',
          fontSize: '0.625rem',
          color: sheet.dimension,
          margin: 0,
        }}
      >
        Drawn from stated dimensions{assumed.length > 0 ? `; ${assumed.join(', ')} assumed` : ''}.
        {holder !== null && holder.gaugeLength === null ? ' The holder length is not stated.' : ''}
      </p>
    </figure>
  )
}
