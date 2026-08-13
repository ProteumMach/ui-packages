import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import type { CSSProperties, PropsWithChildren, ReactNode } from 'react'
import { Box3, Group, Vector3 } from 'three'
import { CadCameraControls } from './camera.js'
import {
  DEFAULT_FIT_MARGIN,
  PERSPECTIVE_FOV,
  type Projection,
  type SceneBounds,
  type ViewerCamera,
  applyProjection,
  cadViewDirections,
  contentBounds,
  currentViewDirection,
  defaultBounds,
  fitDistance,
  startPosition,
} from './render/camera.js'
import type { ControlScheme, ExtendedCameraControls } from './render/controls.js'
import { type ViewerTheme, resolveTheme } from './render/theme.js'
import type { ViewerControls, ViewerHandle, ViewerView } from './types.js'

const ViewerControlsContext = createContext<ViewerControls | null>(null)

export const useViewerControls = (): ViewerControls => {
  const controls = useContext(ViewerControlsContext)
  if (!controls) throw new Error('useViewerControls must be used inside <Viewer>')
  return controls
}

interface SceneProps extends PropsWithChildren {
  setControls: (controls: ViewerControls) => void
  projection: Projection
  scheme: ControlScheme
  freeOrbit: boolean
  theme: ViewerTheme
}

const ViewerScene = ({
  children,
  setControls,
  projection,
  scheme,
  freeOrbit,
  theme,
}: SceneProps) => {
  const camera = useThree((state) => state.camera) as ViewerCamera
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)
  const controlsRef = useRef<ExtendedCameraControls | null>(null)
  const contentRef = useRef<Group>(null)
  const initialFrameComplete = useRef(false)
  const boundsRef = useRef<SceneBounds>(defaultBounds())
  const scratchBox = useMemo(() => new Box3(), [])
  const scratchDirection = useMemo(() => new Vector3(), [])

  /** The bounds of whatever the consumer put in the scene, grid and axes aside. */
  const measure = useCallback((): SceneBounds => {
    const content = contentRef.current
    boundsRef.current = content ? contentBounds(content, scratchBox) : defaultBounds()
    return boundsRef.current
  }, [scratchBox])

  /**
   * Frames the content from `direction`, sizing the frustum to it first.
   *
   * The frustum is derived from the bounds rather than from the camera's
   * distance, so orbiting and dollying afterwards never need it recomputed.
   */
  const frame = useCallback(
    (direction: Vector3, transition = false): boolean => {
      const controls = controlsRef.current
      if (!controls) return false

      const bounds = measure()
      applyProjection(camera, size, bounds, DEFAULT_FIT_MARGIN)

      const distance = fitDistance(projection, size, bounds, DEFAULT_FIT_MARGIN)
      const position = scratchDirection.copy(direction).normalize().multiplyScalar(distance)
      position.add(bounds.center)

      void controls.setLookAt(
        position.x,
        position.y,
        position.z,
        bounds.center.x,
        bounds.center.y,
        bounds.center.z,
        transition,
      )
      // The orthographic frustum is already sized to the bounds, so anything
      // the wheel did to zoom would otherwise survive a Fit.
      if (projection === 'orthographic') void controls.zoomTo(1, transition)

      invalidate()
      return true
    },
    [camera, invalidate, measure, projection, scratchDirection, size],
  )

  const fitContent = useCallback(() => {
    const controls = controlsRef.current
    if (!controls) return false
    const target = controls.getTarget(new Vector3())
    return frame(currentViewDirection(camera, target, new Vector3()), true)
  }, [camera, frame])

  const resetContent = useCallback(() => {
    const bounds = measure()
    const start = startPosition(projection, size, bounds).sub(bounds.center)
    return frame(start, true)
  }, [frame, measure, projection, size])

  useEffect(() => {
    setControls({
      fit: () => {
        fitContent()
      },
      reset: () => {
        resetContent()
      },
      setView: (view) => {
        frame(cadViewDirections[view], true)
      },
    })
  }, [fitContent, frame, resetContent, setControls])

  // Reframe when the projection changes: a perspective distance and an
  // orthographic frustum are not interchangeable.
  useEffect(() => {
    if (initialFrameComplete.current) resetContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projection])

  // Keep the frustum matched to the viewport without moving the camera.
  useEffect(() => {
    applyProjection(camera, size, boundsRef.current, DEFAULT_FIT_MARGIN)
    invalidate()
  }, [camera, invalidate, size])

  // A Suspense-loaded mesh does not exist during the first effect, so the
  // opening frame waits for something to actually be in the scene.
  useFrame(() => {
    if (!initialFrameComplete.current && contentRef.current?.children.length) {
      initialFrameComplete.current = resetContent()
    }
  })

  return (
    <>
      <ambientLight color={theme.ambient} intensity={theme.ambientIntensity} />
      <hemisphereLight
        args={[theme.hemisphereSky, theme.hemisphereGround, theme.hemisphereIntensity]}
      />
      <group ref={contentRef}>{children}</group>
      <CadCameraControls controlsRef={controlsRef} scheme={scheme} freeOrbit={freeOrbit} />
    </>
  )
}

export interface ViewerProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /**
   * Perspective by default. Orthographic is what a machinist reads a part in —
   * parallel edges stay parallel, so two features the same size measure the
   * same size wherever they sit.
   */
  projection?: Projection
  /**
   * `toolpath` — left-drag orbits, right-drag pans. `fusion` — middle-drag and
   * two-finger scroll pan, shift makes them orbit, pinch zooms; it matches
   * Fusion 360, which is what most users have open in the other window.
   */
  controls?: ControlScheme
  /** Orbit past the poles instead of stopping there. On by default. */
  freeOrbit?: boolean
  /** Lighting and background. The part's own colours are tuned against this rig. */
  theme?: Partial<ViewerTheme>
}

export const Viewer = forwardRef<ViewerHandle, ViewerProps>(function Viewer(
  {
    children,
    className,
    style,
    projection = 'perspective',
    controls = 'toolpath',
    freeOrbit = true,
    theme,
  },
  ref,
) {
  const actionsRef = useRef<ViewerControls | null>(null)
  const resolved = useMemo(() => resolveTheme(theme), [theme])
  const proxy = useMemo<ViewerControls>(
    () => ({
      fit: () => actionsRef.current?.fit(),
      reset: () => actionsRef.current?.reset(),
      setView: (view: ViewerView) => actionsRef.current?.setView(view),
    }),
    [],
  )
  useImperativeHandle(ref, () => proxy, [proxy])
  const setControls = useCallback((next: ViewerControls) => {
    actionsRef.current = next
  }, [])

  return (
    <ViewerControlsContext.Provider value={proxy}>
      <div className={className} style={{ height: '100%', width: '100%', ...style }}>
        <Canvas
          key={projection}
          orthographic={projection === 'orthographic'}
          camera={{ fov: PERSPECTIVE_FOV, up: [0, 0, 1], position: [1, -1, 1] }}
          dpr={[1, 2]}
          frameloop="demand"
          gl={{ antialias: true, alpha: true }}
        >
          <ViewerScene
            setControls={setControls}
            projection={projection}
            scheme={controls}
            freeOrbit={freeOrbit}
            theme={resolved}
          >
            {children}
          </ViewerScene>
        </Canvas>
      </div>
    </ViewerControlsContext.Provider>
  )
})
