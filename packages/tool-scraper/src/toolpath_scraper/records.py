"""The interchange contract: what an adapter hands the core, and the canonical
names it hands it in.

Before this seam existed, the mapper read `row['AP1MAX_mm']`, `row['D3_mm']`,
`row['Re_mm']` and `row['Z']` — Kennametal's own attribute codes, in the module
that also held the reduced-shank rule and the bare-tool length convention. A
second vendor had two options and both were bad: relabel its columns into
Kennametal's on the way into the CSV, which puts a lie in the file whose whole
job is to record what the vendor published; or fork the mapper, which copies
the domain into every adapter to drift independently.

So the mapper stopped reading vendor column names. **An adapter owns CSV →
record; a record is where this package hands off.** The CSV keeps the vendor's
own column labels, because it is the receipt — see `conventions`.

## The canonical names are ISO 13399

`DC`, `OAL`, `LCF`, `RE`, `NOF`, `SIG`, `TP` are codes from **ISO 13399**,
*Cutting tool data representation and exchange* — the machine-tool industry's
own interchange dictionary. CAM vendors implement subsets of it; Autodesk
Fusion implements one, which is why these names also appear in Fusion's tool
JSON. This package uses the standard directly, so nothing here depends on any
CAM vendor's choices, and the places where a CAM vendor departed from the
standard are recorded as departures rather than adopted silently: see
{@link GEOMETRY_FIELDS}, where three of the ten names are Autodesk's own and
say so.

The standard is paid and split across parts, so the working reference is a
manufacturer's published table — Sandvik Coromant's and Dormer Pramet's are
both complete.

**A canonical name says nothing about units.** An adapter declares
`'DC': 'D1'` and the core appends `_mm`/`_in` from the family's declared unit;
that rule lives in `conventions.UNIT_SUFFIX`, in one place, because choosing
the suffix inside an adapter is exactly the mistake `unit` exists to prevent.

## What is deliberately *not* here

`LB` and `assemblyGaugeLength` are not canonical inputs — they are `OAL` under
another name on a bare tool, ISO code or not, and a field that is always a copy
is not a second measurement. An adapter that could supply them separately could
supply a tool that claims a holder it does not have.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

from toolpath_scraper.conventions import UnitSystem, dimensional_column

ToolKind = Literal['drill', 'tap', 'endmill']

#: ISO 513's main workpiece-material groups, in the order every vendor's
#: material groups must agree on — **core, not a Kennametal fact**, the same
#: distinction that puts thread-designation parsing here: this is a standard,
#: not a table. A vendor whose own column publishes groups in a different
#: order — Destiny Tool's `isoMaterialGroups` does, e.g. `['M', 'P', 'S']` —
#: must reorder onto this sequence rather than passing its raw order through,
#: because a consumer that renders a facet from one array and a tool's own list
#: from another has no way to notice the two disagree.
ISO_MATERIAL_GROUPS: tuple[str, ...] = ('P', 'M', 'K', 'N', 'S', 'H', 'C')


@dataclass(frozen=True)
class GeometryField:
    """One canonical geometry name: what it measures, and whose name it is."""

    #: What the field measures, phrased so it can be quoted back at whoever
    #: mapped a column to the wrong one.
    definition: str
    #: The ISO 13399 code for this measurement, or None where the standard's
    #: counterpart has not been pinned against the dictionary. Equal to the
    #: canonical name itself on every field that *is* the standard's code.
    iso: str | None


#: Canonical geometry fields an adapter may supply, and what each means.
#:
#: Keyed by name so the load-time check can quote a definition back at whoever
#: mapped a column to the wrong one, and each entry carries its ISO 13399 code
#: so the vocabulary's source is readable from the code rather than from a
#: plan document.
#:
#: **Seven of the ten are the standard's codes with the standard's meanings.**
#: The three that are not are Autodesk's, and each has an ISO counterpart
#: Autodesk did not use:
#:
#: - `SFDM` is Autodesk's "Shaft Diameter"; ISO's shank diameter is `DMM`.
#: - `shoulder-length` and `shoulder-diameter` are Autodesk's hyphenated
#:   lowercase keys. ISO's nearest are `LS` and `DN`, and they are recorded as
#:   unpinned rather than mapped, because "nearest" is not "the same" and the
#:   standing rule here is to leave a code unlabelled rather than guess at what
#:   it measures.
#:
#: They are kept under Autodesk's names anyway: renaming them would buy
#: correctness in a document nothing reads yet and cost the one property that
#: makes a canonical name useful, which is that a downstream consumer
#: recognises it.
GEOMETRY_FIELDS: dict[str, GeometryField] = {
    'DC': GeometryField('cutting diameter', 'DC'),
    'SFDM': GeometryField('shank diameter', 'DMM'),
    'OAL': GeometryField('overall length', 'OAL'),
    'LCF': GeometryField('flute length — the length of the cutting edge', 'LCF'),
    'RE': GeometryField('corner radius; 0 on a square-end tool', 'RE'),
    'TP': GeometryField('thread pitch, in the tool’s own unit system', 'TP'),
    'NOF': GeometryField('number of flutes', 'NOF'),
    'SIG': GeometryField('point angle, degrees included', 'SIG'),
    'shoulder-length': GeometryField('usable length below the full shank', None),
    'shoulder-diameter': GeometryField(
        'diameter at the shoulder — the neck, where necked', None),
}

#: The canonical names that are **not** ISO 13399's own codes, derived rather
#: than listed so the two cannot disagree.
#:
#: Asserted by the tests as exactly these three, which is what makes adding a
#: fourth a deliberate act: a canonical name that is one CAM vendor's invention
#: is a departure from the standard, and this package's claim to be using the
#: standard is only as good as the departures being counted.
NON_ISO_NAMES: tuple[str, ...] = tuple(
    name for name, field_ in GEOMETRY_FIELDS.items() if field_.iso != name)

#: What each tool kind must map before a single row is read.
#:
#: The point of stating it per kind rather than per family: core can refuse
#: "endmill family X maps no LCF" at config load, naming the family, instead of
#: raising a `KeyError` from inside a mapper on row 1 of a scrape that already
#: ran. A field's *absence* from this list is a claim too — `RE` is optional
#: because a square-end family publishes no corner-radius column and 0 is the
#: right answer, not a missing one.
REQUIRED_GEOMETRY: dict[str, frozenset[str]] = {
    'drill': frozenset({'DC', 'SFDM', 'OAL', 'LCF'}),
    'tap': frozenset({'SFDM', 'OAL', 'LCF'}),
    'endmill': frozenset({'DC', 'SFDM', 'OAL', 'LCF'}),
}

#: Fields that carry a unit and therefore get a `_mm`/`_in` suffix appended to
#: the vendor's column label. The rest are counts, angles and flags, published
#: in one column whatever the family's unit system.
#:
#: `TP` is here and it is the interesting one: a thread pitch is a length, and
#: on an inch tap it is `1/TPI` **inches** while on a metric tap it is
#: millimetres. It is nonetheless read from a single column, because the
#: scraper derives it in the family's native unit already — so it is listed as
#: dimensional for documentation and excluded from suffixing by the adapter
#: that knows that. See `DIMENSIONAL_COLUMNS`.
DIMENSIONAL: frozenset[str] = frozenset({
    'DC', 'SFDM', 'OAL', 'LCF', 'RE', 'TP', 'shoulder-length',
    'shoulder-diameter',
})

#: The subset of {@link DIMENSIONAL} whose CSV column is a unit *pair*.
#:
#: `TP` is dimensional but not paired: the Kennametal thread-pitch step derives
#: one `Thread Pitch` column already in the tap's native system, so appending a
#: suffix would look for a column that was never scraped.
DIMENSIONAL_COLUMNS: frozenset[str] = DIMENSIONAL - {'TP'}


@dataclass(frozen=True)
class ToolRecord:
    """One orderable cutting tool, in canonical fields, ready for the core.

    Frozen because it is an interchange value: an adapter builds it and hands
    it over, and a mapper that mutated one would be reaching back across the
    seam this type exists to draw.

    `geometry` holds {@link GEOMETRY_FIELDS} names in `unit`. `material_groups`
    is a tuple rather than a list for the same immutability reason, and an
    **empty** one is a real answer — Kennametal indexes no tap by workpiece
    material, so all 129 carry none, and reading empty as "unconstrained" would
    put every tap under every material on no evidence.
    """

    vendor: str
    material_number: str
    catalog_number: str
    description: str
    kind: ToolKind
    unit: UnitSystem
    substrate: str
    grade: str
    geometry: dict[str, float | int | bool]
    coolant_through: bool
    material_groups: tuple[str, ...] = ()
    #: Drills only, and deliberately `None` elsewhere rather than `False`: it
    #: drops the two ferrous presets downstream, and a default would ship them
    #: on a PCD tool.
    non_ferrous: bool | None = None


@dataclass(frozen=True)
class ColumnMap:
    """A family's canonical-field → CSV-column-label mapping, validated.

    Built once at config load. `labels` are the vendor's own column labels
    **without** a unit suffix — `'D1'`, not `'D1_mm'` — because which suffix to
    read is the core's business, derived from the family's unit system. A
    vendor that wrote `'D1_mm'` here would be hardcoding the answer to the
    question `unit` exists to ask.
    """

    kind: ToolKind
    labels: dict[str, str] = field(default_factory=dict)

    def column(self, canonical: str, unit: UnitSystem) -> str | None:
        """The CSV column to read for `canonical`, or None when unmapped."""
        label = self.labels.get(canonical)
        if label is None:
            return None
        if canonical not in DIMENSIONAL_COLUMNS:
            return label
        return dimensional_column(label, unit)


def family_units(cfg: dict) -> list[str]:
    """The unit systems a family's rows can be in.

    Usually one, declared. **A tap family declares none**, and that asymmetry
    is real rather than an omission: a tap's system comes from its own
    `Thread System` column, so one family can hold metric and inch taps and
    both column sets must exist. Anything checking a family's columns has to
    check both for those.
    """
    unit = cfg.get('unit')
    return [unit] if unit is not None else ['millimeters', 'inches']


def check_columns_exist(family: str, cfg: dict, header: set[str]) -> None:
    """Every mapped column is really in the CSV — before a single row is read.

    `check_column_map` sees only the map, so it cannot catch a family that maps
    `'LCF': 'AP1MAX'` against a table publishing `AP1MAX_in` alone while
    tagged metric. That resolves to a column which is not there, and the
    per-row failure names one row out of ninety-three instead of naming the
    family and the field.

    It is here rather than at config load because the loader deliberately does
    no I/O — an installed package with no scraped data must still import.
    """
    columns: ColumnMap = cfg['columns']
    missing = sorted(
        f'{canonical} -> {column}'
        for unit in family_units(cfg)
        for canonical in columns.labels
        if (column := columns.column(canonical, unit)) not in header
    )
    if missing:
        raise SystemExit(
            f'{family}: mapped column(s) absent from the CSV: '
            f'{", ".join(missing)}')


def check_column_map(family: str, kind: str, labels: dict[str, str]) -> ColumnMap:
    """Validate a family's column map at load, or refuse it by name.

    Three failures, and each is one that used to surface far from its cause:

    1. **An unknown canonical field.** A typo like `'LFC'` would otherwise sit
       in the map doing nothing, and the geometry it was meant to fill would
       silently be absent from every tool in the family.
    2. **A missing required field.** `KeyError: 'AP1MAX_mm'` from inside a
       mapper names the *column*, which is the one piece of information the
       person who wrote the map already had.
    3. **An unknown kind**, which would otherwise skip the required-field
       check entirely by looking up an empty set.

    Returns the validated map so a caller cannot accidentally use the raw dict.
    """
    if kind not in REQUIRED_GEOMETRY:
        raise SystemExit(
            f'{family}: unknown tool kind {kind!r} '
            f'(known: {sorted(REQUIRED_GEOMETRY)})')

    unknown = sorted(set(labels) - set(GEOMETRY_FIELDS))
    if unknown:
        raise SystemExit(
            f'{family}: maps {unknown} which are not canonical geometry '
            f'fields (known: {sorted(GEOMETRY_FIELDS)})')

    missing = sorted(REQUIRED_GEOMETRY[kind] - set(labels))
    if missing:
        described = ', '.join(
            f'{f} ({GEOMETRY_FIELDS[f].definition})' for f in missing)
        raise SystemExit(
            f'{family}: a {kind} family must map {described}')

    return ColumnMap(kind=kind, labels=dict(labels))
