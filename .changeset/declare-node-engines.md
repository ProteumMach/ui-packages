---
'@toolpath/viewer': patch
'@toolpath/ui': patch
---

Declare the supported Node version. Both packages now carry `engines.node: ">=20"`, matching
`@toolpath/api` and `@toolpath/tool-scraper` and the ES2022 output they already build.
