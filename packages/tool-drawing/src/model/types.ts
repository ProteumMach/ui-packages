/**
 * What this package needs to draw an assembly, and nothing more.
 *
 * The contract is the package's own, so nothing here depends on a particular
 * catalog's record types. A consumer writes one adapter that projects its own
 * tool onto {@link ViewerTool}; the adapter is the single file that fails
 * loudly when either side moves.
 *
 * `geometry` keeps the scraper's own field names — `DC`, `SFDM`, `OAL`, `LCF`,
 * `RE`, `SIG`, `NOF`, `shoulder-diameter`, `shoulder-length`. Renaming one here
 * would put a translation table between two vocabularies, which is where an
 * `SFDM` silently becomes a `DC`.
 *
 * All lengths are in millimetres and all angles in degrees, and every generator
 * works in whatever unit system it is handed: an inch tool yields an inch
 * outline. Converting is the caller's, at the seam where a tool meets a holder.
 */

/** Where a stated number came from. */
export type Provenance = 'vendor-stated' | 'derived' | 'assumed'

export interface ViewerTool {
  /** The CAM-library name for what the tool is: `flat end mill`, `drill`, `slot mill`. */
  readonly form: string
  readonly label?: string
  readonly geometry: Readonly<Record<string, number | undefined>>
  readonly provenance?: Readonly<Record<string, Provenance>>
}

export interface ViewerHolder {
  readonly noseDiameter: number | null
  readonly noseLength: number | null
  readonly bodyDiameter: number | null
  readonly bodyLength: number | null
  readonly projection: number | null
  readonly flangeDiameter: number | null
  readonly gaugeLength: number | null
  readonly colletSeries: string | null
  readonly colletProtrusion: number | null
  readonly provenance?: Readonly<Record<string, Provenance>>
}

/**
 * A holder as its own CAD model measures it: the silhouette, and nothing
 * parametric.
 *
 * A {@link ViewerHolder} is a handful of numbers a vendor publishes in a table,
 * and a drawing built from them is a stylised holder. This is the other thing a
 * catalog can have — the envelope measured off the vendor's STEP model, a
 * hundred-odd vertices carrying the V-flange groove and the thread relief that
 * a machinist actually looks for. **It is not a refinement of the parametric
 * form and does not project onto it**: reducing it to a nose and a body throws
 * away the only reason to measure.
 *
 * So the two are a union rather than one shape with optional extras, and
 * {@link isHolderProfile} tells them apart. A consumer that has both picks one;
 * a consumer that has neither passes `null` and the tool is drawn alone.
 */
export interface ViewerHolderProfile {
  /**
   * The silhouette as `[z, r]` in millimetres, `z` ascending.
   *
   * Two vertices share a `z` where the solid steps, so this is a polyline and
   * not a function of `z`. Fewer than two vertices is no holder and draws none.
   */
  readonly points: ReadonlyArray<readonly [z: number, r: number]>
  /**
   * What `z = 0` means.
   *
   * `gage-line` is the spindle face, with `z` increasing toward the cutting end
   * — so the taper is negative, the nose positive, and the holder's gauge
   * length is the last vertex's `z`. `nose` is the frame a holder with no taper
   * to solve a gauge plane on is measured in, and it is stated rather than
   * silently referenced to an arbitrary end: there is no gauge length to read
   * off it, and the drawing says so instead of printing one.
   */
  readonly datum: 'gage-line' | 'nose'
  /** The series the holder takes, as {@link ViewerHolder} means it. */
  readonly colletSeries: string | null
  /** How far the seated collet stands proud of the nose, in millimetres. */
  readonly colletProtrusion: number | null
  /**
   * Keyed as {@link ViewerHolder}'s is, plus `points` for the measurement
   * itself — which is `vendor-stated` unless a caller says otherwise, because
   * the shape measured is the vendor's own model rather than a derivation from
   * its table.
   */
  readonly provenance?: Readonly<Record<string, Provenance>>
}

/**
 * Which of the two holder forms this is.
 *
 * On the presence of `points` rather than on a `kind` tag, because a tag would
 * have to be added to {@link ViewerHolder} as well and every existing adapter
 * would stop compiling to gain nothing a structural check does not already
 * give.
 */
export const isHolderProfile = (
  holder: ViewerHolder | ViewerHolderProfile,
): holder is ViewerHolderProfile => 'points' in holder

export interface ViewerAssembly {
  readonly tool: ViewerTool
  readonly holder: ViewerHolder | ViewerHolderProfile | null
  /**
   * How far the tool stands out of the holder nose, in millimetres — the
   * shop's number, nobody's else. Null draws the tool alone.
   */
  readonly stickout: number | null
}
