---
'@toolpath/ui': patch
---

Remove a stale `eslint-disable` directive naming a rule this repo does not configure. No behavior
change; `@toolpath/ui` ships `src`, so the file a consumer receives differs.
