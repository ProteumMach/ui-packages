---
'@toolpath/ui': patch
---

Stop `Button` throwing away a click when something re-renders mid-press.

The inner surface was a component declared inside `Button`, which makes it a new
component _type_ on every render. React therefore unmounted the content subtree and
mounted a fresh one each time — and a `click` is only dispatched when `mousedown` and
`mouseup` land on the same element, so any render occurring between the two halves of
a press silently swallowed the click. A hover handler on an ancestor is enough to
cause that render, which is why it presented as intermittent.

Nothing said anything was wrong: the button stayed in the tree, matched by role and
name, and reported enabled throughout. It cost two long debugging sessions in the part
viewer before the cause was found.

The surface is now an element built by a plain function rather than a component
declared during render, so its identity survives. Covered by a test that asserts node
identity across a re-render — `fireEvent.click` dispatches straight at the element and
jsdom does not build a click from `mousedown` and `mouseup`, so a click-based test
passes either way.
