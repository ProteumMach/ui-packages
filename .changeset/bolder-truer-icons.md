---
'@toolpath/ui': patch
---

Retune icons across the component set. Carets, checks, and close buttons pick
up explicit Phosphor weights (`bold`/`regular`) instead of inheriting the
default, the combobox trigger trades `ArrowsOutLineVertical` for the
conventional `CaretUpDown`, and the "press enter" affordance in combobox items
and editable cells trades `ArrowBendUpLeft` for `ArrowElbowDownLeft`. Sizes
shift a step where icons sat visually heavy (breadcrumb separators, pagination
chevrons), and `Input` icons now self-center so suffix icons stay aligned at
every input size.
