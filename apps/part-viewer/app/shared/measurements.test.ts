import { describe, expect, it } from 'vitest'
import type { PartFeature } from './contracts'
import { measurements, partTop, stripMeasurements } from './measurements'

/**
 * The datasheet is dozens of fields under the Engine's own names. These are the
 * handful of questions anybody actually asks of one, and the arithmetic that
 * turns the fields into them.
 */

const PZ = { x: 0, y: 0, z: 1 }
const NY = { x: 0, y: -1, z: 0 }

const feature = (over: Partial<PartFeature> & { datasheet?: unknown }): PartFeature =>
  ({
    featureId: 'id',
    featureTag: 'tag',
    featureType: 'pocket',
    regionIdxs: [1],
    machiningDirection: PZ,
    axis: null,
    ...over,
  }) as PartFeature

const regions = [
  { idx: 1, shapeKind: 'Plane' },
  { idx: 2, shapeKind: 'Cylinder' },
  { idx: 3, shapeKind: 'Cylinder' },
]

const rowsFor = (subject: PartFeature, others: PartFeature[] = [], unit: 'mm' | 'in' = 'mm') =>
  measurements({ feature: subject, features: [subject, ...others], regions, unit })

const valueOf = (subject: PartFeature, key: string, others: PartFeature[] = []) =>
  rowsFor(subject, others).find((row) => row.key === key)?.value

describe('partTop', () => {
  it('is the highest zMax of everything cut the same way up', () => {
    const subject = feature({ datasheet: { zMax: 10, zMin: 4 } })
    const taller = feature({ datasheet: { zMax: 25, zMin: 0 } })

    // The report carries no part top, so this stands in for it.
    expect(partTop([subject, taller], subject)).toBe(25)
  })

  it('ignores features cut from another direction', () => {
    const subject = feature({ datasheet: { zMax: 10, zMin: 4 } })
    const sideways = feature({ machiningDirection: NY, datasheet: { zMax: 99, zMin: 0 } })

    // A tall feature reached from the side says nothing about how far a tool
    // travels coming down from above.
    expect(partTop([subject, sideways], subject)).toBe(10)
  })

  it('is null when nothing cut that way reports a depth', () => {
    expect(partTop([feature({ datasheet: {} })], feature({ datasheet: {} }))).toBeNull()
  })
})

describe('measurements', () => {
  it('reads depth from the part top rather than from the feature', () => {
    const subject = feature({ datasheet: { zMax: 10, zMin: 4 } })
    const taller = feature({ datasheet: { zMax: 25, zMin: 0 } })

    expect(valueOf(subject, 'depthBelowTop', [taller])).toBe('21.00 mm')
    // Its own extent is a different question, and both are worth having.
    expect(valueOf(subject, 'featureDepth', [taller])).toBe('6.00 mm')
  })

  it('prefers the extended bounds, which is what a tool has to clear', () => {
    const subject = feature({ datasheet: { extendedZMax: 12, zMax: 10, extendedZMin: 2, zMin: 4 } })

    expect(valueOf(subject, 'featureDepth')).toBe('10.00 mm')
  })

  it('halves the cutter diameter to get a radius', () => {
    const subject = feature({
      datasheet: { facts: { kind: 'Pocket', cd: { ignore: { min: 6 } } } },
    })

    expect(valueOf(subject, 'minRadius')).toBe('3.00 mm')
  })

  it('splits surface area into walls and floors, since the Engine does', () => {
    const subject = feature({ datasheet: { wallishArea: 40, floorishArea: 60 } })
    const rows = rowsFor(subject)

    expect(rows.find((row) => row.key === 'area')?.value).toBe('100.00 mm²')
    expect(rows.find((row) => row.key === 'walls')?.value).toBe('40.00 mm²')
    expect(rows.find((row) => row.key === 'floors')?.value).toBe('60.00 mm²')
  })

  it('counts faces by the shape the Engine gave them', () => {
    const subject = feature({ regionIdxs: [1, 2, 3] })

    expect(valueOf(subject, 'faces')).toBe('2 × Cylinder, 1 × Plane')
  })

  it('measures a hole against its bore and a pocket against its cutter', () => {
    const hole = feature({
      datasheet: { zMax: 10, zMin: 0, facts: { kind: 'Hole', diameter: 5 } },
    })
    const pocket = feature({
      datasheet: { zMax: 10, zMin: 0, facts: { kind: 'Pocket', cd: { ignore: { min: 4 } } } },
    })

    // Nothing wider than the bore goes in it, so a hole is judged on diameter.
    expect(rowsFor(hole).find((row) => row.key === 'ld')?.label).toBe('Drilling L/D')
    expect(valueOf(hole, 'ld')).toBe('2.00')
    expect(rowsFor(pocket).find((row) => row.key === 'ld')?.label).toBe('Milling L/D')
  })

  /**
   * A row left out rather than shown empty: "—" against a field the Engine
   * never reports for this type reads as a measurement that failed, and a wall
   * carries almost none of them.
   */
  it('leaves out what this feature type does not report', () => {
    const wall = feature({ featureType: 'wall', datasheet: {} })
    const keys = rowsFor(wall).map((row) => row.key)

    expect(keys).toEqual(['faces'])
  })

  it('says where every number came from', () => {
    const subject = feature({ datasheet: { zMax: 10, zMin: 4, wallishArea: 1 } })

    // A number a shop cannot trace is one they have to take on faith.
    for (const row of rowsFor(subject)) expect(row.from).not.toBe('')
  })
})

describe('the unit it is read in', () => {
  it('converts every length and area, and keeps the arithmetic in millimetres', () => {
    const subject = feature({ datasheet: { zMax: 8.89, zMin: 0, wallishArea: 806.45 } })
    const inches = rowsFor(subject, [], 'in')

    // The Engine reports millimetres; the conversion happens where it is shown.
    expect(inches.find((row) => row.key === 'featureDepth')?.value).toBe('0.350 in')
    expect(inches.find((row) => row.key === 'walls')?.value).toBe('1.250 in²')
  })
})

describe('stripMeasurements', () => {
  it('picks the numbers a tool is chosen with, in a fixed order', () => {
    const subject = feature({
      datasheet: { zMax: 10, zMin: 4, wallishArea: 1, floorishArea: 1 },
    })

    const strip = stripMeasurements(rowsFor(subject))
    expect(strip.map((row) => row.key)).toEqual(['depthBelowTop', 'featureDepth', 'area'])
  })

  it('is a selection from the same rows the table shows, so the two agree', () => {
    const subject = feature({ datasheet: { zMax: 10, zMin: 4 } })
    const rows = rowsFor(subject)

    for (const row of stripMeasurements(rows)) expect(rows).toContain(row)
  })
})

describe('the two radii a pocket has', () => {
  const pocket = {
    featureTag: 'pocket-1',
    featureType: 'filleted_pocket',
    regionIdxs: [0],
    machiningDirection: { x: 0, y: -1, z: 0 },
    datasheet: {
      facts: {
        kind: 'Pocket',
        cd: { ignore: { min: 6.616 }, terminalCornerRadius: 0.508 },
        filletRadius: 0.508,
      },
      zMax: 10.16,
      zMin: 8.5725,
      partZMax: 10.16,
    },
  } as never

  it('tells the tool it admits from the corner it has', () => {
    // A feature can admit a 6.6 mm cutter and still have a 0.5 mm corner in it.
    // Showing only the first under the name "minimum radius" read as the
    // second, which is 6.5× out.
    const rows = measurements({ feature: pocket, features: [pocket], regions: [], unit: 'mm' })
    const row = (key: string) => rows.find((each) => each.key === key)

    expect(row('minRadius')?.label).toBe('Smallest tool radius')
    expect(row('minRadius')?.value).toContain('3.31')
    expect(row('cornerRadius')?.value).toContain('0.51')
    expect(row('cornerRadius')?.from).toBe('facts.cd.terminalCornerRadius')
  })
})
