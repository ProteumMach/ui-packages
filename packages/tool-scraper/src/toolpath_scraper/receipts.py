"""What a scrape did, written beside what it produced.

Git used to do this job. In the source package the CSVs were committed, so
"when was this scraped, from which URL, under which family code, how many rows"
was `git log`. The CSVs are not committed here — they are vendor data, and a
public repository is the wrong place for it — and that answer went with them.

So each scrape writes a sidecar. It is cheap now and effectively impossible to
backfill: nothing in a CSV records the URL it came from, and a re-scrape a
month later answers a different question than the one asked.

**The row count is the interesting field.** `families/` states how many rows a
human counted at scrape time, and a receipt states how many the scrape actually
wrote. Every other count in a pipeline like this is computed from the same file
it is checking, so a scrape that silently lost rows agrees with itself; two
independently-arrived-at numbers do not.
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path

#: The suffix a receipt takes, beside the CSV it describes.
#:
#: A suffix rather than a parallel directory, so a CSV and its receipt cannot
#: be separated by moving one — and so a directory listing shows immediately
#: which scrapes have one.
SUFFIX = '.scrape.json'


def scraper_version() -> str:
    """This package's version, or `unknown` when it is not installed.

    Not an error: the package runs perfectly well from a source checkout that
    was never installed, and refusing to record a scrape over a missing version
    string would be the tail wagging the dog. `unknown` is the honest value and
    reads as one.
    """
    try:
        return version('toolpath-tool-scraper')
    except PackageNotFoundError:
        return 'unknown'


@dataclass(frozen=True)
class Receipt:
    """One scrape: what was fetched, from where, when, and how much of it."""

    #: The CSV this describes, by name — so a receipt read on its own says
    #: what it belongs to.
    csv: str
    brand: str
    #: The URL the rows came from. A request, not a page: this is the thing to
    #: re-issue when a column changes shape, and finding it again is the most
    #: expensive part of adding a vendor.
    source: str
    #: How many rows were written. See the module docstring.
    rows: int
    #: UTC, ISO 8601, to the second.
    scraped_at: str
    scraper: str
    #: The vendor's own family code where there is one. REGO-FIX and Destiny
    #: Tool have none — their scrape target is a set of index filters — so it
    #: is None rather than an empty string, which would read as a code the
    #: vendor left blank.
    family_code: str | None = None


def path_for(csv_path: str | Path) -> Path:
    """Where the receipt for `csv_path` goes."""
    csv_path = Path(csv_path)
    return csv_path.with_name(csv_path.name + SUFFIX)


def write(csv_path: str | Path, brand: str, source: str, rows: int,
          family_code: str | None = None) -> Path:
    """Record a scrape beside its CSV, replacing any earlier receipt.

    Replacing rather than appending: a receipt describes the file sitting next
    to it, and a history of scrapes that produced files no longer there is a
    log, not a receipt.
    """
    receipt = Receipt(
        csv=Path(csv_path).name,
        brand=brand,
        source=source,
        rows=rows,
        scraped_at=datetime.now(UTC).replace(microsecond=0).isoformat(),
        scraper=scraper_version(),
        family_code=family_code,
    )
    out = path_for(csv_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(asdict(receipt), indent=2, sort_keys=True) + '\n')
    return out


def read(csv_path: str | Path) -> Receipt | None:
    """The receipt beside `csv_path`, or None when the scrape predates them.

    None rather than a raise: a CSV somebody scraped before this existed is
    still a usable CSV, and refusing it would be refusing data over its
    paperwork.
    """
    path = path_for(csv_path)
    if not path.is_file():
        return None
    return Receipt(**json.loads(path.read_text()))


def check_rows(family: str, declared: int, receipt: Receipt) -> None:
    """Refuse a scrape whose row count disagrees with the declared one.

    The one check two independent numbers make possible. A silently truncated
    response, a facet that started filtering, a vendor discontinuing half a
    family — all of them produce a CSV that parses cleanly and is wrong, and
    none of them is visible from the file alone.

    Raising rather than warning, because the declared count is a human's
    statement about the vendor's own page: if the scrape now disagrees with it,
    one of the two needs updating and neither can be guessed at from here.
    """
    if receipt.rows != declared:
        raise SystemExit(
            f'{family}: the scrape wrote {receipt.rows} rows where this '
            f'family declares {declared} — either the vendor changed the '
            f'family or the scrape lost rows. Re-count and update `rows`, or '
            f'find out which.')
