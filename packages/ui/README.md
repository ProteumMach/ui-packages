# Toolpath UI

`@toolpath/ui` is Toolpath's React component kit for applications that use the
Toolpath Engine API. It is intentionally Tailwind-first and uses Toolpath's
shared design tokens.

## Install

```sh
npm install @toolpath/ui react react-dom tailwindcss
```

## Tailwind setup

Add the Toolpath preset and scan the published component bundle. The package
does not inject CSS: your application must include Tailwind's base, components,
and utilities directives in its global stylesheet.

```js
// tailwind.config.cjs
const path = require('node:path')
const toolpathUiRoot = path.dirname(require.resolve('@toolpath/ui/package.json'))

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@toolpath/ui/tailwind-preset')],
  content: ['./src/**/*.{js,ts,jsx,tsx}', path.join(toolpathUiRoot, 'dist/**/*.{js,mjs}')],
}
```

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

The preset uses class-based dark mode. Add `dark` to an ancestor, usually the
document element, to enable it. It supplies the fonts as Tailwind font stacks;
load the corresponding web fonts in your application if you want the exact
Toolpath typography.

## Use components

```tsx
import { Button, Input } from '@toolpath/ui'

export const PartForm = () => (
  <form className="space-y-4">
    <Input id="part-name" name="part-name" placeholder="Part name" />
    <Button variant="primary" type="submit">
      Analyze part
    </Button>
  </form>
)
```

Components retain their existing `className` extension points so applications
can layer their own Tailwind utilities. The package exports UI primitives only:
Toolpath's icon library and `list-item` components are intentionally not part of
the public API.
