import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { cameraDistanceLimits, clampCameraTarget, currentCadViewDirection } from '../src/camera.js'

describe('camera distance limits', () => {
  it('keeps the camera outside the bounding sphere and caps zoom-out relative to frame distance', () => {
    expect(cameraDistanceLimits(10, 40)).toEqual({ minDistance: 11, maxDistance: 200 })
  })
})

describe('Fit direction', () => {
  it('retains the current direction instead of returning to the reset isometric direction', () => {
    const camera = new THREE.PerspectiveCamera()
    camera.position.set(0, 0, 10)
    expect(currentCadViewDirection(camera, new THREE.Vector3()).toArray()).toEqual([0, 0, 1])
  })
})

describe('camera pan bounds', () => {
  it('keeps the orbit target within useful context around the part', () => {
    const target = new THREE.Vector3(10, 0, 0)
    clampCameraTarget(target, new THREE.Vector3(), 4)
    expect(target.toArray()).toEqual([4, 0, 0])
  })

  it('does not move an already-valid target', () => {
    const target = new THREE.Vector3(2, 0, 0)
    clampCameraTarget(target, new THREE.Vector3(), 4)
    expect(target.toArray()).toEqual([2, 0, 0])
  })

  it('does not shift a valid target when the framed part is away from the origin', () => {
    const center = new THREE.Vector3(50, -20, 8)
    const target = center.clone().add(new THREE.Vector3(2, 0, 0))
    clampCameraTarget(target, center, 4)
    expect(target.toArray()).toEqual([52, -20, 8])
  })
})
