/**
 * Kennametal and WIDIA — one adapter, because they are one platform.
 *
 * Both run the same AEM/Hybris component on the same URL shape; only the host,
 * the component node name and the vendor string differ, and `identity.BRANDS`
 * is where that is recorded. Treating them as two adapters would duplicate
 * every module here to encode one differing node name.
 *
 * **Their data directories are still separate**, and the distinction is worth
 * holding on to: an adapter is a fact about *code*, a receipt is a fact about
 * *who published it*. So WIDIA's scraped tables live under WIDIA's own brand
 * even though this module is what scraped them, and a CSV is resolved through
 * its family's `brand` rather than through the adapter that wrote it. A future
 * brand on this same platform is a `BRANDS` entry and a data directory, and no
 * code here at all.
 */

export {
  ACTIVE_ONLY,
  BASE,
  NO_RESULTS,
  TableParser,
  columnNames,
  fetchVariants,
  parseVariantTable,
  scrapeFamily,
  variantsUrl,
  type Cell,
  type Row,
  type Tag,
  type VariantTable,
} from './scrape.js'

export {
  CAD_API,
  LIGHTWEIGHT_STEP,
  annotateCadUrls,
  fetchCad,
  lightweightStepUrl,
  type CadAnnotation,
  type CadPayload,
} from './cad.js'

export {
  FACET,
  ISO_CLASSES,
  MATERIALS_COLUMN,
  MATERIAL_GROUPS,
  addMaterialGroups,
  groupsByMaterial,
  materialClasses,
  materialsInGroup,
  parseMaterialGroups,
  type MaterialSweep,
  type SweepOptions,
} from './materials.js'

export { DESIGNATION_COLUMN, PITCH_COLUMN, SYSTEM_COLUMN, addThreadPitch } from './thread-column.js'

export {
  CATALOG_NUMBER,
  MATERIAL_NUMBER,
  RECORD_MAPPERS,
  drillRecord,
  endmillRecord,
  tapRecord,
} from './records.js'
