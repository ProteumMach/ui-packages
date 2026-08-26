"""The ISO workpiece-group sweep: facet response -> CSV column -> tool field.

The network is mocked at the module seam (`materials.fetch`), the same place
`test_scrape.py` and `test_cad.py` mock theirs — nothing here makes a request.

The test worth having is that a group a family isn't rated for produces an
*absence* rather than an error, because that is what 32-value sweeps mostly
return and a crash there would have made the whole approach unusable.

The cases that run over the real committed CSVs are waiting on a data root —
see the note at the foot of this file.
"""

from __future__ import annotations

import csv

import pytest

from toolpath_scraper.vendors.kennametal import materials

# The two shapes the endpoint returns, trimmed to what the parser reads.
NO_RESULTS = '<div class="no-results">There are no results for this query.</div>'


def _table(*material_numbers: str) -> str:
    rows = ''.join(
        f'<tr><td></td><td>{m}</td><td>CAT{m}</td></tr>'
        for m in material_numbers)
    return (
        '<table><tr>'
        '<th class="collab-checkbox-header"></th>'
        '<th class="">Material Number</th>'
        '<th class="CatNo metric">ISO Catalog Number</th>'
        f'</tr>{rows}</table>'
    )


def _serve(by_group):
    """A fake `fetch` answering from a {group: [material numbers]} map."""
    def fake(code, brand, query):
        group = query.rsplit(':', 1)[1]
        found = by_group.get(group, [])
        return _table(*found) if found else NO_RESULTS
    return fake


# ── one group at a time ────────────────────────────────────────────────────

def test_the_facet_name_is_appended_to_the_active_only_query(monkeypatch):
    """A misspelled facet *name* is ignored by the endpoint rather than
    rejected, which would report every group as matching every tool — so the
    name is a constant and the query it builds is worth pinning."""
    seen = {}

    def fake(code, brand, query):
        seen.update(code=code, brand=brand, query=query)
        return NO_RESULTS

    monkeypatch.setattr(materials, 'fetch', fake)
    materials.materials_in_group('103354322', 'S3', 'widia')
    assert seen == {
        'code': '103354322',
        'brand': 'widia',
        'query': ':relevance:obsoleteFacet:false:workpieceMaterialDetail:S3',
    }


@pytest.mark.parametrize('served, expected', [
    ([], set()),
    (['1'], {'1'}),
    (['1', '2'], {'1', '2'}),
    ([str(i) for i in range(9)], {str(i) for i in range(9)}),
])
def test_a_group_returns_the_material_numbers_indexed_for_it(
        monkeypatch, served, expected):
    monkeypatch.setattr(materials, 'fetch', _serve({'P3': served}))
    assert materials.materials_in_group('1', 'P3') == expected


def test_a_group_the_family_is_not_rated_for_is_empty_not_an_error(monkeypatch):
    """The common case in a 32-value sweep. MaxiMet matches nothing under any
    of the 24 non-N groups, and a raise there would mean no family could be
    swept at all."""
    monkeypatch.setattr(materials, 'fetch', _serve({'N1': ['1']}))
    assert materials.materials_in_group('1', 'P0') == set()


# ── the sweep ──────────────────────────────────────────────────────────────

def test_groups_come_back_in_vendor_order_not_discovery_order(monkeypatch):
    """P before M before K is the vendor's own panel order, and the written
    column has to be byte-stable across re-runs — a set's iteration order is
    neither."""
    monkeypatch.setattr(materials, 'fetch', _serve({
        'H1': ['7'], 'P2': ['7'], 'N4': ['7'], 'K1': ['7'],
    }))
    assert materials.groups_by_material('1', delay=0) == {
        '7': ['P2', 'K1', 'N4', 'H1'],
    }


def test_each_material_gets_only_its_own_groups(monkeypatch):
    """The sweep is per material number rather than per family. Every family
    scraped so far answers uniformly, so a family-wide list would pass every
    test written against today's data and be wrong the first time a vendor
    splits a line by size."""
    monkeypatch.setattr(materials, 'fetch', _serve({
        'P0': ['1', '2'], 'N1': ['2'], 'S4': ['1'],
    }))
    assert materials.groups_by_material('1', delay=0) == {
        '1': ['P0', 'S4'],
        '2': ['P0', 'N1'],
    }


# ── CSV annotation ─────────────────────────────────────────────────────────

def _write_csv(path, material_numbers):
    with open(path, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['Material Number', 'Grade'])
        w.writeheader()
        for m in material_numbers:
            w.writerow({'Material Number': m, 'Grade': 'KCU20'})
    return path


@pytest.mark.parametrize('count', [0, 1, 2, 5])
def test_every_row_gets_a_cell_at_any_size(tmp_path, monkeypatch, count):
    numbers = [str(i) for i in range(count)]
    monkeypatch.setattr(materials, 'fetch', _serve({'P1': numbers}))
    path = _write_csv(tmp_path / 'f.csv', numbers)

    assert materials.add_material_groups_to_csv(path, '1', delay=0) == count

    rows = list(csv.DictReader(open(path, newline='')))
    assert len(rows) == count
    for row in rows:
        assert row[materials.MATERIALS_COLUMN] == 'P1'


def test_a_family_the_vendor_indexes_for_nothing_keeps_every_row(
        tmp_path, monkeypatch):
    """What all three tap families do. An empty cell records that the sweep
    ran and found nothing; dropping the row would delete a tap that exists."""
    monkeypatch.setattr(materials, 'fetch', _serve({}))
    path = _write_csv(tmp_path / 'taps.csv', ['1', '2'])

    assert materials.add_material_groups_to_csv(path, '1', delay=0) == 0

    rows = list(csv.DictReader(open(path, newline='')))
    assert [r['Material Number'] for r in rows] == ['1', '2']
    assert [r[materials.MATERIALS_COLUMN] for r in rows] == ['', '']


def test_re_running_rebuilds_the_column_instead_of_duplicating_it(
        tmp_path, monkeypatch):
    monkeypatch.setattr(materials, 'fetch', _serve({'P0': ['1'], 'M2': ['1']}))
    path = _write_csv(tmp_path / 'f.csv', ['1'])

    materials.add_material_groups_to_csv(path, '1', delay=0)
    monkeypatch.setattr(materials, 'fetch', _serve({'N1': ['1']}))
    materials.add_material_groups_to_csv(path, '1', delay=0)

    with open(path, newline='') as f:
        header = next(csv.reader(f))
    assert header.count(materials.MATERIALS_COLUMN) == 1
    rows = list(csv.DictReader(open(path, newline='')))
    assert rows[0][materials.MATERIALS_COLUMN] == 'N1'


# ── the column back out ────────────────────────────────────────────────────

@pytest.mark.parametrize('cell, expected', [
    (None, []),
    ('', []),
    ('P0', ['P0']),
    ('P0 M1', ['P0', 'M1']),
    ('H2 P0 M1 N4', ['P0', 'M1', 'N4', 'H2']),
])
def test_parsing_the_column_restores_vendor_order(cell, expected):
    assert materials.parse_material_groups(cell) == expected


@pytest.mark.parametrize('cell, expected', [
    (None, []),
    ('', []),
    ('N1', ['N']),
    ('N1 N2 N3 N4', ['N']),
    ('H2 P0 M1 N4', ['P', 'M', 'N', 'H']),
    ('P0 P1 P2 P3 P4 P5 P6 M1 K1 S4 H1', ['P', 'M', 'K', 'S', 'H']),
])
def test_the_converter_sees_iso_classes_not_subgroups(cell, expected):
    """Seven grades of steel hardness are one answer to "does it cut steel".
    The subgroup stays in the CSV, so re-deriving it later is an edit rather
    than a re-scrape."""
    assert materials.material_classes(cell) == expected


def test_an_unknown_code_cannot_smuggle_in_a_class():
    """`material_classes` takes the first letter, so it would happily invent
    a `Z` class if it read the raw cell instead of the parsed list."""
    assert materials.material_classes('P0 Z9') == ['P']


def test_a_code_the_vendor_does_not_publish_is_dropped():
    """This column is generated, so an unknown code came from a hand-edit.
    Passing it through would put a value in the catalog's filter panel that
    no control could ever offer and nothing could ever match."""
    assert materials.parse_material_groups('P0 Z9 N1') == ['P0', 'N1']

# ── The corpus assertions live with the corpus ─────────────────────────────
# The source package ends this file with cases that read the committed CSVs.
# They check the *scraped data* rather than the scraper, so they belong with
# the data — and there is no data root here yet. Step 5 of
# `docs/TOOL-SCRAPER-PLAN.md` brings `TOOLPATH_SCRAPE_ROOT` and returns them
# as skip-with-reason: a machine holding a scrape checks it, and CI skips and
# says why.
#
# Waiting here: that every swept family CSV carries the column, that all
# three tap families carry it empty — a vendor gap, pinned so a vendor who
# starts indexing taps fails a test — that every drill and end mill is
# indexed for something, and that every scraped code is one the sweep
# knows.
