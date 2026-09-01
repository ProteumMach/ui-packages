/**
 * EMUGE-FRANKEN rows -> records, one part per kind.
 *
 * The rows are built by the adapter's own `variantRow` rather than written out
 * as literals, so the column labels a record reads are the ones a scrape really
 * writes — a literal here would be a second copy of the header, updated at the
 * same time as the first, checking nothing. The payloads are trimmed from live
 * responses on 2026-09-01.
 *
 * Every case goes through `registry.toRecords`, which is what runs
 * `checkIdentityColumns` and `checkColumnsExist` before the first row: a family
 * whose column map names a label the scrape does not write fails here, naming
 * the family.
 */

import { describe, expect, it } from 'vitest'

import { UNSPECIFIED } from '../src/records.js'
import { toRecords } from '../src/registry.js'
import { unionHeader, type ScrapeResult, type ScrapedRow } from '../src/scrape.js'
import { variantRow } from '../src/vendors/emuge/scrape.js'
import { VendorResponseError } from '../src/errors.js'

interface Property {
  property: string
  value: string
}

function scrapeOf(rows: ScrapedRow[]): ScrapeResult {
  return { header: unionHeader(rows), rows, source: 'test', familyCode: null }
}

/* ------------------------------------------------------------------ end mill */

const MILL_GROUP = {
  code: 'H301025',
  productListInfo: 'Solid carbide end mill with corner radius, long, type N.',
  technicalDetails: [
    { property: 'category', value: 'End Mill' },
    { property: 'version', value: 'Corner Radius' },
    { property: 'product line', value: 'FRANKEN TOP-Cut VAR' },
  ] as Property[],
}

function millVariant(neck: boolean): {
  code: string
  articleCode: string
  dimensionFeatureValue: string
  mainDrawing: { technicalDetails: Property[] }
} {
  return {
    code: neck ? '000000000010261509' : '000000000010261378',
    articleCode: neck ? '2998L.012015' : '2998L.012010',
    dimensionFeatureValue: neck ? 'Ø1/8 / R0.015' : 'Ø1/8 / R0.010',
    mainDrawing: {
      technicalDetails: [
        { property: 'cutting diameter Ød₁ [inch]', value: '1/8 "' },
        { property: 'shank diameter Ød₂ [inch]', value: neck ? '1/4 "' : '1/8 "' },
        { property: 'cutting length l₂ [inch]', value: '3/8 "' },
        { property: 'overall length l₁', value: '1 1/2 "' },
        { property: 'radius r₁ [inch]', value: '0.01 "' },
        ...(neck
          ? [
              { property: 'neck diameter Ød₃', value: '0.118 "' },
              { property: 'neck length l₃ [inch]', value: '0.75 "' },
            ]
          : []),
      ],
    },
  }
}

function millDetail(code: string, flutes: string) {
  return {
    code,
    technicalDetails: [
      { property: 'number of flutes Z', value: flutes },
      { property: 'Cutting material', value: 'carbide' },
      { property: 'coating', value: 'ALCR' },
      { property: 'internal coolant supply', value: 'Without internal cooling' },
    ] as Property[],
    applicationMaterials: [{ code: 'S' }, { code: 'P' }, { code: 'H' }],
  }
}

function millRow(neck: boolean, flutes = '4'): ScrapedRow {
  const variant = millVariant(neck)
  return variantRow(MILL_GROUP, variant, millDetail(variant.code, flutes), 'inches')
}

/**
 * A plain part and a necked one, which is the smallest end mill scrape the
 * family's column map can be checked against.
 *
 * `records.checkColumnsExist` is a **family**-level gate: it asks whether the
 * CSV carries every mapped column, not whether a given row fills it. EMUGE
 * publishes `neck length l₃` and `neck diameter Ød₃` on its necked lines only,
 * so a scrape of plain parts alone maps two columns the header does not have —
 * and the failure names the family, which is the point. The real inch and
 * metric families both hold necked lines.
 */
function millScrape(...rows: ScrapedRow[]): ScrapeResult {
  return scrapeOf([...rows, millRow(true)])
}

/* --------------------------------------------------------------------- drill */

const DRILL_GROUP = {
  code: 'H109070',
  productListInfo: 'Solid carbide twist drill, 5xD, with internal coolant supply.',
  technicalDetails: [
    { property: 'Specification', value: 'Twist drill' },
    { property: 'Length standard', value: '5xD DIN 6537L' },
    { property: 'Number of margins', value: '4' },
  ] as Property[],
}

const DRILL_VARIANT = {
  code: '000000000010727835',
  articleCode: 'TA219744.0300',
  dimensionFeatureValue: 'd1=3,0',
  mainDrawing: {
    technicalDetails: [
      { property: 'nominal diameter d₁ [mm]', value: '3 mm' },
      { property: 'Shank diameter d₂', value: '6 mm' },
      { property: 'Overall length l₁', value: '66 mm' },
      { property: 'Flute length l₂', value: '28 mm' },
      { property: 'usable length l₃', value: '23 mm' },
      { property: 'Center length l₅', value: '0.546 mm' },
    ] as Property[],
  },
}

const DRILL_DETAIL = {
  code: DRILL_VARIANT.code,
  technicalDetails: [
    { property: 'nominal diameter d₁ [in]', value: '0.1181 "' },
    { property: 'Coolant supply', value: 'internal coolant supply' },
    { property: 'point angle', value: '140 deg' },
    { property: 'Coating', value: 'TIALN-T63' },
    { property: 'Cutting material', value: 'carbide' },
    { property: 'shank diameter tolerance', value: 'h6' },
  ] as Property[],
  applicationMaterials: [{ code: 'P' }, { code: 'M' }, { code: 'K' }, { code: 'N' }],
}

const drillRow = (): ScrapedRow =>
  variantRow(DRILL_GROUP, DRILL_VARIANT, DRILL_DETAIL, 'millimeters')

/* ----------------------------------------------------------------------- tap */

const TAP_GROUP = {
  code: 'H100331',
  productListInfo: 'HSSE-PM machine tap, straight flutes with spiral point.',
  technicalDetails: [
    { property: 'chamfer form', value: 'Form B (Plug)' },
    { property: 'thread orientation', value: 'internal' },
  ] as Property[],
}

const TAP_VARIANT = {
  code: '000000000010565149',
  articleCode: 'BU20A601.5003',
  dimensionFeatureValue: 'Nr.4-40 UNC-2BX',
  mainDrawing: {
    technicalDetails: [
      { property: 'nominal diameter d₁ [mm]', value: '2.845 mm' },
      { property: 'Shank diameter d₂', value: '3.581 mm' },
      { property: 'Overall length l₁', value: '56 mm' },
      { property: 'length of cutting edge l₂', value: '6 mm' },
      { property: 'usable length l₃', value: '18 mm' },
      { property: 'square ◘', value: '2.79 mm' },
    ] as Property[],
  },
}

const TAP_DETAIL = {
  code: TAP_VARIANT.code,
  technicalDetails: [
    { property: 'thread symbol', value: 'UNC' },
    { property: 'pitch [mm]', value: '0.635 mm' },
    { property: 'threads per inch', value: '40' },
    { property: 'nominal size', value: '#4' },
    { property: 'coolant supply', value: 'Without' },
    { property: 'Coating', value: 'GLT-1' },
    { property: 'Cutting material', value: 'HSSE-PM' },
  ] as Property[],
  applicationMaterials: [{ code: 'P' }, { code: 'M' }],
}

const tapRow = (): ScrapedRow => variantRow(TAP_GROUP, TAP_VARIANT, TAP_DETAIL, 'millimeters')

/* --------------------------------------------------------------------- tests */

describe('an end mill', () => {
  const [record] = toRecords('emuge_end_mills_inch.csv', millScrape(millRow(false)))

  it('is minted in this brand’s own namespace, from the SAP material number', () => {
    expect(record?.brand).toBe('emuge')
    expect(record?.vendor).toBe('EMUGE-FRANKEN')
    expect(record?.materialNumber).toBe('000000000010261378')
    expect(record?.catalogNumber).toBe('2998L.012010')
    expect(record?.guid).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('reads a fractional inch as a number, in the family’s declared unit', () => {
    expect(record?.unit).toBe('inches')
    expect(record?.geometry.DC).toBe(0.125)
    expect(record?.geometry.LCF).toBe(0.375)
    expect(record?.geometry.OAL).toBe(1.5)
    expect(record?.geometry.RE).toBe(0.01)
  })

  it('falls back to the flute length and the cutting diameter on a plain shank', () => {
    expect(record?.geometry['shoulder-length']).toBe(record?.geometry.LCF)
    expect(record?.geometry['shoulder-diameter']).toBe(record?.geometry.DC)
  })

  it('reads the neck where the vendor publishes one', () => {
    const [, necked] = toRecords('emuge_end_mills_inch.csv', millScrape(millRow(false)))

    expect(necked?.geometry['shoulder-length']).toBe(0.75)
    expect(necked?.geometry['shoulder-diameter']).toBe(0.118)
  })

  it('takes the flute count from the part’s own record', () => {
    expect(record?.geometry.NOF).toBe(4)
  })

  it('omits the flute count where the vendor publishes its sentinel, and says so', () => {
    // 64 end mill variants answer `999`, which is not a count.
    const said: string[] = []
    const [odd] = toRecords('emuge_end_mills_inch.csv', millScrape(millRow(false, '999')), {
      warn: (m) => said.push(m),
    })

    expect(odd?.geometry.NOF).toBeUndefined()
    expect(said.join('\n')).toContain('999')
  })

  it('carries the vendor’s free text, and never its catalog number', () => {
    expect(record?.description).toBe(MILL_GROUP.productListInfo)
    expect(record?.description).not.toContain(record!.catalogNumber)
  })

  it('reorders the vendor’s material index onto ISO 513’s own order', () => {
    // The vendor answered S, P, H.
    expect(record?.materialGroups).toEqual(['P', 'S', 'H'])
    expect(record?.materialGroupsSource).toBe('vendor-stated')
  })

  it('records the coating raw and the substrate in this package’s vocabulary', () => {
    expect(record?.coating).toBe('ALCR')
    expect(record?.substrate).toBe('carbide')
    expect(record?.coolantThrough).toBe(false)
  })
})

describe('a drill', () => {
  const [record] = toRecords('emuge_drills.csv', scrapeOf([drillRow()]))

  it('reads the point angle the vendor states, rather than assuming one', () => {
    // The only drill family in this package that does. Kennametal's two lines
    // assume theirs or derive them from a point length.
    expect(record?.geometry.SIG).toBe(140)
  })
  it('omits the point angle where the vendor left the cell empty, and says so', () => {
    // One of FB01's 2,670 variants publishes no point angle. `SIG` is a mapped
    // column here rather than a fact, so before it moved to
    // `RECORD_GEOMETRY.drill.sometimes` that one blank cell threw — and
    // `toRecords` maps a family's rows together, so it took the other 2,669
    // drills with it.
    const said: string[] = []
    const [blank] = toRecords(
      'emuge_drills.csv',
      scrapeOf([{ ...drillRow(), 'point angle': '' }]),
      {
        warn: (m) => said.push(m),
      },
    )

    expect(blank?.geometry.SIG).toBeUndefined()
    expect(blank?.geometry.DC).toBe(3)
    expect(said.join('\n')).toContain(DRILL_VARIANT.code)
    expect(said.join('\n')).toContain('no point angle')
  })

  it('takes the flute count from the family fact, which the vendor states nowhere', () => {
    expect(record?.geometry.NOF).toBe(2)
  })

  it('is millimetres throughout', () => {
    expect(record?.unit).toBe('millimeters')
    expect(record?.geometry.DC).toBe(3)
    expect(record?.geometry.SFDM).toBe(6)
    expect(record?.geometry.OAL).toBe(66)
    expect(record?.geometry.LCF).toBe(28)
  })

  it('reads the drilling coolant vocabulary, which is not the milling one', () => {
    expect(record?.coolantThrough).toBe(true)
  })

  it('carries the ferrous claim its family states', () => {
    expect(record?.nonFerrous).toBe(false)
    expect(record?.materialGroups).toEqual(['P', 'M', 'K', 'N'])
  })
})

describe('a tap', () => {
  const [record] = toRecords('emuge_taps.csv', scrapeOf([tapRow()]))

  it('is millimetres even on an inch thread, because that is what was published', () => {
    // A `#4-40 UNC` tap. The vendor states 2.845 mm and 0.635 mm; neither is a
    // conversion this package made.
    expect(record?.unit).toBe('millimeters')
    expect(record?.geometry.DC).toBe(2.845)
    expect(record?.geometry.TP).toBe(0.635)
    expect(record?.geometry.SFDM).toBe(3.581)
  })

  it('reads the thread pitch from a column with no unit suffix', () => {
    // `records.DIMENSIONAL_COLUMNS` excludes `TP` from unit pairing, so the
    // column is `pitch` and not `pitch_mm`.
    expect(Object.keys(tapRow())).toContain('pitch')
    expect(Object.keys(tapRow())).not.toContain('pitch_mm')
  })

  it('carries no flute count, because the vendor states none anywhere', () => {
    expect(record?.geometry.NOF).toBeUndefined()
  })

  it('reads HSSE-PM as high-speed steel', () => {
    expect(record?.substrate).toBe('hss')
    expect(record?.coating).toBe('GLT-1')
    expect(record?.coolantThrough).toBe(false)
  })

  it('keeps the thread designation on the row for a consumer that needs it', () => {
    expect(tapRow()['dimensionFeatureValue']).toBe('Nr.4-40 UNC-2BX')
    expect(tapRow()['thread symbol']).toBe('UNC')
    expect(tapRow()['threads per inch']).toBe('40')
  })
})

describe('what a mapper refuses', () => {
  it('refuses a cutting material it has no word for, naming the table to add to', () => {
    const row = { ...drillRow(), 'Cutting material': 'unobtainium' }

    expect(() => toRecords('emuge_drills.csv', scrapeOf([row]))).toThrow(/SUBSTRATES/)
  })

  it('refuses a coolant value outside the category’s own facet vocabulary', () => {
    const row = { ...drillRow(), 'Coolant supply': 'sometimes' }

    expect(() => toRecords('emuge_drills.csv', scrapeOf([row]))).toThrow(/COOLANT_COLUMNS/)
  })

  it('records false and warns where no coolant column is filled at all', () => {
    // A different thing from the case above: the vendor's facet does not cover
    // the whole of milling — 6,862 of FF01's 7,021 variants — so 159 parts have
    // no `internal coolant supply` value. This refused until 2026-09-01, and
    // because `toRecords` maps its rows, one such part took the whole family's
    // conversion with it rather than one row.
    const row = { ...drillRow() }
    delete row['Coolant supply']

    const said: string[] = []
    const [record] = toRecords('emuge_drills.csv', scrapeOf([row]), {
      warn: (m) => said.push(m),
    })

    expect(record?.coolantThrough).toBe(false)
    expect(said.join('\n')).toContain(DRILL_VARIANT.code)
    expect(said.join('\n')).toContain('recorded as false')
  })
  it('refuses a point angle that is a length, which an empty cell is not', () => {
    // The two halves of the same column. A blank is the vendor publishing
    // nothing and is omitted; a length where an angle belongs is the property
    // having moved under this adapter, and is worth losing the row over.
    const row = { ...drillRow(), 'point angle': '3 mm' }

    expect(() => toRecords('emuge_drills.csv', scrapeOf([row]))).toThrow(VendorResponseError)
    expect(() => toRecords('emuge_drills.csv', scrapeOf([row]))).toThrow(/not an angle/)
  })

  it('refuses a point angle stated as a range, which has no single reading', () => {
    const row = { ...drillRow(), 'point angle': '130-140 deg' }

    expect(() => toRecords('emuge_drills.csv', scrapeOf([row]))).toThrow(/not an angle/)
  })

  it('refuses a row whose dimension the vendor left blank', () => {
    const row = { ...drillRow(), 'Overall length l₁_mm': '' }

    expect(() => toRecords('emuge_drills.csv', scrapeOf([row]))).toThrow(VendorResponseError)
  })

  it('says it has no evidence where no detail record answered', () => {
    // `variantRow` leaves the key off entirely, which is what keeps "we do not
    // know" apart from "rated for nothing".
    const row = variantRow(MILL_GROUP, millVariant(false), undefined, 'inches')
    const withParts = {
      ...row,
      'Cutting material': 'carbide',
      'internal coolant supply': 'Without internal cooling',
    }
    const [record] = toRecords('emuge_end_mills_inch.csv', millScrape(withParts))

    expect(record?.materialGroups).toBeNull()
    expect(record?.materialGroupsSource).toBe(UNSPECIFIED)
  })
})
