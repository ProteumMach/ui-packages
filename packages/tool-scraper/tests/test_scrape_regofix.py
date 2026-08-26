"""The REGO-FIX half — the ProductFinder index, the DIN 4000 documents, and
the CSV shape a consumer then reads.

Network is mocked at the two seams that are network (`fetch.urlopen` for the
search proxy, `fetch_din4000` for the per-part XML); everything below runs for
real against saved payloads, because parsing is what breaks when a vendor
changes shape. The cases at the foot run over a scrape where one exists on the
machine, and skip with a reason where it does not.

**The tests worth reading twice are the ones about the three pinned DIN codes
and about where a collet's size comes from.** Both are places where a
plausible reading of the vendor's data is wrong, and neither would raise.
"""

from __future__ import annotations

import csv
import io
import json

import corpus
import pytest

from toolpath_scraper import fetch
from toolpath_scraper.conventions import (
    CAD_COLUMN,
    DIN_PREFIX,
    check_identity_columns,
)
from toolpath_scraper.families import HOLDER_FAMILIES
from toolpath_scraper.vendors.regofix import scrape as rf

HOLDERS = 'regofix_bt30_pg_holders.csv'
STANDARD = 'regofix_pg_collets_standard.csv'
TAPPING = 'regofix_pg_collets_tap.csv'
SHORT_TAIL = 'regofix_pgst_collets.csv'

#: The BT 30 / PG 25 x 075 document, trimmed to the properties this package
#: reads plus two it deliberately does not. Values are verbatim from
#: `XML_DIN4000/XML/213072530.xml` (fetched JG 2026-08-07).
DIN_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Tool-Data><Tool><Properties>
  <Property-Data>
    <PropertyName source="din_mk">J21</PropertyName><Value>2130.72530</Value>
  </Property-Data>
  <Property-Data>
    <PropertyName source="din_mk">J1</PropertyName><Value>DINISO7388-2</Value>
  </Property-Data>
  <Property-Data>
    <PropertyName source="din_mk">A1</PropertyName><Value>40</Value>
  </Property-Data>
  <Property-Data>
    <PropertyName source="din_mk">A4</PropertyName><Value>46</Value>
  </Property-Data>
  <Property-Data>
    <PropertyName source="din_mk">A6</PropertyName><Value></Value>
  </Property-Data>
  <Property-Data>
    <PropertyName source="din_mk">B3</PropertyName><Value>75</Value>
  </Property-Data>
  <Property-Data>
    <PropertyName source="din_mk">B4</PropertyName><Value>123.4</Value>
  </Property-Data>
  <Property-Data>
    <PropertyName source="din_mk">A2</PropertyName><Value>42</Value>
  </Property-Data>
  <Property-Data>
    <PropertyName source="din_mk">B3_WOA</PropertyName><Value>69</Value>
  </Property-Data>
</Properties></Tool></Tool-Data>
"""

#: One `_source`, as the proxy returns it — every value a list, even the ones
#: that are always single.
HIT = {
    'title': ['BT 30 / PG 25 x 075'],
    'field_sku_fulltext': ['2130.72530'],
    'form_name': ['Standard'],
    'norm_size': ['25'],
    'field_technical_drawings_url': [
        '//static.rego-fix.com/x/DXF/213072530.dxf',
        '//static.rego-fix.com/x/STP/213072530.stp',
    ],
}


def _properties(**overrides: str) -> dict[str, str]:
    props = rf.parse_din4000(DIN_XML)
    props.update(overrides)
    return props


# ── The search proxy ───────────────────────────────────────────────────────

def _mock_urlopen(monkeypatch, payload):
    """Answer the proxy with `payload`, and record the request body."""
    sent = {}

    class _Response(io.BytesIO):
        def __enter__(self) -> io.BytesIO:
            return self

        def __exit__(self, *exc: object) -> None:
            self.close()

    def fake(req, timeout=None):
        sent['url'] = req.full_url
        sent['body'] = json.loads(req.data)
        return _Response(json.dumps(payload).encode())

    monkeypatch.setattr(fetch, 'urlopen', fake)
    return sent


def test_a_search_is_an_and_of_term_filters_against_the_proxy(monkeypatch):
    sent = _mock_urlopen(
        monkeypatch, {'hits': {'total': 1, 'hits': [{'_source': HIT}]}})

    sources = rf.search({'system_name': 'powRgrip', 'type': 'toolholders'})

    assert sent['url'] == rf.SEARCH_URL
    assert sent['body']['query'] == {'bool': {'filter': [
        {'term': {'system_name': 'powRgrip'}},
        {'term': {'type': 'toolholders'}},
    ]}}
    assert sources == [HIT]


def test_a_roster_larger_than_the_request_is_refused_rather_than_truncated(
        monkeypatch):
    """The failure this whole package is built to notice.

    A silently truncated roster converts cleanly, validates cleanly and leaves
    no failed assertion — it just ships a family missing half its parts.
    """
    _mock_urlopen(
        monkeypatch, {'hits': {'total': 900, 'hits': [{'_source': HIT}]}})

    with pytest.raises(SystemExit, match='900 products but only'):
        rf.search({'type': 'collets'}, size=500)


def test_a_response_without_hits_is_reported_as_a_changed_endpoint(monkeypatch):
    """Not as zero products — which would look exactly like a discontinued
    line, the same distinction `scrape.parse_variant_table` draws."""
    _mock_urlopen(monkeypatch, {'error': 'nope'})

    with pytest.raises(ValueError, match='carries no "hits"'):
        rf.search({'type': 'collets'})


def test_one_reads_a_single_valued_field_and_treats_absent_as_none():
    assert rf.one(HIT, 'title') == 'BT 30 / PG 25 x 075'
    # Absent and empty are both None: `o_inch` is missing on a metric collet,
    # which is the vendor saying "metric" rather than leaving a hole.
    assert rf.one(HIT, 'o_inch') is None
    assert rf.one({'o_inch': []}, 'o_inch') is None


# ── DIN 4000 documents ─────────────────────────────────────────────────────

def test_din_properties_are_parsed_and_blank_ones_dropped():
    props = rf.parse_din4000(DIN_XML)

    assert props['A1'] == '40'
    assert props['B4'] == '123.4'
    # `A6` is published empty. Dropping it is what makes "the vendor stated
    # this" and "the vendor stated a hole" different states.
    assert 'A6' not in props


def test_a_document_with_no_properties_raises_rather_than_reading_as_empty():
    with pytest.raises(ValueError, match='changed shape'):
        rf.parse_din4000('<Tool-Data><Tool/></Tool-Data>')


# ── The three pinned codes, and the checks that pin them ───────────────────

def test_the_gage_length_is_b4_because_b4_minus_b3_is_the_taper_offset():
    """The claim `holder_row` is built on, asserted as arithmetic.

    Nothing in the vendor's XML says B4 is a gage length. What says it is that
    `B4 - B3` is 48.4 mm on every row, and 48.4 is BT 30's gauge-line-to-flange
    distance in REGO-FIX's own interface table. Break that and the mapping is
    unfounded, so it is refused rather than converted.
    """
    row = rf.holder_row(HIT, _properties())
    assert row['L1_mm'] == '123.4'
    assert row['B3_mm'] == '75'
    # `123.4 - 75` is 48.400000000000006 in binary floating point, which is
    # why `holder_row` compares to a tolerance rather than for equality.
    assert float(row['L1_mm']) - float(row['B3_mm']) == \
        pytest.approx(rf.BT30_GAUGE_TO_FLANGE, abs=1e-9)

    with pytest.raises(SystemExit, match='B4 is not the gage length here'):
        rf.holder_row(HIT, _properties(B4='120'))


def test_a_flange_that_is_not_a_bt30_flange_is_refused():
    """`A4` is 46 on every BT 30 holder — the taper's flange diameter, not the
    part's. It is checked rather than stored: a document where it differs is
    not the interface this family claims."""
    with pytest.raises(SystemExit, match='not the 46.0 mm flange'):
        rf.holder_row(HIT, _properties(A4='63'))


def test_a_missing_pinned_code_is_refused_rather_than_defaulted():
    for code in ('A1', 'B3', 'B4'):
        with pytest.raises(SystemExit, match=f'publishes no {code}'):
            rf.holder_row(HIT, _properties(**{code: ''}))


def test_the_unpinned_codes_are_carried_verbatim_and_never_promoted():
    """`A2`, `B1`, `B2` and `B3_WOA` have no meaning this repo can cite, so
    they keep their raw DIN code behind a `DIN_` prefix. A column named
    `A2_mm` would sit beside `L1_mm` looking exactly as mapped as it is not —
    the runbook's rule about not inventing a label for a vendor code, applied
    to a column name."""
    row = rf.holder_row(HIT, _properties())

    assert row['DIN_A2'] == '42'
    assert row['DIN_B3_WOA'] == '69'
    assert row['DIN_B1'] == '' and row['DIN_B2'] == ''
    for key in row:
        assert not key.startswith(('A2', 'B1', 'B2', 'B3_WOA'))


# ── Hand-checked mapping ───────────────────────────────────────────────────

def test_a_powrgrip_holder_maps_to_a_collet_clamping_record():
    row = rf.holder_row(HIT, _properties())

    assert row == {
        'Material Number': '2130.72530',
        'ISO Catalog Number': 'BT 30 / PG 25 x 075',
        'CST': 'PG25',
        'contact': 'taper',
        'L1_mm': '123.4',
        'D2_mm': '40',
        'B3_mm': '75',
        'CAD_STEP_URL': 'https://static.rego-fix.com/x/STP/213072530.stp',
        'DIN_A2': '42',
        'DIN_B1': '',
        'DIN_B2': '',
        'DIN_B3_WOA': '69',
    }
    # No D1 anywhere: a powRgrip holder clamps through a collet, and
    # `_check_holder` refuses a collet-clamping holder that also has a bore.
    assert not any(key.startswith('D1') for key in row)


def test_the_plus_form_becomes_face_contact_and_an_unknown_form_is_refused():
    """The reason `contact` is a scraped column for this vendor.

    REGO-FIX publishes both forms as rows of one product group, so a family
    constant could not tell them apart. `BT-OM 30` is the third form in that
    same group and nothing published says what OM designates — so it fails
    loudly here rather than being recorded as a plain taper on no evidence.
    """
    plus = dict(HIT, form_name=['Plus +'], title=['BT+ 30 / PG 25 x 080'])
    assert rf.holder_row(plus, _properties())['contact'] == 'face'

    unknown = dict(HIT, form_name=['Whatever'])
    with pytest.raises(SystemExit, match='not a contact mode this package knows'):
        rf.holder_row(unknown, _properties())


def test_a_part_number_the_document_disagrees_with_is_warned_about(capsys):
    """One real REGO-FIX document states the wrong part number for itself
    (`4130.70646` calls itself `4130.71646`). The index's number is used and
    the disagreement is printed — reported, never corrected, the same call
    `cross_check_disagrees` makes about Kennametal's contradictory cells."""
    row = rf.holder_row(HIT, _properties(J21='9999.99999'))

    assert row['Material Number'] == '2130.72530'
    assert 'calls itself 9999.99999' in capsys.readouterr().out


def test_a_holder_with_no_step_model_gets_an_empty_cad_column():
    """Null is a real state — `_check_holder` accepts no model and refuses a
    malformed one."""
    assert rf.holder_row(dict(HIT, field_technical_drawings_url=[]),
                         _properties())['CAD_STEP_URL'] == ''


# ── Collet sizes come from the designation, never from `o_mm` ──────────────

@pytest.mark.parametrize('title,unit,native,mm', [
    ('PG 25 Ø 3.5 mm', 'millimeters', '3.5', '3.5'),
    ('PG 25 Ø 10.0 mm', 'millimeters', '10', '10'),
    ('PG 25 Ø 3/8"', 'inches', '0.375', '9.525'),
    ('PG 15-CF Ø 1/16"', 'inches', '0.0625', '1.5875'),
    ('PGST 25 Ø 16.0 mm', 'millimeters', '16', '16'),
    # A tapping collet marks *every* number when it is inch and only the last
    # when it is metric. Both shapes, because a pattern that reads one reads
    # the other as unparseable.
    ('PG 15-TAP Ø 0.141" x 0.110"', 'inches', '0.141', '3.5814'),
    ('PG 15-TAP Ø 3.5 x 2.7 mm', 'millimeters', '3.5', '3.5'),
])
def test_a_collet_size_is_read_off_the_vendors_own_designation(
        title, unit, native, mm):
    source = {'title': [title], 'field_sku_fulltext': ['1725.00000'],
              'norm_size': ['25']}

    row = rf.collet_row(source)

    assert row['unit'] == unit
    suffix = 'in' if unit == 'inches' else 'mm'
    assert row[f'D1_{suffix}'] == native
    assert row['D1_mm'] == mm
    # A PG collet clamps one size, so its capacity is its nominal at both ends.
    assert row[f'CCCN_{suffix}'] == row[f'CCCX_{suffix}'] == native


def test_an_inch_collet_is_exact_where_the_index_is_rounded():
    """The reason the size is parsed rather than read.

    `o_mm` is stated to two decimals, so a 3/8 in collet is 9.53 there against
    a true 9.525 — five microns, where `apps/web/src/data/fit.ts` sizes its
    equality test to two. Every inch collet would have failed to match a shank
    of its own size: no error, no empty state, just a stocked part the picker
    never offers. That is the exact bug `EPSILON` was widened for once already.
    """
    row = rf.collet_row({'title': ['PG 25 Ø 3/8"'],
                         'field_sku_fulltext': ['1725.09531'],
                         'o_mm': [9.53], 'norm_size': ['25']})

    # 9.525 exactly, not the 9.525000000000002 that `0.375 * 25.4` evaluates
    # to — `collet_row` rounds to six places, which removes float error rather
    # than adding precision. Six places is far coarser than the ~1e-15 the
    # error reaches here and far finer than anything REGO-FIX prints, so
    # nothing the vendor stated is lost. It matters because this number is a
    # *display* number too: it lands in `catalog.json` and in the string a
    # shank size is prefix-matched against.
    assert row['D1_mm'] == '9.525'
    assert 0.375 * 25.4 != 9.525
    assert float(row['D1_mm']) == pytest.approx(0.375 * 25.4, abs=1e-12)
    assert row['o_mm'] == '9.53'


def test_an_index_size_that_contradicts_the_designation_is_warned_about(capsys):
    """Two REGO-FIX tapping collets carry the *previous row's* `o_mm`. The
    tolerance is half a unit in the last decimal the vendor printed — 0.005 mm
    — not a number picked by feel."""
    within = rf.collet_row({'title': ['PG 25 Ø 3/8"'],
                            'field_sku_fulltext': ['1725.09531'],
                            'o_mm': [9.53]})
    assert capsys.readouterr().out == ''
    assert float(within['D1_mm']) == 9.525

    rf.collet_row({'title': ['PG 25 Ø 0.323"'],
                   'field_sku_fulltext': ['1725.08215'],
                   'o_mm': [9.68]})
    assert 'o_mm = 9.68 where the designation is 8.2042 mm' in \
        capsys.readouterr().out


def test_a_designation_that_states_no_unit_system_is_refused():
    """This catalog does not guess a unit system, and a bare number is exactly
    the case where guessing looks harmless."""
    with pytest.raises(SystemExit, match='states none'):
        rf.collet_row({'title': ['PG 25 Ø 3.5'],
                       'field_sku_fulltext': ['1725.03500']})


def test_an_unreadable_designation_is_refused_rather_than_skipped():
    with pytest.raises(SystemExit, match='cannot read a size off'):
        rf.collet_row({'title': ['Cleaning paper set CPS'],
                       'field_sku_fulltext': ['9999.00000']})


def test_the_short_tail_series_is_kept_distinct_from_the_pg_one():
    """`PGST 15` is not `PG 15`. REGO-FIX sells dedicated short-tail
    toolholders, and nothing published says a PGST collet also seats in a plain
    PG holder — so the series is written as designated and matches no PG
    holder. Widening the string would offer an assembly that may not exist,
    which costs a machinist a purchase; leaving it costs an option."""
    pgst = rf.collet_row({'title': ['PGST 15 Ø 10.0 mm'],
                          'field_sku_fulltext': ['1815.10000']})
    pg = rf.collet_row({'title': ['PG 15 Ø 10.0 mm'],
                        'field_sku_fulltext': ['1715.10000']})

    assert pgst['Collet Series'] == 'PGST15'
    assert pg['Collet Series'] == 'PG15'


# ── Writing the CSV ────────────────────────────────────────────────────────

def test_the_header_is_the_union_of_every_rows_keys(tmp_path):
    """Keying the header off the first row would drop `D1_in` from a group
    whose metric collets happen to come first — which is every group, since
    the rows are sorted by part number."""
    out = tmp_path / 'x.csv'
    rf.write_rows([{'a': '1', 'D1_mm': '3'}, {'a': '2', 'D1_in': '0.125'}], out)

    with open(out, newline='') as f:
        rows = list(csv.DictReader(f))
    assert list(rows[0]) == ['a', 'D1_mm', 'D1_in']
    assert rows[0] == {'a': '1', 'D1_mm': '3', 'D1_in': ''}
    assert rows[1] == {'a': '2', 'D1_mm': '', 'D1_in': '0.125'}


def test_writing_no_rows_is_refused(tmp_path):
    """An empty CSV converts to an empty family and looks like a vendor
    discontinuing a line."""
    with pytest.raises(SystemExit, match='no rows to write'):
        rf.write_rows([], tmp_path / 'x.csv')


def test_scrape_holders_skips_a_part_with_no_dimension_document(
        monkeypatch, tmp_path, capsys):
    """One real BT+ 30 holder publishes DXF and PDF but no XML, so it has no
    gage length. Skipped with a message rather than written with holes — but
    the ones that do have a document still land."""
    other = dict(HIT, title=['BT+ 30 / PG 15 x 075 H'],
                 field_sku_fulltext=['4130.71506'], form_name=['Plus +'])
    monkeypatch.setattr(rf, 'search', lambda *a, **k: [HIT, other])
    monkeypatch.setattr(
        rf, 'fetch_din4000',
        lambda sku: None if sku == '4130.71506' else _properties())

    count = rf.scrape_holders(tmp_path / 'h.csv')

    assert count == 1
    assert 'SKIPPED 4130.71506' in capsys.readouterr().out


def test_scrape_holders_takes_only_the_tapers_this_package_can_name(
        monkeypatch, tmp_path):
    """`BT-OM 30` sits in the same product group and is deliberately not
    scraped: the family page, the product catalog and the index all print the
    token and none says what OM designates. Recording a spindle interface for
    it would be a guess about which machine a holder fits."""
    om = dict(HIT, title=['BT-OM 30 / PG 25 x 080 H'],
              field_sku_fulltext=['2130.71028'])
    monkeypatch.setattr(rf, 'search', lambda *a, **k: [HIT, om])
    monkeypatch.setattr(rf, 'fetch_din4000', lambda sku: _properties())

    rf.scrape_holders(tmp_path / 'h.csv')

    with open(tmp_path / 'h.csv', newline='') as f:
        assert [r['Material Number'] for r in csv.DictReader(f)] == ['2130.72530']


# ── The conventions, against the header this adapter writes ────────────────

def test_a_holder_row_carries_the_identity_columns():
    """REGO-FIX adopted Kennametal's identity labels because it came second.
    That is the convention holding rather than the vendor's own choice, so it
    is worth a check that would notice it stopping."""
    check_identity_columns('regofix', set(rf.holder_row(HIT, _properties())))


def test_every_dimension_on_a_holder_row_carries_its_unit():
    """And nothing that is not a dimension does. `CST` and `contact` are a
    series and a mode; the `DIN_` codes are unlabelled by design."""
    row = rf.holder_row(HIT, _properties())

    assert {c for c in row if c.endswith(('_mm', '_in'))} == {
        'L1_mm', 'D2_mm', 'B3_mm'}
    assert CAD_COLUMN in row


def test_an_unpinned_din_code_cannot_read_as_a_dimension():
    """A bare `A2` beside `L1_mm` would sit in the CSV looking exactly like a
    mapped length. Nothing published says what it measures, and the rule is to
    leave a vendor code unlabelled rather than guess."""
    row = rf.holder_row(HIT, _properties())

    unpinned = [c for c in row if c.startswith(DIN_PREFIX)]
    assert unpinned == [f'{DIN_PREFIX}{code}' for code in rf.UNPINNED_DIN_CODES]
    for column in unpinned:
        assert not column.endswith(('_mm', '_in'))


def test_a_collet_row_carries_both_unit_systems_only_where_it_has_both():
    """The native cell is what a machinist ordered; the millimetre cell is
    what fit arithmetic compares. On a metric collet those are one cell, so
    projecting one would state the same measurement twice."""
    metric = rf.collet_row({'title': ['PG 25 Ø 6.0 mm'],
                            'field_sku_fulltext': ['1725.06000']})
    inch = rf.collet_row({'title': ['PG 25 Ø 1/4"'],
                          'field_sku_fulltext': ['1725.06350']})

    check_identity_columns('regofix', set(metric))
    assert 'D1_in' not in metric
    assert inch['D1_in'] == '0.25' and inch['D1_mm'] == '6.35'


# ── The scraped corpus, where there is one ─────────────────────────────────

HOLDERS = 'regofix_bt30_pg_holders.csv'
STANDARD = 'regofix_pg_collets_standard.csv'
TAPPING = 'regofix_pg_collets_tap.csv'
SHORT_TAIL = 'regofix_pgst_collets.csv'


def test_every_scraped_holder_satisfies_the_taper_arithmetic():
    """The 48.4 mm check, over the whole family rather than one document.

    This is what would catch a re-scrape where the vendor moved `B3` or `B4`,
    which is the change that would silently redefine every gage length in the
    family.
    """
    rows = corpus.rows(HOLDERS)
    assert len(rows) == HOLDER_FAMILIES[HOLDERS]['rows']
    for row in rows:
        gauge, projection = float(row['L1_mm']), float(row['B3_mm'])
        assert gauge - projection == pytest.approx(
            rf.BT30_GAUGE_TO_FLANGE, abs=1e-9), row['ISO Catalog Number']


def test_every_scraped_holder_states_a_contact_mode_that_matches_its_name():
    """Both halves are present in the real family, and the designation is what
    says which — so a lost `form_name` shows up as a mismatch rather than as
    twenty-one plain-taper holders."""
    contacts = {row['ISO Catalog Number']: row['contact']
                for row in corpus.rows(HOLDERS)}

    assert set(contacts.values()) == {'taper', 'face'}
    for name, contact in contacts.items():
        assert (contact == 'face') == name.startswith('BT+'), name


def test_every_scraped_collet_round_trips_to_its_own_designation():
    """The nominal size, re-derived from the title and compared against the
    column the scraper wrote — over all 321 collets rather than the seven
    cases above."""
    for name in (STANDARD, TAPPING, SHORT_TAIL):
        for row in corpus.rows(name):
            again = rf.collet_row({'title': [row['ISO Catalog Number']],
                                   'field_sku_fulltext': [row['Material Number']]})
            assert again['unit'] == row['unit'], row['ISO Catalog Number']
            assert again['D1_mm'] == row['D1_mm'], row['ISO Catalog Number']


def test_the_real_collet_groups_hold_both_unit_systems():
    """Which is the whole reason `unit` is a per-record fact here. If a
    re-scrape ever produced a single-unit group, splitting the CSV would be
    back on the table and this says so."""
    assert {row['unit'] for row in corpus.rows(STANDARD)} == {
        'millimeters', 'inches'}


def test_a_tapping_collets_drive_square_is_carried_but_not_a_dimension():
    """The second number in `Ø 3.5 x 2.7 mm` is the internal square, not a
    second diameter. It is kept in its own column so nothing reads it as
    one."""
    row = corpus.row(TAPPING, 'PG 15-TAP Ø 3.5 x 2.7 mm')

    assert row['Square_mm'] == '2.7'
    assert row['D1_mm'] == '3.5'
