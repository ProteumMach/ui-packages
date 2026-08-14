/**
 * What the part wears for "this is the thing I am reading".
 *
 * Blue, and saturated enough to still read as blue over a light grey part —
 * but eased off the fully saturated version, which sat on the part as a slab of
 * colour rather than as a face wearing one. There is a floor to this: brightened
 * or drained much further it becomes a white patch, and the thing being read
 * stops being a colour at all.
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
  highlight: 0x3e6bcc,
  hover: 0x608ad2,
  picked: 0x4878cb,
} as const
