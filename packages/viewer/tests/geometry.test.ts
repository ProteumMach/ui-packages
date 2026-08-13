import { type BufferGeometry, Mesh, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { describe, expect, it } from 'vitest'
import {
  PartMeshError,
  loadPartGeometry,
  loadPartMesh,
  parsePartGeometry,
  partMeshAssets,
} from '../src/engine/geometry.js'
import { normalizePartReport } from '../src/engine/normalize.js'
import { assertInstanceOf, cubeModel, loadMeshFixture, loadReportFixture } from './fixtures.js'

/**
 * The loader is where a report and a mesh are declared to be the same artifact,
 * so these tests are mostly about the ways that can be false. They run in node
 * against the real captured GLB: parsing a `POSITION`-only GLB needs no WebGL,
 * which is why the one part of the renderer that can be tested for real is.
 */

const CUBE = { pointCount: 8, triangleCount: 12 }

const cubeGeometry = () => parsePartGeometry(loadMeshFixture('local-0.3.0-cube'), CUBE)

/** Triangle `i` as a flat list of its nine position components. */
function triangle(geometry: BufferGeometry, i: number): number[] {
  const position = geometry.getAttribute('position')
  const index = geometry.index
  const values: number[] = []

  for (let corner = 0; corner < 3; corner += 1) {
    const vertex = index ? index.getX(i * 3 + corner) : i * 3 + corner
    values.push(position.getX(vertex), position.getY(vertex), position.getZ(vertex))
  }

  return values
}

/** The three vertex normals of triangle `i`, which faceted shading makes equal. */
function normalsOf(geometry: BufferGeometry, i: number): [Vector3, Vector3, Vector3] {
  const normal = geometry.getAttribute('normal')
  const at = (corner: number) => new Vector3().fromBufferAttribute(normal, i * 3 + corner)

  return [at(0), at(1), at(2)]
}

describe('parsePartGeometry', () => {
  it('de-indexes the mesh and computes normals', async () => {
    const geometry = await cubeGeometry()

    // 8 shared vertices become 36, three per triangle. Nothing else can carry a
    // per-vertex region attribute: a cube corner belongs to three regions.
    expect(geometry.index).toBeNull()
    expect(geometry.getAttribute('position').count).toBe(36)
    expect(geometry.hasAttribute('normal')).toBe(true)
  })

  /**
   * The regression test for the failure that reads as a rendering bug:
   * `computeVertexNormals()` on the indexed mesh averages the three faces
   * meeting at each corner and smooth-shades a cube. De-indexed, every triangle
   * gets its own flat normal, and a cube has exactly six.
   */
  it('shades the cube faceted, not smooth', async () => {
    const geometry = await cubeGeometry()
    const distinct = new Set<string>()

    for (let i = 0; i < 12; i += 1) {
      const [a, b, c] = normalsOf(geometry, i)

      expect(a.equals(b)).toBe(true)
      expect(a.equals(c)).toBe(true)
      // Axis-aligned, so a smooth-shaded corner normal would fail here too.
      expect(Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z)).toBeCloseTo(1)

      distinct.add(a.toArray().join(','))
    }

    expect(distinct.size).toBe(6)
  })

  /**
   * `toNonIndexed()` looks like it might renumber, and does not: it walks the
   * index buffer in order, three at a time. Everything about picking rests on
   * triangle `i` still being triangle `i` afterwards, so it is asserted on the
   * real mesh rather than assumed from the docs.
   */
  it('preserves triangle order while de-indexing', async () => {
    const { scene } = await new GLTFLoader().parseAsync(loadMeshFixture('local-0.3.0-cube'), '')
    const [indexed] = scene.children
    if (!(indexed instanceof Mesh)) {
      throw new TypeError('The cube fixture should hold one mesh.')
    }
    const geometry = await cubeGeometry()

    expect(indexed.geometry.index?.count).toBe(36)

    for (let i = 0; i < 12; i += 1) {
      expect(triangle(geometry, i)).toEqual(triangle(indexed.geometry, i))
    }
  })

  /**
   * The only end-to-end check that the report's region ranges and the GLB's
   * triangle order agree: each of the cube's six regions is one flat face, so
   * its two triangles must share a normal, and the six region normals must be
   * the six axes. Permuting triangles in the writer would break this without
   * breaking anything else here.
   */
  it("lines its triangles up with the report's region ranges", async () => {
    const { regionIndex, regions } = cubeModel()
    const geometry = await cubeGeometry()

    const axes = new Set<string>()
    for (const region of regions) {
      const [face] = normalsOf(geometry, region.triangles.start)

      for (let i = region.triangles.start; i < region.triangles.end; i += 1) {
        expect(regionIndex.regionForTriangle(i)).toBe(region.idx)
        expect(normalsOf(geometry, i)[0].equals(face)).toBe(true)
      }

      axes.add(face.toArray().join(','))
    }

    expect(axes).toEqual(new Set(['1,0,0', '-1,0,0', '0,1,0', '0,-1,0', '0,0,1', '0,0,-1']))
  })

  it('passes millimetres and Z-up through untouched', async () => {
    const geometry = await cubeGeometry()
    geometry.computeBoundingBox()
    const box = geometry.boundingBox

    // 2 inches = 50.8 mm on every axis, corner at the origin. Not centred and
    // not rotated to glTF's Y-up: part space is what gets rendered.
    expect(box?.min.toArray()).toEqual([0, 0, 0])
    expect(box?.max.toArray().map((value) => Number(value.toFixed(4)))).toEqual([50.8, 50.8, 50.8])
  })
})

describe("parsePartGeometry — a mesh that is not the report's mesh", () => {
  it('rejects a triangle count the report does not describe', async () => {
    await expect(
      parsePartGeometry(loadMeshFixture('local-0.3.0-cube'), { ...CUBE, triangleCount: 11 }),
    ).rejects.toThrow(/describes 11 triangles but the mesh has 12/)
  })

  it('rejects a point count the report does not describe', async () => {
    await expect(
      parsePartGeometry(loadMeshFixture('local-0.3.0-cube'), { ...CUBE, pointCount: 24 }),
    ).rejects.toThrow(/describes 24 points but the mesh has 8/)
  })

  /**
   * The realistic version of this: a mesh from a *different* part parses
   * perfectly, and every region range then points at the wrong surface. The
   * demo report describes 96 triangles; the cube's GLB has 12.
   */
  it('rejects a well-formed GLB belonging to another part', async () => {
    const { mesh } = normalizePartReport(loadReportFixture('local-0.3.0-demo'))

    await expect(parsePartGeometry(loadMeshFixture('local-0.3.0-cube'), mesh)).rejects.toThrow(
      PartMeshError,
    )
  })

  it('rejects bytes that are not a GLB', async () => {
    let error: unknown
    try {
      await parsePartGeometry(new TextEncoder().encode('nope').buffer as ArrayBuffer, CUBE)
    } catch (caught) {
      error = caught
    }

    assertInstanceOf(error, PartMeshError)
    // The parser's own complaint is kept, since it names the actual problem.
    expect(error.cause).toBeDefined()
  })
})

describe('loadPartGeometry', () => {
  it('fetches the given URL rather than one off the report', async () => {
    const seen: string[] = []
    const geometry = await loadPartGeometry('https://example.test/mesh.glb', CUBE, {
      fetch: (input) => {
        seen.push(input)
        return Promise.resolve(new Response(loadMeshFixture('local-0.3.0-cube')))
      },
    })

    expect(seen).toEqual(['https://example.test/mesh.glb'])
    expect(geometry.getAttribute('position').count).toBe(36)
  })

  it('names the expiry when a presigned URL has gone stale', async () => {
    await expect(
      loadPartGeometry('https://example.test/mesh.glb', CUBE, {
        fetch: () => Promise.resolve(new Response('<Error/>', { status: 403 })),
      }),
    ).rejects.toThrow(/403.*expires 15 minutes/s)
  })

  it('forwards an abort signal', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(
      loadPartGeometry('https://example.test/mesh.glb', CUBE, {
        signal: controller.signal,
        fetch: (_input, init) =>
          init?.signal?.aborted
            ? Promise.reject(new DOMException('Aborted', 'AbortError'))
            : Promise.resolve(new Response(loadMeshFixture('local-0.3.0-cube'))),
      }),
    ).rejects.toThrow(/Aborted/)
  })
})

describe('loadPartMesh', () => {
  const mesh = {
    ...CUBE,
    glbUrl: 'https://example.test/part.glb',
    stlUrl: 'https://example.test/part.stl',
    thumbnailUrl: null,
  }

  const stlCube = () =>
    new TextEncoder().encode(
      'solid t\nfacet normal 0 0 1\nouter loop\n' +
        'vertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\n' +
        'endloop\nendfacet\nendsolid',
    )

  it('prefers GLB and keeps STL as the fallback', () => {
    expect(partMeshAssets(mesh)).toEqual([
      { format: 'glb', url: mesh.glbUrl },
      { format: 'stl', url: mesh.stlUrl },
    ])
    expect(partMeshAssets({ glbUrl: null, stlUrl: mesh.stlUrl })).toEqual([
      { format: 'stl', url: mesh.stlUrl },
    ])
  })

  it('falls back to the STL when the GLB cannot be fetched', async () => {
    const geometry = await loadPartMesh(
      { ...mesh, pointCount: 3, triangleCount: 1 },
      {
        fetch: (url) =>
          Promise.resolve(
            url.endsWith('.glb') ? new Response('', { status: 403 }) : new Response(stlCube()),
          ),
      },
    )

    expect(geometry.getAttribute('position').count).toBe(3)
  })

  /**
   * The fallback must not paper over the first failure: "the GLB 403'd and the
   * STL was not a mesh" is two problems, and a caller shown only the second
   * chases the wrong one.
   */
  it('reports every attempt when no artifact loads', async () => {
    let error: unknown
    try {
      await loadPartMesh(mesh, {
        fetch: (url) =>
          Promise.resolve(
            url.endsWith('.glb') ? new Response('', { status: 403 }) : new Response('not a mesh'),
          ),
      })
    } catch (caught) {
      error = caught
    }

    assertInstanceOf(error, AggregateError)
    expect(error.errors).toHaveLength(2)
    expect(String(error.errors[0])).toMatch(/403/)
  })

  it('says so when the report carries no mesh at all', async () => {
    await expect(
      loadPartMesh({ ...CUBE, glbUrl: null, stlUrl: null, thumbnailUrl: null }),
    ).rejects.toThrow(/neither a GLB nor an STL/)
  })
})
