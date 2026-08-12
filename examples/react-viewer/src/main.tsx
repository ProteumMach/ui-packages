import { StrictMode, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import {
  Axes,
  Grid,
  OrientationCube,
  PartMesh,
  type FeaturePointerEvent,
  type FeatureRegion,
  type ViewerHandle,
  Viewer,
} from '@toolpath/viewer'
import './style.css'

const cubeRegions: FeatureRegion<string>[] = [
  { regionIndex: 0, triangleStart: 0, triangleEnd: 2, featureIds: ['right-face'] },
  { regionIndex: 1, triangleStart: 2, triangleEnd: 4, featureIds: ['left-face'] },
  { regionIndex: 2, triangleStart: 4, triangleEnd: 6, featureIds: ['top-face'] },
  { regionIndex: 3, triangleStart: 6, triangleEnd: 8, featureIds: ['bottom-face'] },
  { regionIndex: 4, triangleStart: 8, triangleEnd: 10, featureIds: ['front-face'] },
  { regionIndex: 5, triangleStart: 10, triangleEnd: 12, featureIds: ['back-face'] },
]

const App = () => {
  const geometry = useMemo(() => new THREE.BoxGeometry(25.4, 25.4, 25.4), [])
  const viewerRef = useRef<ViewerHandle>(null)
  const [hovered, setHovered] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const onHover = (event: FeaturePointerEvent<string> | null) =>
    setHovered(event ? [...event.featureIds] : [])

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
            geometry={geometry}
            regions={cubeRegions}
            hoveredFeatureIds={hovered}
            selectedFeatureIds={selected}
            onFeatureHover={onHover}
            onFeatureClick={(event) => setSelected([...event.featureIds])}
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
