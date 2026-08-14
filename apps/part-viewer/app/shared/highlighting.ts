/**
 * Which features the lists ask the part to light up.
 *
 * Three things can want the part painted at once — an open type in the summary,
 * a row under the pointer, and the feature that was clicked — and they are not
 * equal. The click is the most recent thing somebody said, and a type is the
 * oldest: it was opened to find something, and once something is found the type
 * has served its purpose.
 *
 * So the type steps aside for anything more specific. A row under the pointer
 * replaces it, because that is a question being asked right now; a selection
 * removes it, because the question has been answered; and the pointer over the
 * part removes it too, since sixty lit faces standing between somebody and the
 * face they are reaching for is the type highlight outliving its usefulness.
 */
export function listHighlight({
  selected,
  hovered,
  ofType,
  pointerOnPart,
}: {
  /** The feature the last click landed on, if any. */
  selected: string | null
  /** Features under the pointer in a list. */
  hovered: readonly string[]
  /** Every feature of the open type, already narrowed to the held direction. */
  ofType: readonly string[]
  /** Whether the pointer is over the part itself. */
  pointerOnPart: boolean
}): string[] {
  if (hovered.length > 0) return [...hovered]
  if (selected !== null || pointerOnPart) return []
  return [...ofType]
}
