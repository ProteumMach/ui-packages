import { StrictMode, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import {
  Axes,
  Grid,
  DirectionArrows,
  ViewCube,
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
 * regions are half-open triangle ranges that tile the mesh completely,
 * `splitOrigin` groups regions derived from one original face, and features
 * name the regions they own. `buildRegionIndex` inverts that mapping and
 * rejects a table with a gap or an overlap.
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
  // This example has no analysis splits, so every region is its own origin.
  splitOrigin: idx,
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
  const [cut, setCut] = useState(0.45)
  const [sectioning, setSectioning] = useState(false)
  const [direction, setDirection] = useState<number | null>(null)

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
        <p>
          <strong>Cut:</strong> {sectioning ? `${Math.round(cut * 100)}%` : 'off'}
        </p>
        <p>
          <strong>Direction:</strong> {direction === null ? 'all' : String(direction)}
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
          <button type="button" onClick={() => setSectioning((on) => !on)}>
            Section
          </button>
          {sectioning ? (
            <label>
              <span className="sr-only">Cut depth</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={cut}
                onChange={(event) => setCut(Number(event.target.value))}
              />
            </label>
          ) : null}
        </div>
        <Viewer ref={viewerRef} onPointerMissed={() => setSelected([])}>
          <PartMesh
            model={cube}
            geometry={geometry}
            selection={selected}
            section={{ enabled: sectioning, normal: { x: 0, y: 0, z: -1 }, offset: cut }}
            onSectionChange={(state) => setCut(state.offset)}
            onHover={(pick: PartPick | null) => setHovered(pick ? [...pick.owners] : [])}
            onPick={(pick: PartPick) => setSelected([...pick.ranked])}
          />
          <DirectionArrows
            directions={cube.candidateDirections}
            shownDirection={direction}
            onPickDirection={(index) => setDirection((held) => (held === index ? null : index))}
          />
          <Grid />
          <Axes size={35} />
          <ViewCube />
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
