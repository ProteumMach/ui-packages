"""Which adapter serves which family — the composition root.

`families/` is the config table and `vendors/` are the adapters; this is the one
module that knows both, and it exists so that neither has to. Putting the
binding in the config table made the table import a manufacturer, which
`tests/test_vendor_boundary.py` refuses for good reason: the table is read by
every test, and none of those should drag a vendor's scraper in behind it.

It runs at package import, so a mapping fault is a startup error naming the
family rather than a `KeyError` from inside a mapper on row 1 of a scrape that
already ran.

**This is the seam a per-vendor distribution would replace with an entry-point
registry.** When a vendor package can be installed from outside the tree, the
`ADAPTERS` dict below becomes a lookup over entry points and nothing else here
changes shape. Until then one repository holds every adapter, which is what lets
one commit change the record contract and every adapter together.
"""

from __future__ import annotations

from toolpath_scraper.families import (
    COLLET_FAMILIES,
    FAMILIES,
    HOLDER_FAMILIES,
)
from toolpath_scraper.provenance import check_fact
from toolpath_scraper.records import check_column_map
from toolpath_scraper.vendors.destinytool.records import (
    RECORD_MAPPERS as DESTINYTOOL,
)
from toolpath_scraper.vendors.kennametal.records import (
    RECORD_MAPPERS as KENNAMETAL,
)

#: Brand -> its CSV-row-to-`ToolRecord` mappers, by tool kind.
#:
#: One entry serves two brands: Kennametal and WIDIA are the same AEM platform
#: and the same table vocabulary, so one adapter covers both, exactly as one
#: scraper does. A brand absent from here can still be scraped — REGO-FIX ships
#: toolholding and no cutting tools, and only cutting tools go through a column
#: map.
ADAPTERS: dict[str, dict] = {
    'kennametal': KENNAMETAL,
    'widia': KENNAMETAL,
    'destinytool': DESTINYTOOL,
}

#: The config tables, by the name `provenance.assumptions` labels rows with.
#:
#: Only `tool` binds an adapter. Holders and collets are here because their
#: facts pass the same provenance gate — a taper or a clamping mode is a
#: per-family constant no variant table states, exactly like a drill's flute
#: count.
TABLES: dict[str, dict] = {
    'tool': FAMILIES,
    'holder': HOLDER_FAMILIES,
    'collet': COLLET_FAMILIES,
}


def project_facts(tables: dict[str, dict] | None = None) -> None:
    """Check every fact, then write its value onto the config under its own key.

    **This is what stops `Fact` being a second source of truth.** The fact is
    the only authored copy; the plain key is a projection with one owner.
    Readers keep saying `cfg['unit']` and never learn about provenance, which is
    right — provenance is evidence for a person and a gate, not an input to
    arithmetic.

    A family that sets both is refused rather than silently preferring one.
    That is the failure this projection could otherwise hide: two copies that
    agree today and drift the first time somebody edits the obvious one.

    `tables` defaults to {@link TABLES}. It is a parameter so a test can put a
    family in front of the gate without editing the real catalog and putting
    the rest of the suite behind its restoration.
    """
    for table, families in (TABLES if tables is None else tables).items():
        for name, cfg in families.items():
            for key, fact in cfg.get('facts', {}).items():
                check_fact(f'{table} {name}', key, fact)
                if key in cfg:
                    raise SystemExit(
                        f'{name}: {key!r} is set both as a plain key and as a '
                        f'fact — the fact is the authored one, so delete the '
                        f'plain key')
                cfg[key] = fact.value


#: Whether {@link bind_adapters} has already run against `FAMILIES`.
#:
#: Projection is a write onto the config, so a second run would meet its own
#: output and refuse it as a plain key set beside a fact. The flag is what makes
#: the "idempotent" claim below true rather than aspirational.
_bound = False


def bind_adapters() -> None:
    """Validate every family's column map and attach its record mapper.

    Idempotent, so calling it twice in one interpreter is harmless.
    """
    global _bound
    if _bound:
        return
    project_facts()
    for name, cfg in FAMILIES.items():
        brand = cfg.get('brand', 'kennametal')
        mappers = ADAPTERS.get(brand)
        if mappers is None:
            raise SystemExit(
                f'{name}: brand {brand!r} has no record adapter — a vendor '
                f'that ships cutting tools needs one '
                f'(known: {sorted(ADAPTERS)})')
        cfg['columns'] = check_column_map(name, cfg['kind'], cfg['columns'])
        cfg['records'] = mappers[cfg['kind']]
    _bound = True
