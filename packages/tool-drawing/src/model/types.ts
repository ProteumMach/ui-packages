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

export interface ViewerAssembly {
  readonly tool: ViewerTool
  readonly holder: ViewerHolder | null
  /**
   * How far the tool stands out of the holder nose, in millimetres — the
   * shop's number, nobody's else. Null draws the tool alone.
   */
  readonly stickout: number | null
}
