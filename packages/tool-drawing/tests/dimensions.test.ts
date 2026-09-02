import { describe, expect, it } from 'vitest'
import {
  bandOffset,
  bandRoom,
  dimensionLabel,
  dimensionLayout,
  dimensionsFor,
  figureHeight,
  figureType,
  laneOffset,
  stackLabels,
} from '../src/index.js'
import type { BandRoom, ViewerAssembly, ViewerHolder, ViewerTool } from '../src/index.js'

const tool = (geometry: Record<string, number>, form = 'flat end mill'): ViewerTool => ({
  form,
  label: 'TDMX0500',
  geometry,
  provenance: {},
})

/** A plain end mill: no relief behind the flutes. */
const plain = tool({ DC: 12, LCF: 30, OAL: 80, SFDM: 12, RE: 0.5 })

/** A necked one: the relief is under the shank and past the flutes. */
const necked = tool({
  DC: 6,
  LCF: 12,
  OAL: 75,
  SFDM: 6,
  'shoulder-diameter': 5.4,
  'shoulder-length': 40,
})

const holder = (gaugeLength: number | null): ViewerHolder => ({
  gaugeLength,
  colletSeries: 'PG10',
  noseDiameter: 16,
  noseLength: null,
  bodyDiameter: null,
  bodyLength: null,
  projection: null,
  flangeDiameter: 46,
  colletProtrusion: null,
  provenance: {},
})

const alone = (each: ViewerTool): ViewerAssembly => ({
  tool: each,
  holder: null,
  stickout: null,
})

const codes = (dims: ReadonlyArray<{ code: string }>) => dims.map((each) => each.code)

describe('what a drawing of the tool alone dimensions', () => {
  it('measures the cut, the shank and the two lengths', () => {
    const { widths, lengths } = dimensionsFor(alone(plain))

    expect(codes(widths)).toEqual(['DC', 'SFDM'])
    expect(codes(lengths)).toEqual(['LCF', 'OAL'])
  })

  /** Every length is measured from the tip, which is where the sheet measures from. */
  it('measures every length from the tip', () => {
    expect(dimensionsFor(alone(plain)).lengths.every((each) => each.from === 0)).toBe(true)
  })

  /**
   * Shortest innermost. Lanes assigned in the order they were listed would
   * cross the moment a tool's shoulder ran past its flutes.
   */
  it('nests the lines shortest first, so none crosses another', () => {
    const { lengths } = dimensionsFor(alone(necked))

    expect(lengths.map((each) => [each.code, each.lane])).toEqual([
      ['LCF', 0],
      ['shoulder-length', 1],
      ['OAL', 2],
    ])
  })

  it('dimensions the relief only on a tool that has one', () => {
    expect(codes(dimensionsFor(alone(necked)).widths)).toContain('shoulder-diameter')
    expect(codes(dimensionsFor(alone(plain)).widths)).not.toContain('shoulder-diameter')
    expect(codes(dimensionsFor(alone(plain)).lengths)).not.toContain('shoulder-length')
  })

  /** A vendor's own number or nothing: a corner radius of zero is a square end, not a radius. */
  it('calls out a corner radius only where one is stated', () => {
    expect(dimensionsFor(alone(plain)).cornerRadius).toBe(0.5)
    expect(dimensionsFor(alone(tool({ DC: 12, LCF: 30, RE: 0 }))).cornerRadius).toBeNull()
  })

  it('draws nothing for a tool that states no diameter or flute length', () => {
    expect(dimensionsFor(alone(tool({ OAL: 80 })))).toEqual({
      lengths: [],
      widths: [],
      angles: [],
      cornerRadius: null,
    })
  })
})

describe('what the holder adds, and what it takes away', () => {
  const assembly = (stickout: number | null, gauge: number | null = 98.4): ViewerAssembly => ({
    tool: plain,
    holder: holder(gauge),
    stickout,
  })

  /**
   * Most of the shank is inside the holder, so a line to the end of it
   * measures to a face nobody can see.
   */
  it('drops the overall length and states the stickout instead', () => {
    const { lengths } = dimensionsFor(assembly(45))

    expect(codes(lengths)).not.toContain('OAL')
    expect(codes(lengths)).toContain('stickout')
  })

  /**
   * Neither drawing reaches the spindle face — both stop past the flange — so
   * a gauge-length line would point at a face that is not there.
   */
  it('never dimensions the gauge length, stated or not', () => {
    expect(codes(dimensionsFor(assembly(45)).lengths)).toEqual(['LCF', 'stickout'])
    expect(codes(dimensionsFor(assembly(45, null)).lengths)).toEqual(['LCF', 'stickout'])
  })

  it('measures the shank above the nose, not inside the holder', () => {
    const { widths } = dimensionsFor(assembly(45))
    const shank = widths.find((each) => each.code === 'SFDM')

    expect(shank?.at).toBeGreaterThan(30)
    expect(shank?.at).toBeLessThanOrEqual(45)
  })
})

describe('what a dimension is called', () => {
  it('keeps a code that is already a name, and names the ones that are not', () => {
    expect(dimensionLabel('LCF')).toBe('LCF')
    expect(dimensionLabel('shoulder-length')).toBe('shoulder')
  })
})

/**
 * The stacker moves a clash **away from the tip**, which is what "up" meant
 * back when the tool was always drawn standing. So the numbers here run the
 * other way from the drawing this was ported from: `along` grows away from the
 * tip, where screen `y` grew toward it.
 */
describe('labels that would cover each other', () => {
  const box = (key: string, across: number, along: number) => ({
    key,
    across,
    width: 10,
    along,
    height: 4,
  })

  it('stacks overlapping boxes away from the tip', () => {
    const placed = stackLabels([box('a', 0, 100), box('b', 2, 102)])

    expect(placed.get('a')).toBe(100)
    expect(placed.get('b')).toBe(104)
  })

  it('leaves boxes that do not overlap where they are', () => {
    const placed = stackLabels([box('a', 0, 100), box('b', 40, 102), box('c', 0, 120)])

    expect(placed.get('b')).toBe(102)
    expect(placed.get('c')).toBe(120)
  })

  /** Three in a heap end up in a column, in the order they were nearest. */
  it('stacks a heap of three', () => {
    const placed = stackLabels([box('a', 0, 100), box('b', 1, 101), box('c', 2, 102)])

    expect([placed.get('a'), placed.get('b'), placed.get('c')]).toEqual([100, 104, 108])
  })

  it('rises clear of a box that cannot move', () => {
    const placed = stackLabels([box('a', 0, 100)], 0, [box('line', 0, 98)])

    expect(placed.get('a')).toBe(102)
  })
})

/**
 * **A drill is its point** (Paul, 2026-09-01: "shouldn't a 2d rep of a drill be
 * showing me a tip angle?"). On a ⌀1 drill the cone is three tenths of a
 * millimetre tall, so the number is the only way the drawing says 140°.
 */
describe('the tip angle', () => {
  it('calls out a drill’s stated tip angle, on the flank it is between', () => {
    const drill = dimensionsFor(alone(tool({ DC: 10, LCF: 40, OAL: 100, SIG: 140 }, 'drill')))

    expect(drill.angles).toEqual([
      { code: 'SIG', degrees: 140, at: { r: 2.5, z: expect.closeTo(0.911, 2) } },
    ])
  })

  it('says nothing about a tool with no point, or a drill that states no angle', () => {
    expect(dimensionsFor(alone(tool({ DC: 10, LCF: 40, SIG: 140 }))).angles).toEqual([])
    expect(dimensionsFor(alone(tool({ DC: 10, LCF: 40 }, 'drill'))).angles).toEqual([])
  })

  /** Called what the table beside it calls it (Paul, 2026-09-01). */
  it('letters it “tip angle”, the way the measurement table does', () => {
    expect(dimensionLabel('SIG')).toBe('tip angle')
  })
})

const format = (mm: number) => `${String(Math.round(mm * 100) / 100)} mm`

describe('the bands the figures stand in', () => {
  const model = dimensionsFor(alone(necked))

  it('puts the widths in the first band and each length outboard of its own lane', () => {
    const layout = dimensionLayout(model, format, 12)
    const band = new Map(layout.figures.map((each) => [each.code, each.band]))

    expect(band.get('DC')).toBe(0)
    expect(band.get('shoulder-diameter')).toBe(0)
    expect(band.get('LCF')).toBe(1)
    expect(band.get('shoulder-length')).toBe(2)
    expect(band.get('OAL')).toBe(3)
  })

  it('keeps everything on one flank unless both are offered', () => {
    const one = dimensionLayout(model, format, 12, 'one')
    expect(one.figures.every((each) => each.side === 'minus')).toBe(true)
    expect(one.bands.plus).toEqual([])

    const both = dimensionLayout(model, format, 12, 'both')
    expect(both.figures.some((each) => each.side === 'plus')).toBe(true)
    expect(both.bands.plus.length).toBeGreaterThan(0)
  })

  it('sizes a band by the widest figure in it, because that room comes out of the tool', () => {
    const layout = dimensionLayout(model, format, 12)
    for (const [index, width] of layout.bands.minus.entries()) {
      const inBand = layout.figures.filter((each) => each.side === 'minus' && each.band === index)
      expect(width).toBe(Math.max(...inBand.map((each) => each.across)))
    }
  })

  /**
   * **Text is the one thing in the drawing that does not rotate.** A figure
   * twelve characters wide and two lines deep is wide on the screen whichever
   * way the tool runs, so when the tool is laid along the sheet that figure
   * reaches mostly along the tool, and the bands — which are measured across
   * it — become as thin as the type is tall.
   */
  it('swaps a figure’s two extents when the type reads along the axis', () => {
    const upright = dimensionLayout(model, format, 12, 'one', false)
    const laid = dimensionLayout(model, format, 12, 'one', true)
    const of = (layout: typeof upright, code: string) =>
      layout.figures.find((each) => each.code === code)!

    expect(of(laid, 'LCF').across).toBe(of(upright, 'LCF').along)
    expect(of(laid, 'LCF').along).toBe(of(upright, 'LCF').across)
    // And the bands follow the across measure, so they are much thinner.
    expect(Math.max(...laid.bands.minus)).toBeLessThan(Math.max(...upright.bands.minus))
  })

  it('measures a figure’s depth the way the renderer sets it', () => {
    const layout = dimensionLayout(model, format, 12)
    const type = figureType(12)
    const dc = layout.figures.find((each) => each.code === 'DC')!

    expect(dc.along).toBe(figureHeight(dc.lines.length, type))
  })
})

describe('the room a side’s bands take', () => {
  const room: BandRoom = { arrow: 10, gap: 2 }

  it('starts past the arrows and steps out one band at a time', () => {
    expect(bandOffset([4, 6], 0, room)).toBe(12)
    expect(bandOffset([4, 6], 1, room)).toBe(12 + 4 + 4)
  })

  it('runs a lane just outboard of the band that carries its figure', () => {
    expect(laneOffset([4, 6], 0, room)).toBe(12 + 4 + 2)
  })

  it('reaches to the far edge of the last band, and is nothing where there are none', () => {
    expect(bandRoom([4, 6], room)).toBe(12 + 4 + 4 + 6)
    expect(bandRoom([], room)).toBe(0)
  })
})
