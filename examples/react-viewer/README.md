# React 3D viewer

A standalone, local-only Vite example for `@toolpath/viewer`. It renders a procedural one-inch
(25.4 mm) cube, so it requires no Toolpath API key or Engine request.

```bash
pnpm install --frozen-lockfile
pnpm --filter @toolpath/example-react-viewer dev
```

Run the browser acceptance test with Chromium installed:

```bash
pnpm --filter @toolpath/example-react-viewer exec playwright install chromium
pnpm --filter @toolpath/example-react-viewer test
```
