import type { BufferGeometry } from 'three'
import type { PartModelRegion } from './types.js'

/**
 * Which regions are one surface to look at.
 *
 * The Engine splits a surface where that makes a better machining plan — a
 * floor cut in two so each half can be reached from a different direction, say.
 * Those splits are real and features depend on them, but they are not edges of
 * the part: a plane divided in two is still flat, and drawing the join or
 * shading across it makes a clean model look faceted and creased where nothing
 * creases.
 *
 * So this groups regions that continue each other, and the grouping is used for
 * the two things that are about how the part *looks* — its edges and its
 * shading. Nothing about picking, highlighting or features goes through here:
 * a split is still two regions to click on and still two regions a feature can
 * own, which is the whole reason the Engine made it.
 *
 * Two regions continue each other when they meet along an edge, are the same
 * kind of surface, and the facets meeting there face nearly the same way. Same
 * kind is the conservative half: a chamfer meeting a wall tangentially is still
 * a chamfer meeting a wall, and its line stays.
 */

/**
 * How far two facets may disagree across a shared edge and still be one
 * surface.
 *
 * Wider than it sounds, because a curved surface is tessellated: a 32-sided
 * bore turns 11° at every facet, and a split down one has exactly that much
 * disagreement across it. Narrower than the angle a real feature turns
 * through, which on a machined part is a chamfer at 30° or more.
 */
export const CONTINUES_WITHIN = Math.cos((20 * Math.PI) / 180)

/** Region index → the surface it belongs to, by region `idx`. */
export type SurfaceOf = ReadonlyMap<number, number>

export function visualSurfaces(
  geometry: BufferGeometry,
  regions: readonly PartModelRegion[],
): SurfaceOf {
  const position = geometry.getAttribute('position')
  const surfaces = new Map<number, number>()

  for (const region of regions) surfaces.set(region.idx, region.idx)
  if (!position || geometry.index) return surfaces

  const triangleCount = Math.floor(position.count / 3)
  const regionOf = new Int32Array(triangleCount).fill(-1)
  const kindOf = new Map<number, string>()

  for (const region of regions) {
    kindOf.set(region.idx, region.shapeKind)
    const end = Math.min(region.triangles.end, triangleCount)
    for (let triangle = region.triangles.start; triangle < end; triangle += 1) {
      regionOf[triangle] = region.idx
    }
  }

  const normals = facetNormals(geometry, triangleCount)

  // Union-find over regions: a split can be a chain of them, and two halves of
  // one surface have to end up in the same group however they were divided.
  const parent = new Map<number, number>(surfaces)
  const find = (idx: number): number => {
    let root = idx
    while (parent.get(root) !== root) root = parent.get(root) ?? root
    let walk = idx
    while (parent.get(walk) !== root) {
      const next = parent.get(walk) ?? root
      parent.set(walk, root)
      walk = next
    }
    return root
  }
  const union = (a: number, b: number) => {
    const [rootA, rootB] = [find(a), find(b)]
    if (rootA !== rootB) parent.set(rootB, rootA)
  }

  const seen = new Map<string, number>()

  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    for (let corner = 0; corner < 3; corner += 1) {
      const a = triangle * 3 + corner
      const b = triangle * 3 + ((corner + 1) % 3)
      const id = edgeKey(position, a, b)
      const met = seen.get(id)

      if (met === undefined) {
        seen.set(id, triangle)
        continue
      }

      const here = regionOf[triangle] ?? -1
      const there = regionOf[met] ?? -1
      if (here === -1 || there === -1 || here === there) continue
      if (kindOf.get(here) !== kindOf.get(there)) continue

      const facing =
        normals[triangle * 3]! * normals[met * 3]! +
        normals[triangle * 3 + 1]! * normals[met * 3 + 1]! +
        normals[triangle * 3 + 2]! * normals[met * 3 + 2]!

      if (facing >= CONTINUES_WITHIN) union(here, there)
    }
  }

  for (const region of regions) surfaces.set(region.idx, find(region.idx))

  return surfaces
}

/** The unit normal of every facet, three components each. */
function facetNormals(geometry: BufferGeometry, triangleCount: number): Float32Array {
  const position = geometry.getAttribute('position')!
  const normals = new Float32Array(triangleCount * 3)

  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const at = triangle * 3
    const ax = position.getX(at)
    const ay = position.getY(at)
    const az = position.getZ(at)
    const bx = position.getX(at + 1) - ax
    const by = position.getY(at + 1) - ay
    const bz = position.getZ(at + 1) - az
    const cx = position.getX(at + 2) - ax
    const cy = position.getY(at + 2) - ay
    const cz = position.getZ(at + 2) - az

    const nx = by * cz - bz * cy
    const ny = bz * cx - bx * cz
    const nz = bx * cy - by * cx
    const length = Math.hypot(nx, ny, nz) || 1

    normals[at] = nx / length
    normals[at + 1] = ny / length
    normals[at + 2] = nz / length
  }

  return normals
}

/** An undirected edge, keyed on its endpoints in a fixed order. */
function edgeKey(
  position: { getX(i: number): number; getY(i: number): number; getZ(i: number): number },
  a: number,
  b: number,
): string {
  const ax = position.getX(a)
  const ay = position.getY(a)
  const az = position.getZ(a)
  const bx = position.getX(b)
  const by = position.getY(b)
  const bz = position.getZ(b)
  const first = ax < bx || (ax === bx && (ay < by || (ay === by && az <= bz)))

  return first ? `${ax},${ay},${az}|${bx},${by},${bz}` : `${bx},${by},${bz}|${ax},${ay},${az}`
}
