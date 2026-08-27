---
'@toolpath/ui': patch
---

Fix `Button` dropping a click when a re-render lands between mousedown and mouseup. The label
wrapper was declared inside `Button`, so every render gave it a new component identity and React
remounted the label `<div>` instead of updating it. A browser only synthesizes a click on the
nearest common ancestor of the mousedown and mouseup targets, so replacing that node mid-press
swallowed the click — most visibly on a button pressed right after focus left a stateful element.
