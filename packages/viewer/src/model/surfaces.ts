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
 * Two regions continue each other when they meet along an edge, are both
 * **planes**, and are flat to within a degree of one another — which for a
 * plane means they are the same plane.
 *
 * Planes only, and that is a limit of what the report says rather than caution.
 * A region carries an `idx`, a `shapeKind`, an area and a triangle range: there
 * is nothing in it that says which analytic surface a region was cut from. On a
 * flat face that does not matter, because two coplanar planes meeting along an
 * edge *are* one plane and no part has an edge there. On a curved one it
 * matters entirely: a fillet running tangentially into a shaft and a fillet
 * split down the middle look identical from the facets alone, and guessing
 * between them either rubs out a line the part has or leaves one it does not.
 * A line the part has is the worse of the two to lose, so curved boundaries are
 * all drawn.
 *
 * All of which is the fallback. A report that carries `splitOrigin` — which the
 * schema now requires — is grouped by what the Engine said instead, exactly,
 * for every kind of surface.
 */

/**
 * How far two planes may disagree across a shared edge and still be one plane.
 *
 * A degree, which is a rounding error rather than a judgement: a split is
 * exactly coplanar, and anything a part actually turns through is a chamfer at
 * fifteen degrees or more.
 */
export const CONTINUES_WITHIN = Math.cos((1 * Math.PI) / 180)

/** The one kind whose regions can be merged from the facets alone. */
const MERGEABLE = 'Plane'

/** Region index → the surface it belongs to, by region `idx`. */
export type SurfaceOf = ReadonlyMap<number, number>

/**
 * Worked out once per mesh.
 *
 * Three things ask for this — the edges, the shading and the paint — and it is
 * a pass over every facet, which on a real part is 90 000 of them. Keyed on the
 * geometry and checked against the regions it was built from, so a different
 * model on the same buffer recomputes rather than answering for the wrong part.
 */
const worked = new WeakMap<BufferGeometry, { regions: readonly PartModelRegion[]; of: SurfaceOf }>()

export function visualSurfaces(
  geometry: BufferGeometry,
  regions: readonly PartModelRegion[],
): SurfaceOf {
  const already = worked.get(geometry)
  if (already && already.regions === regions) return already.of

  const found = computeSurfaces(geometry, regions)
  worked.set(geometry, { regions, of: found })

  return found
}

function computeSurfaces(geometry: BufferGeometry, regions: readonly PartModelRegion[]): SurfaceOf {
  // Where the report names the face a region was cut from, there is nothing to
  // work out: equal `splitOrigin` is one face. That answer is exact for every
  // kind — a split down a fillet merges, and the fillet's junction with the
  // shaft keeps its line — which is what the geometry below can only manage for
  // planes.
  const stated = statedSurfaces(regions)
  if (stated) return stated

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

      if (kindOf.get(here) !== MERGEABLE) continue
      if (facing >= CONTINUES_WITHIN) union(here, there)
    }
  }

  for (const region of regions) surfaces.set(region.idx, find(region.idx))

  return surfaces
}

/**
 * The grouping the report states, or `null` where it does not state one.
 *
 * All or nothing: a report that names the surface for some regions and not
 * others would leave the rest to be inferred by different rules, and two
 * halves of one face grouped by two different methods is worse than either.
 */
function statedSurfaces(regions: readonly PartModelRegion[]): SurfaceOf | null {
  const surfaces = new Map<number, number>()

  for (const region of regions) {
    if (region.splitOrigin === undefined) return null
    surfaces.set(region.idx, region.splitOrigin)
  }

  return regions.length > 0 ? surfaces : null
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
