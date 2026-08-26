"""The binding: config table on one side, adapters on the other.

`registry` is the one module that knows both, and it runs at package import —
so a family that maps a field no vendor publishes is a startup error naming the
family rather than a `KeyError` from inside a mapper on row 1 of a scrape that
already ran. These are what say the binding happened and what it refuses.
"""

from __future__ import annotations

import re
from urllib.parse import quote

import pytest

import toolpath_scraper  # noqa: F401  — the import is what runs bind_adapters
from toolpath_scraper.families import (
    COLLET_FAMILIES,
    FAMILIES,
    HOLDER_FAMILIES,
    _merge,
    family_id,
)
from toolpath_scraper.provenance import Fact
from toolpath_scraper.records import REQUIRED_GEOMETRY, ColumnMap
from toolpath_scraper.registry import (
    ADAPTERS,
    TABLES,
    bind_adapters,
    project_facts,
)

# ── What importing the package already did ─────────────────────────────────

def test_every_family_carries_a_validated_map_and_an_adapter():
    """`bind_adapters` ran at import, so this is the loader's own result. A
    family reaching a mapper without either would raise from inside it; the
    whole point of binding at import is that it cannot."""
    assert FAMILIES, 'a registry with no families binds nothing'
    for name, cfg in FAMILIES.items():
        assert isinstance(cfg['columns'], ColumnMap), name
        assert cfg['columns'].kind == cfg['kind'], name
        assert callable(cfg['records']), name
        assert REQUIRED_GEOMETRY[cfg['kind']] <= set(cfg['columns'].labels), name


def test_every_brand_that_ships_cutting_tools_has_an_adapter():
    for name, cfg in FAMILIES.items():
        assert cfg.get('brand', 'kennametal') in ADAPTERS, name


def test_an_adapter_covers_the_kinds_its_families_declare():
    """A mapper dict missing the kind a family declares is a `KeyError` inside
    `bind_adapters`, which names nothing useful."""
    for name, cfg in FAMILIES.items():
        mappers = ADAPTERS[cfg.get('brand', 'kennametal')]
        assert cfg['kind'] in mappers, name


def test_binding_twice_is_harmless():
    """Projection writes onto the config, so a second run meets its own output.
    Without the guard it would refuse a plain key set beside a fact — its own
    projection — and the failure would name a family that is perfectly fine."""
    bind_adapters()
    bind_adapters()


# ── The fact projection ────────────────────────────────────────────────────

def test_a_fact_value_is_projected_onto_the_config_under_its_own_key():
    """Readers say `cfg['unit']` and never learn about provenance, which is
    right: provenance is evidence for a person and a gate, not an input to
    arithmetic."""
    cfg = FAMILIES['destinytool_end_mills_inch.csv']

    assert cfg['unit'] == cfg['facts']['unit'].value == 'inches'
    assert cfg['coolant_through'] is False


def test_every_projected_key_still_agrees_with_its_fact():
    """The projection is a derived copy with one owner. This is what says it
    stayed derived."""
    for families in TABLES.values():
        for name, cfg in families.items():
            for key, fact in cfg.get('facts', {}).items():
                assert cfg[key] == fact.value, f'{name}: {key}'


def test_setting_a_key_both_ways_is_refused():
    """The failure the projection could otherwise hide: two copies that agree
    today and drift the first time somebody edits the obvious one."""
    tables = {'tool': {'x.csv': {
        'facts': {'flutes': Fact(2, 'assumed', note='n', checked='2026-08-08',
                                 by='JG')},
        'flutes': 3,
    }}}

    with pytest.raises(SystemExit, match='both as a plain key and as a fact'):
        project_facts(tables)


def test_a_fact_that_fails_its_own_check_is_refused_by_family_and_key():
    tables = {'tool': {'x.csv': {'facts': {'flutes': Fact(2, 'assumed')}}}}

    with pytest.raises(SystemExit, match='tool x.csv: flutes'):
        project_facts(tables)


def test_every_family_sources_the_constants_no_table_states():
    """The facts a vendor table never publishes must each carry provenance.

    Listed per kind rather than as one set, because what a table omits differs:
    a tap has no `unit` — its rows carry their own `Thread System` — and no
    `flutes` constant, because it publishes a `Z` column.
    """
    required = {
        'drill': {'unit', 'flutes', 'point_angle', 'coolant_through',
                  'non_ferrous', 'bmc'},
        'endmill': {'unit', 'coolant_through', 'bmc'},
        'tap': {'bmc'},
    }
    for name, cfg in FAMILIES.items():
        missing = required[cfg['kind']] - set(cfg.get('facts', {}))
        assert not missing, f'{name}: missing {missing}'


def test_every_holder_and_collet_sources_its_discriminants():
    """`taper`, `clamping` and `style` are facts the variant table never states
    — which is why they are config, and therefore why each needs a source."""
    assert HOLDER_FAMILIES and COLLET_FAMILIES
    for name, cfg in HOLDER_FAMILIES.items():
        assert {'taper', 'clamping', 'style'} <= set(cfg['facts']), name
    for name, cfg in COLLET_FAMILIES.items():
        assert 'style' in cfg['facts'], name


def test_a_holder_family_states_how_it_meets_the_spindle():
    """`contact` has no default on purpose. BTKV30 is the same JIS B 6339 cone
    as BT30 and seats on the spindle face as well, so a family added without it
    would be recorded as plain-taper on no evidence."""
    for name, cfg in HOLDER_FAMILIES.items():
        assert (('contact' in cfg['facts']) == ('contact' in cfg)), name
    contacts = {cfg['facts']['contact'].value for cfg in HOLDER_FAMILIES.values()
                if 'contact' in cfg['facts']}
    assert contacts <= {'taper', 'face'}, contacts


# ── Family ids ─────────────────────────────────────────────────────────────

def test_a_family_id_is_its_brand_and_its_vendor_local_name():
    assert family_id(FAMILIES['destinytool_end_mills_inch.csv']) == (
        'destinytool:end-mills-inch')


def test_every_family_id_is_unique_and_url_safe():
    """The colon is deliberate: it is a legal `pchar` in a path segment
    (RFC 3986), so `/family/destinytool:end-mills-inch` needs no encoding and
    stays one route parameter. The local half is kebab-case so nothing
    downstream has to decide between a stem's underscores and a URL's
    hyphens."""
    ids = [family_id(cfg) for cfg in FAMILIES.values()]

    assert len(set(ids)) == len(ids)
    for identifier in ids:
        brand, _, local = identifier.partition(':')
        assert brand in toolpath_scraper.identity.BRANDS, identifier
        assert re.fullmatch(r'[a-z0-9-]+', local), identifier
        assert quote(identifier, safe=':-') == identifier


def test_two_vendors_cannot_claim_one_csv_name():
    """`{**a, **b}` would let the second win silently, and the collision would
    surface as a family scraping into a file already holding someone else's
    rows. `end_mills_inch.csv` is the first name either vendor would pick."""
    with pytest.raises(SystemExit, match='claimed by two vendors'):
        _merge({'end_mills_inch.csv': {}}, {'end_mills_inch.csv': {}})


def test_every_family_name_is_the_csv_it_is_scraped_into():
    for table in (FAMILIES, HOLDER_FAMILIES, COLLET_FAMILIES):
        for name in table:
            assert name.endswith('.csv'), name


def test_the_hand_counted_row_total_is_stated_per_family():
    """`rows` is what a human counted, and it is the one key no code needs. It
    is an independent restatement: every other count is computed from the same
    file it checks, so a scrape that silently lost rows agrees with itself."""
    for name, cfg in FAMILIES.items():
        assert isinstance(cfg['rows'], int) and cfg['rows'] > 0, name
