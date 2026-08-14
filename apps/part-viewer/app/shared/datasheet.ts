import type { components } from '@toolpath/api'
import type { PartFeature } from './contracts'

type Vec3 = components['schemas']['Vec3']

/**
 * The Engine's datasheet, as a shape rather than as a bag.
 *
 * Our OpenAPI document types `FeatureDatasheet` as `{ [key: string]: unknown }`
 * — accurate, and useless to arithmetic. Every measurement in `metrics.ts`
 * reads a named field of it, and reading those through `unknown` casts at each
 * site would put a hundred unchecked reads in the file that most needs to be
 * checkable.
 *
 * So the shape lives here, ported from the feature picker's own API types,
 * with **one** cast at the boundary — `readDatasheet` below — and every field
 * optional. Optional is not caution: the datasheet is genuinely sparse, the
 * kernel adds and drops fields between versions, and a metric whose field is
 * absent is supposed to return `null` rather than throw. A wrong shape here
 * shows up as a metric that goes quiet, which `metrics.ts` already treats as an
 * answer.
 *
 * When the OpenAPI document types the datasheet properly, this file is deleted
 * and the import moves to `@toolpath/api`.
 */

export type CdRange = {
  readonly min: number
  readonly max: number
}

/** Cutter-diameter bands derived from the feature's tolerance band. */
export type CdFacts = {
  readonly ignore?: CdRange
  readonly deviate?: CdRange
  readonly effectiveAdaptive?: CdRange
  readonly terminalCornerRadius?: number | null
}

/**
 * Dropped from the datasheet in kernel 0.4.0, which is measurement facts only.
 * Kept in the type so a report captured before then still reads.
 */
export type CdQuantiles = {
  readonly dim?: number
  readonly diameters?: readonly number[]
  readonly clearanceRatios?: readonly number[]
  readonly featureHypervol?: number
}

export type ToolFit = {
  readonly toolDiameter?: number
  readonly toolBottomDiameter?: number
  readonly cornerRadius?: number
}

export type HoleFacts = {
  readonly kind: 'Hole'
  readonly cd?: CdFacts
  readonly diameter?: number
  readonly filletHeight?: number
  readonly filletRadius?: number
  /** Radians, before kernel 0.4.0. */
  readonly fullConeRad?: number
  /** Degrees, from kernel 0.4.0: every angle in the API is degrees. */
  readonly fullConeDeg?: number
  readonly holeProcess?: string
  readonly isCounterbore?: boolean
  readonly maxDrillDiameter?: number
  readonly maxEndmillDiameter?: number
  readonly maxSpotDiameter?: number | null
}

export type BossFacts = {
  readonly kind: 'Boss'
  readonly cd?: CdFacts
  readonly filletHeight?: number
  readonly filletRadius?: number
  readonly maxBottomDiameter?: number | null
}

export type PocketFacts = {
  readonly kind: 'Pocket'
  readonly cd?: CdFacts
  readonly cdquantiles?: CdQuantiles
  readonly filletHeight?: number
  readonly filletRadius?: number
  readonly maxBottomDiameter?: number | null
}

export type FaceFacts = {
  readonly kind: 'Face'
  readonly cd?: CdFacts
  readonly cdquantiles?: CdQuantiles
  readonly isFacing?: boolean
  readonly isTopFace?: boolean
  readonly maxBottomDiameter?: number | null
  readonly needsSidemill?: boolean
}

export type WallFacts = {
  readonly kind: 'Wall'
  readonly cd?: CdFacts
  readonly cdquantiles?: CdQuantiles
}

export type ProfileFacts = {
  readonly kind: 'Profile'
  readonly cd?: CdFacts
  readonly cdquantiles?: CdQuantiles
  readonly isModified?: boolean
  /** Before kernel 0.4.0, where a `Mm` suffix meant what the units now imply. */
  readonly lengthMm?: number
  /** From kernel 0.4.0: an unsuffixed length is millimetres. */
  readonly length?: number
}

/** Backs `inner_fillet`, `outer_fillet`, and `contour_surface`. */
export type ThreeFacts = {
  readonly kind: 'Three'
  readonly cd?: CdFacts
  readonly filletRadius?: number
  readonly hasSharpCorner?: boolean
  readonly isUShapedFillet?: boolean
  readonly maxBottomDiameter?: number | null
  readonly maxStepdown?: number
  readonly surfaceFinishCuspHeight?: number
  readonly toolFit?: ToolFit
  readonly useOnlyBallToolsForFinish?: boolean
}

export type CountersinkFacts = {
  readonly center?: Vec3
  readonly innerRadius?: number
  readonly outerRadius?: number
}

export type BevelParams = {
  readonly maxBotVerticalExcess?: number
  readonly maxBottomDiameterAtMaxBotVerticalExcess?: number
  readonly maxDiameterAtZFeatureTop?: number | null
  readonly maxTopVerticalExcess?: number | null
}

export type BevelFacts = {
  /** Radians, before kernel 0.4.0. */
  readonly angleRad?: number
  /** Degrees, from kernel 0.4.0. */
  readonly angleDeg?: number
  readonly countersink?: CountersinkFacts
  readonly isOpenPocketBottom?: boolean
  readonly lowerAdjacentMinDepth?: number
  readonly params?: BevelParams
  readonly slant?: number
}

/** Backs `chamfer`, `sink`, and `slanted_face`; nests a `Three` alongside. */
export type ChamferFacts = {
  readonly kind: 'Chamfer'
  readonly bevel?: BevelFacts
  readonly three?: ThreeFacts
}

export type TslotFacts = {
  readonly kind: 'Tslot'
  readonly cd?: CdFacts
  readonly filletRadius?: number
  readonly isClosed?: boolean
  readonly isExternal?: boolean
  readonly maxEntryCd?: number | null
  readonly undercutDepth?: number | null
}

export type DovetailFacts = {
  readonly kind: 'Dovetail'
  readonly bottomOpeningWidth?: number
  readonly cd?: CdFacts
  readonly filletRadius?: number
  readonly floorWidth?: number
  readonly isExternal?: boolean
  readonly isInvalidGeometry?: boolean
  /** Radians, before kernel 0.4.0. */
  readonly taperRad?: number
  /** Degrees, from kernel 0.4.0. */
  readonly taperDeg?: number
  readonly topOpeningWidth?: number
}

/**
 * Discriminated on `kind` — ten variants beneath eighteen `featureType` values,
 * in a stable many-to-one relationship (see `FACTS_KIND_BY_FEATURE_TYPE`).
 */
export type FeatureFacts =
  | BossFacts
  | ChamferFacts
  | DovetailFacts
  | FaceFacts
  | HoleFacts
  | PocketFacts
  | ProfileFacts
  | ThreeFacts
  | TslotFacts
  | WallFacts

export type FactsKind = FeatureFacts['kind']

export type ToleranceBand = {
  readonly atolMax?: number
  readonly atolIgnore?: number
  readonly atolDeviate?: number
}

export type DepthVariation = {
  readonly deltaX?: readonly number[]
  readonly deltaY?: readonly number[]
}

export type FeatureDatasheet = {
  readonly facts: FeatureFacts
  /** The kernel's own PascalCase name for the type, e.g. `ThroughHole`. */
  readonly featureType?: string
  readonly hasWall?: boolean
  readonly hasFloor?: boolean
  /**
   * The feature's extent along the tool axis, as **Z coordinates in part
   * space** rather than as depths — despite the names.
   *
   * Observed directly: on a 120-feature part every feature reports a non-zero
   * `minDepth`, several report negative values (`minDepth: -7.67`,
   * `maxDepth: -1.48`), and a flat `face` reports the two as equal. A depth
   * cannot be negative and a face has none, so these are the bottom and top of
   * the feature and its depth is the difference.
   *
   * A coming kernel renames them to `zMin` and `zMax`, which is what they have
   * always been. Both spellings are read, so the app spans the change.
   */
  readonly maxDepth?: number
  readonly minDepth?: number
  readonly zMax?: number
  readonly zMin?: number
  /**
   * The part's own Z bounds **in this feature's machining direction**, from
   * kernel 0.5.0.
   *
   * In the same frame as `zMin`/`zMax`, which is what makes them subtractable:
   * the height from the top of the part to the bottom of the feature is
   * `partZMax - zMin`. Before this the app derived a top by taking the highest
   * `zMax` among features cut the same way, which is only the highest surface
   * the Engine attributed to that direction and not the top of the stock.
   */
  readonly partZMax?: number
  readonly partZMin?: number
  readonly extendedMaxDepth?: number
  readonly extendedMinDepth?: number
  /**
   * The same bounds including the run-out a tool needs to clear the feature,
   * renamed from `extendedMaxDepth`/`extendedMinDepth` in kernel 0.5.0.
   *
   * Where a cutter actually has to start from, which is why this rather than
   * `zMax` stands in for the top of the part when the report carries no
   * `partZMax`.
   */
  readonly extendedZMax?: number
  readonly extendedZMin?: number
  readonly wallishArea?: number
  readonly floorishArea?: number
  readonly toleranceBand?: ToleranceBand
  readonly depthVariation?: DepthVariation
  readonly axialStockToLeave?: number
  readonly radialStockToLeave?: number
}

/**
 * The datasheet of a feature, typed.
 *
 * The cast is the whole point of this module and the only one: the payload is
 * parsed JSON, every field is optional, and nothing downstream may assume a
 * field is there because the type says it could be.
 */
export function readDatasheet(feature: PartFeature): FeatureDatasheet | null {
  return (feature.datasheet as FeatureDatasheet | null | undefined) ?? null
}
