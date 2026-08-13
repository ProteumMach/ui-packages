import { type Box3, BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'

/** Steps a machinist reads without doing arithmetic, in millimetres. */
const STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000] as const

/** Roughly how many cells should span the part itself. */
const TARGET_CELLS = 10
/** How far past the part the grid extends, as a multiple of its size. */
const OVERHANG = 1.6

export interface GridSpec {
  /** Cell size in part units (millimetres). */
  readonly step: number
  /** Half-width of the grid, so it spans `2 × extent`. */
  readonly extent: number
  /** The plane the grid sits on: the bottom of the part, snapped to a step. */
  readonly z: number
  readonly center: Vector3
}

/**
 * Sizes a ground grid for a part.
 *
 * The step comes from a 1-2-5 progression rather than a fixed size, so the same
 * code reads sensibly for a 12 mm insert and a 900 mm plate — the Engine emits
 * millimetres but says nothing about scale.
 *
 * The plane is the *bottom* of the part, not `z = 0`: parts usually sit on
 * `z = 0` and then the two agree, but one modelled about its centre would
 * otherwise be sliced in half by its own grid.
 */
export function gridSpec(box: Box3): GridSpec {
  const size = box.getSize(new Vector3())
  const center = box.getCenter(new Vector3())
  const largest = Math.max(size.x, size.y, 1e-6)

  // The largest readable step that still gives at least `TARGET_CELLS` across
  // the part. Rounding up instead would leave a 50.8 mm cube on 10 mm cells —
  // five squares, which is a border rather than a grid.
  const ideal = largest / TARGET_CELLS
  const step = [...STEPS].reverse().find((candidate) => candidate <= ideal) ?? STEPS[0]

  // Snap outwards to a whole number of cells so the part sits inside the grid
  // rather than ending part-way through a square.
  const extent = Math.ceil((largest * OVERHANG) / 2 / step) * step

  return { step, extent, z: box.min.z, center }
}

/**
 * A ground grid on the part's Z-up base plane.
 *
 * Built directly rather than with `GridHelper`, which lays out on XZ for a Y-up
 * world and has to be rotated into place — the Engine is Z-up, and a rotated
 * helper is a thing to remember rather than a thing that is true.
 */
export function gridGeometry(spec: GridSpec): BufferGeometry {
  const { step, extent, z, center } = spec
  const positions: number[] = []

  for (let offset = -extent; offset <= extent + 1e-9; offset += step) {
    positions.push(
      center.x + offset,
      center.y - extent,
      z,
      center.x + offset,
      center.y + extent,
      z,
      center.x - extent,
      center.y + offset,
      z,
      center.x + extent,
      center.y + offset,
      z,
    )
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))

  return geometry
}
