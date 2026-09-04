# @toolpath/app-support

## 0.1.0

### Minor Changes

- 8e66848: New package: the logic a Toolpath application reuses, split from the component
  kit that renders it.

  `@toolpath/ui` is styling and display — the surface Storybook documents. Storage
  policy is neither, and `loadUnit`, `saveUnit` and `useUnit` shipped there in
  0.2.0 and 0.3.0 anyway. They live here now, unchanged in behavior, and leave
  `@toolpath/ui` in its next major.

  Two entry points. `@toolpath/app-support` imports no React, so a loader on a
  server can read a stored preference without bundling a renderer;
  `@toolpath/app-support/react` is the hooks and contexts. `react` and `react-dom`
  are peers, and `@toolpath/tool-support` is the one runtime dependency — its
  `UnitSystem` is the vocabulary, imported rather than restated.
