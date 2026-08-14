/**
 * What the part wears for "this is the thing I am reading".
 *
 * Blue, and saturated enough to still read as blue over a light grey part.
 * Brightening these drains them: a pale blue over the part is a white patch,
 * and the thing being read stops being a colour at all. Bright means
 * *luminous*, not washed out — the saturation stays up and the value comes down
 * a little.
 *
 * The hover takes the blue the selection had and the selection goes a step
 * deeper: hovering is the commoner state and the one that has to read as blue
 * at a glance, while the selection only has to beat it.
 *
 * The warm equivalent is kept for setups, where a plan is being laid on the
 * part rather than a feature read off it — and for difficulty, whenever that
 * arrives, since its five bands are a warm ramp and a selection sitting over
 * them cannot be warm too.
 */
export const READING_COLORS = {
  highlight: 0x1a55d6,
  hover: 0x2f6fe0,
  picked: 0x1e5fd0,
} as const
