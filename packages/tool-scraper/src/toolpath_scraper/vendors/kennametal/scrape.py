"""Family page -> CSV, for every brand on Kennametal's AEM platform.

Family pages render their variant table client-side, but the table comes
from a plain AEM GET that returns ALL variants as one HTML table — no
pagination, no JS, no bot-blocking. The package runbook records how the
endpoint was found and how to read a new brand's component node off a family
page.

Column identity comes from the <th> class attribute (e.g. "DRL_CUT_D1_MIN
metric"), NOT the visible label — labels like "D1" repeat across unit pairs
and non-dimensional columns like wire size.
"""

from __future__ import annotations

import csv
import re
import urllib.parse
from collections.abc import Sequence
from html.parser import HTMLParser
from pathlib import Path

from toolpath_scraper.fetch import get_text
from toolpath_scraper.identity import BRANDS

BASE = ("https://www.{host}/us/en/products/fam/_jcr_content/root/"
        "responsivegrid/{node}.variants.{code}.html"
        "?query={query}&uom=metric")

#: The Hybris/Solr facet string that scopes a request to a family's active
#: variants. The family code in the URL path already scopes to the family, so
#: this only drops the discontinued ones. `materials` appends a second facet
#: to it; nothing else should need to.
ACTIVE_ONLY = ":relevance:obsoleteFacet:false"

#: The class the vendor renders instead of a table when a query matches
#: nothing. Distinguishing that from a response we failed to parse is the
#: whole reason `parse_variant_table` looks for it.
NO_RESULTS = 'class="no-results"'

SKIP_CLASSES = ("collab-checkbox-header", "sticky-column", "marketingFirstChoice")

# One parsed cell: its collapsed text, and the tag's attributes. Column
# identity lives in those attributes, never in the text — see the note above.
Cell = tuple[str, dict[str, str | None]]
Row = list[Cell]


class TableParser(HTMLParser):
    """Collects rows of (cell_text, attributes) tuples."""

    def __init__(self) -> None:
        super().__init__()
        self.rows: list[Row] = []
        self._row: Row | None = None
        self._cell: str | None = None
        self._attrs: dict[str, str | None] = {}

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        if tag == "tr":
            self._row = []
        elif tag in ("td", "th") and self._row is not None:
            self._cell = ""
            self._attrs = dict(attrs)

    def handle_endtag(self, tag: str) -> None:
        if tag == "tr" and self._row is not None:
            self.rows.append(self._row)
            self._row = None
        elif tag in ("td", "th") and self._cell is not None:
            self._row.append((" ".join(self._cell.split()), self._attrs))
            self._cell = None

    def handle_data(self, data: str) -> None:
        if self._cell is not None:
            self._cell += data


def fetch(code: str, brand: str = "kennametal", query: str = ACTIVE_ONLY) -> str:
    """One family's variants response, as HTML.

    The one network call in this module, and the seam every test replaces —
    everything below it parses a string.
    """
    return get_text(BASE.format(
        code=code, query=urllib.parse.quote(query, safe=""), **BRANDS[brand]))


def parse_variant_table(html: str) -> tuple[Row | None, list[Row]]:
    """The header row and the data rows of a variants response.

    Both callers need the same two subtleties and neither is obvious, which
    is why this is one function rather than two copies: the header is found
    by its "Material Number" cell rather than by position (the response opens
    with filter rows that are also `<tr>`s), and a data row is one exactly as
    long as the header whose second cell is all digits. Header, filter and
    footer rows all fail one of those two tests.

    A **matched-nothing** response has no table in it at all, only the
    vendor's own no-results notice, and comes back as `(None, [])`. That is
    the ordinary answer to a facet query for a group a family isn't rated for
    (`materials`), and a hard error for a family scrape — so it is returned as
    a state rather than raised, and `scrape_family` is what decides it's fatal.

    A response with neither the notice nor a header is a *third* thing: the
    endpoint changed shape. That raises, because silently reporting zero rows
    would look exactly like the vendor discontinuing a family.
    """
    parser = TableParser()
    parser.feed(html)
    header = next((r for r in parser.rows
                   if any(t == "Material Number" for t, _ in r)), None)
    if header is None:
        if NO_RESULTS in html:
            return None, []
        raise ValueError(
            "variants response has neither a Material Number header nor the "
            f"vendor's {NO_RESULTS!r} marker — the endpoint changed shape")
    rows = [r for r in parser.rows
            if len(r) == len(header)
            and re.fullmatch(r"\d+", r[1][0] or "")]
    return header, rows


def column_names(header: Sequence[Cell]) -> list[str | None]:
    """Build unique column names from header label + th class unit hints.

    A `None` entry is a column the CSV drops — the checkbox, the sticky CTA,
    and the marketing flag. The list stays positional so it can be zipped
    against a data row.
    """
    label_counts: dict[str, int] = {}
    for text, _ in header:
        label_counts[text] = label_counts.get(text, 0) + 1
    names: list[str | None] = []
    for text, attrs in header:
        cls = attrs.get("class", "")
        if not text or any(s in cls for s in SKIP_CLASSES):
            names.append(None)
            continue
        name = text
        if "CatNo" in cls:
            pass  # catalog number columns carry unit classes but aren't dimensions
        elif "metric" in cls:
            name += "_mm"
        elif "inch" in cls:
            name += "_in"
        elif label_counts[text] > 1:
            # unitless column sharing a label with a unit pair, e.g. a third
            # "D1" with data-value "[D1] Wire Size" -> "D1_wire_size"
            title = re.sub(r"^\[[^\]]*\]\s*", "", attrs.get("data-value", "")).strip()
            if title and title.lower() != text.lower():
                slug = re.sub(r"[^A-Za-z0-9]+", "_", title).strip("_").lower()
                name = f"{text}_{slug}"
        names.append(name)
    return names


def scrape_family(
    code: str,
    out_path: str | Path,
    brand: str = "kennametal",
    # A Sequence rather than an Iterable, and that is not incidental: `tags`
    # is walked twice below, once for the header and once per data row. A
    # generator would write the tag columns into the header and then silently
    # leave every row short.
    tags: Sequence[tuple[str, str]] = (),
) -> int:
    """Scrape one family into a CSV at `out_path`; returns the row count.

    `tags` is a sequence of (name, value) pairs appended to every row as
    constant columns — used to tag facts the table doesn't state, e.g.
    the thread system on a tap family.
    """
    header, data_rows = parse_variant_table(fetch(code, brand))
    if header is None:
        raise SystemExit(f"family {code}: the vendor returned no variants")
    names = column_names(header)

    with open(out_path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow([n for n in names if n] + [k for k, _ in tags])
        for row in data_rows:
            # strict: `data_rows` is filtered to rows exactly as long as the
            # header, and `names` has one entry per header cell, so a length
            # mismatch here means the table changed shape mid-parse. Truncating
            # silently would shift every column after the gap by one.
            w.writerow([t for n, (t, _) in zip(names, row, strict=True) if n]
                       + [v for _, v in tags])
    return len(data_rows)
