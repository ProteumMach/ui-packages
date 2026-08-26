"""The conventions the vendor CSVs share, and the one that already broke.

A CSV keeps its vendor's own column labels, so there is no schema to test.
What there is: a short list of rules that hold across the CSVs anyway, and
which of them are enforced. These are the enforcement.

Destiny Tool's header is **derived from its adapter**, so the rules below run
against what a scrape actually writes. The other three are still the real first
lines of the scraped CSVs as of 2026-08-26, quoted rather than derived because
those adapters have not landed; each becomes derived as its vendor does.
"""

from __future__ import annotations

import pytest

from toolpath_scraper.conventions import (
    CAD_COLUMN,
    DIN_PREFIX,
    IDENTITY_COLUMNS,
    IDENTITY_DEVIATIONS,
    UNIT_SUFFIX,
    check_identity_columns,
    dimensional_column,
    identity_columns,
)
from toolpath_scraper.identity import BRANDS
from toolpath_scraper.vendors.destinytool import scrape as destinytool


def _destinytool_header() -> list[str]:
    """The header `scrape_end_mills` writes, built the way it builds it.

    Derived rather than copied: the point of checking a header against the
    conventions is lost if the header being checked is a literal somebody
    updates by hand at the same time as the adapter.
    """
    return [f'{f}_in' if f in destinytool.DIMENSIONAL_FIELDS else f
            for f in destinytool.FIELDS]


#: The headers, one per vendor. Kennametal's is a holder family, which is why
#: `CAD_STEP_URL` is on it and not on the WIDIA cutting-tool table.
HEADERS: dict[str, list[str]] = {
    'kennametal': (
        'Material Number,ISO Catalog Number,ANSI Catalog Number,CST,D11_mm,'
        'D11_in,L1_mm,L1_in,L9_mm,L9_in,V_mm,V_in,Weight Kilograms,'
        'Counter Bore Collet Torque Nm,Straight Collet Torque Nm,'
        'Stop Screw ID Drive Size,CAD_STEP_URL'
    ).split(','),
    'widia': (
        'Material Number,ISO Catalog Number,ANSI Catalog Number,Grade,'
        'Adapter Style Machine Side,Re_mm,Re_in,Z,D1_mm,D1_in,D_mm,D_in,'
        'AP1MAX_mm,AP1MAX_in,L_mm,L_in,Material Groups'
    ).split(','),
    'regofix': (
        'Material Number,ISO Catalog Number,CST,contact,L1_mm,D2_mm,B3_mm,'
        'CAD_STEP_URL,DIN_A2,DIN_B1,DIN_B2,DIN_B3_WOA'
    ).split(','),
    'destinytool': _destinytool_header(),
}


# ── Identity ───────────────────────────────────────────────────────────────

def test_every_vendors_header_carries_the_identity_columns_it_claims():
    """The failure this prevents: a re-scrape whose part-number column moved
    or was renamed produces a CSV that still parses, still has the right number
    of rows, and mints every guid off an empty string."""
    for brand, header in HEADERS.items():
        check_identity_columns(brand, set(header))


def test_a_header_missing_its_identity_column_is_refused_by_name():
    with pytest.raises(SystemExit) as raised:
        check_identity_columns('regofix', {'CST', 'L1_mm'})

    assert 'regofix' in str(raised.value)
    assert 'Material Number' in str(raised.value)
    assert 'ISO Catalog Number' in str(raised.value)


def test_the_deviation_names_columns_the_adapter_really_writes():
    """The half a literal header could never check. A deviation that named a
    column the adapter stopped writing would keep passing
    `check_identity_columns` — it checks the header against the deviation, and
    both would be wrong together."""
    assert set(identity_columns('destinytool')) <= set(_destinytool_header())


def test_the_one_vendor_that_broke_the_convention_is_the_one_written_down():
    """REGO-FIX adopted Kennametal's identity labels; Destiny Tool passes
    Firestore's own `itemNumber` straight through. The convention was real but
    informal, and it eroded the first time a vendor did not resemble the first
    two — so the deviation is a table entry, and the fourth vendor's drift has
    to be a decision somebody made rather than a thing that happened."""
    assert set(IDENTITY_DEVIATIONS) == {'destinytool'}
    assert identity_columns('destinytool') == ('itemNumber',)
    assert identity_columns('regofix') == IDENTITY_COLUMNS


def test_a_deviation_is_declared_for_a_brand_this_package_knows():
    """A deviation keyed on a brand nothing scrapes is a rule with nothing to
    apply it to, and would silently stop applying if a brand were renamed."""
    assert set(IDENTITY_DEVIATIONS) <= set(BRANDS)


def test_an_unlisted_brand_gets_the_convention_rather_than_an_exemption():
    """The lookup defaults to the rule, not to "no identity columns" — a brand
    added without an entry is held to the convention until somebody writes
    down that it cannot be."""
    assert identity_columns('sandvik') == IDENTITY_COLUMNS


# ── Units ──────────────────────────────────────────────────────────────────

def test_the_suffix_carries_the_unit_and_there_are_only_two():
    assert UNIT_SUFFIX == {'millimeters': '_mm', 'inches': '_in'}
    assert dimensional_column('D1', 'millimeters') == 'D1_mm'
    assert dimensional_column('D1', 'inches') == 'D1_in'


def test_an_unknown_unit_system_is_refused_rather_than_defaulted():
    """A typo that silently picked millimetres would produce a clean
    conversion with the wrong numbers in it — which is the failure mode a
    declared `unit` exists to prevent, not one it may cause."""
    with pytest.raises(SystemExit, match='unknown unit system'):
        dimensional_column('D1', 'metric')


def test_every_suffixed_column_in_a_real_header_uses_one_of_the_two():
    """The rule stated the other way round: a vendor column that carries a
    unit carries it as `_mm` or `_in`. A stray `_MM` or `_inch` would resolve
    to a column no map can find."""
    for brand, header in HEADERS.items():
        for column in header:
            lowered = column.lower()
            if lowered.endswith(('_mm', '_in')):
                assert column.endswith(('_mm', '_in')), f'{brand}: {column}'


# ── The advisory rules ─────────────────────────────────────────────────────

def test_the_cad_column_is_one_name_across_vendors():
    """Named for what it holds rather than for how one vendor names the
    format. It was `CAD_STP_LWM` until 2026-08-08 — CDS Visual's key for
    Kennametal's lightweight model — and the moment a second vendor wrote into
    the column that name became a claim about the data that was false."""
    assert CAD_COLUMN == 'CAD_STEP_URL'
    assert CAD_COLUMN in HEADERS['kennametal']
    assert CAD_COLUMN in HEADERS['regofix']


def test_an_unmapped_vendor_code_keeps_a_prefix_that_is_not_a_dimension():
    """A bare `A2` beside `L1_mm` reads as a labelled dimension. `DIN_A2`
    reads as what it is: a vendor code, pending a source."""
    unmapped = [c for c in HEADERS['regofix'] if c.startswith(DIN_PREFIX)]

    assert unmapped == ['DIN_A2', 'DIN_B1', 'DIN_B2', 'DIN_B3_WOA']
    for column in unmapped:
        assert not column.endswith(('_mm', '_in'))


def test_the_same_measurement_wears_a_different_name_in_each_vendors_table():
    """Which is the whole reason the CSV is a receipt rather than an
    interchange format. Relabelling `cutDia_in` to `D1_in` on the way into the
    file would put a lie in the file whose job is to record what the vendor
    published — and nothing reads a vendor's CSV but that vendor's adapter."""
    assert 'D1_mm' in HEADERS['widia']
    assert 'cutDia_in' in HEADERS['destinytool']
    assert 'D1_in' not in HEADERS['destinytool']
