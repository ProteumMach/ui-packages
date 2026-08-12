# `@toolpath/viewer`

React Three Fiber primitives for exploring Toolpath Engine part meshes. The package is client-side:
it can be imported by an SSR application, but render `<Viewer>` from a client component.

```bash
npm install @toolpath/viewer react react-dom three @react-three/fiber @react-three/drei
```

## Generic mesh

```tsx
import { Axes, Grid, OrientationCube, PartMesh, Viewer } from '@toolpath/viewer'
;<Viewer style={{ height: 500 }}>
  <PartMesh geometry={geometry} regions={regions} onFeatureClick={console.log} />
  <Grid />
  <Axes />
  <OrientationCube />
</Viewer>
```

`regions` use the mesh's original triangle order. A region can have multiple feature IDs, and the
hover/click callback returns all of them. Pass `selectedFeatureIds` and `hoveredFeatureIds` to
control highlighting from application state. Highlighting uses one shared material each for the
default, hovered, and selected states, then coalesces matching triangle ranges; hundreds of
feature regions do not create hundreds of materials when the part is idle.

## Toolpath Engine reports

The optional `@toolpath/viewer/engine` entry point contains the Toolpath Engine adapter. It keeps
Engine report loading and region mapping separate from the generic mesh viewer. `EnginePart`
accepts the relevant structural subset of `PartReportResponse`, so a report returned by
`@toolpath/api` can be passed directly. It prefers `meshGlbUrl`, then falls back to `meshStlUrl`,
and maps `feature.regionIdxs` through report regions to preserve `featureTag` values.

```tsx
import { OrientationCube, Viewer } from '@toolpath/viewer'
import { EnginePart } from '@toolpath/viewer/engine'
;<Suspense fallback={<p>Loading mesh…</p>}>
  <Viewer>
    <EnginePart report={report} onFeatureClick={(event) => setSelected(event.featureIds)} />
    <OrientationCube />
  </Viewer>
</Suspense>
```

Wrap this tree in an error boundary for unavailable or expired mesh URLs. The viewer does not parse
STEP files: the Engine analyzes STEP and emits tessellated GLB/STL artifacts for display.

## Controls

Use a ref or `useViewerControls()` beneath a viewer to call `fit`, `reset`, and `setView`. The
viewer uses a Z-up CAD interaction model: left-drag orbits, middle/right-drag pans, and the wheel
zooms around the current part center. Panning is bounded near the fitted part, the camera cannot
enter its enclosing sphere, and it cannot flip over either pole. `fit()` frames the part in the
current viewing direction; `reset()` returns to the default isometric view.
