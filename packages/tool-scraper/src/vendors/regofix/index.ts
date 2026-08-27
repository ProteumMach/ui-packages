/**
 * REGO-FIX — toolholding only, and nothing here is shared with Kennametal.
 *
 * Different CMS, different transport, and — the part that surprises — the
 * roster and the geometry are two different fetches. See
 * `docs/REGOFIX_PRODUCTFINDER_API.md`.
 */

export {
  BT30_FLANGE_DIAMETER,
  BT30_GAUGE_TO_FLANGE,
  CONTACT_BY_FORM,
  DIN4000_URL,
  MM_PER_INCH,
  SCRAPED_TAPERS,
  SEARCH_URL,
  UNPINNED_DIN_CODES,
  cadUrl,
  colletRow,
  fetchDin4000,
  holderRow,
  one,
  parseDin4000,
  parseSize,
  plain,
  scrapeCollets,
  scrapeHolders,
  search,
  unionHeader,
  type RegofixOptions,
  type Source,
} from './scrape.js'
