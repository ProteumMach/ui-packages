/**
 * EMUGE-FRANKEN's families.
 *
 * Four, one per catalog category crossed with the unit system the category is
 * published in. That is coarser than the vendor's own marketing, which splits
 * end mills fifteen ways by product line — TOP-Cut, Hard-Cut, Alu-Cut — and it
 * is deliberate: EMUGE states the product line, the cutting material, the
 * coating and the coolant supply **per part**, in columns, and a scraped column
 * beats a family constant. Splitting by product line would turn four counted
 * row totals into thirty and buy nothing a `product line` column does not
 * already carry.
 *
 * So the only fact three of these four state is `unit`, and the fourth adds the
 * two a drill record cannot be built without.
 *
 * ## `rows`
 *
 * The vendor's own result count for exactly the query the family scrapes, read
 * on 2026-09-01. It is the second number `node/receipts.checkRows` exists to
 * compare against, and the point is that nothing computes it from the file it
 * is checking — so when EMUGE adds a size, the scrape and this table disagree
 * and somebody looks.
 *
 * ## The unit split, and where it does not apply
 *
 * Milling is the one category EMUGE publishes in both systems: `AMM_EINHS`
 * indexes every milling variant as inch or metric, and an inch part states its
 * dimensions in fractional inches (`1 1/2 "`) where a metric one states
 * millimetres. Drilling and tapping have no such facet and no such split —
 * every drill and every tap, including a `#4-40 UNC` one, is published in
 * millimetres. That is why `emuge_taps.csv` declares a `unit` where
 * `families/kennametal.ts`'s taps declare none: there is no per-row thread
 * system to read, because the vendor states one system for all of them.
 */

import type { FamilyDefinition } from '../family.js'

/**
 * The facet EMUGE indexes milling variants by unit system under.
 *
 * The vendor's own code, verbatim, including the German class name in the
 * middle of it — it is a key in their search index rather than a label, and
 * shortening it would be inventing a query.
 */
const UNIT_FACET = 'feature-HYBCL_PRODUKTMERKMALE-AMM_EINHS'

/**
 * What each family scrapes, keyed by the same CSV names as {@link FAMILIES}.
 *
 * A sibling table rather than more keys on `FamilyDefinition`, which has no
 * word for "a category narrowed by one facet" and should not grow one for a
 * single vendor — the call `families/harvey.ts` makes with `PRODUCT_PAGES` and
 * `families/maritool.ts` with `LEAVES`.
 *
 * `Target` is declared here rather than imported from
 * `vendors/emuge/scrape.ts`, which is structurally identical, because
 * `families/` importing an adapter is what `tests/vendor-boundary.test.ts`
 * refuses: this table is read by every test, and none of them should drag a
 * vendor's scraper in behind it.
 */
export interface Target {
  /** The vendor's category code. */
  readonly category: string
  /** A facet code and value, both the vendor's own. */
  readonly facet?: { readonly code: string; readonly value: string }
}

export const SCRAPE_TARGETS = {
  'emuge_end_mills_inch.csv': {
    category: 'FF01',
    facet: { code: UNIT_FACET, value: 'AMM_EINHS_Z' },
  },
  'emuge_end_mills_mm.csv': {
    category: 'FF01',
    facet: { code: UNIT_FACET, value: 'AMM_EINHS_M' },
  },
  'emuge_drills.csv': { category: 'FB01' },
  'emuge_taps.csv': { category: 'FG01' },
} as const satisfies Record<string, Target>

/** Milling geometry, identical either side of the unit split. */
const MILLING_COLUMNS = {
  DC: 'cutting diameter Ød₁',
  SFDM: 'shank diameter Ød₂',
  OAL: 'overall length l₁',
  LCF: 'cutting length l₂',
  RE: 'radius r₁',
  'shoulder-length': 'neck length l₃',
  'shoulder-diameter': 'neck diameter Ød₃',
  NOF: 'number of flutes Z',
} as const

export const FAMILIES = {
  'emuge_end_mills_inch.csv': {
    id: 'end-mills-inch',
    brand: 'emuge',
    kind: 'endmill',
    familyCode: 'FF01',
    rows: 1832,
    columns: MILLING_COLUMNS,
    facts: {
      unit: {
        value: 'inches',
        source: 'vendor-stated',
        cite: 'the vendor\'s own `AMM_EINHS` facet, whose two values are `AMM_EINHS_Z` (inch, 1,832 variants) and `AMM_EINHS_M` (metric, 5,189); this family scrapes the first, and every dimensional value in it states `"` rather than `mm`',
      },
    },
  },
  'emuge_end_mills_mm.csv': {
    id: 'end-mills-mm',
    brand: 'emuge',
    kind: 'endmill',
    familyCode: 'FF01',
    rows: 5189,
    columns: MILLING_COLUMNS,
    facts: {
      unit: {
        value: 'millimeters',
        source: 'vendor-stated',
        cite: 'the same `AMM_EINHS` facet, `AMM_EINHS_M`; every dimensional value in this family states `mm`',
      },
    },
  },
  'emuge_drills.csv': {
    id: 'drills',
    brand: 'emuge',
    kind: 'drill',
    familyCode: 'FB01',
    // `SIG` is a mapped column and not a fact, which no other drill family in
    // this package manages: EMUGE states a point angle on every part's detail
    // record. Kennametal's two drill lines assume theirs or derive them from a
    // point length, and both say so at length in `families/kennametal.ts`.
    columns: {
      DC: 'nominal diameter d₁',
      SFDM: 'Shank diameter d₂',
      OAL: 'Overall length l₁',
      LCF: 'Flute length l₂',
      SIG: 'point angle',
    },
    rows: 2670,
    facts: {
      unit: {
        value: 'millimeters',
        source: 'vendor-stated',
        cite: 'every dimensional value on every drill variant states `mm`; the inch column the detail record also publishes (`nominal diameter d₁ [in]`) is a second index on the same part rather than a second family',
      },
      flutes: {
        value: 2,
        source: 'assumed',
        note: 'EMUGE publishes no flute count for a drill anywhere a scrape can reach. All 17 grouped products in FB01 state `Specification: Twist drill`, which is a two-flute geometry, and the vendor publishes `Number of margins` (2 or 4) as a separate column — so the 4 that appears there is a margin count and not a flute count, and that column is in the CSV as the evidence',
        checked: '2026-09-01',
        by: 'JG',
      },
      nonFerrous: {
        value: false,
        source: 'vendor-stated',
        cite: "the vendor's own `applicationMaterials` index rates these drills for P, M, K, N, S and H — the ferrous groups included — on every part sampled across all 17 grouped products",
      },
    },
  },
  'emuge_taps.csv': {
    id: 'taps',
    brand: 'emuge',
    kind: 'tap',
    familyCode: 'FG01',
    // `TP` reads a column with no unit suffix, which is what
    // `records.DIMENSIONAL_COLUMNS` excluding it means: the vendor publishes
    // `pitch [mm]` and this family is millimetres, so the column is already in
    // the record's native unit.
    columns: {
      DC: 'nominal diameter d₁',
      SFDM: 'Shank diameter d₂',
      OAL: 'Overall length l₁',
      LCF: 'length of cutting edge l₂',
      TP: 'pitch',
    },
    rows: 11566,
    facts: {
      unit: {
        value: 'millimeters',
        source: 'vendor-stated',
        cite: 'every tap dimension is published in millimetres whatever the thread standard — a `#4-40 UNC` tap states `nominal diameter d₁ [mm]` as `2.845 mm`, `pitch [mm]` as `0.635 mm`, and its shank and lengths in `mm` — with `thread symbol`, `nominal size` and `threads per inch` carrying the inch designation beside them',
      },
    },
  },
} as const satisfies Record<string, FamilyDefinition>
