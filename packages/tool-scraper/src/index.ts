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
 */

export * from './conventions.js'
export * from './errors.js'
export * from './family.js'
export * from './fetch.js'
export * from './identity.js'
export * from './provenance.js'
export * from './records.js'
export * from './scrape.js'
export * from './thread.js'
