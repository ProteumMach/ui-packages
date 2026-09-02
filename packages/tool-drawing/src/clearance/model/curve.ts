/**
 * The feature's reach curve, and how the drawing reads it.
 *
 * **Declared structurally, on purpose.** The shape is exactly what
 * `@toolpath/part-contracts` calls a `ReachCurve`, and naming it here rather
 * than importing it is one of the three senses in which this overlay stays
 * optional: a consumer that draws a tool alone pulls in no Toolpath schema.
 * A `ReachCurve` from the API satisfies this by structure, with no adapter.
 */

/**
 * The worst-case material around a feature, as a staircase.
 *
 * Read as "material within `horizontalOffset[i]` of the cut rises to
 * `verticalOffset[i]`". Both are in millimetres; the offsets run outward from
 * the cutting edge and the heights up from the bottom of the feature.
 */
export interface ReachCurve {
  readonly horizontalOffset: ReadonlyArray<number>
  readonly verticalOffset: ReadonlyArray<number>
}

/** Room the shop wants kept between the stack and the part, in millimetres. */
export interface Margins {
  readonly radial: number
  readonly axial: number
}

export const NO_MARGINS: Margins = { radial: 0, axial: 0 }

/** A hair, as the sweep's own tolerance: a gap a femtometre under the room wanted is the room wanted. */
export const GAP_TOLERANCE = 1e-6

/**
 * The tallest material within `offset` mm of the cut, above the feature's bottom.
 *
 * **The one piece of the verdict's own arithmetic that had to travel.** The
 * decision — whether an assembly clears — stays with the catalog's
 * tool-selection engine, which has a dozen callers that never draw anything.
 * This is not that decision: it is the reading of the curve that the drawn
 * staircase is drawn from, and the gaps this overlay dimensions are measured
 * against. It is here because {@link tightestGaps} cannot be written without
 * it, and it must keep agreeing with whatever draws the material profile — the
 * rise comes at the *start* of each run, so everything out to a knot is
 * already as tall as that knot says.
 */
export const heightAt = (curve: ReachCurve, offset: number): number => {
  // "Material within h[i] rises to v[i]": for an offset between knots the
  // material could be anywhere out to the next knot, so the next knot's height
  // is the bound. Past the last knot the curve clamps.
  for (let index = 0; index < curve.horizontalOffset.length; index += 1) {
    if ((curve.horizontalOffset[index] ?? 0) >= offset) {
      return curve.verticalOffset[index] ?? 0
    }
  }
  return curve.verticalOffset[curve.verticalOffset.length - 1] ?? 0
}

/**
 * Where the wall face stands at a given height, as an offset from the cut:
 * the start of the first run of the staircase that rises above that height.
 * Null where nothing stands that tall — no wall to measure to.
 */
export const wallFaceAt = (curve: ReachCurve, z: number): number | null => {
  let from = 0
  for (let index = 0; index < curve.horizontalOffset.length; index += 1) {
    if ((curve.verticalOffset[index] ?? 0) > z + GAP_TOLERANCE) {
      return from
    }
    from = curve.horizontalOffset[index] ?? from
  }
  return null
}
