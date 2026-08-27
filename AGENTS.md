## Public package releases

When changing a public package in a consumer-visible way, always add a Changeset in the same pull
request. Do this as part of the implementation; do not ask a human to create it later.

Changesets are Markdown files in `.changeset/` with this form:

```md
---
'@toolpath/viewer': patch
---

Fix camera reset after a report reload.
```

Use the package and bump that match the change:

| Changed area                                                                                                | Package                  |
| ----------------------------------------------------------------------------------------------------------- | ------------------------ |
| `packages/ui/src/` or `packages/ui/tailwind-preset.cjs`                                                     | `@toolpath/ui`           |
| `packages/viewer/src/`                                                                                      | `@toolpath/viewer`       |
| `packages/sdk-typescript/src/`, `openapi/`, `codegen/typescript-fetch.yaml`, or `scripts/generate-sdks.mjs` | `@toolpath/api`          |
| `packages/tool-scraper/src/`                                                                                | `@toolpath/tool-scraper` |

- Public package manifest changes that alter exports, dependencies, peer dependencies, or shipped files
  also require the relevant package Changeset.
- Use `patch` for a backwards-compatible fix.
- Use `minor` for a backwards-compatible public capability or export.
- Use `major` for an incompatible public API, type, peer-dependency, or behavioral change.
- Name every affected package in one Changeset when work spans packages.
- Do not add a Changeset for docs, examples, app-only work, CI, or test-only changes unless a package
  consumer receives a change.

**`packages/sdk-python` is outside Changesets and takes no Changeset.** It is not an npm package,
the release workflow does not version it, and adding one would put a package name in a changelog
that never ships. Its version lives in its own `pyproject.toml`.

`packages/tool-scraper` used to sit under the same exclusion and no longer does: it was ported to
TypeScript and publishes to npm as `@toolpath/tool-scraper`, so it takes a Changeset like any other
public package.

Do not manually edit package versions or changelogs. The release workflow generates them in its
auto-merged release-metadata pull request.

## Validation

Run the narrowest relevant tests while implementing, then run the applicable broader checks before
completion. Public package changes must include tests when behavior changes.
