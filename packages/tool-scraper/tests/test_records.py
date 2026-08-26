"""The interchange seam: the canonical vocabulary, the column map, and where a
bad one is caught.

The point of the second half is *when* a mapping fault surfaces. Before the
seam existed the mapper read `row['AP1MAX_mm']` directly, so a family that
published no such column raised `KeyError: 'AP1MAX_mm'` from inside a loop, on
row 1, after a scrape had already run — and the message named the column, which
is the one piece of information whoever wrote the config already had. Now the
map is checked at load and the message names the family.

The source package's "over the real families" cases are not ported: they read
`FAMILIES` and the scraped CSVs, and neither is here yet. They come back with
`families/` in step 4 of `docs/TOOL-SCRAPER-PLAN.md`.
"""

from __future__ import annotations

import pytest

from toolpath_scraper.records import (
    DIMENSIONAL,
    DIMENSIONAL_COLUMNS,
    GEOMETRY_FIELDS,
    ISO_MATERIAL_GROUPS,
    NON_ISO_NAMES,
    REQUIRED_GEOMETRY,
    ToolRecord,
    check_column_map,
    check_columns_exist,
    family_units,
)

# ── The vocabulary is ISO 13399's ──────────────────────────────────────────

def test_the_canonical_names_are_the_standards_own_codes():
    """Not a CAM vendor's invention, which is the claim the package makes and
    therefore the one worth pinning. `DC`, `OAL`, `LCF`, `RE`, `NOF`, `SIG` and
    `TP` are ISO 13399 codes with ISO's meanings; Fusion implements a subset of
    the same dictionary, which is why they also appear there."""
    standard = {n for n, f in GEOMETRY_FIELDS.items() if f.iso == n}

    assert standard == {'DC', 'OAL', 'LCF', 'RE', 'NOF', 'SIG', 'TP'}


def test_the_three_names_that_are_autodesks_are_named_as_such():
    """A canonical name that is one CAM vendor's invention is a departure from
    the standard, and this package's claim to be using the standard is only as
    good as the departures being counted. Adding a fourth has to be a
    deliberate act rather than a name that slipped in.
    """
    assert set(NON_ISO_NAMES) == {'SFDM', 'shoulder-length', 'shoulder-diameter'}


def test_the_departure_records_the_iso_counterpart_where_one_is_pinned():
    """`SFDM` is Autodesk's "Shaft Diameter" and ISO's shank diameter is
    `DMM` — a name Autodesk did not use, not a measurement ISO lacks. The two
    hyphenated keys are left unpinned instead of mapped to their nearest code,
    because "nearest" is not "the same" and the standing rule here is to leave
    a code unlabelled rather than guess at what it measures."""
    assert GEOMETRY_FIELDS['SFDM'].iso == 'DMM'
    assert GEOMETRY_FIELDS['shoulder-length'].iso is None
    assert GEOMETRY_FIELDS['shoulder-diameter'].iso is None


def test_the_length_that_is_always_a_copy_is_not_a_canonical_field():
    """`LB` and `assemblyGaugeLength` are `OAL` under another name on a bare
    tool. An adapter that could supply them separately could supply a tool that
    claims a holder it does not have."""
    assert 'LB' not in GEOMETRY_FIELDS
    assert 'assemblyGaugeLength' not in GEOMETRY_FIELDS


def test_every_field_says_what_it_measures():
    """The definition is quoted back at whoever mapped a column to the wrong
    field, so an empty one turns a useful failure into `'LCF ()'`."""
    for name, field_ in GEOMETRY_FIELDS.items():
        assert field_.definition.strip(), name


def test_the_material_groups_are_iso_513s_in_one_order():
    """A vendor publishing its own order — Destiny Tool does — reorders onto
    this sequence. A consumer that renders a facet from one array and a tool's
    own list from another has no way to notice the two disagree."""
    assert ISO_MATERIAL_GROUPS == ('P', 'M', 'K', 'N', 'S', 'H', 'C')


# ── The unit suffix is the core's business ─────────────────────────────────

def test_a_dimension_takes_the_suffix_of_the_familys_unit_system():
    """A vendor declares `'DC': 'D1'` and never `'D1_mm'`.

    Which suffix to read is exactly the question `unit` exists to answer, and a
    map that hardcoded one would put the answer in the place least able to
    notice it was wrong — a wrong `unit` on a family that publishes both
    columns converts cleanly and shows 9.525 mm where a machinist ordered 3/8.
    """
    columns = check_column_map('x', 'drill', {
        'DC': 'D1', 'SFDM': 'D', 'OAL': 'L', 'LCF': 'L3'})

    assert columns.column('DC', 'millimeters') == 'D1_mm'
    assert columns.column('DC', 'inches') == 'D1_in'


def test_a_count_or_an_angle_takes_no_suffix():
    """`NOF` and `SIG` are published in one column whatever the unit system,
    so suffixing them would look for a column that was never scraped."""
    columns = check_column_map('x', 'drill', {
        'DC': 'D1', 'SFDM': 'D', 'OAL': 'L', 'LCF': 'L3', 'NOF': 'Z'})

    assert columns.column('NOF', 'inches') == 'Z'


def test_thread_pitch_is_dimensional_but_unsuffixed():
    """The one field where the two lists disagree, and it is not an oversight.

    A pitch *is* a length — `1/TPI` inches on an inch tap, millimetres on a
    metric one — but the Kennametal thread-pitch step derives a single
    `Thread Pitch` column already in the tap's native system. Suffixing it
    would look for `Thread Pitch_in`.
    """
    assert 'TP' in DIMENSIONAL
    assert 'TP' not in DIMENSIONAL_COLUMNS

    columns = check_column_map('x', 'tap', {
        'SFDM': 'D', 'OAL': 'L', 'LCF': 'L3', 'TP': 'Thread Pitch'})
    assert columns.column('TP', 'inches') == 'Thread Pitch'


def test_an_unmapped_field_resolves_to_no_column():
    """Not to a guessed one. An endmill family with no `Re` column is a
    square-end family, and the adapter reads that absence as radius 0."""
    columns = check_column_map('x', 'endmill', {
        'DC': 'D1', 'SFDM': 'D', 'OAL': 'L', 'LCF': 'AP1MAX'})

    assert columns.column('RE', 'millimeters') is None


def test_every_dimensional_field_is_a_canonical_one():
    assert DIMENSIONAL <= set(GEOMETRY_FIELDS)


# ── What the loader refuses, and how it says so ────────────────────────────

def test_a_family_missing_a_required_field_is_named_with_the_field():
    with pytest.raises(SystemExit) as raised:
        check_column_map('gomill_pro.csv', 'endmill',
                         {'DC': 'D1', 'SFDM': 'D', 'OAL': 'L'})

    message = str(raised.value)
    assert 'gomill_pro.csv' in message
    # The field *and* what it means, because "LCF" alone assumes the reader
    # already knows the vocabulary they are being asked to map into.
    assert 'LCF' in message
    assert 'flute length' in message


def test_a_typo_in_a_canonical_name_is_refused_rather_than_ignored():
    """`'LFC'` would otherwise sit in the map doing nothing at all, and the
    geometry it was meant to fill would be silently absent from every tool in
    the family — which is a shipped library that is quietly wrong, not a
    crash."""
    with pytest.raises(SystemExit, match=r"maps \['LFC'\]"):
        check_column_map('x.csv', 'endmill',
                         {'DC': 'D1', 'SFDM': 'D', 'OAL': 'L', 'LCF': 'AP1MAX',
                          'LFC': 'oops'})


def test_an_unknown_kind_is_refused_rather_than_skipping_the_check():
    """A kind absent from `REQUIRED_GEOMETRY` would look up an empty set of
    required fields and pass every map, including an empty one."""
    with pytest.raises(SystemExit, match='unknown tool kind'):
        check_column_map('x.csv', 'reamer', {})


def test_every_kind_requires_the_fields_that_have_no_other_source():
    """`REQUIRED_GEOMETRY` is a claim about what a vendor must publish, so it
    is asserted rather than left to whatever the current families happen to
    map. A tap requires no `DC` because its major diameter is *derived* from
    the thread designation; an endmill requires no `RE` because a square-end
    family publishes none and zero is the right answer."""
    assert 'DC' not in REQUIRED_GEOMETRY['tap']
    assert 'RE' not in REQUIRED_GEOMETRY['endmill']
    for kind, required in REQUIRED_GEOMETRY.items():
        assert required <= set(GEOMETRY_FIELDS), kind
        assert {'SFDM', 'OAL', 'LCF'} <= required, kind


def test_a_validated_map_cannot_be_confused_with_the_raw_dict():
    """`check_column_map` returns the map so a caller cannot accidentally use
    the unvalidated literal it was handed."""
    labels = {'DC': 'D1', 'SFDM': 'D', 'OAL': 'L', 'LCF': 'L3'}
    columns = check_column_map('x', 'drill', labels)

    assert columns.labels == labels
    assert columns.labels is not labels


# ── The column check that needs the CSV ────────────────────────────────────

def test_a_mapped_column_absent_from_the_header_names_the_family_and_the_field():
    """The other half of "fails at load, not at row 1". `check_column_map` can
    only see the map; this sees the header. A family that maps
    `'LCF': 'AP1MAX'` against a table publishing `AP1MAX_in` alone, and is
    tagged metric, resolves to a column that is not there — and a per-row
    failure would name one row out of ninety-three."""
    cfg = {
        'unit': 'millimeters',
        'columns': check_column_map('x', 'endmill', {
            'DC': 'D1', 'SFDM': 'D', 'OAL': 'L', 'LCF': 'AP1MAX'}),
    }

    with pytest.raises(SystemExit) as raised:
        check_columns_exist('gomill_pro.csv', cfg,
                            {'D1_mm', 'D_mm', 'L_mm', 'AP1MAX_in'})

    assert 'gomill_pro.csv' in str(raised.value)
    assert 'LCF -> AP1MAX_mm' in str(raised.value)


def test_a_tap_family_declares_no_unit_so_both_column_sets_must_exist():
    """The asymmetry is real rather than an omission: a tap's system comes
    from its own `Thread System` column, so one family holds metric and inch
    taps and anything checking its columns has to check both."""
    assert family_units({'unit': 'inches'}) == ['inches']
    assert family_units({}) == ['millimeters', 'inches']

    cfg = {'columns': check_column_map('x', 'tap', {
        'SFDM': 'D', 'OAL': 'L', 'LCF': 'L3'})}
    with pytest.raises(SystemExit, match='SFDM -> D_in'):
        check_columns_exist('taps.csv', cfg, {'D_mm', 'L_mm', 'L3_mm'})


# ── The record itself ──────────────────────────────────────────────────────

def test_a_record_is_frozen():
    """It is an interchange value. A mapper that mutated one would be reaching
    back across the seam this type exists to draw."""
    record = ToolRecord(
        vendor='Kennametal', material_number='4151623', catalog_number='X',
        description='', kind='endmill', unit='millimeters', substrate='carbide',
        grade='KC7325', geometry={'DC': 6.0}, coolant_through=False)

    with pytest.raises(AttributeError):
        record.unit = 'inches'  # type: ignore[misc]


def test_no_material_groups_is_a_real_answer_rather_than_a_missing_one():
    """Kennametal indexes no tap by workpiece material, so all 129 carry none.
    Reading empty as "unconstrained" would put every tap under every material
    on no evidence."""
    record = ToolRecord(
        vendor='Kennametal', material_number='1', catalog_number='X',
        description='', kind='tap', unit='millimeters', substrate='hss',
        grade='', geometry={}, coolant_through=False)

    assert record.material_groups == ()
    assert record.non_ferrous is None
