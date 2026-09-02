---
'@toolpath/tool-scraper': minor
---

Measure a mirrored holder's CAD model into a gage-line profile.

- `profiles.ts` — `layersToProfile`, `buildProfiles`, `checkProfile` and
  `taperDesignation`, plus `HolderProfile` and `ProfilesDocument`. Pure: the
  layer stack the Toolpath Engine API returns becomes a `[z, r]` silhouette
  datumed on the gage line, cross-checked against the vendor's published `L1`,
  and keyed by the guid the holder record was minted under.
- `@toolpath/tool-scraper/node` gains `holder-import.ts` — `createHolderApi`,
  `measureHolder`, `measureFamily`, `parseHolderResponse` — reading
  `TOOLPATH_API_KEY` and `TOOLPATH_API_URL`, and `paths.profilesDir` /
  `paths.profilesJson`.
- `cad-mirror.stepFileName` is exported, so the mirror and the reader resolve
  one part to one filename.
- New CLI verb: `toolpath-scrape profiles HOLDERS.csv [more.csv ...]`.
- `cli.run` takes an optional fourth argument, a `HolderApi`.
