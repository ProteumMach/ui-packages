import { StrictMode, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import {
  Axes,
  Grid,
  OrientationCube,
  PartMesh,
  Viewer,
  buildRegionIndex,
  type PartModel,
  type PartPick,
  type ViewerHandle,
} from '@toolpath/viewer'
import './style.css'

/**
 * A part the viewer can render, built by hand rather than fetched.
 *
 * A real one comes from `normalizePartReport(report)`. This is the same shape:
 * regions are half-open triangle ranges that tile the mesh completely, and
 * features name the regions they own. `buildRegionIndex` inverts that mapping
 * and rejects a table with a gap or an overlap.
 */
const cubeFaces = [
  { tag: 'right-face', direction: { x: 1, y: 0, z: 0 } },
  { tag: 'left-face', direction: { x: -1, y: 0, z: 0 } },
  { tag: 'top-face', direction: { x: 0, y: 1, z: 0 } },
  { tag: 'bottom-face', direction: { x: 0, y: -1, z: 0 } },
  { tag: 'front-face', direction: { x: 0, y: 0, z: 1 } },
  { tag: 'back-face', direction: { x: 0, y: 0, z: -1 } },
]

const regions = cubeFaces.map((_face, idx) => ({
  idx,
  shapeKind: 'Plane',
  area: 25.4 * 25.4,
  triangles: { start: idx * 2, end: idx * 2 + 2 },
}))

const features = cubeFaces.map((face, idx) => ({
  tag: face.tag,
  featureType: 'face',
  machiningDirection: face.direction,
  axis: face.direction,
  regionIdxs: [idx],
}))

const cube: PartModel = {
  partId: 'one-inch-cube',
  kernelVersion: '0.3.0',
  features,
  regions,
  candidateDirections: cubeFaces.map((face) => face.direction),
  mesh: { pointCount: 36, triangleCount: 12, glbUrl: null, stlUrl: null, thumbnailUrl: null },
  regionIndex: buildRegionIndex({ regions, features, triangleCount: 12 }),
  warnings: [],
}

const App = () => {
  // Non-indexed on purpose. Highlighting is a per-vertex region attribute, and
  // a vertex shared between two regions has no single value to carry — which is
  // why the Engine mesh loader de-indexes too.
  const geometry = useMemo(() => new THREE.BoxGeometry(25.4, 25.4, 25.4).toNonIndexed(), [])
  const viewerRef = useRef<ViewerHandle>(null)
  const [hovered, setHovered] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])

  return (
    <main>
      <section>
        <p className="eyebrow">@toolpath/viewer</p>
        <h1>One-inch cube</h1>
        <p>
          Left-drag to orbit, middle/right-drag to pan, scroll to zoom, and click a face to select
          it.
        </p>
        <p>
          <strong>Hovered:</strong> {hovered.join(', ') || 'none'}
        </p>
        <p>
          <strong>Selected:</strong> {selected.join(', ') || 'none'}
        </p>
      </section>
      <div className="viewer">
        <div className="viewer-toolbar" aria-label="Viewer controls">
          <button type="button" onClick={() => viewerRef.current?.fit()}>
            Fit
          </button>
          <button type="button" onClick={() => viewerRef.current?.reset()}>
            Reset
          </button>
          <button type="button" onClick={() => viewerRef.current?.setView('top')}>
            Top view
          </button>
        </div>
        <Viewer ref={viewerRef}>
          <PartMesh
            model={cube}
            geometry={geometry}
            selection={selected}
            onHover={(pick: PartPick | null) => setHovered(pick ? [...pick.owners] : [])}
            onPick={(pick: PartPick | null) => setSelected(pick ? [...pick.ranked] : [])}
          />
          <Grid size={100} divisions={20} />
          <Axes size={35} />
          <OrientationCube />
        </Viewer>
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
