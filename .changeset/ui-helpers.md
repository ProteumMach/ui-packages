---
'@toolpath/ui': minor
---

Export two helpers an application had to keep beside this package: `cn`, which
was here all along but internal, and `loadUnit`/`saveUnit` for the unit a person
reads in. `loadUnit` reads the older `'in'`/`'mm'` spellings as well as
`'inches'`/`'millimeters'`, so a preference already in a browser survives.
