/**
 * The interchange contract: what an adapter hands the core, and the canonical
 * names it hands it in.
 *
 * Before this seam existed, the mapper read `row['AP1MAX_mm']`, `row['D3_mm']`,
 * `row['Re_mm']` and `row['Z']` — Kennametal's own attribute codes, in the
 * module that also held the reduced-shank rule and the bare-tool length
 * convention. A second vendor had two options and both were bad: relabel its
 * columns into Kennametal's on the way into the CSV, which puts a lie in the
 * file whose whole job is to record what the vendor published; or fork the
 * mapper, which copies the domain into every adapter to drift independently.
 *
 * So the mapper stopped reading vendor column names. **An adapter owns CSV →
 * record; a record is where this package hands off.** The CSV keeps the
 * vendor's own column labels, because it is the receipt — see `conventions`.
 *
 * ## The canonical names are ISO 13399
 *
 * `DC`, `OAL`, `LCF`, `RE`, `NOF`, `SIG`, `TP` are codes from **ISO 13399**,
 * *Cutting tool data representation and exchange* — the machine-tool
 * industry's own interchange dictionary. CAM vendors implement subsets of it;
 * Autodesk Fusion implements one, which is why these names also appear in
 * Fusion's tool JSON. This package uses the standard directly, so nothing here
 * depends on any CAM vendor's choices, and the places where a CAM vendor
 * departed from the standard are recorded as departures rather than adopted
 * silently: see {@link GEOMETRY_FIELDS}, where three of the ten names are
 * Autodesk's own and say so.
 *
 * The standard is paid and split across parts, so the working reference is a
 * manufacturer's published table — Sandvik Coromant's and Dormer Pramet's are
 * both complete.
 *
 * **A canonical name says nothing about units.** An adapter declares
 * `DC: 'D1'` and the core appends `_mm`/`_in` from the family's declared unit;
 * that rule lives in `conventions.UNIT_SUFFIX`, in one place, because choosing
 * the suffix inside an adapter is exactly the mistake `unit` exists to prevent.
 *
 * ## What is deliberately *not* here
 *
 * `LB` and `assemblyGaugeLength` are not canonical inputs — they are `OAL`
 * under another name on a bare tool, ISO code or not, and a field that is
 * always a copy is not a second measurement. An adapter that could supply them
 * separately could supply a tool that claims a holder it does not have.
 */

import { dimensionalColumn, type UnitSystem } from './conventions.js'
import { ScraperConfigError } from './errors.js'

/** The kinds of cutting tool this package maps. */
export type ToolKind = 'drill' | 'tap' | 'endmill'

/**
 * ISO 513's main workpiece-material groups, in the order every vendor's
 * material groups must agree on — **core, not a Kennametal fact**, the same
 * distinction that puts thread-designation parsing in `thread.ts`: this is a
 * standard, not a table. A vendor whose own column publishes groups in a
 * different order — Destiny Tool's `isoMaterialGroups` does, e.g.
 * `['M', 'P', 'S']` — must reorder onto this sequence rather than passing its
 * raw order through, because a consumer that renders a facet from one array
 * and a tool's own list from another has no way to notice the two disagree.
 */
export const ISO_MATERIAL_GROUPS = ['P', 'M', 'K', 'N', 'S', 'H', 'C'] as const

/** One canonical geometry name: what it measures, and whose name it is. */
export interface GeometryField {
  /**
   * What the field measures, phrased so it can be quoted back at whoever
   * mapped a column to the wrong one.
   */
  definition: string
  /**
   * The ISO 13399 code for this measurement, or `null` where the standard's
   * counterpart has not been pinned against the dictionary. Equal to the
   * canonical name itself on every field that *is* the standard's code.
   */
  iso: string | null
}

/**
 * Canonical geometry fields an adapter may supply, and what each means.
 *
 * Keyed by name so the load-time check can quote a definition back at whoever
 * mapped a column to the wrong one, and each entry carries its ISO 13399 code
 * so the vocabulary's source is readable from the code rather than from a plan
 * document.
 *
 * **Seven of the ten are the standard's codes with the standard's meanings.**
 * The three that are not are Autodesk's, and each has an ISO counterpart
 * Autodesk did not use:
 *
 * - `SFDM` is Autodesk's "Shaft Diameter"; ISO's shank diameter is `DMM`.
 * - `shoulder-length` and `shoulder-diameter` are Autodesk's hyphenated
 *   lowercase keys. ISO's nearest are `LS` and `DN`, and they are recorded as
 *   unpinned rather than mapped, because "nearest" is not "the same" and the
 *   standing rule here is to leave a code unlabelled rather than guess at what
 *   it measures.
 *
 * They are kept under Autodesk's names anyway: renaming them would buy
 * correctness in a document nothing reads yet and cost the one property that
 * makes a canonical name useful, which is that a downstream consumer
 * recognises it.
 */
export const GEOMETRY_FIELDS = {
  DC: { definition: 'cutting diameter', iso: 'DC' },
  SFDM: { definition: 'shank diameter', iso: 'DMM' },
  OAL: { definition: 'overall length', iso: 'OAL' },
  LCF: {
    definition: 'flute length — the length of the cutting edge',
    iso: 'LCF',
  },
  RE: { definition: 'corner radius; 0 on a square-end tool', iso: 'RE' },
  TP: { definition: 'thread pitch, in the tool’s own unit system', iso: 'TP' },
  NOF: { definition: 'number of flutes', iso: 'NOF' },
  SIG: { definition: 'point angle, degrees included', iso: 'SIG' },
  'shoulder-length': {
    definition: 'usable length below the full shank',
    iso: null,
  },
  'shoulder-diameter': {
    definition: 'diameter at the shoulder — the neck, where necked',
    iso: null,
  },
} as const satisfies Record<string, GeometryField>

/**
 * The canonical names an adapter may map, as a type.
 *
 * Derived from {@link GEOMETRY_FIELDS}, so a column map naming `LFC` is a
 * compile error rather than a key that sits there doing nothing while the
 * geometry it was meant to fill is silently absent from every tool.
 */
export type GeometryName = keyof typeof GEOMETRY_FIELDS

/**
 * The canonical names that are **not** ISO 13399's own codes, derived rather
 * than listed so the two cannot disagree.
 *
 * Asserted by the tests as exactly these three, which is what makes adding a
 * fourth a deliberate act: a canonical name that is one CAM vendor's invention
 * is a departure from the standard, and this package's claim to be using the
 * standard is only as good as the departures being counted.
 */
export const NON_ISO_NAMES: readonly GeometryName[] = (
  Object.entries(GEOMETRY_FIELDS) as [GeometryName, GeometryField][]
)
  .filter(([name, field]) => field.iso !== name)
  .map(([name]) => name)

/**
 * What each tool kind must map before a single row is read.
 *
 * The point of stating it per kind rather than per family: core can refuse
 * "endmill family X maps no LCF" at config load, naming the family, instead of
 * failing on a missing key from inside a mapper on row 1 of a scrape that
 * already ran. A field's *absence* from this list is a claim too — `RE` is
 * optional because a square-end family publishes no corner-radius column and 0
 * is the right answer, not a missing one.
 */
export const REQUIRED_GEOMETRY: Record<ToolKind, readonly GeometryName[]> = {
  drill: ['DC', 'SFDM', 'OAL', 'LCF'],
  tap: ['SFDM', 'OAL', 'LCF'],
  endmill: ['DC', 'SFDM', 'OAL', 'LCF'],
}

/**
 * Fields that carry a unit and therefore get a `_mm`/`_in` suffix appended to
 * the vendor's column label. The rest are counts, angles and flags, published
 * in one column whatever the family's unit system.
 *
 * `TP` is here and it is the interesting one: a thread pitch is a length, and
 * on an inch tap it is `1/TPI` **inches** while on a metric tap it is
 * millimetres. It is nonetheless read from a single column, because the
 * scraper derives it in the family's native unit already — so it is listed as
 * dimensional for documentation and excluded from suffixing by
 * {@link DIMENSIONAL_COLUMNS}.
 */
export const DIMENSIONAL: ReadonlySet<GeometryName> = new Set<GeometryName>([
  'DC',
  'SFDM',
  'OAL',
  'LCF',
  'RE',
  'TP',
  'shoulder-length',
  'shoulder-diameter',
])

/**
 * The subset of {@link DIMENSIONAL} whose CSV column is a unit *pair*.
 *
 * `TP` is dimensional but not paired: the Kennametal thread-pitch step derives
 * one `Thread Pitch` column already in the tap's native system, so appending a
 * suffix would look for a column that was never scraped.
 */
export const DIMENSIONAL_COLUMNS: ReadonlySet<GeometryName> = new Set(
  [...DIMENSIONAL].filter((name) => name !== 'TP'),
)

/**
 * One orderable cutting tool, in canonical fields, ready for the core.
 *
 * `readonly` throughout because it is an interchange value: an adapter builds
 * it and hands it over, and a mapper that mutated one would be reaching back
 * across the seam this type exists to draw.
 *
 * `geometry` holds {@link GEOMETRY_FIELDS} names in `unit`. An **empty**
 * `materialGroups` is a real answer — Kennametal indexes no tap by workpiece
 * material, so all 129 carry none, and reading empty as "unconstrained" would
 * put every tap under every material on no evidence.
 */
export interface ToolRecord {
  readonly vendor: string
  readonly materialNumber: string
  readonly catalogNumber: string
  readonly description: string
  readonly kind: ToolKind
  readonly unit: UnitSystem
  readonly substrate: string
  readonly grade: string
  readonly geometry: Readonly<Partial<Record<GeometryName, number | boolean>>>
  readonly coolantThrough: boolean
  readonly materialGroups: readonly string[]
  /**
   * Drills only, and deliberately `null` elsewhere rather than `false`: it
   * drops the two ferrous presets downstream, and a default would ship them on
   * a PCD tool.
   */
  readonly nonFerrous: boolean | null
}

/**
 * Build a {@link ToolRecord}, defaulting the two fields that have a meaningful
 * absence.
 *
 * The defaults were Python dataclass defaults; an interface cannot carry one,
 * and requiring every adapter to write `materialGroups: []` would put the
 * decision back in the three places least able to notice it was wrong. They
 * stay **required on the type** so a consumer reading a record never handles
 * `undefined` — only the construction is optional.
 *
 * The result is frozen, geometry and material groups included: a record is an
 * interchange value, and a mapper that mutated one would be reaching back
 * across the seam this type exists to draw.
 */
export function toolRecord(
  fields: Omit<ToolRecord, 'materialGroups' | 'nonFerrous'> &
    Partial<Pick<ToolRecord, 'materialGroups' | 'nonFerrous'>>,
): ToolRecord {
  return Object.freeze({
    ...fields,
    geometry: Object.freeze({ ...fields.geometry }),
    materialGroups: Object.freeze([...(fields.materialGroups ?? [])]),
    nonFerrous: fields.nonFerrous ?? null,
  })
}

/**
 * A family's canonical-field → CSV-column-label mapping, validated.
 *
 * Built once when the registry binds. `labels` are the vendor's own column
 * labels **without** a unit suffix — `'D1'`, not `'D1_mm'` — because which
 * suffix to read is the core's business, derived from the family's unit
 * system. A vendor that wrote `'D1_mm'` here would be hardcoding the answer to
 * the question `unit` exists to ask.
 *
 * A class rather than a plain object so that {@link checkColumnMap} is the
 * only way to get one: a caller cannot accidentally use an unvalidated map.
 */
export class ColumnMap {
  readonly kind: ToolKind
  readonly labels: Readonly<Partial<Record<GeometryName, string>>>

  /** @internal Use {@link checkColumnMap}. */
  constructor(kind: ToolKind, labels: Readonly<Partial<Record<GeometryName, string>>>) {
    this.kind = kind
    this.labels = { ...labels }
  }

  /** The CSV column to read for `canonical`, or null when unmapped. */
  column(canonical: GeometryName, unit: UnitSystem): string | null {
    const label = this.labels[canonical]
    if (label === undefined) return null
    if (!DIMENSIONAL_COLUMNS.has(canonical)) return label
    return dimensionalColumn(label, unit)
  }

  /** Every canonical name this family maps, in declaration order. */
  mapped(): GeometryName[] {
    return Object.keys(this.labels) as GeometryName[]
  }
}

/** A family config, as far as this module is concerned. */
export interface ColumnBearing {
  unit?: UnitSystem
  columns: ColumnMap
}

/**
 * The unit systems a family's rows can be in.
 *
 * Usually one, declared. **A tap family declares none**, and that asymmetry is
 * real rather than an omission: a tap's system comes from its own
 * `Thread System` column, so one family can hold metric and inch taps and both
 * column sets must exist. Anything checking a family's columns has to check
 * both for those.
 */
export function familyUnits(cfg: { unit?: UnitSystem }): UnitSystem[] {
  return cfg.unit === undefined ? ['millimeters', 'inches'] : [cfg.unit]
}

/**
 * Every mapped column is really in the CSV — before a single row is read.
 *
 * {@link checkColumnMap} sees only the map, so it cannot catch a family that
 * maps `LCF: 'AP1MAX'` against a table publishing `AP1MAX_in` alone while
 * tagged metric. That resolves to a column which is not there, and the per-row
 * failure names one row out of ninety-three instead of naming the family and
 * the field.
 *
 * It is separate from binding because binding deliberately does no I/O — an
 * installed package with no scraped data must still import.
 */
export function checkColumnsExist(
  family: string,
  cfg: ColumnBearing,
  header: Iterable<string>,
): void {
  const present = new Set(header)
  const missing: string[] = []

  for (const unit of familyUnits(cfg)) {
    for (const canonical of cfg.columns.mapped()) {
      const column = cfg.columns.column(canonical, unit)
      if (column === null || !present.has(column)) {
        missing.push(`${canonical} -> ${column}`)
      }
    }
  }

  if (missing.length > 0) {
    throw new ScraperConfigError(
      family,
      `mapped column(s) absent from the CSV: ${[...new Set(missing)].sort().join(', ')}`,
    )
  }
}

/**
 * Validate a family's column map, or refuse it by name.
 *
 * Three failures, and each is one that used to surface far from its cause:
 *
 * 1. **An unknown canonical field.** A typo like `LFC` would otherwise sit in
 *    the map doing nothing, and the geometry it was meant to fill would
 *    silently be absent from every tool in the family. {@link GeometryName}
 *    catches this at compile time for a map written in TypeScript; the check
 *    stays for one that arrives as data.
 * 2. **A missing required field.** A missing-key fault from inside a mapper
 *    names the *column*, which is the one piece of information the person who
 *    wrote the map already had.
 * 3. **An unknown kind**, which would otherwise skip the required-field check
 *    entirely by looking up an empty set.
 *
 * Returns the validated map so a caller cannot accidentally use the raw object.
 */
export function checkColumnMap(
  family: string,
  kind: string,
  labels: Readonly<Record<string, string>>,
): ColumnMap {
  if (!Object.hasOwn(REQUIRED_GEOMETRY, kind)) {
    throw new ScraperConfigError(
      family,
      `unknown tool kind ${JSON.stringify(kind)} ` +
        `(known: ${Object.keys(REQUIRED_GEOMETRY).sort().join(', ')})`,
    )
  }

  const unknown = Object.keys(labels)
    .filter((name) => !Object.hasOwn(GEOMETRY_FIELDS, name))
    .sort()
  if (unknown.length > 0) {
    throw new ScraperConfigError(
      family,
      `maps ${unknown.join(', ')} which are not canonical geometry fields ` +
        `(known: ${Object.keys(GEOMETRY_FIELDS).sort().join(', ')})`,
    )
  }

  const missing = REQUIRED_GEOMETRY[kind as ToolKind]
    .filter((name) => !Object.hasOwn(labels, name))
    .sort()
  if (missing.length > 0) {
    const described = missing
      .map((name) => `${name} (${GEOMETRY_FIELDS[name].definition})`)
      .join(', ')
    throw new ScraperConfigError(family, `a ${kind} family must map ${described}`)
  }

  return new ColumnMap(kind as ToolKind, labels as Partial<Record<GeometryName, string>>)
}
