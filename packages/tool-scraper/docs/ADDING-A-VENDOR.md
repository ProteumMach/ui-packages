# Adding a vendor

What it takes, in the order it takes it. Roughly one day per vendor, and the
expensive part is never the code — it is finding the endpoint and then finding
out what the vendor's own labels mean.

## 1. Find the transport, and write down how you found it

The three vendors here reach their data three unrelated ways: an AEM
variant-table GET, a Firestore REST walk, an Elasticsearch proxy POST. None of
them is documented by the vendor and none was guessable; each was read off the
site's own application bundle.

**This is the most expensive thing in the package to rediscover**, so it is
written down before anything else: `KENNAMETAL_CAD_API.md`,
`KENNAMETAL_SPEEDFEED_API.md` and `REGOFIX_PRODUCTFINDER_API.md` each record
the endpoint, the request shape, the fields it returns, and the dead ends that
were tried first. Add one for the new vendor.

Dead ends are worth a paragraph each. The REGO-FIX note's is the useful kind:
the marketing pages carry no variant table at all, no inline JSON and no
server-rendered `<table>`, and the Drupal node behind a part redirects to
`/products`. Somebody will try it again otherwise.

## 2. `identity.BRANDS`

Four keys — `host`, `home`, `vendor`, `product_link` — and one optional `node`
that only the AEM platform uses.

`home` is the guid namespace seed and is **stated rather than derived**. Every
record of this brand is minted under `uuid5(NAMESPACE_URL, home)`, so a
mistake here is not a wrong string: it is every one of that vendor's guids,
permanently, and a guid is the join key downstream.

`product_link` is what the vendor actually offers. Two of the four brands
publish no per-part page at all, and their links are searches. A link that
404s is worse than a link to a listing.

## 3. The adapter, under `vendors/<brand>/`

`scrape.py` at minimum, and whatever else that vendor's data needs — Kennametal
has four modules because its geometry, its material index, its CAD links and
its thread pitches arrive four different ways.

Two rules, and `tests/test_vendor_boundary.py` enforces both from the package
tree:

- **Nothing in the core imports a vendor.** A core module that needs a
  vendor's constant is telling you the constant belongs in the core.
- **No vendor imports another vendor.** The cheapest way to add vendor three is
  to reach into vendor one's parsing, and that is how a "shared" scraper that
  serves nobody gets built.

Fetch through `fetch`, so the transport gets the same `User-Agent`, timeout and
decoding as the others, and so a test can replace one module attribute instead
of the whole of `urllib.request`.

## 4. The CSV: the vendor's own labels

**Keep them.** Relabelling a vendor's columns on the way into the file would
put a lie in the file whose whole job is to record what the vendor published,
and the CSV is what gets diffed when a vendor silently changes their table.

`conventions.py` holds the short list of rules that do hold across vendors.
Two are enforced:

- **Units.** A dimensional column carries `_mm` or `_in`. An adapter declares a
  bare label and the core appends the suffix from the family's declared `unit`;
  choosing the suffix inside an adapter is exactly the mistake `unit` exists to
  prevent.
- **Identity.** `Material Number` and `ISO Catalog Number`, unless the vendor
  genuinely does not have them — in which case add an entry to
  `IDENTITY_DEVIATIONS` rather than inventing columns. Destiny Tool is the one
  entry there today, and writing it down is what makes the next drift a
  decision somebody made.

A vendor code you cannot pin to a meaning keeps its raw code behind
`DIN_PREFIX`. **Do not guess at what it measures.** A column named `A2_mm`
sits in the CSV looking exactly like a mapped length; `DIN_A2` reads as what it
is.

## 5. `families/<brand>.py`

Scrape targets, the column map, the hand-counted `rows`, and the facts no
vendor table states.

**The column map is keyed by ISO 13399 code** — `DC`, `OAL`, `LCF`, `RE`,
`NOF`, `SIG`, `TP` — with the vendor's own label as the value, unsuffixed. See
`records.GEOMETRY_FIELDS`, which carries each code's definition and names the
three that are Autodesk's rather than the standard's.

**Every constant the vendor's table does not state is a `Fact`.** The gate is
in `provenance.py` and it runs at import: a `vendor-stated` fact needs a
citation specific enough to re-check with one request, a `derived` one needs a
note saying what was computed from what, and an `assumed` one needs a note, a
date and initials — because the only thing standing behind an assumption is a
person on a day.

When a vendor label is unclear, **ask**. Record the answer and its date. Do not
guess and flag it afterwards; the flag is what gets lost.

`rows` is what a human counted on the vendor's own page. It is the one key
nothing reads at scrape time, and it is the point: every other count is
computed from the same file it is checking, so a scrape that silently lost rows
agrees with itself. `receipts.check_rows` is what the second number buys.

## 6. `registry.ADAPTERS`, if the vendor ships cutting tools

One line. A vendor that ships only toolholding needs no entry — REGO-FIX has
none.

## 7. Tests

Mock the network at one seam and feed inline fixtures. Every test in this
package does, and `tests/conftest.py` refuses a real request and names the URL
that asked for one — without it, a test that forgets to mock quietly pages a
vendor's whole catalog and passes.

Check the header the adapter really writes against `conventions`, in that
vendor's own test file. A header quoted as a literal is a second copy of what
the adapter writes, updated at the same time, checking nothing.

Cases that read a scraped CSV go through `tests/corpus.py`, which skips with a
named reason where no scrape exists.

## 8. The scrape

An entry point in `cli.py` and a line in `pyproject.toml`'s `[project.scripts]`.
Print the resolved scrape root first, and record a receipt after.

Then run it, and read the CSV. The three faults documented in
`vendors/regofix/scrape.py` — a part whose XML states the wrong part number, a
product-line label that lies, a cell repeating the row above it — were all
found this way and none of them raised anything.
