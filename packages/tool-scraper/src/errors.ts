/**
 * The two ways this package refuses, split by who has to fix it.
 *
 * - {@link ScraperConfigError} — **this package's own catalog is wrong.** A
 *   family maps a canonical field that does not exist, a fact is missing the
 *   note its source kind requires, two vendors claim one CSV name. Nothing a
 *   retry or a different vendor response can fix; it is a bug here, and it is
 *   raised before any network call.
 * - {@link VendorResponseError} — **the vendor sent something this package
 *   cannot read.** The variants endpoint changed shape, a scrape's row count
 *   disagrees with the declared one, a DIN 4000 code that should be pinned is
 *   absent. The catalog is fine; the world moved.
 *
 * They throw rather than exiting the process: a Node backend imports this, and
 * a mapped column that moved must not take down somebody's request handler.
 * Both carry a `subject` — the family, brand or part the failure is about — so
 * a caller that catches one does not parse it back out of a sentence.
 */

/** Common shape: a message that already names its subject, plus the subject. */
abstract class ScraperError extends Error {
  /** The family, brand or part number this is about, and `message` leads with it. */
  readonly subject: string

  constructor(subject: string, message: string) {
    super(`${subject}: ${message}`)
    this.subject = subject
    // `Error` is a built-in, so the prototype has to be restored by hand for
    // `instanceof` to survive the ES2022 downlevel. Cheap, and the alternative
    // is a catch block that silently never matches.
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = new.target.name
  }
}

/**
 * This package's own catalog or column map is wrong.
 *
 * Thrown at config-validation time, which is before a scrape reaches the
 * network — the whole point of validating a family's map up front is that a
 * typo fails naming the family instead of as a missing-key fault on row 1 of a
 * scrape that already ran.
 */
export class ScraperConfigError extends ScraperError {}

/**
 * A vendor's response was not the shape this package requires.
 *
 * Distinct from "the vendor returned nothing", which is often an ordinary
 * answer — a facet query for a group a family is not rated for matches no
 * rows, and that is data, not a fault. This is for the case where the reply
 * cannot be read at all, because reporting zero rows there would look exactly
 * like a family being discontinued.
 */
export class VendorResponseError extends ScraperError {}
