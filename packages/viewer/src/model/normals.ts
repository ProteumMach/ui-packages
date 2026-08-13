import type { BufferGeometry } from 'three'
import type { PartModelRegion, Vec3 } from './types.js'

/**
 * Which way each face points, taken off the mesh.
 *
 * The report says which triangles belong to a region and how big it is; it does
 * not say which way it faces. That is in the geometry, and it is what any
 * question of the form "could this be cut from over there" starts with.
 *
 * Area-weighted, so a region made of one large triangle and a sliver reads as
 * the large one. A perfectly flat region gives its own normal exactly; a curved
 * one gives an average, which is honest — a bore's wall does not point one way,
 * and a single vector for it is a simplification whoever uses it should know
 * about.
 */
export function regionNormals(
  geometry: BufferGeometry,
  regions: readonly PartModelRegion[],
): Map<number, Vec3> {
  const position = geometry.getAttribute('position')
  const index = geometry.getIndex()
  const normals = new Map<number, Vec3>()

  if (!position) return normals

  const vertexAt = (at: number): [number, number, number] => {
    const vertex = index ? index.getX(at) : at
    return [position.getX(vertex), position.getY(vertex), position.getZ(vertex)]
  }

  for (const region of regions) {
    let x = 0
    let y = 0
    let z = 0

    for (let triangle = region.triangles.start; triangle < region.triangles.end; triangle++) {
      const [ax, ay, az] = vertexAt(triangle * 3)
      const [bx, by, bz] = vertexAt(triangle * 3 + 1)
      const [cx, cy, cz] = vertexAt(triangle * 3 + 2)

      // The cross product of two edges: its direction is the facet's normal and
      // its length is twice the triangle's area, which is the weighting for
      // free.
      const ux = bx - ax
      const uy = by - ay
      const uz = bz - az
      const vx = cx - ax
      const vy = cy - ay
      const vz = cz - az

      x += uy * vz - uz * vy
      y += uz * vx - ux * vz
      z += ux * vy - uy * vx
    }

    const length = Math.sqrt(x * x + y * y + z * z)
    if (length > 1e-9) normals.set(region.idx, { x: x / length, y: y / length, z: z / length })
  }

  return normals
}
