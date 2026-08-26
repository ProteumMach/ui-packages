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

from toolpath_scraper.families.destinytool import FAMILIES as DESTINYTOOL
from toolpath_scraper.families.kennametal import COLLET_FAMILIES as KM_COLLETS
from toolpath_scraper.families.kennametal import FAMILIES as KENNAMETAL
from toolpath_scraper.families.kennametal import HOLDER_FAMILIES as KM_HOLDERS


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
HOLDER_FAMILIES: dict[str, dict] = _merge(KM_HOLDERS)
COLLET_FAMILIES: dict[str, dict] = _merge(KM_COLLETS)


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
