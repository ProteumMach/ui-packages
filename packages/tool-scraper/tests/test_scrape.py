"""Tests for the scraping half — endpoint construction, table parsing, and
the CSV shape a record mapper then reads.

The AEM fetch is mocked at the network seam (`scrape.fetch`); everything
below it runs for real against saved table markup, because the parsing is
the part that breaks when a vendor changes a column.
"""

from __future__ import annotations

import csv

import pytest

from toolpath_scraper.conventions import check_identity_columns
from toolpath_scraper.identity import BRANDS
from toolpath_scraper.vendors.kennametal import scrape

# Trimmed to the structure that matters: the leading checkbox column, a
# repeated "D1" label whose identity lives in the th class, a metric/inch
# unit pair, a unitless column sharing the "D1" label, a CatNo column
# carrying a unit class that is NOT a dimension, and a trailing sticky CTA.
TABLE_HTML = """
<table>
  <tr>
    <th class="collab-checkbox-header"></th>
    <th class="">Material Number</th>
    <th class="CatNo metric">ISO Catalog Number</th>
    <th class="DRL_CUT_D1_MIN metric" data-value="[D1] Cutting Diameter">D1</th>
    <th class="DRL_CUT_D1_MIN inch" data-value="[D1] Cutting Diameter">D1</th>
    <th class="DRL_CUT_D1_SIZE" data-value="[D1] Wire Size">D1</th>
    <th class="" data-value="[Z] Number of Flutes">Z</th>
    <th class="sticky-column">Add to cart</th>
  </tr>
  <tr>
    <td></td><td>4151623</td><td>B041A01000CPG</td>
    <td>1</td><td>0.0394</td><td></td><td>2</td><td>Buy</td>
  </tr>
  <tr>
    <td></td><td>4151624</td><td>B041A01100CPG</td>
    <td>1.1</td><td>0.0433</td><td>#57</td><td>2</td><td>Buy</td>
  </tr>
</table>
"""


def _parse(html):
    p = scrape.TableParser()
    p.feed(html)
    return p.rows


def test_endpoint_url_per_brand():
    """WIDIA runs the same component under a different node name; the
    kennametal URL 404s on widia.com, so this is load-bearing."""
    kmt = scrape.BASE.format(code='100003658', query='q', **BRANDS['kennametal'])
    widia = scrape.BASE.format(code='103354322', query='q', **BRANDS['widia'])
    assert 'www.kennametal.com' in kmt
    assert '/product_variants.variants.100003658.html' in kmt
    assert 'www.widia.com' in widia
    assert '/product_variants_cop.variants.103354322.html' in widia


def test_column_names_use_class_not_label():
    """Three columns all render the label 'D1'. Keying off the label would
    collapse them; identity comes from the th class and data-value."""
    header = _parse(TABLE_HTML)[0]
    names = scrape.column_names(header)
    assert names == [
        None,                # checkbox column
        'Material Number',
        'ISO Catalog Number',  # CatNo carries a unit class but isn't a dimension
        'D1_mm',
        'D1_in',
        'D1_wire_size',      # unitless column sharing the D1 label
        'Z',
        None,                # sticky CTA column
    ]


def test_data_rows_filtered_by_numeric_material_number():
    """Header and filter rows are rejected on cell 2 not being all digits."""
    header, data = scrape.parse_variant_table(TABLE_HTML)
    assert header is not None
    assert [r[1][0] for r in data] == ['4151623', '4151624']


def test_a_matched_nothing_response_is_a_state_not_a_crash():
    """The vendor renders a notice instead of a table when a query matches
    nothing. `materials` sweeps 32 facet values per family and most of them
    legitimately match none, so this is the common path there — and it is
    what tells `scrape_family` a family really is empty."""
    assert scrape.parse_variant_table(
        '<div class="no-results">nothing here</div>') == (None, [])


def test_a_response_with_neither_table_nor_notice_raises():
    """The third case, and the reason the second is not just "no header":
    reporting an unparseable response as zero rows looks exactly like the
    vendor discontinuing a family, and would empty a CSV without a word."""
    with pytest.raises(ValueError, match='changed shape'):
        scrape.parse_variant_table('<div>maintenance</div>')


def test_scrape_family_refuses_to_write_an_empty_csv_over_a_real_one(
        tmp_path, monkeypatch):
    """`parse_variant_table` returns the no-results case rather than raising,
    so the decision that it is fatal *here* lives here. Writing the file
    anyway would replace a scraped family with a zero-byte one on any day the
    vendor's facet string changes."""
    monkeypatch.setattr(scrape, 'fetch',
                        lambda code, brand: '<div class="no-results"></div>')
    out = tmp_path / 'fam.csv'
    with pytest.raises(SystemExit, match='no variants'):
        scrape.scrape_family('100003658', out)
    assert not out.exists()


@pytest.mark.parametrize('tags, expected_header_tail, expected_row_tail', [
    ((), [], []),
    ((('Thread System', 'metric'),), ['Thread System'], ['metric']),
    ((('Thread System', 'inch'), ('Source', 'kmt')),
     ['Thread System', 'Source'], ['inch', 'kmt']),
])
def test_scrape_family_appends_constant_tag_columns(
        tmp_path, monkeypatch, tags, expected_header_tail, expected_row_tail):
    """Tag columns carry facts the vendor table never states — the tap
    families depend on this for Thread System."""
    monkeypatch.setattr(scrape, 'fetch', lambda code, brand: TABLE_HTML)
    out = tmp_path / 'fam.csv'
    count = scrape.scrape_family('100003658', out, tags=tags)

    assert count == 2
    rows = list(csv.reader(out.read_text().splitlines()))
    assert rows[0] == ['Material Number', 'ISO Catalog Number', 'D1_mm',
                       'D1_in', 'D1_wire_size', 'Z'] + expected_header_tail
    assert rows[1] == ['4151623', 'B041A01000CPG', '1', '0.0394', '', '2'] \
        + expected_row_tail
    assert rows[2] == ['4151624', 'B041A01100CPG', '1.1', '0.0433', '#57', '2'] \
        + expected_row_tail


def test_scrape_family_writes_path_verbatim(tmp_path, monkeypatch):
    """Unlike the converter, the scraper does not rewrite the output path
    into data/csv/ — callers pass the full path."""
    monkeypatch.setattr(scrape, 'fetch', lambda code, brand: TABLE_HTML)
    nested = tmp_path / 'somewhere' / 'else.csv'
    nested.parent.mkdir()
    scrape.scrape_family('100003658', nested)
    assert nested.is_file()


def test_scrape_family_passes_brand_through(tmp_path, monkeypatch):
    seen = {}

    def fake_fetch(code, brand):
        seen['code'], seen['brand'] = code, brand
        return TABLE_HTML

    monkeypatch.setattr(scrape, 'fetch', fake_fetch)
    scrape.scrape_family('103354322', tmp_path / 'w.csv', brand='widia')
    assert seen == {'code': '103354322', 'brand': 'widia'}


def test_empty_table_yields_header_only(tmp_path, monkeypatch):
    """Size-0 case: a family whose filter matched nothing still writes a
    well-formed CSV rather than a truncated file."""
    monkeypatch.setattr(scrape, 'fetch', lambda code, brand: TABLE_HTML.split(
        '  <tr>\n    <td></td><td>4151623')[0] + '</table>')
    out = tmp_path / 'empty.csv'
    count = scrape.scrape_family('1', out, tags=(('Thread System', 'inch'),))
    assert count == 0
    rows = list(csv.reader(out.read_text().splitlines()))
    assert len(rows) == 1
    assert rows[0][0] == 'Material Number'
    assert rows[0][-1] == 'Thread System'


# ── The conventions, against the header this adapter writes ────────────────

def test_the_header_carries_the_identity_columns_every_other_vendor_copied(
        tmp_path, monkeypatch):
    """Kennametal came first, so `conventions.IDENTITY_COLUMNS` is its header
    text. A rename here is not one vendor's problem: it is the convention two
    other adapters were written against."""
    monkeypatch.setattr(scrape, 'fetch', lambda code, brand: TABLE_HTML)
    out = tmp_path / 'f.csv'
    scrape.scrape_family('1', out)

    with open(out, newline='') as f:
        header = next(csv.reader(f))
    check_identity_columns('kennametal', set(header))


def test_a_unit_pair_is_the_only_thing_that_takes_a_suffix(
        tmp_path, monkeypatch):
    """Column identity here comes from the `<th>` class, and the class is what
    says a column is a metric/inch pair. A `CatNo` column carries a unit class
    and is not a dimension — suffixing it would invent a pair the vendor never
    published."""
    monkeypatch.setattr(scrape, 'fetch', lambda code, brand: TABLE_HTML)
    out = tmp_path / 'f.csv'
    scrape.scrape_family('1', out)

    with open(out, newline='') as f:
        header = next(csv.reader(f))
    suffixed = {c for c in header if c.endswith(('_mm', '_in'))}
    assert 'ISO Catalog Number' in header
    assert 'ISO Catalog Number_mm' not in header
    assert suffixed == {'D1_mm', 'D1_in'}
