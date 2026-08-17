# Toolpath UI

`@toolpath/ui` is Toolpath's React component kit for applications that use the
Toolpath Engine API. It is intentionally Tailwind-first and uses Toolpath's
shared design tokens.

## Install

```sh
npm install @toolpath/ui react react-dom tailwindcss
```

## Tailwind v4 setup

Import Tailwind and the Toolpath theme in your application stylesheet. The
theme scans the package's component source, provides the Toolpath tokens, and
uses the document's `dark` class for dark mode.

```css
@import 'tailwindcss';
@import '@toolpath/ui/theme.css';
```

Load Open Sans, Nunito, and Roboto Mono to use the exact Toolpath typography.

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
