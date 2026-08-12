import { OrbitControls } from '@react-three/drei'
import { useCallback } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { ViewerView } from './types.js'

/** Shared world-up convention for the grid, axes, camera, and standard views. */
export const CAD_CAMERA_UP = new THREE.Vector3(0, 0, 1)

const POLE_GUARD_ANGLE = THREE.MathUtils.degToRad(3)

export const cadViewDirections: Record<ViewerView, THREE.Vector3> = {
  front: new THREE.Vector3(0, -1, 0),
  back: new THREE.Vector3(0, 1, 0),
  left: new THREE.Vector3(-1, 0, 0),
  right: new THREE.Vector3(1, 0, 0),
  top: new THREE.Vector3(0, 0, 1),
  bottom: new THREE.Vector3(0, 0, -1),
  isometric: new THREE.Vector3(1, -1, 1).normalize(),
}

/** Returns the current orbit direction so Fit can retain the user's chosen view. */
export const currentCadViewDirection = (
  camera: THREE.PerspectiveCamera,
  target: THREE.Vector3,
): THREE.Vector3 => {
  const direction = new THREE.Vector3().subVectors(camera.position, target)
  return direction.lengthSq() > Number.EPSILON
    ? direction.normalize()
    : cadViewDirections.isometric.clone()
}

export interface CameraDistanceLimits {
  minDistance: number
  maxDistance: number
}

export interface CameraPanBounds {
  center: THREE.Vector3
  maxDistance: number
}

/** Keeps the camera outside the part while allowing a useful amount of context around it. */
export const cameraDistanceLimits = (
  boundingRadius: number,
  framedDistance: number,
): CameraDistanceLimits => ({
  // Keep the camera beyond the enclosing sphere. This prevents wheel zoom from placing it
  // inside a mesh even when the mesh has a long diagonal or irregular shape.
  minDistance: Math.max(boundingRadius * 1.1, 0.001),
  maxDistance: Math.max(framedDistance * 5, boundingRadius * 2),
})

/** Restricts panning to useful context around the fitted part, rather than empty space. */
export const clampCameraTarget = (
  target: THREE.Vector3,
  center: THREE.Vector3,
  maxDistance: number,
): void => {
  const offset = target.sub(center)
  if (offset.lengthSq() > maxDistance * maxDistance)
    target.copy(offset.setLength(maxDistance).add(center))
}

/** Finds the content bounds while deliberately excluding visual helpers such as grids and axes. */
export const viewerContentBounds = (content: THREE.Object3D): THREE.Box3 => {
  const bounds = new THREE.Box3()
  let hasMesh = false
  content.traverseVisible((object) => {
    if (object.userData.viewerExcludeFromFrame || !(object instanceof THREE.Mesh)) return
    bounds.expandByObject(object)
    hasMesh = true
  })

  // A consumer can use an arbitrary renderable object rather than PartMesh. Fall back to the
  // complete scene subtree when there is no mesh to establish the initial camera framing.
  return hasMesh ? bounds : bounds.setFromObject(content)
}

export interface FrameCadCameraOptions {
  camera: THREE.PerspectiveCamera
  content: THREE.Object3D
  controls: OrbitControlsImpl | null
  direction?: THREE.Vector3
  panBoundsRef: MutableRefObject<CameraPanBounds | null>
}

/** Frames a content subtree and synchronizes the orbit target and its distance limits. */
export const frameCadCamera = ({
  camera,
  content,
  controls,
  direction = cadViewDirections.isometric,
  panBoundsRef,
}: FrameCadCameraOptions): boolean => {
  const bounds = viewerContentBounds(content)
  if (bounds.isEmpty()) return false

  const center = bounds.getCenter(new THREE.Vector3())
  const sphere = bounds.getBoundingSphere(new THREE.Sphere())
  const distance = Math.max(
    (sphere.radius * 1.35) / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)),
    0.1,
  )
  const limits = cameraDistanceLimits(sphere.radius, distance)
  panBoundsRef.current = {
    center: center.clone(),
    maxDistance: Math.max(sphere.radius * 2, 0.1),
  }

  camera.position.copy(center).addScaledVector(direction, distance)
  camera.near = Math.max(distance / 1000, 0.001)
  camera.far = Math.max(distance * 1000, 1000)
  camera.updateProjectionMatrix()

  controls?.target.copy(center)
  if (controls) {
    controls.minDistance = limits.minDistance
    controls.maxDistance = limits.maxDistance
  }
  controls?.update()
  return controls !== null
}

/** Applies the viewer's fixed Z-up convention when R3F creates the perspective camera. */
export const configureCadCamera = (camera: THREE.PerspectiveCamera): void => {
  camera.up.copy(CAD_CAMERA_UP)
  camera.updateProjectionMatrix()
}

interface CadOrbitControlsProps {
  controlsRef: RefObject<OrbitControlsImpl | null>
  panBoundsRef: MutableRefObject<CameraPanBounds | null>
}

/** The viewer's deliberately explicit CAD orbit/pan/zoom interaction profile. */
export const CadOrbitControls = ({ controlsRef, panBoundsRef }: CadOrbitControlsProps) => {
  const constrainPan = useCallback(() => {
    const controls = controlsRef.current
    const panBounds = panBoundsRef.current
    if (controls && panBounds)
      clampCameraTarget(controls.target, panBounds.center, panBounds.maxDistance)
  }, [controlsRef, panBoundsRef])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      // A CAD viewer has an intentional, fixed-up interaction model. The scene itself is Z-up,
      // so the camera must use that same convention or vertical drag becomes unintuitive.
      enableDamping={false}
      zoomToCursor={false}
      screenSpacePanning
      minPolarAngle={POLE_GUARD_ANGLE}
      maxPolarAngle={Math.PI - POLE_GUARD_ANGLE}
      rotateSpeed={0.8}
      zoomSpeed={0.9}
      panSpeed={0.9}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.PAN,
      }}
      onChange={constrainPan}
    />
  )
}
