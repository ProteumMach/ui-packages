"""Destiny Tool: the Firestore pagination client and the description-parsing
adapter derivations.

Network is mocked at the one seam that is network — `fetch.urlopen`, which is
imported by name in that module precisely so a test can replace it without
reaching into `urllib.request` and changing it for the whole interpreter. Everything
below the fetch — value decoding, the fraction parser, and the three free-text
derivations (shank diameter, corner radius, neck diameter) — runs against
literals, and the real ones were all found or corrected running this against
the actual Firestore collection 2026-08-19; the evidence for each is in
`vendors/destinytool/records.py` beside the code it justifies.
"""

from __future__ import annotations

import io
import json

import pytest

from toolpath_scraper import fetch
from toolpath_scraper.vendors.destinytool import records as dt_records
from toolpath_scraper.vendors.destinytool import scrape as dt

# ── Firestore value decoding ────────────────────────────────────────────────


@pytest.mark.parametrize('value, expected', [
    ({'stringValue': 'DR36424R093S'}, 'DR36424R093S'),
    ({'stringValue': ''}, ''),
    ({'integerValue': '3'}, 3),
    ({'doubleValue': 1.5}, 1.5),
    ({'booleanValue': True}, True),
    ({'nullValue': None}, None),
    ({'arrayValue': {}}, []),
    ({'arrayValue': {'values': [{'stringValue': 'N'}]}}, ['N']),
    ({'arrayValue': {'values': [{'stringValue': 'P'}, {'stringValue': 'M'}]}},
     ['P', 'M']),
])
def test_decode_value(value, expected):
    assert dt.decode_value(value) == expected


def test_decode_value_rejects_an_unrecognized_shape():
    with pytest.raises(ValueError):
        dt.decode_value({'geoPointValue': {}})


def test_decode_document_flattens_fields():
    document = {
        'name': 'projects/x/databases/(default)/documents/products/abc',
        'fields': {
            'itemNumber': {'stringValue': 'X1'},
            'flutes': {'integerValue': '2'},
        },
    }
    assert dt.decode_document(document) == {'itemNumber': 'X1', 'flutes': 2}


def test_decode_document_with_no_fields_is_empty():
    assert dt.decode_document({'name': 'x'}) == {}


# ── Pagination ───────────────────────────────────────────────────────────


class _Response(io.BytesIO):
    def __enter__(self) -> io.BytesIO:
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()


def _mock_pages(monkeypatch, pages):
    """Answer `documents.list` with one of `pages` per call, in order, and
    record every request URL."""
    calls = {'urls': []}
    responses = iter(pages)

    def fake(req, timeout=None):
        calls['urls'].append(req.full_url)
        return _Response(json.dumps(next(responses)).encode())

    monkeypatch.setattr(fetch, 'urlopen', fake)
    return calls


def _doc(item_number):
    return {'fields': {'itemNumber': {'stringValue': item_number}}}


def test_fetch_products_pages_until_no_token_or_no_documents(monkeypatch):
    calls = _mock_pages(monkeypatch, [
        {'documents': [_doc('A'), _doc('B')], 'nextPageToken': 'tok1'},
        {'documents': [_doc('C')], 'nextPageToken': 'tok2'},
        {'documents': []},
    ])
    products = dt.fetch_products()
    assert [p['itemNumber'] for p in products] == ['A', 'B', 'C']
    assert len(calls['urls']) == 3
    assert 'pageToken=tok1' in calls['urls'][1]
    assert 'pageToken=tok2' in calls['urls'][2]


def test_fetch_products_stops_on_a_token_with_zero_documents(monkeypatch):
    """A page with a token but no documents would loop forever if only the
    token were checked — this is the guard against that."""
    calls = _mock_pages(monkeypatch, [
        {'documents': [_doc('A')], 'nextPageToken': 'tok1'},
        {'documents': [], 'nextPageToken': 'tok2'},
    ])
    products = dt.fetch_products()
    assert [p['itemNumber'] for p in products] == ['A']
    assert len(calls['urls']) == 2


def test_the_request_carries_the_field_mask(monkeypatch):
    calls = _mock_pages(monkeypatch, [{'documents': []}])
    dt.fetch_products()
    url = calls['urls'][0]
    for field in dt.FIELDS:
        assert f'mask.fieldPaths={field}' in url
    assert f'pageSize={dt.PAGE_SIZE}' in url


def test_a_single_page_of_zero_documents_stops_immediately(monkeypatch):
    calls = _mock_pages(monkeypatch, [{'documents': []}])
    assert dt.fetch_products() == []
    assert len(calls['urls']) == 1


# ── scrape_end_mills: filtering, sorting, CSV shape ────────────────────────


def _product(item_number, type_='End Mill', **fields):
    return {'itemNumber': item_number, 'type': type_, **fields}


def test_scrape_end_mills_filters_to_end_mill_and_sorts(monkeypatch, tmp_path):
    monkeypatch.setattr(dt, 'fetch_products', lambda: [
        _product('Z1'),
        _product('A9', type_='Drill'),
        _product('A1'),
    ])
    out = tmp_path / 'out.csv'
    count = dt.scrape_end_mills(out)
    assert count == 2
    import csv
    rows = list(csv.DictReader(open(out, newline='')))
    assert [r['itemNumber'] for r in rows] == ['A1', 'Z1']


def test_scrape_end_mills_refuses_a_collection_with_none(monkeypatch, tmp_path):
    monkeypatch.setattr(dt, 'fetch_products', lambda: [
        _product('A1', type_='Drill')])
    with pytest.raises(SystemExit, match='no End Mill rows'):
        dt.scrape_end_mills(tmp_path / 'out.csv')


def test_scrape_end_mills_writes_dimensional_columns_with_an_in_suffix(
        monkeypatch, tmp_path):
    monkeypatch.setattr(dt, 'fetch_products', lambda: [
        _product('A1', cutDia='1/4', isoMaterialGroups=['N', 'P'])])
    out = tmp_path / 'out.csv'
    dt.scrape_end_mills(out)
    import csv
    with open(out, newline='') as f:
        header = next(csv.reader(f))
    for field in dt.DIMENSIONAL_FIELDS:
        assert f'{field}_in' in header
        assert field not in header
    rows = list(csv.DictReader(open(out, newline='')))
    assert rows[0]['cutDia_in'] == '1/4'
    # arrayValue fields are written space-separated.
    assert rows[0]['isoMaterialGroups'] == 'N P'


# ── parse_fraction_inches: sizes 0/1/2/N ────────────────────────────────


def test_parse_fraction_inches_rejects_an_empty_string():
    with pytest.raises(ValueError):
        dt_records.parse_fraction_inches('')


@pytest.mark.parametrize('text, expected', [
    ('.093', 0.093),
    ('1"', 1.0),
    ('3/4', 0.75),
    ('1-1/2', 1.5),
    ('1-1/2"', 1.5),
    ('1', 1.0),
    ('.0225', 0.0225),
    ('5/64', 5 / 64),
])
def test_parse_fraction_inches(text, expected):
    assert dt_records.parse_fraction_inches(text) == pytest.approx(expected)


# ── shank diameter (SFDM) from the description's "SHK" annotation ─────────


def test_shank_diameter_defaults_to_cut_diameter_when_not_stated():
    assert dt_records._shank_diameter(
        'PYTHON 5/8, 5 FLT, 3/4 LOC, 3-1/2 OAL, S/E', 0.625) == 0.625


def test_shank_diameter_reads_a_simple_fraction():
    assert dt_records._shank_diameter(
        'COBRA MINI .078 DIA, 2 FLT, .234 LOC, 1/8 SHK, 1-1/2 OAL',
        0.078) == pytest.approx(0.125)


def test_shank_diameter_reads_a_quoted_shank():
    assert dt_records._shank_diameter(
        'DBACK 1, 3 FLT, 1-1/2 LOC, 1/4" SHK, 4 OAL', 1.0) == pytest.approx(0.25)


def test_shank_diameter_ignores_an_unrelated_number():
    """A description with another number before SHK must not match it."""
    assert dt_records._shank_diameter(
        'VIPER MINI 5/64 DIA, 2 FLT, .117 LOC, 1/8 SHK, 3 OAL, .375 LBS',
        5 / 64) == pytest.approx(0.125)


# ── corner radius (RE): the four-way priority in _corner_radius ───────────


def test_corner_radius_prefers_the_structured_cell():
    assert dt_records._corner_radius(
        'irrelevant .999 RAD', 'Corner Radius', 'W1', 1.0, 0.093) == 0.093


def test_corner_radius_is_half_diameter_on_a_ball_end_mill():
    assert dt_records._corner_radius(
        'BALL VIPER 3/16, 2 FLT, 3/8 LOC, 2 OAL', 'Ball', 'W1',
        0.1875, None) == pytest.approx(0.09375)


def test_corner_radius_recovers_a_single_value_from_the_description():
    assert dt_records._corner_radius(
        'VIPER 3/16, 3 FLT, 3/4 LOC, .015 RAD, 2-1/2 OAL', 'Corner Radius',
        'W1', 0.1875, None) == pytest.approx(0.015)


def test_corner_radius_recovers_the_upper_bound_of_a_description_range():
    """Corroborated over the real scrape: across the 370 rows that state a
    range and also publish a populated structured cell, the cell equals the
    upper bound 352 times and the lower bound 18 times."""
    assert dt_records._corner_radius(
        'DVH ROUGHER 1, 4 FLT, 1-1/2 LOC, .035-.040 RAD, 7 OAL', 'Corner Radius',
        'W1', 1.0, None) == pytest.approx(0.040)


def test_corner_radius_falls_back_to_flat_when_nothing_states_one():
    assert dt_records._corner_radius(
        'DVH 3/4, 7 FLT, 1 1/4 LOC, 4 OAL, Xtreme Plus', 'Corner Radius',
        'W1', 0.75, None) == 0.0


def test_corner_radius_rejects_a_description_value_past_half_diameter(capsys):
    """`V33220R093` states "0.93 RAD" in its description where its two
    siblings and its own item number's `093` suffix all agree the true value
    is .093 — a vendor typo missing a leading zero. A recovered value that
    would make the tool geometrically impossible is not used."""
    result = dt_records._corner_radius(
        'VIPER 1/2, 3 FLT, 1-1/4 LOC, 0.93 RAD, 3 OAL', 'Corner Radius',
        'V33220R093', 0.5, None)
    assert result == 0.0
    assert 'V33220R093' in capsys.readouterr().out


# ── neck (shoulder) diameter from the description's "NECK" annotation ─────


def test_shoulder_diameter_defaults_to_cut_diameter_when_not_stated():
    assert dt_records._shoulder_diameter(
        'COBRA MINI .078 DIA, 2 FLT, .234 LOC, 1/8 SHK, 1-1/2 OAL',
        0.078) == 0.078


def test_shoulder_diameter_reads_the_neck_annotation():
    assert dt_records._shoulder_diameter(
        'VIPER MINI 5/64 DIA, 2 FLT, .117 LOC, 1/8 SHK, 3 OAL, .375 LBS, '
        '.074 NECK, STEALTH COATING', 5 / 64) == pytest.approx(0.074)


# ── material groups fallback: 0/1/2/N and both branches ────────────────


def test_material_groups_uses_the_vendor_cell_when_populated():
    row = {'isoMaterialGroups': 'P M S'}
    assert dt_records._material_groups(row, flutes=5) == ('P', 'M', 'S')


def test_material_groups_reorders_the_vendor_cell_onto_the_iso_sequence():
    """Destiny Tool's own array order is not the ISO 513 sequence every other
    list in the catalog agrees on — real values seen include `['M', 'P', 'S']`
    — so a populated cell is reordered, not passed through verbatim."""
    row = {'isoMaterialGroups': 'M P S K H'}
    assert dt_records._material_groups(row, flutes=5) == (
        'P', 'M', 'K', 'S', 'H')


def test_material_groups_falls_back_to_non_ferrous_at_or_below_three_flutes():
    row = {'isoMaterialGroups': ''}
    assert dt_records._material_groups(row, flutes=2) == ('N',)
    assert dt_records._material_groups(row, flutes=3) == ('N',)


def test_material_groups_falls_back_to_ferrous_above_three_flutes():
    row = {'isoMaterialGroups': ''}
    assert dt_records._material_groups(row, flutes=4) == (
        'P', 'M', 'K', 'S', 'H')


def test_material_groups_missing_cell_is_treated_as_blank():
    assert dt_records._material_groups({}, flutes=2) == ('N',)
