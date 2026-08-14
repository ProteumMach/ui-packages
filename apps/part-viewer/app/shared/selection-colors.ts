/**
 * What the part wears for "this is the thing I am reading".
 *
 * Blue, and saturated enough to still read as blue over a light grey part —
 * but eased off the fully saturated version, which sat on the part as a slab of
 * colour rather than as a face wearing one. There is a floor to this: brightened
 * or drained much further it becomes a white patch, and the thing being read
 * stops being a colour at all.
 *
 * The three read as one blue at three depths, and the depth is the claim being
 * made about the face:
 *
 *   picked    the face you actually clicked — deepest, the only one you chose
 *   highlight the rest of the feature that click was read as — a step lighter,
 *             because it was inferred and inferred faces must not out-shout the
 *             one they were inferred from
 *   hover     the pointer's question — lightest, and transient
 *
 * The warm equivalent is kept for setups, where a plan is being laid on the
 * part rather than a feature read off it — and for difficulty, whenever that
 * arrives, since its five bands are a warm ramp and a selection sitting over
 * them cannot be warm too.
 */
export const READING_COLORS = {
  highlight: 0x6d97dd,
  hover: 0x93b6ea,
  picked: 0x3e6bcc,
} as const
