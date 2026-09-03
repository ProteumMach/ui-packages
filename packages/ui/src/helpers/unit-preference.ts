/**
 * The unit a person reads in, remembered between visits.
 *
 * It belongs to the person rather than to the thing being looked at: a
 * machinist works in one of them all day and should not set it again after
 * opening a report or a catalog.
 *
 * The storage is the caller's, so a component can be rendered in a test or on
 * a server without a `window`, and the key is the caller's too. Two
 * applications on one origin would otherwise silently share the preference —
 * defensible, but a decision each application should make rather than inherit
 * from a constant it cannot see.
 *
 * The vocabulary is `@toolpath/tool-support`'s `UnitSystem`, written out here
 * rather than imported: a union of two string literals unifies structurally,
 * so these interoperate with it exactly, and a React component kit should not
 * put the cutting-tool domain in every consumer's `node_modules` for a type.
 */

/**
 * The stored unit, defaulting to millimetres — what Toolpath states every
 * length in.
 *
 * **`'in'` is read as well as `'inches'`.** The preference was written under
 * the short spelling for as long as that was the vocabulary, and those values
 * are in people's browsers now. A reader that accepts only the current
 * spelling silently moves every inch shop to metric the day it deploys.
 */
export const loadUnit = (
  storage: Pick<Storage, 'getItem'> | null,
  key: string,
): 'millimeters' | 'inches' => {
  const stored = storage?.getItem(key)
  return stored === 'inches' || stored === 'in' ? 'inches' : 'millimeters'
}

/** Writes the current spelling. {@link loadUnit} still reads the old one. */
export const saveUnit = (
  storage: Pick<Storage, 'setItem'> | null,
  key: string,
  unit: 'millimeters' | 'inches',
): void => {
  storage?.setItem(key, unit)
}
