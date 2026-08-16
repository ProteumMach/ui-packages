import { describe, expect, it } from 'vitest'
import { parsePartGeometry } from '../src/engine/geometry.js'
import type { PartModel } from '../src/model/types.js'
import {
  CANDIDATE_WEIGHT,
  HIGHLIGHT_WEIGHT,
  HOVER_WEIGHT,
  type HighlightLayers,
  applyHighlightLayers,
} from '../src/render/paint.js'
import { type PartObject, createPart } from '../src/render/part.js'
import { DEFAULT_THEME, directionColor } from '../src/render/theme.js'
import { cubeModel, loadMeshFixture } from './fixtures.js'

/**
 * A face can only be one colour: the part is one mesh and each region carries a
 * single texel. So the whole specification is an *order* — which layer wins a
 * face when two of them want it — and that is what is pinned here.
 */

const BAND = 0x4ea172

async function loadCube(): Promise<{ model: PartModel; part: PartObject }> {
  const model = cubeModel()
  const geometry = await parsePartGeometry(loadMeshFixture('local-0.3.0-cube'), model.mesh)
  return { model, part: createPart(model, geometry, DEFAULT_THEME) }
}

function paint(part: PartObject, layers: HighlightLayers) {
  applyHighlightLayers(part, layers, DEFAULT_THEME)
}

/**
 * A colour as it survives the state texture.
 *
 * The texel is eight bits per channel in the renderer's working space, so a
 * paint round-trips to within a bit or two rather than exactly. Comparing
 * against a colour put through the same trip keeps these tests about *which*
 * layer won a face rather than about quantization.
 */
function quantized(part: PartObject, color: number): number {
  const scratch = 5
  const before = part.regionPaint(scratch)
  part.paintRegion(scratch, color, 1)
  const round = part.regionPaint(scratch)?.color
  part.paintRegion(scratch, before?.color ?? 0, before?.weight ?? 0)
  if (round === undefined) throw new Error('The cube fixture should have a region 5.')
  return round
}

/** A feature owning exactly one region, so a paint on it is unambiguous. */
function faceOn(model: PartModel, z: 1 | -1) {
  const face = model.features.find(
    (feature) => feature.featureType === 'face' && feature.machiningDirection.z === z,
  )
  if (!face) throw new Error('The cube fixture should have a face on each of ±Z.')
  return { tag: face.tag, region: model.regionIndex.regionsForFeature(face.tag)[0]! }
}

describe('applyHighlightLayers — the order is the specification', () => {
  it('lets a selection beat the consumer’s own colouring', async () => {
    const { model, part } = await loadCube()
    const face = faceOn(model, 1)

    paint(part, { highlights: [{ tag: face.tag, color: BAND }], selection: [face.tag] })

    // Not blended, not averaged: the later layer takes the face outright.
    expect(part.regionPaint(face.region)?.color).toBe(quantized(part, DEFAULT_THEME.highlight))
    expect(part.regionPaint(face.region)?.weight).toBe(1)
  })

  it('lets the pointer beat everything it has not just selected', async () => {
    const { model, part } = await loadCube()
    const top = faceOn(model, 1)
    const bottom = faceOn(model, -1)

    paint(part, {
      highlights: [{ tag: bottom.tag, color: BAND }],
      selection: [top.tag],
      hoverRegion: bottom.region,
    })

    // A question asked with the mouse wins over a decision already made — the
    // decision is still there when the pointer moves away.
    expect(part.regionPaint(bottom.region)?.color).toBe(quantized(part, DEFAULT_THEME.hover))
    expect(part.regionPaint(bottom.region)?.weight).toBeCloseTo(HOVER_WEIGHT, 2)
  })

  it('leaves the face it just selected in the selection colour', async () => {
    const { model, part } = await loadCube()
    const face = faceOn(model, 1)

    paint(part, { selection: [face.tag], hoverRegion: face.region })

    // Clicking a face and having it answer in the colour it already had reads
    // as the click not having landed. The pointer is still on it, but there is
    // nothing left to ask.
    expect(part.regionPaint(face.region)?.color).toBe(quantized(part, DEFAULT_THEME.highlight))
    expect(part.regionPaint(face.region)?.weight).toBe(1)
  })

  it('lets a named face beat the feature colouring under it', async () => {
    const { model, part } = await loadCube()
    const face = faceOn(model, 1)

    paint(part, {
      highlights: [{ tag: face.tag, color: BAND }],
      regionHighlights: [{ region: face.region, color: 0x8b5cf6 }],
    })

    expect(part.regionPaint(face.region)?.color).toBe(quantized(part, 0x8b5cf6))
  })

  it('paints candidates in their own direction colour, under the selection', async () => {
    const { model, part } = await loadCube()
    const top = faceOn(model, 1)
    const bottom = faceOn(model, -1)

    paint(part, { candidates: [top.tag, bottom.tag], selection: [top.tag] })

    // +Z and −Z are candidateDirections 0 and 1, so the two faces read as
    // different ways up rather than as one undifferentiated "could be this".
    expect(part.regionPaint(bottom.region)?.color).toBe(quantized(part, directionColor(1)))
    expect(part.regionPaint(bottom.region)?.color).not.toBe(quantized(part, directionColor(0)))
    expect(part.regionPaint(bottom.region)?.weight).toBeCloseTo(CANDIDATE_WEIGHT, 2)
    expect(part.regionPaint(top.region)?.weight).toBe(1)
  })

  it('gives an unplaced candidate a colour rather than dropping it', async () => {
    const { model, part } = await loadCube()
    const face = faceOn(model, 1)
    const unplaced: PartModel = {
      ...model,
      features: model.features.map((feature) =>
        feature.tag === face.tag
          ? { ...feature, machiningDirection: { x: 0.577, y: 0.577, z: 0.577 } }
          : feature,
      ),
    }

    applyHighlightLayers({ ...part, model: unplaced }, { candidates: [face.tag] }, DEFAULT_THEME)

    expect(part.regionPaint(face.region)?.color).toBe(quantized(part, DEFAULT_THEME.hover))
    expect(part.regionPaint(face.region)?.weight).toBeCloseTo(CANDIDATE_WEIGHT, 2)
  })

  it('defaults a consumer layer to a wash the two pointer layers stay legible over', async () => {
    const { model, part } = await loadCube()
    const face = faceOn(model, 1)

    paint(part, { highlights: [{ tag: face.tag, color: BAND }] })
    expect(part.regionPaint(face.region)?.weight).toBeCloseTo(HIGHLIGHT_WEIGHT, 2)

    paint(part, { highlights: [{ tag: face.tag, color: BAND, weight: 1 }] })
    expect(part.regionPaint(face.region)?.weight).toBe(1)
  })

  it('shows a held face over the reading it resolved to', async () => {
    const { model, part } = await loadCube()
    const face = faceOn(model, 1)

    paint(part, { selection: [face.tag], pickedRegions: [face.region] })

    // The reading a click guesses is painted, so a held face under it would
    // vanish and a modifier-click would look like it did nothing.
    expect(part.regionPaint(face.region)?.color).toBe(quantized(part, DEFAULT_THEME.picked))
    expect(part.regionPaint(face.region)?.weight).toBe(1)
  })

  it('still lets the pointer beat a held face', async () => {
    const { model, part } = await loadCube()
    const face = faceOn(model, 1)

    paint(part, { pickedRegions: [face.region], hoverRegion: face.region })

    expect(part.regionPaint(face.region)?.color).toBe(quantized(part, DEFAULT_THEME.hover))
  })

  it('clears what the previous paint left behind', async () => {
    const { model, part } = await loadCube()
    const face = faceOn(model, 1)

    paint(part, { selection: [face.tag] })
    paint(part, {})

    expect(part.regionPaint(face.region)?.weight).toBe(0)
  })

  it('leaves a face no layer claims bare', async () => {
    const { model, part } = await loadCube()
    const top = faceOn(model, 1)
    const bottom = faceOn(model, -1)

    paint(part, { selection: [top.tag] })

    // "Not yet cut" reading as absence rather than as a colour is what makes
    // coverage legible at a glance.
    expect(part.regionPaint(bottom.region)?.weight).toBe(0)
  })
})

describe('a split is not a hole in the highlight', () => {
  /**
   * The Engine divides a surface where that makes a better machining plan. One
   * face of the cube, cut into its two triangles: still one flat face, and two
   * regions for a feature to own separately.
   */
  async function splitFace() {
    const model = cubeModel()
    const geometry = await parsePartGeometry(loadMeshFixture('local-0.3.0-cube'), model.mesh)
    const face = model.features.find(
      (feature) => feature.featureType === 'face' && feature.machiningDirection.z === 1,
    )!
    const whole = model.regions.find(
      (region) => region.idx === model.regionIndex.regionsForFeature(face.tag)[0],
    )!
    const half = {
      ...whole,
      idx: model.regions.length,
      triangles: { start: whole.triangles.start + 1, end: whole.triangles.end },
    }
    const split: PartModel = {
      ...model,
      regions: [
        ...model.regions.map((region) =>
          region.idx === whole.idx
            ? {
                ...region,
                triangles: { start: whole.triangles.start, end: whole.triangles.start + 1 },
              }
            : region,
        ),
        half,
      ],
    }

    return {
      model: split,
      part: createPart(split, geometry, DEFAULT_THEME),
      kept: whole.idx,
      cut: half.idx,
      tag: face.tag,
    }
  }

  it('carries a paint across a split nobody else claims', async () => {
    const { part, kept, cut, tag } = await splitFace()

    // The feature owns only the half the region index knows about; the other
    // half was bare, which reads as a hole in the highlight rather than a
    // split in the plan.
    paint(part, { selection: [tag] })

    expect(part.regionPaint(kept)?.color).toBe(quantized(part, DEFAULT_THEME.highlight))
    expect(part.regionPaint(cut)?.color).toBe(quantized(part, DEFAULT_THEME.highlight))
  })

  it('leaves a surface two paints disagree over alone', async () => {
    const { part, kept, cut, tag } = await splitFace()

    paint(part, { selection: [tag], regionHighlights: [{ region: cut, color: BAND, weight: 1 }] })

    // Two claims on one surface is the reason it was split. Neither spreads
    // over the other.
    expect(part.regionPaint(kept)?.color).toBe(quantized(part, DEFAULT_THEME.highlight))
    expect(part.regionPaint(cut)?.color).toBe(quantized(part, BAND))
  })
})
