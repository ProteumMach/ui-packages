"""Vendor CAD model URLs: material number in, a static STEP link out.

Kennametal's product pages don't host their CAD models — a third party does
(CDS Visual, on `product-config.net`), and the page reaches it in one of two
ways. For an *assembly* it POSTs a job, polls a batch, and gets back a
transient generated ZIP. For a **single part with no child components** — every
holder in this catalog — it takes a different branch entirely and asks for a
pre-built static file:

    GET https://www.product-config.net/catalog3/cad?d=kennametal&id=<material>

That returns `staticURLs`, a map of format key -> permanent CloudFront URL, and
the files behind it are ordinary objects with a `Last-Modified` in 2024. The
response also states `authenticatedDownload: false`, which is what makes a
direct link viable: no login, no session, no token.

`KENNAMETAL_CAD_API.md` documents the endpoint and the format keys. This
module scrapes one of them — `stp-lwm`, the lightweight STEP, which is the
collision model to give Fusion as holder geometry.

**Why this writes a CSV column rather than a catalog directly.** Everything
scraped in this package lands in a CSV first and is converted offline
afterwards, and that split is what keeps every consumer pure and the whole test
suite off the network. The CSV is also the record of what the vendor said and
when — the provenance sidecar beside it carries the date.
"""

from __future__ import annotations

import csv
import time
from pathlib import Path

from toolpath_scraper.conventions import CAD_COLUMN
from toolpath_scraper.fetch import get_bytes, get_json

CAD_API = 'https://www.product-config.net/catalog3/cad?d=kennametal&id={material}'

#: The CSV column this module writes is `conventions.CAD_COLUMN`, shared with
#: every other vendor's scraper because a consumer reads exactly one. What is
#: Kennametal-specific is *which* of CDS Visual's formats fills it — that is
#: `LIGHTWEIGHT_STEP` below, and it stays here.

#: The `staticURLs` key for the lightweight STEP — CDS calls it LWM, the
#: vendor UI calls it "3D Anti Collision Model", and it is the simplified
#: solid rather than the full graphical model (`stp-gtm`).
LIGHTWEIGHT_STEP = 'stp-lwm'

#: Seconds between requests. One per holder, twenty holders — this is
#: politeness, not rate-limit avoidance.
REQUEST_DELAY = 0.4


def fetch_cad(material: str) -> dict:
    """The CAD metadata for one material number."""
    return get_json(CAD_API.format(material=material))


def lightweight_step_url(payload: dict) -> str | None:
    """The lightweight STEP URL from a CAD payload, or None when there is none.

    None is a real state and not an error: the vendor's own UI carries a "we
    do not have any CAD models available for download" case, and a holder
    without a published model is a holder this app should say nothing about
    rather than offer a dead link for. All twenty holders scraped so far do
    have one, which is exactly why the absent case needs a test rather than a
    reassuring assumption.
    """
    if not payload.get('cadAvailable'):
        return None
    urls = payload.get('staticURLs') or {}
    url = urls.get(LIGHTWEIGHT_STEP)
    return url if isinstance(url, str) and url else None


def download_step(url: str, dest: Path) -> int:
    """One STEP file onto disk. Returns the bytes written.

    Straight to `dest` rather than through a temp file: these are ~54 KB
    static CloudFront objects, and a half-written one is caught by whatever
    tries to import it, not by anything here.
    """
    data = get_bytes(url)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return len(data)


def download_family_steps(
    path: str | Path,
    out_dir: Path,
    delay: float = REQUEST_DELAY,
) -> list[tuple[str, int]]:
    """Every STEP model a holder CSV names, into `out_dir`, one file per row.

    Named for the catalog number rather than the material number, because the
    filename is what a human reads in the probe's output and `BT30ER16060M`
    says what the part is where `1258023` does not.

    **`out_dir` is a required argument and never inferred**, the same rule
    `convert_family` follows: these files are a local working copy, they are
    gitignored, and a default that pointed into `data/` would be the one
    mistake that silently commits ~3 MB of vendor binaries.

    Returns `(catalog_number, bytes)` per file written. A row with no CAD URL
    is skipped rather than failed — that is `lightweight_step_url`'s documented
    None case arriving here.
    """
    path = Path(path)
    with open(path, newline='') as f:
        rows = list(csv.DictReader(f))

    written: list[tuple[str, int]] = []
    for row in rows:
        url = (row.get(CAD_COLUMN) or '').strip()
        if not url:
            continue
        catalog = row['ISO Catalog Number']
        if written:
            time.sleep(delay)
        size = download_step(url, out_dir / f'{catalog}.stp')
        written.append((catalog, size))
    return written


def annotate_csv(path: str | Path, delay: float = REQUEST_DELAY) -> int:
    """Add (or refresh) the CAD model column on a toolholding CSV, in place.

    Returns how many rows got a URL — deliberately not the row count, so a
    run that silently found nothing reads as `0 of 12` at the call site
    instead of as success.

    Safe to re-run, like `thread_column.add_thread_pitch_to_csv`: an existing
    column is rebuilt rather than duplicated. A row whose lookup finds no model keeps
    an empty cell; the row is never dropped, because the holder still exists.
    """
    path = Path(path)
    with open(path, newline='') as f:
        reader = csv.DictReader(f)
        fields = list(reader.fieldnames or [])
        rows = list(reader)
    if not rows:
        return 0

    if CAD_COLUMN not in fields:
        fields.append(CAD_COLUMN)

    found = 0
    for index, row in enumerate(rows):
        if index:
            time.sleep(delay)
        url = lightweight_step_url(fetch_cad(row['Material Number']))
        row[CAD_COLUMN] = url or ''
        if url:
            found += 1

    with open(path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    return found
