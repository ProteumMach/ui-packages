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
import type { PropsWithChildren, ReactNode } from 'react'
import type { Group, PerspectiveCamera } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import {
  CadOrbitControls,
  cadViewDirections,
  configureCadCamera,
  currentCadViewDirection,
  frameCadCamera,
} from './camera.js'
import type { CameraPanBounds } from './camera.js'
import type { ViewerControls, ViewerHandle, ViewerView } from './types.js'

const ViewerControlsContext = createContext<ViewerControls | null>(null)

export const useViewerControls = (): ViewerControls => {
  const controls = useContext(ViewerControlsContext)
  if (!controls) throw new Error('useViewerControls must be used inside <Viewer>')
  return controls
}

interface SceneProps extends PropsWithChildren {
  setControls: (controls: ViewerControls) => void
}

const ViewerScene = ({ children, setControls }: SceneProps) => {
  const { camera, invalidate } = useThree()
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const contentRef = useRef<Group>(null)
  const initialFrameComplete = useRef(false)
  const panBoundsRef = useRef<CameraPanBounds | null>(null)

  const frameContent = useCallback(
    (direction = cadViewDirections.isometric): boolean => {
      const content = contentRef.current
      if (!content) return false
      const framed = frameCadCamera({
        camera: camera as PerspectiveCamera,
        content,
        controls: controlsRef.current,
        direction,
        panBoundsRef,
      })
      invalidate()
      return framed
    },
    [camera, invalidate],
  )

  const fitContent = useCallback(() => {
    const controls = controlsRef.current
    return frameContent(
      controls
        ? currentCadViewDirection(camera as PerspectiveCamera, controls.target)
        : cadViewDirections.isometric,
    )
  }, [camera, frameContent])

  useEffect(() => {
    const controls: ViewerControls = {
      fit: fitContent,
      reset: () => frameContent(cadViewDirections.isometric),
      setView: (view) => frameContent(cadViewDirections[view]),
    }
    setControls(controls)
    frameContent()
  }, [fitContent, frameContent, setControls])

  // A Suspense-loaded mesh may not exist during the first effect. Frame once its scene nodes have
  // actually mounted, while leaving later camera movement under the consumer's control.
  useFrame(() => {
    if (!initialFrameComplete.current && contentRef.current?.children.length) {
      initialFrameComplete.current = frameContent()
    }
  })

  return (
    <>
      <ambientLight intensity={1.8} />
      <hemisphereLight args={['#ffffff', '#25283a', 1.2]} />
      <group ref={contentRef}>{children}</group>
      <CadOrbitControls controlsRef={controlsRef} panBoundsRef={panBoundsRef} />
    </>
  )
}

export interface ViewerProps {
  children?: ReactNode
  className?: string
  style?: React.CSSProperties
}

export const Viewer = forwardRef<ViewerHandle, ViewerProps>(function Viewer(
  { children, className, style },
  ref,
) {
  const actionsRef = useRef<ViewerControls | null>(null)
  const proxy = useMemo<ViewerControls>(
    () => ({
      fit: () => actionsRef.current?.fit(),
      reset: () => actionsRef.current?.reset(),
      setView: (view) => actionsRef.current?.setView(view),
    }),
    [],
  )
  useImperativeHandle(ref, () => proxy, [proxy])
  const setControls = useCallback((controls: ViewerControls) => {
    actionsRef.current = controls
  }, [])

  return (
    <ViewerControlsContext.Provider value={proxy}>
      <div className={className} style={{ height: '100%', width: '100%', ...style }}>
        <Canvas
          camera={{ fov: 42, position: [1, -1, 1], near: 0.001, far: 100000 }}
          dpr={[1, 2]}
          frameloop="demand"
          gl={{ antialias: true, alpha: true }}
          onCreated={({ camera }) => configureCadCamera(camera as PerspectiveCamera)}
        >
          <ViewerScene setControls={setControls}>{children}</ViewerScene>
        </Canvas>
      </div>
    </ViewerControlsContext.Provider>
  )
})
