import CameraControls from 'camera-controls'
import {
  Box3,
  Matrix4,
  OrthographicCamera,
  Quaternion,
  Raycaster,
  Sphere,
  Spherical,
  Vector2,
  Vector3,
  Vector4,
} from 'three'

import type { ViewerCamera } from './camera.js'

/**
 * `camera-controls` needs the three classes it constructs injected once, and
 * against the *same* three instance the rest of the app uses — which is why
 * `three` is a peer dependency and a duplicate copy is a silent breakage.
 *
 * Only the documented subset is passed rather than the whole namespace, so a
 * bundler can still drop what the viewer does not use.
 */
CameraControls.install({
  THREE: {
    Box3,
    Matrix4,
    Quaternion,
    Raycaster,
    Sphere,
    Spherical,
    Vector2,
    Vector3,
    Vector4,
  },
})

/**
 * Mouse and trackpad presets.
 *
 * - `toolpath` — left-drag orbits, right-drag pans. The product default.
 * - `fusion` — middle-drag and two-finger scroll pan, shift makes them orbit,
 *   pinch zooms. Matches Fusion 360, which is what most of our users have open
 *   in the other window.
 */
export type ControlScheme = 'toolpath' | 'fusion'

export type ExtendedCameraControlsOptions = {
  /**
   * Orbit past the poles instead of stopping there. When enabled the up vector
   * is re-derived from the view each frame, so there is no gimbal stop.
   */
  readonly freeOrbit?: boolean | undefined
}

const EPSILON = 1e-6

const FUSION_PINCH_ZOOM_SCALE = 0.04
const FUSION_ROTATE_SCALE = 2.2
const FUSION_TRUCK_SCALE = 0.33

/**
 * Effectively no damping — the legacy viewer settled on this after overriding
 * its own preset values, and the product feel depends on the view tracking the
 * pointer exactly.
 */
const DEFAULT_SMOOTH_TIME = 0.001

/**
 * `CameraControls` with free orbit, camera-relative up, and the Fusion wheel
 * scheme.
 *
 * Two departures from the legacy implementation, both deliberate:
 *
 * - It does **not** override `connect`/`disconnect`. Legacy declared them as
 *   arrow-function class fields, which shadowed the base methods of the same
 *   name — so `connect()` added a pointer listener but never did what the base
 *   class's `connect` does, and the base's own connection came from the
 *   constructor instead. The extra listeners live on `attach`/`detach` here,
 *   and the base methods are left alone.
 * - Modifier state is tracked internally. Legacy read Shift and Control from a
 *   React hook and reapplied the whole preset on every keypress, which coupled
 *   the controls to the component tree for two booleans.
 */
export class ExtendedCameraControls extends CameraControls {
  #domElement: HTMLElement
  #freeOrbit: boolean
  #scheme: ControlScheme = 'toolpath'
  #attached = false
  #autoUpEnabled = false
  #shiftPressed = false
  #wheelHandler: ((event: WheelEvent) => void) | null = null

  // Scratch objects — `#onPointerMove` and `#adaptUpVector` run at pointer and
  // frame rate respectively, so neither may allocate.
  #spherical = new Spherical()
  #scratchA = new Vector3()
  #scratchB = new Vector3()
  #scratchC = new Vector3()
  #scratchD = new Vector3()

  constructor(
    camera: ViewerCamera,
    domElement: HTMLElement,
    options: ExtendedCameraControlsOptions = {},
  ) {
    super(camera, domElement)

    this.#domElement = domElement
    this.#freeOrbit = options.freeOrbit ?? true

    // Rotation is driven entirely by `#onPointerMove`, which can flip the up
    // vector when the pose crosses a pole. The base rotate must contribute
    // nothing or the two would compound.
    this.azimuthRotateSpeed = 0
    this.polarRotateSpeed = 0
  }

  get freeOrbit(): boolean {
    return this.#freeOrbit
  }

  get scheme(): ControlScheme {
    return this.#scheme
  }

  /** Adds the listeners this subclass owns, on top of the base connection. */
  attach(): void {
    if (this.#attached) {
      return
    }

    this.#attached = true
    this.#domElement.ownerDocument.addEventListener('pointermove', this.#onPointerMove)

    const view = this.#domElement.ownerDocument.defaultView
    view?.addEventListener('keydown', this.#onModifierChange)
    view?.addEventListener('keyup', this.#onModifierChange)
    // A window that loses focus never delivers the matching keyup, which would
    // otherwise leave the Fusion scheme stuck in its shift variant.
    view?.addEventListener('blur', this.#onWindowBlur)

    if (this.#freeOrbit) {
      this.#enableAutoUp()
    }

    this.applyScheme(this.#scheme)
  }

  detach(): void {
    if (!this.#attached) {
      return
    }

    this.#attached = false
    this.#domElement.ownerDocument.removeEventListener('pointermove', this.#onPointerMove)

    const view = this.#domElement.ownerDocument.defaultView
    view?.removeEventListener('keydown', this.#onModifierChange)
    view?.removeEventListener('keyup', this.#onModifierChange)
    view?.removeEventListener('blur', this.#onWindowBlur)

    this.#disableAutoUp()
    this.#disableFusionWheel()
  }

  override dispose(): void {
    this.detach()
    super.dispose()
  }

  /**
   * Reapplies the current preset. The Viewer calls this after a projection
   * change too, because the correct wheel action differs between an
   * orthographic and a perspective camera.
   */
  applyScheme(scheme: ControlScheme): void {
    this.#scheme = scheme

    this.mouseButtons.left = CameraControls.ACTION.NONE
    this.mouseButtons.middle = CameraControls.ACTION.NONE
    this.mouseButtons.right = CameraControls.ACTION.NONE
    this.mouseButtons.wheel = CameraControls.ACTION.NONE

    this.touches.one = CameraControls.ACTION.TOUCH_ROTATE
    this.touches.two = CameraControls.ACTION.TOUCH_DOLLY_TRUCK
    this.touches.three = CameraControls.ACTION.TOUCH_TRUCK

    this.smoothTime = DEFAULT_SMOOTH_TIME
    this.draggingSmoothTime = DEFAULT_SMOOTH_TIME

    this.#disableFusionWheel()

    if (scheme === 'fusion') {
      // Shift turns the pan gestures into orbit gestures, matching Fusion.
      const rotating = this.#shiftPressed

      this.mouseButtons.middle = rotating
        ? CameraControls.ACTION.ROTATE
        : CameraControls.ACTION.TRUCK
      this.touches.two = rotating
        ? CameraControls.ACTION.TOUCH_ROTATE
        : CameraControls.ACTION.TOUCH_TRUCK

      // Fusion feels wrong with damping; the view has to track the trackpad.
      this.smoothTime = 0
      this.draggingSmoothTime = 0
      this.#enableFusionWheel()

      return
    }

    this.mouseButtons.left = CameraControls.ACTION.ROTATE
    this.mouseButtons.right = CameraControls.ACTION.TRUCK
    // Dollying an orthographic camera moves it without changing what the
    // frustum covers, so the wheel has to scale the frustum instead.
    this.mouseButtons.wheel =
      this.camera instanceof OrthographicCamera
        ? CameraControls.ACTION.ZOOM
        : CameraControls.ACTION.DOLLY
  }

  setFreeOrbit(freeOrbit: boolean): void {
    if (this.#freeOrbit === freeOrbit) {
      return
    }

    this.#freeOrbit = freeOrbit

    if (!this.#attached) {
      return
    }

    if (freeOrbit) {
      this.#enableAutoUp()
    } else {
      this.#disableAutoUp()
      this.resetUpVector()
    }
  }

  /** Returns the camera to Z-up, the orientation the part data is authored in. */
  resetUpVector(): void {
    this.camera.up.set(0, 0, 1)
    this.updateCameraUp()

    const position = this.getPosition(this.#scratchA)
    void this.setPosition(position.x, position.y, position.z, false)
  }

  #enableAutoUp(): void {
    if (this.#autoUpEnabled) {
      return
    }

    this.#autoUpEnabled = true
    this.addEventListener('update', this.#adaptUpVector)
  }

  #disableAutoUp(): void {
    if (!this.#autoUpEnabled) {
      return
    }

    this.#autoUpEnabled = false
    this.removeEventListener('update', this.#adaptUpVector)
  }

  #enableFusionWheel(): void {
    this.#wheelHandler = (event: WheelEvent) => this.#onFusionWheel(event)
    this.#domElement.addEventListener('wheel', this.#wheelHandler, {
      passive: false,
    })
  }

  #disableFusionWheel(): void {
    if (!this.#wheelHandler) {
      return
    }

    this.#domElement.removeEventListener('wheel', this.#wheelHandler)
    this.#wheelHandler = null
  }

  /**
   * Re-derives the up vector from the current view each update, so orbiting
   * over a pole keeps going instead of flipping the horizon.
   */
  #adaptUpVector = (): void => {
    const target = this.getTarget(this.#scratchA)
    const view = this.#scratchB.subVectors(target, this.camera.position).normalize()
    const side = this.#scratchC.crossVectors(view, this.camera.up).normalize()
    const up = this.#scratchD.crossVectors(side, view).normalize()

    this.camera.up.copy(up)

    const position = this.getPosition(this.#scratchA)
    this.updateCameraUp()
    void this.setPosition(position.x, position.y, position.z, false)
  }

  /**
   * Rotation, done here rather than by the base class so a constrained orbit
   * can bounce off a pole — flipping the up vector and inverting azimuth —
   * instead of sticking there.
   */
  #onPointerMove = (event: PointerEvent): void => {
    if (this.currentAction !== CameraControls.ACTION.ROTATE) {
      return
    }

    // Recomputed per move rather than cached in the constructor: the element
    // is usually still unlaid-out at construction, so a cached scale is wrong
    // exactly once, permanently.
    const scale =
      Math.PI / Math.max(1, Math.min(this.#domElement.clientWidth, this.#domElement.clientHeight))

    const spherical = this.getSpherical(this.#spherical)

    let azimuth = spherical.theta - event.movementX * scale
    let polar = spherical.phi - event.movementY * scale

    const exceededUpper = polar > Math.PI - EPSILON
    const exceededLower = polar < EPSILON

    if (!this.#freeOrbit && (exceededUpper || exceededLower)) {
      polar = exceededUpper ? EPSILON : Math.PI - EPSILON
      azimuth = -azimuth
      this.camera.up.negate()
      this.updateCameraUp()
    }

    void this.rotateTo(azimuth, polar, false)
    this.update(0)
  }

  #onFusionWheel = (event: WheelEvent): void => {
    event.preventDefault()

    if (event.ctrlKey) {
      // Trackpad pinch arrives as a wheel event with ctrlKey set.
      void this.zoom(-event.deltaY * FUSION_PINCH_ZOOM_SCALE, false)
    } else if (this.#shiftPressed) {
      const scale =
        Math.PI / Math.max(1, Math.min(this.#domElement.clientWidth, this.#domElement.clientHeight))

      void this.rotate(
        event.deltaX * scale * FUSION_ROTATE_SCALE,
        event.deltaY * scale * FUSION_ROTATE_SCALE,
        false,
      )
    } else {
      void this.truck(event.deltaX * FUSION_TRUCK_SCALE, event.deltaY * FUSION_TRUCK_SCALE, false)
    }

    this.update(0)
    this.dispatchEvent({ type: 'control' })
  }

  #onModifierChange = (event: KeyboardEvent): void => {
    this.#setShiftPressed(event.shiftKey)
  }

  #onWindowBlur = (): void => {
    this.#setShiftPressed(false)
  }

  #setShiftPressed(pressed: boolean): void {
    if (this.#shiftPressed === pressed) {
      return
    }

    this.#shiftPressed = pressed

    // Only the Fusion scheme reads the modifier, so nothing else has to churn.
    if (this.#scheme === 'fusion') {
      this.applyScheme(this.#scheme)
    }
  }
}
