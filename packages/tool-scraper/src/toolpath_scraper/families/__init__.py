"""Per-family scrape config: what to fetch, and how its columns are labelled.

One module per vendor, merged here. The split is the point: a REGO-FIX family
is named whatever REGO-FIX calls it without anybody checking Kennametal's list
first, and adding a vendor is a new file rather than an edit to a table three
other vendors depend on.

**Config, not code.** Nothing here imports an adapter — `registry` is the one
module that knows both, and `tests/test_vendor_boundary.py` refuses the
alternative. In the source package this table briefly did the binding itself,
which made the config import a manufacturer; the table is read by every test,
and none of them should drag a vendor's scraper in behind it.

Three kinds of key, and they are worth telling apart:

- **Scrape targets** — `family_code`, and whatever else names the thing to
  fetch. This is what makes a scrape re-runnable without going back to the
  browser to find the family page again.
- **`columns`** — the vendor's own column labels, keyed by canonical ISO 13399
  name, *without* a unit suffix. `registry.bind_adapters` runs each through
  `records.check_column_map`, so a typo fails at import naming the family.
- **`facts`** — the per-family constants no vendor table states, each carrying
  its provenance. `registry.project_facts` checks and projects them, so readers
  say `cfg['unit']` and never learn about provenance.

`rows` is **how many rows a human counted in this CSV** at scrape time, and it
is the one key here that no code needs. It is an independent restatement, which
is the whole value: every other count is computed from the same file it is
checking, so a scrape that silently lost rows agrees with itself. It is per
family and not a total, because a total hides the case it exists to catch — one
family gaining a row while another loses one sums to no change.
"""

from __future__ import annotations

import os
from pathlib import Path

from toolpath_scraper.families.destinytool import FAMILIES as DESTINYTOOL
from toolpath_scraper.families.kennametal import COLLET_FAMILIES as KM_COLLETS
from toolpath_scraper.families.kennametal import FAMILIES as KENNAMETAL
from toolpath_scraper.families.kennametal import HOLDER_FAMILIES as KM_HOLDERS
from toolpath_scraper.families.regofix import COLLET_FAMILIES as RF_COLLETS
from toolpath_scraper.families.regofix import HOLDER_FAMILIES as RF_HOLDERS


def _merge(*tables: dict[str, dict]) -> dict[str, dict]:
    """One flat table, refusing a CSV name two vendors both claim.

    A flat dict is what every reader wants, and `{**a, **b}` is how it would
    normally be built — which is exactly the problem: the second vendor's entry
    would silently replace the first's, and the collision would surface as a
    family that scrapes into a file already holding someone else's rows. Two
    vendors shipping `end_mills_inch.csv` is not far-fetched; it is the first
    name either of them would pick.
    """
    merged: dict[str, dict] = {}
    for table in tables:
        for name, cfg in table.items():
            if name in merged:
                raise SystemExit(
                    f'{name}: claimed by two vendors — a CSV name is the key of '
                    f'this table and has to be unique across all of them')
            merged[name] = cfg
    return merged


#: Every cutting-tool family, keyed by the CSV it is scraped into.
FAMILIES: dict[str, dict] = _merge(KENNAMETAL, DESTINYTOOL)

#: Every toolholding family — holders, and the collets that go in them.
#:
#: Separate tables rather than a `kind` on one, because a holder and a collet
#: are not variants of a thing: they carry different discriminants (a holder
#: states a taper and a clamping mode; a collet states a series and a capacity
#: band) and a scrape of one is not a scrape of the other.
HOLDER_FAMILIES: dict[str, dict] = _merge(KM_HOLDERS, RF_HOLDERS)
COLLET_FAMILIES: dict[str, dict] = _merge(KM_COLLETS, RF_COLLETS)


def family_id(cfg: dict) -> str:
    """A family's id: `<brand>:<vendor-local id>`.

    Bare filename stems were the id in the source package until 2026-08-08 —
    `godrill_3xd_metric` — and they are a route parameter and a join key
    downstream. With one vendor there was no collision to fix; with four there
    is a latent one the moment two ship a family called `endmills_metric`, and
    it would land as a route that resolves to whichever library was read last.

    The local half is the vendor's, kebab-cased, which is what lets a REGO-FIX
    family be called whatever REGO-FIX calls it without checking Kennametal's
    list first. The **colon** is deliberate: it is a legal `pchar` in a URL path
    segment (RFC 3986), so `/family/kennametal:godrill-3xd-metric` needs no
    encoding and stays one route parameter.
    """
    return f"{cfg.get('brand', 'kennametal')}:{cfg['id']}"


# ── Where a scrape lands ───────────────────────────────────────────────────
# **Scraped output is never committed.** A CSV is a vendor's data and a working
# file, not source, and this repository is public — which is a second reason,
# independent of size, to keep it out.
#
# Git was carrying the provenance of those CSVs for free. Now that it is not,
# every scrape writes a `receipts` sidecar beside its file.

#: Where scraped CSVs are read from and written to.
#:
#: Set it when the package is installed rather than run from this checkout: the
#: default below is derived from this file's own location, which is right in a
#: working tree and meaningless inside `site-packages`. Every command prints
#: the resolved root for exactly that reason — a scrape that wrote somewhere
#: surprising should say so on the way, not be discovered later.
SCRAPE_ROOT_ENV = 'TOOLPATH_SCRAPE_ROOT'

#: `packages/tool-scraper/scrape-out`, which `.gitignore` already covers —
#: named in the skeleton commit, before anything wrote into it.
DEFAULT_SCRAPE_ROOT = Path(__file__).resolve().parents[3] / 'scrape-out'


def scrape_root() -> Path:
    """The directory holding every vendor's scraped CSVs."""
    override = os.environ.get(SCRAPE_ROOT_ENV)
    return Path(override).expanduser().resolve() if override else DEFAULT_SCRAPE_ROOT


def describe_root() -> str:
    """One line naming the resolved root and how it was resolved.

    Printed by every command. The distinction it carries is the one that
    matters when a scrape goes somewhere unexpected: whether the path came from
    the environment or from this package's own location.
    """
    how = 'set' if os.environ.get(SCRAPE_ROOT_ENV) else 'default'
    return f'scrape root: {scrape_root()} ({SCRAPE_ROOT_ENV} {how})'


def csv_dir(brand: str) -> Path:
    """Where one vendor's scraped CSVs live — the receipts.

    Per brand rather than per adapter, and the distinction is worth holding on
    to: an adapter is a fact about *code*, a scraped table is a fact about who
    published it. WIDIA's tables are WIDIA's even though Kennametal's adapter
    is what fetched them.
    """
    return scrape_root() / brand / 'csv'


def step_dir(brand: str) -> Path:
    """One vendor's mirrored STEP models.

    Nothing is redistributed from here: these are a local working copy for
    measuring a holder, and only a derived profile is ever meant to leave.
    """
    return scrape_root() / brand / 'step'


#: Every family this package knows, by CSV name — tools and toolholding alike.
#:
#: Built once rather than searched per call, so `family_csv` can refuse an
#: unknown name by listing what it does know.
_ALL: dict[str, dict] = {**FAMILIES, **HOLDER_FAMILIES, **COLLET_FAMILIES}


def family_csv(name: str) -> Path:
    """Where one family's CSV lives, resolved through its own brand.

    Takes a bare CSV name rather than a path, so a caller cannot pass a file
    from somewhere else and have it silently treated as this family's receipt.
    """
    cfg = _ALL.get(name)
    if cfg is None:
        raise SystemExit(
            f'unknown family CSV: {name} (known: {sorted(_ALL)})')
    return csv_dir(cfg.get('brand', 'kennametal')) / name


def family_brand(name: str) -> str:
    """The brand that published `name`, refusing a name nothing declares."""
    cfg = _ALL.get(name)
    if cfg is None:
        raise SystemExit(
            f'unknown family CSV: {name} (known: {sorted(_ALL)})')
    return cfg.get('brand', 'kennametal')
