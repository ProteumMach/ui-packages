---
'@toolpath/ui': major
---

**Breaking:** `loadUnit`, `saveUnit` and `useUnit` are gone. They are
`@toolpath/app-support` now, unchanged in behavior.

```diff
-import { loadUnit, saveUnit } from '@toolpath/ui'
+import { loadUnit, saveUnit } from '@toolpath/app-support'

-import { useUnit } from '@toolpath/ui'
+import { useUnit } from '@toolpath/app-support/react'
```

They were never this package's to hold. `@toolpath/ui` is styling and display —
the surface Storybook documents — and where a person's unit preference is stored
is not that. They shipped here in 0.2.0 and 0.3.0 and are removed in the next
release either way; taking them out now is the smallest window in which an
application depends on the wrong package for them.

`cn` stays, and stays public. It merges Tailwind classes, which is this
package's own subject, and every component uses it.

`tests/boundary.test.ts` is the check that keeps this true: every directory
under `src/` contains a component, nothing sits loose at the top of `src/`, and
no module imports a Toolpath sibling. Nothing shipped in this package's files
changes for a consumer who imported only components.
