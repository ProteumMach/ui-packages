"""REGO-FIX powRgrip product index -> toolholding CSV.

Nothing here is shared with any other adapter beyond `conventions` — REGO-FIX
is a Drupal site, not Kennametal's AEM platform, so the transport, the identity
fields and the dimension source are all different. See
`REGOFIX_PRODUCTFINDER_API.md` for how the endpoint was found.

## Two sources, and both are needed

**The roster** comes from the ProductFinder's Elasticsearch proxy: one POST
returns every variant of a group with its part number, its designation, its PG
series and its CAD links. It carries no geometry beyond the projection length.

**The geometry** comes from a per-part DIN 4000 XML on the vendor's CDN, linked
from each hit. Three of its codes are pinned to a meaning by REGO-FIX's own
published tables and the rest are not:

- **`B3`** — projection from the flange face. The `L` column of the BT/PG
  table in the PG product catalog, row for row.
- **`B4`** — gage length. `B4 - B3 == 48.4` on every row, and 48.4 mm is
  BT 30's gauge-line-to-flange distance in the vendor's own standards table.
- **`A1`** — diameter at the collet end. The `D` column of that same BT/PG
  table, row for row.

`A2`, `B1`, `B2` and `B3_WOA` are carried into the CSV verbatim under their
raw DIN codes and are **not** promoted onto a record. Nothing available here
says what they measure, and the standing rule is to leave a vendor code
unlabelled rather than guess at it (JG 2026-08-07). `conventions.DIN_PREFIX` is
what keeps them from reading as promoted dimensions: a column named `A2_mm`
would sit in the CSV looking exactly like `L1_mm`, which is mapped.

There is a lead on pinning them honestly. REGO-FIX publishes
`DXF_ISO13399/DXF` and `DXF_ISO13399/PDF` beside the `XML_DIN4000/XML` this
module reads, so the standard this package's canonical names come from is
already in the vendor's own source material.

`A4` is 46 on every BT 30 holder — the flange diameter, a property of the
taper and not of the part — so it is checked rather than stored.

## What the vendor gets wrong

Three faults found on 2026-08-07, all recorded as warnings rather than fixed:
two disagreeing vendor cells cannot say which one is wrong, and a scraper that
corrects one becomes a place tool data is authored by hand.

1. `4130.70646`'s XML states its own part number as `4130.71646`.
2. `J22`, the XML's own product-line label, says "PG-SG secuRgrip
   Werkzeughalter" on several plain BT 30 holders that are not secuRgrip
   parts. It is never read.
3. `o_mm` on a tapping collet repeats the previous row's value twice
   (`1715.08215` and `1725.08215`). This is why the nominal size is parsed
   from the vendor's own designation and `o_mm` is only ever a cross-check.
"""

from __future__ import annotations

import csv
import re
import urllib.error
from fractions import Fraction
from pathlib import Path

from toolpath_scraper.conventions import CAD_COLUMN, DIN_PREFIX
from toolpath_scraper.fetch import get_text, post_json

MM_PER_INCH = 25.4

#: The Searchkit proxy the ProductFinder posts its Elasticsearch queries to.
#: Discovered by reading the app bundle, which constructs
#: `SearchkitManager(origin + '/' + lang, {searchUrlPath: '/elastic/post'})`.
SEARCH_URL = 'https://us.rego-fix.com/en/elastic/post'

#: Where a part's DIN 4000 XML lives. The filename is the part number with its
#: dot removed, which is also `field_sku_ngram`.
DIN4000_URL = ('https://static.rego-fix.com/sites/default/files/products/'
               'XML_DIN4000/XML/{sku}.xml')

#: Gauge line to flange face, JIS B 6339 / MAS 403 size 30, as published in
#: the vendor's own interface table (PG product catalog, "BT MAS 403": `BT 30 |
#: 31.75 | 46 | 2 | 48.4 | 20 | M 12`). Used to *verify* that `B4` is the gage
#: length rather than to compute one — both numbers are scraped, and their
#: difference is what identifies the code.
BT30_GAUGE_TO_FLANGE = 48.4

#: Flange diameter of a BT 30 taper, from the same row. `A4` on every holder.
BT30_FLANGE_DIAMETER = 46.0

#: DIN 4000 codes carried into the CSV verbatim because nothing here says what
#: they measure. Written out rather than "everything else" so that a code the
#: vendor adds later shows up as an unhandled key instead of silently
#: appearing as a column.
UNPINNED_DIN_CODES = ('A2', 'B1', 'B2', 'B3_WOA')

_PROPERTY = re.compile(
    r'<PropertyName source="din_mk">([^<]*)</PropertyName>\s*'
    r'<Value>([^<]*)</Value>')

#: `PG 25 Ø 3.5 mm`, `PG 15-CF Ø 1/4"`, `PGST 25 Ø 16.0 mm`,
#: `PG 15-TAP Ø 0.141" x 0.110"`, `PG 15-TAP Ø 3.5 x 2.7 mm`.
#:
#: Two things here are easy to get wrong and both were, on the first pass. The
#: series alternation is `PG(?:ST)?` and not `PGST?`, which is "PGS" followed
#: by an optional T and matches none of the 293 plain PG collets. And **an
#: inch designation marks every number while a metric one marks only the
#: last**: a tapping collet is `Ø 0.141" x 0.110"` but `Ø 3.5 x 2.7 mm`, so a
#: pattern that demands a unit after the first number reads no metric tapping
#: collet at all.
_COLLET_TITLE = re.compile(
    r'^(?P<series>PG(?:ST)? ?\d+)(?P<variant>-[A-Z-]+)? *Ø *'
    r'(?P<size>[\d./]+)(?P<size_unit>"?)'
    r'(?: *x *(?P<square>[\d./]+)"?)?'
    r'(?P<metric> *mm)?$')

#: `BT 30 / PG 25 x 075`, `BT+ 30 / PG 15 x 070 H`.
_HOLDER_TITLE = re.compile(
    r'^(?P<taper>BT\+? ?\d+)(?P<taper_variant>-[A-Z]+)? */ *'
    r'(?P<series>PG ?\d+) *x *(?P<projection>\d+)')

#: `form_name`, the vendor's own field, mapped to this catalog's `contact`
#: axis. `Plus +` is REGO-FIX's designation for the dual-contact shank that
#: seats on the spindle face as well as the cone — the same distinction
#: Kennametal sells as BTKV. It is a **scraped fact here**, not family config,
#: because REGO-FIX publishes both forms in one product group: `BT 30 / PG 25 x
#: 080 H` and `BT+ 30 / PG 25 x 080 H` are two rows of one table.
#:
#: There is no default. A third form is a stop-and-ask, and `BT-OM 30` is
#: already sitting in that table undefined — nothing on the vendor's site or in
#: its catalog says what OM designates, so its three parts are deliberately not
#: scraped (JG 2026-08-07).
CONTACT_BY_FORM = {
    'Standard': 'taper',
    'Plus +': 'face',
}


def search(filters: dict[str, str], size: int = 500) -> list[dict]:
    """Every `_source` matching an AND of term filters, newest index first.

    One request: the index holds 4142 products in total and the largest group
    asked for here is 321, so there is nothing to page. `size` is an explicit
    ceiling rather than a page length, and going over it raises — a silently
    truncated roster is the failure this whole package is built to notice.
    """
    query = {'bool': {'filter': [{'term': {k: v}} for k, v in filters.items()]}}
    payload = post_json(SEARCH_URL, {'size': size, 'query': query})
    hits = payload.get('hits')
    if hits is None:
        raise ValueError(
            f'{SEARCH_URL}: response carries no "hits" — the proxy changed '
            f'shape (keys: {sorted(payload)})')
    total = hits['total']
    if total > size:
        raise SystemExit(
            f'{filters}: {total} products but only {size} requested — raise '
            f'`size` rather than shipping a truncated roster')
    return [hit['_source'] for hit in hits['hits']]


def one(source: dict, field: str) -> str | float | None:
    """A field of an Elasticsearch `_source`, which stores every value as a
    list even when there is exactly one.

    Missing and empty are both None: `o_inch` is absent on a metric collet,
    which is the vendor saying it is metric rather than a gap.
    """
    values = source.get(field) or []
    return values[0] if values else None


def fetch_din4000(sku: str) -> dict[str, str] | None:
    """One part's DIN 4000 properties, or None when the vendor publishes none.

    None is a real state — two of the BT+ 30 holders have DXF and PDF but no
    XML — and it is distinguished from a failed request, which raises. A
    holder with no XML has no gage length and cannot be converted, so it is
    the caller that decides what to do about it.
    """
    try:
        xml = get_text(DIN4000_URL.format(sku=sku.replace('.', '')))
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise
    return parse_din4000(xml)


def parse_din4000(xml: str) -> dict[str, str]:
    """DIN 4000 property codes to their values, empty ones dropped.

    The document repeats a `<PropertyName>`/`<Value>` pair per property and
    states most of them empty, so dropping blanks is what makes "the vendor
    published this" and "the vendor published a hole" different states.

    Raises on a document with no properties at all rather than returning an
    empty dict, for the reason `scrape.parse_variant_table` raises on an
    unparseable response: reporting a changed format as no data looks exactly
    like a discontinued part.
    """
    pairs = _PROPERTY.findall(xml)
    if not pairs:
        raise ValueError(
            'DIN 4000 document carries no din_mk properties — the format '
            'changed shape')
    return {name: value.strip() for name, value in pairs if value.strip()}


def holder_row(source: dict, properties: dict[str, str]) -> dict[str, str]:
    """One search hit plus its DIN 4000 properties -> one CSV row.

    Column names are the shared toolholding vocabulary rather than REGO-FIX's
    own, so a consumer reads a REGO-FIX holder exactly as it reads a Kennametal
    one — `L1` is the gage length whoever published it. The DIN codes those
    came from are in this module's docstring; the ones that stay unmapped keep
    their raw code behind `conventions.DIN_PREFIX`.

    **This is the one place a REGO-FIX label is rewritten, and it is a
    holder-geometry label rather than an identity or a dimension code.** The
    identity columns are Kennametal's, adopted here because this vendor came
    second — see `conventions.IDENTITY_COLUMNS`.

    `D1` is deliberately absent. A powRgrip holder clamps through a collet, and
    a collet-clamping holder that also carried a bore would be claiming two
    ways of gripping one tool.
    """
    title = str(one(source, 'title'))
    sku = str(one(source, 'field_sku_fulltext'))
    parsed = _HOLDER_TITLE.match(title)
    if parsed is None:
        raise SystemExit(f'{sku}: cannot read a taper and series off {title!r}')

    form = one(source, 'form_name')
    contact = CONTACT_BY_FORM.get(str(form))
    if contact is None:
        raise SystemExit(
            f'{sku} ({title}): form_name {form!r} is not a contact mode this '
            f'package knows — add it to CONTACT_BY_FORM once the vendor says '
            f'what it designates')

    gauge = _pinned(properties, 'B4', sku)
    projection = _pinned(properties, 'B3', sku)
    if abs((gauge - projection) - BT30_GAUGE_TO_FLANGE) > 1e-9:
        raise SystemExit(
            f'{sku} ({title}): B4 - B3 is {gauge - projection}, not the '
            f'{BT30_GAUGE_TO_FLANGE} mm this taper puts between its gauge '
            f'line and its flange — B4 is not the gage length here')
    flange = _pinned(properties, 'A4', sku)
    if abs(flange - BT30_FLANGE_DIAMETER) > 1e-9:
        raise SystemExit(
            f'{sku} ({title}): A4 is {flange}, not the '
            f'{BT30_FLANGE_DIAMETER} mm flange of a BT 30 taper')

    stated = properties.get('J21')
    if stated is not None and stated != sku:
        print(f'  WARNING: {sku} ({title}): its DIN 4000 document calls '
              f'itself {stated} — the index part number is used')

    row = {
        'Material Number': sku,
        'ISO Catalog Number': title,
        'CST': parsed['series'].replace(' ', ''),
        'contact': contact,
        'L1_mm': _plain(gauge),
        'D2_mm': _plain(_pinned(properties, 'A1', sku)),
        'B3_mm': _plain(projection),
        CAD_COLUMN: _cad_url(source),
    }
    for code in UNPINNED_DIN_CODES:
        row[f'{DIN_PREFIX}{code}'] = properties.get(code, '')
    return row


def collet_row(source: dict) -> dict[str, str]:
    """One search hit -> one CSV row, with the nominal size read off the
    vendor's own designation.

    **The size comes from the title, not from `o_mm`.** `o_mm` is rounded to
    two decimals, which puts a 1/8 in collet at 3.18 mm where the part is
    3.175 — five microns out, against the two-micron tolerance
    `apps/web/src/data/fit.ts` sizes its equality test to, so every inch collet
    would have failed to match its own shank size. It is also wrong outright on
    two tapping collets, where it repeats the previous row's value. The title
    states the vendor's designation exactly (`Ø 1/4"`, `Ø 3.5 mm`) and says
    which unit system it is in, so it is both more precise and the only source
    here that carries a unit at all.

    `o_mm` is kept as a cross-check column rather than dropped, the same way
    Kennametal's contradictory unit cells are kept: it is what the vendor said.
    """
    title = str(one(source, 'title'))
    sku = str(one(source, 'field_sku_fulltext'))
    parsed = _COLLET_TITLE.match(title)
    if parsed is None:
        raise SystemExit(f'{sku}: cannot read a size off {title!r}')

    inches = parsed['size_unit'] == '"'
    # Exactly one unit marker, or the designation does not state a system.
    # Both would mean a title like `Ø 1/4" mm`; neither means the vendor
    # printed a bare number, and this catalog does not guess a unit system.
    if inches == bool(parsed['metric']):
        raise SystemExit(
            f'{sku}: {title!r} states {"two unit systems" if inches else "none"}')
    nominal = float(Fraction(parsed['size']))
    unit = 'inches' if inches else 'millimeters'
    nominal_mm = round(nominal * MM_PER_INCH, 6) if inches else nominal

    # A powRgrip collet clamps one size to h6 (h9 on the turning and tapping
    # lines) rather than closing over a range, so its capacity is its nominal
    # diameter at both ends. That is the vendor's `Clamping range or tolerance`
    # row in the PG catalog's collet matrix, and it is the same shape as
    # Kennametal's sealed coolant-through collets, where CCCX == CCCN == D1 —
    # a zero-width range is still a range.
    row = {
        'Material Number': sku,
        'ISO Catalog Number': title,
        'Collet Series': parsed['series'].replace(' ', ''),
        'unit': unit,
        'o_mm': _plain(one(source, 'o_mm')),
        'Square_mm': '',
        'Square_in': '',
    }
    # The native cell is what a machinist ordered; the millimetre cell is what
    # fit arithmetic compares. On a metric collet they are the same cell, so
    # only an inch one gets a projection — and that projection is exact,
    # because the designation is a fraction rather than a printed decimal.
    for label in ('D1', 'CCCN', 'CCCX'):
        row[f'{label}_in' if inches else f'{label}_mm'] = _plain(nominal)
        if inches:
            row[f'{label}_mm'] = _plain(nominal_mm)

    if parsed['square']:
        square = float(Fraction(parsed['square']))
        row['Square_in' if inches else 'Square_mm'] = _plain(square)
    _cross_check_o_mm(row, nominal_mm)
    return row


def _cross_check_o_mm(row: dict[str, str], nominal_mm: float) -> None:
    """Report where the index's `o_mm` contradicts the vendor's designation.

    Reports, never gates: two disagreeing vendor cells cannot say which one is
    wrong, and correcting one here would make this module a place tool data is
    authored by hand.

    **The tolerance is the vendor's own printed precision, not a feel.**
    `o_mm` is stated to two decimals, so half a unit in its last place —
    0.005 mm — is exactly how far it may legitimately sit from the exact size.
    The four disagreements in the catalog today are 0.01, 0.01, 0.12 and
    1.48 mm; the last two are tapping collets whose `o_mm` repeats the
    previous row's value outright.
    """
    stated = row['o_mm']
    if not stated:
        return
    if abs(float(stated) - nominal_mm) > 0.005 + 1e-9:
        print(f"  WARNING: {row['Material Number']} "
              f"({row['ISO Catalog Number']}): the index says o_mm = {stated} "
              f"where the designation is {nominal_mm} mm; the designation is "
              f"used")


def _pinned(properties: dict[str, str], code: str, sku: str) -> float:
    """One of the three DIN codes this package is willing to map, as a float."""
    raw = properties.get(code)
    if not raw:
        raise SystemExit(f'{sku}: DIN 4000 document publishes no {code}')
    return float(raw)


def _plain(value: object) -> str:
    """A number as the vendor would print it: no trailing `.0` on an integer.

    The CSV is read back with `float()`, so this only decides what a human and
    a git diff see — and `10` rather than `10.0` is what the vendor's own
    designation says.
    """
    if value is None:
        return ''
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)


def _cad_url(source: dict) -> str:
    """The part's STEP model, absolute, or empty when none is published.

    The index gives protocol-relative CDN URLs, and `conventions.CAD_COLUMN`
    holds a URL a consumer can fetch — so the scheme is added here rather than
    left for every reader to guess at.
    """
    urls = source.get('field_technical_drawings_url') or []
    for url in urls:
        if url.endswith('.stp'):
            return f'https:{url}' if url.startswith('//') else url
    return ''


#: The taper designations this package scrapes, and what they mean.
#:
#: `BT-OM 30` is published in the same product group and is **not** here: the
#: family page, the product catalog and the ProductFinder all print the token
#: and none of them says what OM designates, so recording a spindle interface
#: for it would be a guess about which machine a holder fits (JG 2026-08-07).
#: Its three parts are a stop-and-ask, not an omission to fix silently.
SCRAPED_TAPERS = ('BT 30', 'BT+ 30')


def scrape_holders(out_path: str | Path, group: str = 'BT/PG',
                   category: str = 'BT') -> int:
    """Every powRgrip holder of `group` whose taper is in `SCRAPED_TAPERS`.

    Two requests' worth of work per part — the roster is one POST, then one
    DIN 4000 document each. A part the vendor publishes no XML for is dropped
    with a message rather than written with holes: `gaugeLength` is required,
    and a holder without one fails conversion anyway.
    """
    sources = search({
        'system_name': 'powRgrip',
        'type': 'toolholders',
        'product_category_name': category,
        'product_group_name': group,
    })
    wanted = [s for s in sources
              if str(one(s, 'title')).startswith(SCRAPED_TAPERS)]
    rows = []
    for source in sorted(wanted, key=lambda s: str(one(s, 'field_sku_fulltext'))):
        sku = str(one(source, 'field_sku_fulltext'))
        properties = fetch_din4000(sku)
        if properties is None:
            print(f'  SKIPPED {sku} ({one(source, "title")}): the vendor '
                  f'publishes no DIN 4000 document, so it has no gage length')
            continue
        rows.append(holder_row(source, properties))
    return write_rows(rows, out_path)


def scrape_collets(out_path: str | Path, group: str,
                   sizes: tuple[str, ...]) -> int:
    """Every powRgrip collet of one product group, in the given PG sizes.

    `sizes` are the vendor's `norm_size` values — the PG series numbers a BT 30
    holder can take. It is an argument rather than "all of them" because the
    sizes are what tie a collet family to the holders in this catalog: PG 32
    and PG 48 collets exist and no BT 30 holder accepts one.
    """
    sources = search({
        'system_name': 'powRgrip',
        'type': 'collets',
        'product_group_name': group,
    })
    wanted = [s for s in sources if one(s, 'norm_size') in sizes]
    rows = [collet_row(s) for s in
            sorted(wanted, key=lambda s: str(one(s, 'field_sku_fulltext')))]
    return write_rows(rows, out_path)


def write_rows(rows: list[dict[str, str]], out_path: str | Path) -> int:
    """Rows to a CSV whose header is the union of their keys, in first-seen
    order; returns the row count.

    A union rather than the first row's keys: a mixed-unit collet family has
    `D1_mm` on its metric rows and `D1_in` on its inch ones, and keying off row
    one would drop whichever came second.
    """
    if not rows:
        raise SystemExit('no rows to write')
    header: list[str] = []
    for row in rows:
        for key in row:
            if key not in header:
                header.append(key)
    with open(out_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=header, restval='')
        writer.writeheader()
        writer.writerows(rows)
    return len(rows)
