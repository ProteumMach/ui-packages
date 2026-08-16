import { describe, expect, test } from 'vitest'
import type { PartFeature } from './contracts'
import { METRICS, metricFormula, metricSources, partContext, readMetrics } from './metrics'
import { measurements } from './measurements'

/**
 * The metrics are arithmetic over the Engine's datasheet, so what these pin is
 * the arithmetic and the silence: a field the Engine never reported has to come
 * back `null` rather than as a number somebody's rule will then band.
 */

const hole = (facts: Record<string, unknown> = {}, sheet: Record<string, unknown> = {}) =>
  ({
    featureTag: 'hole-1',
    featureType: 'blind_hole',
    regionIdxs: [0],
    machiningDirection: { x: 0, y: 0, z: 1 },
    axis: { x: 0, y: 0, z: 1 },
    datasheet: {
      facts: { kind: 'Hole', diameter: 6.35, ...facts },
      zMax: 0,
      zMin: -25.4,
      partZMax: 0,
      ...sheet,
    },
  }) as unknown as PartFeature

describe('readMetrics', () => {
  test('works a drilling L/D out of the reach and the bore', () => {
    // 25.4 deep in a 6.35 bore is 4:1, which is where a standard drill starts
    // wanting a peck cycle.
    expect(readMetrics(hole()).drillingLD).toBeCloseTo(4, 6)
    expect(readMetrics(hole()).holeDiameter).toBeCloseTo(6.35, 6)
  })

  test('says nothing about a measurement the Engine never reported', () => {
    const bare = readMetrics(hole({ diameter: undefined }))

    // Not zero, and not a guess. A rule reading this has to stand down.
    expect(bare.holeDiameter).toBe(null)
    expect(bare.drillingLD).toBe(null)
  })

  test('gives a feature with no datasheet at all a full set of nulls', () => {
    const bare = { ...hole(), datasheet: null } as PartFeature

    expect(Object.values(readMetrics(bare)).every((value) => value === null)).toBe(true)
  })

  test('reads degrees as degrees, whichever spelling the kernel used', () => {
    // Kernel 0.4.0 renames `angleRad` to `angleDeg` as it converts. Reading the
    // wrong one either way is an error of 57×.
    const inRadians = hole({ kind: 'Chamfer', bevel: { angleRad: Math.PI / 4 } })
    const inDegrees = hole({ kind: 'Chamfer', bevel: { angleDeg: 45 } })

    expect(readMetrics(inRadians).chamferAngle).toBeCloseTo(45, 4)
    expect(readMetrics(inDegrees).chamferAngle).toBeCloseTo(45, 4)
  })

  test('falls back to the tallest surface cut this way up when no partZMax is reported', () => {
    const older = hole({}, { partZMax: undefined })
    const context = partContext([
      older,
      { ...older, datasheet: { ...older.datasheet, zMax: 10 } } as PartFeature,
    ])

    // The reach is measured from the highest surface the Engine attributed to
    // this direction, which is not the top of the stock — the reason these read
    // large on an older report.
    expect(readMetrics(older, context).depthBelowPartTop).toBeCloseTo(35.4, 6)
  })
})

describe('showing the working', () => {
  test('every metric names the fields it read and what they held', () => {
    const readings = metricSources('drillingLD', hole())

    expect(readings.length).toBeGreaterThan(0)
    expect(readings.every((reading) => typeof reading.path === 'string')).toBe(true)
    expect(readings.some((reading) => reading.value !== null)).toBe(true)
  })

  test('says so plainly when the feature has no datasheet', () => {
    const bare = { ...hole(), datasheet: null } as PartFeature

    expect(metricSources('drillingLD', bare)).toEqual([
      { path: 'datasheet', value: null, note: 'this feature has none' },
    ])
  })

  test('explains every number it does produce', () => {
    const measured = readMetrics(hole({ cd: { ignore: { min: 3.175 } } }))
    const feature = hole({ cd: { ignore: { min: 3.175 } } })

    // A number a shop cannot trace is one they have to take on faith, which is
    // the whole argument for showing the Engine's own measurements. Either
    // arithmetic or the field it came straight off counts as an explanation —
    // a hole diameter *is* `facts.diameter`, and there is nothing to derive. A
    // metric that stayed quiet needs neither.
    const unexplained = METRICS.filter(
      (metric) =>
        measured[metric.id] !== null && !metricFormula(metric.id, feature) && !metric.field,
    )

    expect(unexplained.map((metric) => metric.id)).toEqual([])
  })
})

/**
 * The differential pass.
 *
 * `measurements.ts` reads the same datasheet for the detail panel, and until
 * one of the two goes they have to agree. Where they do not, one of them is
 * wrong about the Engine — which is worth knowing before either is deleted.
 */
describe('the two readers of the datasheet agree', () => {
  const feature = hole(
    { cd: { ignore: { min: 3.175 } }, filletRadius: 1.5 },
    { wallishArea: 400, floorishArea: 100 },
  )
  const report = { features: [feature], regions: [] }

  const rowValue = (key: string) => {
    const row = measurements({
      feature,
      features: report.features,
      regions: report.regions as never,
      unit: 'mm',
    }).find((each) => each.key === key)
    return row ? Number.parseFloat(row.value) : null
  }

  const metrics = readMetrics(feature, partContext(report.features))

  test.each([
    ['depthBelowTop', 'depthBelowPartTop'],
    ['featureDepth', 'depth'],
    ['maxTool', 'requiredCutter'],
    ['minRadius', 'minRadius'],
    ['diameter', 'holeDiameter'],
    ['floorFillet', 'floorFilletRadius'],
    ['area', 'surfaceArea'],
    ['walls', 'wallArea'],
    ['floors', 'floorArea'],
  ] as const)('%s matches %s', (row, metric) => {
    const shown = rowValue(row)
    const measured = metrics[metric]

    if (shown === null && measured === null) return
    expect(measured).not.toBe(null)
    expect(shown).toBeCloseTo(measured as number, 2)
  })

  test('the L/D shown is the one for a hole, which is drilled rather than milled', () => {
    expect(rowValue('ld')).toBeCloseTo(metrics.drillingLD as number, 2)
  })
})

describe('an open pocket has no corner to fit a cutter to', () => {
  const pocket = (featureType: string) =>
    ({
      featureTag: 'pocket-1',
      featureType: 'filleted_open_pocket',
      regionIdxs: [0],
      machiningDirection: { x: 0, y: 0, z: 1 },
      axis: { x: 0, y: 0, z: 1 },
      datasheet: {
        featureType,
        facts: {
          kind: 'Pocket',
          // Every band unreported, which is the case this turns on.
          cd: { terminalCornerRadius: 1.524 },
          filletRadius: 1.524,
        },
        zMax: 66.19,
        zMin: 50.84,
        partZMax: 66.19,
      },
    }) as unknown as PartFeature

  test('leaves the milling metrics quiet rather than reading its floor blend', () => {
    // The Engine reports the floor blend as `terminalCornerRadius` on an open
    // pocket. Taken as a corner it says a 0.06 in fillet demands a 0.12 in
    // cutter, and the milling rules then judge a pocket by the radius of its
    // floor.
    const metrics = readMetrics(pocket('FilletedOpenPocket'))

    expect(metrics.requiredCutter).toBe(null)
    expect(metrics.minRadius).toBe(null)
    expect(metrics.millingLD).toBe(null)
  })

  test('still measures the floor radius, which is what judges it', () => {
    expect(readMetrics(pocket('FilletedOpenPocket')).floorFilletRadius).toBeCloseTo(1.524, 6)
  })

  test('keeps the corner on a closed pocket, where there is one', () => {
    // A closed pocket whose floor blend happens to equal its corner radius has
    // a real corner, and it has to go on constraining the cutter.
    const metrics = readMetrics(pocket('FilletedPocket'))

    expect(metrics.requiredCutter).toBeCloseTo(3.048, 6)
    expect(metrics.minRadius).toBeCloseTo(1.524, 6)
  })

  test('says why it stood down, where the working is shown', () => {
    const [reading] = metricSources('requiredCutter', pocket('FilletedOpenPocket'))

    expect(reading?.note).toContain('no closed corner')
  })
})
