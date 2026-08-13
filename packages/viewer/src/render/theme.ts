/**
 * Viewer colors.
 *
 * Plain hex numbers rather than CSS custom properties because three needs
 * numbers; wiring these to a design-token source is a separate decision. The
 * values are tuned against the viewer's light rig, and changing either in
 * isolation changes how every part reads.
 */
export interface ViewerTheme {
  /** `null` keeps the canvas transparent so the page background shows through. */
  readonly background: number | null
  readonly hemisphereSky: number
  readonly hemisphereGround: number
  readonly hemisphereIntensity: number
  readonly ambient: number
  readonly ambientIntensity: number
  /** Unhighlighted part surface. */
  readonly part: number
  readonly partEmissive: number
  /** The region under the cursor. */
  readonly hover: number
  readonly hoverEmissive: number
  /** Selected features; see also {@link HIGHLIGHT_COLORS}. */
  readonly highlight: number
  /** `EdgesGeometry` line color and opacity. */
  readonly edge: number
  readonly edgeOpacity: number
  /** The capped face of a section cut, and the cutting plane's outline. */
  readonly sectionCap: number
  readonly sectionOutline: number
  /**
   * The arrow that drags the cut, and the shell that outlines it. Hovered it
   * takes {@link ViewerTheme.hover}, like every other control here.
   */
  readonly sectionHandle: number
  readonly sectionHandleOutline: number
  /**
   * The view cube's panels, the lines between them, and its face names. A
   * hovered panel takes {@link ViewerTheme.hover}, the same color the part uses
   * — the cube is a control, and one hover color across the viewport is one
   * thing to learn.
   */
  readonly cube: number
  readonly cubeEdge: number
  readonly cubeLabel: number
}

/**
 * Selection highlight by issue type. `default` is the plain selection color;
 * the other two mark a feature the analysis flagged.
 */
export const HIGHLIGHT_COLORS = {
  default: 0xff8000,
  toolIssue: 0x9333ea,
  geometryIssue: 0xff0000,
} as const

/**
 * Per-direction color cycle for the machining-direction overlay.
 *
 * Nine entries, so a part with ten candidate directions wraps — real reports
 * carry exactly ten, which is what makes the wrap reachable rather than
 * theoretical.
 *
 * The same color identifies a direction in three places at once: on the part,
 * on its arrow, and on its row in the directions list. That triple is the point
 * of the palette — it is an identity, not a ranking, which is why the colors
 * are unordered and deliberately not a scale.
 */
export const DIRECTION_COLORS = [
  0x3b82f6, // blue
  0x14b8a6, // teal
  0xd946ef, // fuchsia
  0x06b6d4, // cyan
  /*
   * Olive, where a purple used to be.
   *
   * The purple sat one step from the violet a proposed feature is painted in,
   * so an offer laid over work already assigned to this direction was a clash
   * between "suggested" and "decided" — the two states the part is read for.
   * Olive is the only hue with room: the warm ramp belongs to the difficulty
   * bands, red to sharp corners, orange to faces being picked, and green to
   * whatever is being looked at.
   */
  0x65a30d, // olive
  0xec4899, // pink
  0x64748b, // slate
  0x10b981, // emerald
  0x6366f1, // indigo
] as const

export const DEFAULT_THEME: ViewerTheme = {
  background: null,
  hemisphereSky: 0xffffff,
  hemisphereGround: 0x000000,
  hemisphereIntensity: 2.5,
  ambient: 0x4d5168,
  ambientIntensity: 2,
  part: 0xffffff,
  partEmissive: 0x3c4051,
  /*
   * Pale amber, a step off the selection orange it leads to.
   *
   * It was a teal, which sat between two of the nine direction colors — on a
   * part painted by direction, "what the pointer is on" and "cut from way up
   * number two" were the same answer. The warm end of the wheel belongs to this
   * moment rather than to the plan: what is under the pointer, and what has
   * been picked. Nothing in the direction cycle is warm.
   */
  hover: 0xffc275,
  hoverEmissive: 0x5c3a10,
  highlight: HIGHLIGHT_COLORS.default,
  edge: 0x000000,
  edgeOpacity: 0.5,
  sectionCap: 0xc7cbd8,
  sectionOutline: 0x6bb0b3,
  sectionHandle: 0xf2f3f7,
  sectionHandleOutline: 0x3c4051,
  cube: 0xd6d9e2,
  cubeEdge: 0x71768d,
  cubeLabel: 0x3c4051,
}

export function resolveTheme(overrides?: Partial<ViewerTheme>): ViewerTheme {
  return { ...DEFAULT_THEME, ...overrides }
}

/**
 * Whether two themes would paint identically.
 *
 * Written out rather than derived from `Object.keys`, which cannot be typed
 * without an assertion — and this way adding a field to {@link ViewerTheme}
 * makes the compiler point here.
 */
export function themesEqual(a: ViewerTheme, b: ViewerTheme): boolean {
  return (
    a.background === b.background &&
    a.hemisphereSky === b.hemisphereSky &&
    a.hemisphereGround === b.hemisphereGround &&
    a.hemisphereIntensity === b.hemisphereIntensity &&
    a.ambient === b.ambient &&
    a.ambientIntensity === b.ambientIntensity &&
    a.part === b.part &&
    a.partEmissive === b.partEmissive &&
    a.hover === b.hover &&
    a.hoverEmissive === b.hoverEmissive &&
    a.highlight === b.highlight &&
    a.edge === b.edge &&
    a.edgeOpacity === b.edgeOpacity &&
    a.sectionCap === b.sectionCap &&
    a.sectionOutline === b.sectionOutline &&
    a.sectionHandle === b.sectionHandle &&
    a.sectionHandleOutline === b.sectionHandleOutline &&
    a.cube === b.cube &&
    a.cubeEdge === b.cubeEdge &&
    a.cubeLabel === b.cubeLabel
  )
}

/** The color for a candidate direction, wrapping at {@link DIRECTION_COLORS}. */
export function directionColor(index: number): number {
  const wrapped = index % DIRECTION_COLORS.length
  // `noUncheckedIndexedAccess`: the modulo guarantees a hit, but only for a
  // non-negative integer index, which a caller could still get wrong.
  return DIRECTION_COLORS[wrapped] ?? HIGHLIGHT_COLORS.default
}
