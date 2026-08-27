import tsParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'packages/sdk-python/**',
      'packages/sdk-typescript/src/generated/**',
      'packages/viewer/fixtures/**',
    ],
  },
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      // A component defined inside another component is a new type on every
      // render, so React remounts its subtree instead of updating it. That
      // detaches the DOM node a pointer may be pressing, and the browser then
      // has no common ancestor to synthesize the click on.
      'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
      // Carried for the viewer's two deliberate suppressions: ESLint fails on a
      // disable comment naming a rule it cannot resolve, and reports one naming
      // a rule that is off as unused. The .tsx sources are already clean under
      // it, so it costs nothing to keep on.
      'react-hooks/exhaustive-deps': 'error',
    },
  },
]
