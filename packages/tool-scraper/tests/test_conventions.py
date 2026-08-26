"""The conventions the vendor CSVs share, and the one that already broke.

A CSV keeps its vendor's own column labels, so there is no schema to test.
What there is: a short list of rules that hold across the CSVs anyway, and
which of them are enforced. These are the rules themselves.

**Whether a vendor keeps them is checked in that vendor's own test file**,
against the header its adapter really writes — a header quoted as a literal
here would be a second copy somebody updates at the same time as the adapter,
which is exactly the check being lost.
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

# ── Identity ───────────────────────────────────────────────────────────────

def test_a_header_that_carries_its_identity_columns_passes():
    """The failure the check prevents: a re-scrape whose part-number column
    moved or was renamed produces a CSV that still parses, still has the right
    number of rows, and mints every guid off an empty string."""
    check_identity_columns('regofix', {'Material Number', 'ISO Catalog Number',
                                       'L1_mm'})
    check_identity_columns('destinytool', {'itemNumber', 'cutDia_in'})


def test_a_header_missing_its_identity_column_is_refused_by_name():
    with pytest.raises(SystemExit) as raised:
        check_identity_columns('regofix', {'CST', 'L1_mm'})

    assert 'regofix' in str(raised.value)
    assert 'Material Number' in str(raised.value)
    assert 'ISO Catalog Number' in str(raised.value)


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


# ── The advisory rules ─────────────────────────────────────────────────────

def test_the_cad_column_is_one_name_across_vendors():
    """Named for what it holds rather than for how one vendor names the
    format. It was `CAD_STP_LWM` until 2026-08-08 — CDS Visual's key for
    Kennametal's lightweight model — and the moment a second vendor wrote into
    the column that name became a claim about the data that was false.

    Two vendors write it and neither owns it, which is why it is here and not
    in either of them — that leak is what `test_vendor_boundary.py` exists to
    refuse.
    """
    assert CAD_COLUMN == 'CAD_STEP_URL'
    assert not CAD_COLUMN.endswith(('_mm', '_in'))


def test_an_unmapped_vendor_code_keeps_a_prefix_that_is_not_a_dimension():
    """A bare `A2` beside `L1_mm` reads as a labelled dimension. `DIN_A2`
    reads as what it is: a vendor code, pending a source."""
    assert DIN_PREFIX == 'DIN_'
    assert not f'{DIN_PREFIX}A2'.endswith(('_mm', '_in'))
