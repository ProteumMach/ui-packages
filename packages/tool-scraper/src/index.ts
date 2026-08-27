/**
 * Scrape cutting-tool geometry from vendor catalogs into records.
 *
 * A small vendor-neutral core plus one adapter per manufacturer under
 * `vendors/`. The line between them is **what a fact is about**: a module
 * under `vendors/` knows one manufacturer's transport, its column vocabulary
 * or its own dimension codes, and a module beside this one knows the domain —
 * what a tool record is, how a guid is minted, what the ISO workpiece groups
 * are.
 *
 * Two adapters share no code with each other, and
 * `tests/vendor-boundary.test.ts` asserts it from the package tree rather than
 * from a list. What they share is the core, and that sharing is the point: it
 * is what makes two vendors' catalogs comparable.
 *
 * ## This entry point is records, not files
 *
 * Every scrape returns rows. Writing them to a CSV, and the provenance sidecar
 * that goes beside one, is `@toolpath/tool-scraper/node` — a separate entry
 * point, because a backend embedding this wants the data and a maintainer
 * running the CLI wants the file, and only one of those two needs `fs`.
 *
 * The Python this is ported from had it the other way round: every scrape
 * function ended in `open(out_path, 'w')`. That is right for a console script
 * and wrong for a library.
 */

export { ScraperConfigError, VendorResponseError } from './errors.js'

export {
  CAD_COLUMN,
  DIN_PREFIX,
  IDENTITY_COLUMNS,
  IDENTITY_DEVIATIONS,
  UNIT_SUFFIX,
  checkIdentityColumns,
  dimensionalColumn,
  identityColumns,
  type UnitSystem,
} from './conventions.js'

export {
  BRANDS,
  productLink,
  recordGuid,
  vendorNamespace,
  type AemBrandName,
  type Brand,
  type BrandName,
} from './identity.js'

export {
  SOURCES,
  assumptions,
  checkFact,
  type Assumption,
  type Fact,
  type FactSource,
  type FactValue,
} from './provenance.js'

export {
  ColumnMap,
  DIMENSIONAL,
  DIMENSIONAL_COLUMNS,
  GEOMETRY_FIELDS,
  ISO_MATERIAL_GROUPS,
  NON_ISO_NAMES,
  REQUIRED_GEOMETRY,
  checkColumnMap,
  checkColumnsExist,
  familyUnits,
  toolRecord,
  type GeometryField,
  type GeometryName,
  type ToolKind,
  type ToolRecord,
} from './records.js'

export { threadMajorDiameter, threadPitch, type ThreadSystem } from './thread.js'

export { DEFAULT_TIMEOUT_MS, USER_AGENT, createFetcher, type Fetcher } from './fetch.js'
