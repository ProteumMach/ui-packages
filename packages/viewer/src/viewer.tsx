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
  boundsFromBox,
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
  const lightsRef = useRef<Group>(null)
  const initialFrameComplete = useRef(false)
  const boundsRef = useRef<SceneBounds>(defaultBounds())
  const scratchBox = useMemo(() => new Box3(), [])
  const scratchDirection = useMemo(() => new Vector3(), [])
  const scratchView = useMemo(() => new Vector3(), [])

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

  /**
   * Frames bounds other than the whole part's, from where the camera already
   * is. The frustum still comes from the *scene's* bounds rather than these, so
   * a feature framed up close does not clip the part around it.
   */
  const frameBounds = useCallback(
    (bounds: SceneBounds): boolean => {
      const controls = controlsRef.current
      if (!controls) return false

      const target = controls.getTarget(new Vector3())
      const direction = currentViewDirection(camera, target, new Vector3())
      const distance = fitDistance(projection, size, bounds, DEFAULT_FIT_MARGIN)
      const position = direction.multiplyScalar(distance).add(bounds.center)

      void controls.setLookAt(
        position.x,
        position.y,
        position.z,
        bounds.center.x,
        bounds.center.y,
        bounds.center.z,
        true,
      )
      if (projection === 'orthographic') {
        void controls.zoomTo(boundsRef.current.radius / bounds.radius, true)
      }

      invalidate()
      return true
    },
    [camera, invalidate, projection, size],
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
      setViewDirection: (direction) => {
        frame(scratchView.set(direction.x, direction.y, direction.z), true)
      },
      frameBox: (box) => {
        frameBounds(boundsFromBox(box))
      },
    })
  }, [fitContent, frame, frameBounds, resetContent, scratchView, setControls])

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

  /**
   * The light rig turns with the camera, so a part is lit the same way from
   * every angle.
   *
   * Fixed to the world, the lighting is physically honest and practically
   * useless: a face that starts in shadow stays in shadow however the view is
   * orbited, so the only way to see it is to guess which way to turn the part
   * that is not turning.
   */
  useFrame(() => {
    const lights = lightsRef.current
    if (lights && !lights.quaternion.equals(camera.quaternion)) {
      lights.quaternion.copy(camera.quaternion)
      invalidate()
    }
  })

  // A Suspense-loaded mesh does not exist during the first effect, so the
  // opening frame waits for something to actually be in the scene.
  useFrame(() => {
    if (!initialFrameComplete.current && contentRef.current?.children.length) {
      initialFrameComplete.current = resetContent()
    }
  })

  return (
    <>
      <group ref={lightsRef}>
        <ambientLight color={theme.ambient} intensity={theme.ambientIntensity} />
        <hemisphereLight
          args={[theme.hemisphereSky, theme.hemisphereGround, theme.hemisphereIntensity]}
        />
      </group>
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
  /**
   * A click that hit nothing in the scene — not the part, not an arrow, not a
   * section handle. The usual meaning is "put the selection down".
   */
  onPointerMissed?: () => void
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
    onPointerMissed,
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
      setViewDirection: (direction) => actionsRef.current?.setViewDirection(direction),
      frameBox: (box) => actionsRef.current?.frameBox(box),
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
          // `stencil` is off by default in three, and the section cap is a
          // stencil trick — without it the cut still happens and the part just
          // looks hollow. `localClippingEnabled` is what lets a material carry
          // its own clipping plane rather than the whole scene sharing one.
          gl={{ antialias: true, alpha: true, stencil: true, localClippingEnabled: true }}
          onPointerMissed={onPointerMissed}
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
