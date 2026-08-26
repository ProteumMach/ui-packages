"""Provenance as a gate rather than a convention.

The rule — *when a vendor label is unclear, ask; record the answer and its
date* — was kept in prose for the source package's whole life, and prose is
unenforceable against a stranger adding a family next month. These are what
turn it into something that fails.

The source package's cases over its real catalog are not ported: they walk
`TABLES` and read the generated assumptions document, and neither the families
nor the document is in this package yet. They come back with `families/` in
step 4 of `docs/TOOL-SCRAPER-PLAN.md`.
"""

from __future__ import annotations

import pytest

from toolpath_scraper.provenance import SOURCES, Fact, assumptions, check_fact

# ── What a fact must carry ────────────────────────────────────────────────

def test_a_vendor_stated_fact_needs_a_citation():
    """Without one it is an assumption wearing the word "vendor" — the exact
    move this rule exists to prevent, and the one that reads as authoritative
    to the next person."""
    with pytest.raises(SystemExit, match='needs a `cite`'):
        check_fact('x.csv', 'taper', Fact('BT30', 'vendor-stated'))

    check_fact('x.csv', 'taper',
               Fact('BT30', 'vendor-stated', cite='the family page says so'))


def test_a_derived_fact_needs_a_note_saying_what_was_computed():
    with pytest.raises(SystemExit, match='needs a `note`'):
        check_fact('x.csv', 'point_angle', Fact(142, 'derived'))

    check_fact('x.csv', 'point_angle',
               Fact(142, 'derived', note='least squares on L5 over 49 rows'))


def test_an_assumed_fact_needs_a_note_a_date_and_initials():
    """All three, because the only thing standing behind an assumption is a
    person on a day. A row in the assumptions document with no name is a guess
    nobody can be asked about."""
    with pytest.raises(SystemExit, match='needs a `note`'):
        check_fact('x.csv', 'flutes', Fact(2, 'assumed'))
    with pytest.raises(SystemExit, match='needs `checked`'):
        check_fact('x.csv', 'flutes', Fact(2, 'assumed', note='no column'))
    with pytest.raises(SystemExit, match='needs `by`'):
        check_fact('x.csv', 'flutes',
                   Fact(2, 'assumed', note='no column', checked='2026-08-08'))

    check_fact('x.csv', 'flutes', Fact(2, 'assumed', note='no column',
                                       checked='2026-08-08', by='JG'))


def test_a_date_that_is_not_a_date_is_refused():
    """`checked='soon'` would satisfy a truthiness check and tell a reader
    nothing."""
    with pytest.raises(SystemExit, match='YYYY-MM-DD'):
        check_fact('x.csv', 'flutes',
                   Fact(2, 'assumed', note='n', checked='soon', by='JG'))


def test_an_unknown_source_is_refused():
    with pytest.raises(SystemExit, match='not one of'):
        check_fact('x.csv', 'flutes', Fact(2, 'probably'))


def test_the_failure_names_the_family_and_the_key():
    """Not the type. A gate that says "a fact needs a `by`" over a catalog of
    forty families is a gate somebody has to bisect."""
    with pytest.raises(SystemExit, match='godrill_3xd_metric.csv: flutes'):
        check_fact('godrill_3xd_metric.csv', 'flutes', Fact(2, 'assumed'))


def test_a_fact_is_frozen():
    """It is a record of what somebody established; code that mutated one
    would be rewriting the evidence rather than the value."""
    fact = Fact('BT30', 'vendor-stated', cite='the family page says so')

    with pytest.raises(AttributeError):
        fact.value = 'BT40'  # type: ignore[misc]


# ── The flattening the document is built from ─────────────────────────────

def test_a_cited_fact_is_left_out_because_it_is_a_different_kind_of_claim():
    """The document's purpose is the list of things that would be wrong if
    somebody guessed wrong. A citation has its own re-check path — one `curl` —
    and listing it would bury the guesses among a hundred things that are
    true."""
    tables = {'families': {'x.csv': {'facts': {
        'taper': Fact('BT30', 'vendor-stated', cite='the family page'),
        'flutes': Fact(2, 'assumed', note='no column', checked='2026-08-08',
                       by='JG'),
    }}}}

    rows = assumptions(tables)

    assert [r['key'] for r in rows] == ['flutes']
    assert rows[0]['table'] == 'families'
    assert rows[0]['family'] == 'x.csv'


def test_the_sources_are_ordered_weakest_last_so_the_guesses_lead():
    """`assumptions()` sorts by `SOURCES.index`, so the ordering of that tuple
    is what puts the guesses first. A reorder would silently bury them."""
    assert SOURCES == ('vendor-stated', 'derived', 'assumed')

    tables = {'families': {
        'b.csv': {'facts': {'flutes': Fact(
            2, 'assumed', note='n', checked='2026-08-08', by='JG')}},
        'a.csv': {'facts': {'point_angle': Fact(142, 'derived', note='n')}},
    }}

    assert [r['source'] for r in assumptions(tables)] == ['derived', 'assumed']


def test_a_family_with_no_facts_contributes_nothing_rather_than_raising():
    """Holder families state their discriminants; a cutting-tool family whose
    every constant is a scraped column states none, and that is a family with
    nothing to assume rather than a family that forgot."""
    assert assumptions({'families': {'x.csv': {}}}) == []


def test_the_flattening_is_deterministic():
    """Whatever reads it is a diffable document, so dict iteration order must
    not reach the output."""
    tables = {'families': {'x.csv': {'facts': {
        'flutes': Fact(2, 'assumed', note='n', checked='2026-08-08', by='JG'),
        'bmc': Fact('carbide', 'assumed', note='n', checked='2026-08-08',
                    by='JG'),
    }}}}

    assert assumptions(tables) == assumptions(tables)
    assert [r['key'] for r in assumptions(tables)] == ['bmc', 'flutes']
