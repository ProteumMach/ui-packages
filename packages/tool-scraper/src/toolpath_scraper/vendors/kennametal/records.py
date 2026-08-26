"""Kennametal CSV rows -> `ToolRecord`. The adapter half of the record seam.

Everything here knows Kennametal's column vocabulary and nothing here knows
what a record becomes. The reverse is true of whatever consumes one: it knows
no vendor at all.

What stayed on this side of the line, and why each is a *vendor* fact rather
than a domain one:

- **Which column holds a canonical field.** Declared per family as
  `columns={'DC': 'D1', ...}` and resolved through `ColumnMap`, which appends
  the unit suffix. A vendor with different labels declares different labels.
- **Where the identity strings live.** `Material Number` and `ISO Catalog
  Number` are Kennametal's header text — the labels
  `conventions.IDENTITY_COLUMNS` took as the convention because this vendor was
  first, and which Destiny Tool then did not follow.
- **Which column is the grade.** A drill and an end mill carry a carbide
  `Grade`; a tap has no carbide grade and carries `Coating`, the surface
  treatment, in the record's `grade` field. That is Kennametal's table shape,
  not a rule about taps everywhere.
- **That a tap's unit system is per row.** `Thread System` is a constant tag
  column this package appends at scrape time, and a metric and an inch tap can
  sit in one family — so a tap's `unit` is read per row where a drill's and an
  end mill's come from config.
- **The optional columns.** `Re`, `L3` and `D3` are present on some families
  and absent on others, and the *absence* means something specific: no corner
  radius is a square end (RE 0); no `L3` on a plain-shank tool means AP1MAX is
  the shoulder length too; no `D3` means the shoulder is the cutting diameter.
  Those three fallbacks are Kennametal-table facts and they stay here.

What deliberately stays out: whether a corner radius makes a tool a bull nose,
`LB` and `assemblyGaugeLength` being `OAL` on a bare tool, and every cutting
preset. Those are true of a tool, not of a table.
"""

from __future__ import annotations

from toolpath_scraper.records import ColumnMap, ToolRecord
from toolpath_scraper.thread import thread_major_diameter
from toolpath_scraper.vendors.kennametal.materials import (
    MATERIALS_COLUMN,
    material_classes,
)

#: Kennametal's identity columns. Named here rather than inline so a table that
#: renames one fails in a single place.
MATERIAL_NUMBER = 'Material Number'
CATALOG_NUMBER = 'ISO Catalog Number'


def _dim(row: dict, columns: ColumnMap, canonical: str, unit: str) -> float | None:
    """One canonical dimension, or None when this family maps or publishes none.

    None is a real state and the callers distinguish it: an absent `Re` is a
    square-end tool, an absent `L3` is a plain shank. It is never a silent
    zero, because a zero corner radius and an unpublished one are the same
    number and different facts.
    """
    column = columns.column(canonical, unit)
    if column is None:
        return None
    raw = row.get(column)
    if raw is None or raw.strip() == '':
        return None
    return float(raw)


def _require(row: dict, columns: ColumnMap, canonical: str, unit: str,
             what: str) -> float:
    """A dimension the kind requires. `check_column_map` has already refused a
    family that maps none, so what this catches is a *row* the vendor left
    empty — which is a scrape problem, not a config one, and says so."""
    value = _dim(row, columns, canonical, unit)
    if value is None:
        raise SystemExit(
            f'{what}: no value for {canonical} in column '
            f'{columns.column(canonical, unit)!r}')
    return value


def drill_record(row: dict, cfg: dict, columns: ColumnMap) -> ToolRecord:
    """A drill, in the family's native unit system per `cfg['unit']`.

    Every drill table publishes both unit columns, so `unit` is config and
    never inferred: it decides which column is read and what a machinist is
    shown. Getting it wrong converts cleanly and prints 5.9531 mm where the
    part ordered is a 15/64 in KenDrill TXD.

    L4 (max drilling depth) and L5 (point length) are mapped by no family and
    reach no record — but L5 is not inert, because it is what pins
    `point_angle` on a family whose table states none. See
    `families.kennametal`.
    """
    unit = cfg['unit']
    what = row[MATERIAL_NUMBER]
    return ToolRecord(
        vendor=cfg.get('brand', 'kennametal'),
        material_number=row[MATERIAL_NUMBER],
        catalog_number=row[CATALOG_NUMBER],
        description=row[CATALOG_NUMBER],
        kind='drill',
        unit=unit,
        substrate=cfg['bmc'],
        grade=row['Grade'],
        material_groups=material_classes(row.get(MATERIALS_COLUMN)),
        coolant_through=cfg['coolant_through'],
        non_ferrous=cfg['non_ferrous'],
        geometry={
            'DC': _require(row, columns, 'DC', unit, what),
            'SFDM': _require(row, columns, 'SFDM', unit, what),
            'OAL': _require(row, columns, 'OAL', unit, what),
            'LCF': _require(row, columns, 'LCF', unit, what),
            'NOF': cfg['flutes'],
            'SIG': cfg['point_angle'],
        },
    )


def tap_record(row: dict, cfg: dict, columns: ColumnMap) -> ToolRecord:
    """A tap, in **its own** native unit system rather than the family's.

    `Thread System` is a constant column the scraper tags on, because the table
    does not state it; metric taps read the mm columns and inch taps the inch
    ones. `Thread Pitch` is already native-unit — derived from `D1-TDZ` by
    `thread_column.add_thread_pitch_to_csv` — which is why `TP` is dimensional
    but unsuffixed.

    `DC` is **derived, not read**: a tap table publishes a thread designation
    (`#2-56`, `M6 X 1`) and no major-diameter column, so the major diameter is
    parsed out of the designation. That is arithmetic over a standard, which is
    why `thread_major_diameter` sits in the core.
    """
    system = row['Thread System']
    unit = 'inches' if system == 'inch' else 'millimeters'
    tdz = row['D1-TDZ']
    what = row[MATERIAL_NUMBER]
    return ToolRecord(
        vendor=cfg.get('brand', 'kennametal'),
        material_number=row[MATERIAL_NUMBER],
        catalog_number=row[CATALOG_NUMBER],
        # The designation is part of what a tap *is*, and the catalog number
        # alone does not carry the size.
        description=f'{row[CATALOG_NUMBER]} {tdz}',
        kind='tap',
        unit=unit,
        substrate=cfg['bmc'],
        # A tap has no carbide grade; the record's grade carries the coating.
        grade=row['Coating'],
        material_groups=material_classes(row.get(MATERIALS_COLUMN)),
        coolant_through=False,
        geometry={
            'DC': thread_major_diameter(tdz, system),
            'TP': _require(row, columns, 'TP', unit, what),
            'SFDM': _require(row, columns, 'SFDM', unit, what),
            'OAL': _require(row, columns, 'OAL', unit, what),
            'LCF': _require(row, columns, 'LCF', unit, what),
            'NOF': int(row['Z']),
        },
    )


def endmill_record(row: dict, cfg: dict, columns: ColumnMap) -> ToolRecord:
    """A solid end mill, native unit per `cfg['unit']`.

    Three optional columns, and each absence carries a meaning this table
    assigns rather than one the domain does:

    - **no `Re`** → a square-end family, corner radius 0;
    - **no `L3`** → nothing below the flutes to reach past, so the maximum
      flute length is the shoulder length too (the WIDIA VariMill tables);
    - **no `D3`** → a plain shank, so the shoulder is the cutting diameter.

    Whether a radius makes it a bull nose is a consumer's call, not this one.
    """
    unit = cfg['unit']
    what = row[MATERIAL_NUMBER]
    dc = _require(row, columns, 'DC', unit, what)
    flute_length = _require(row, columns, 'LCF', unit, what)
    return ToolRecord(
        vendor=cfg.get('brand', 'kennametal'),
        material_number=row[MATERIAL_NUMBER],
        catalog_number=row[CATALOG_NUMBER],
        description=row[CATALOG_NUMBER],
        kind='endmill',
        unit=unit,
        substrate=cfg['bmc'],
        grade=row['Grade'],
        material_groups=material_classes(row.get(MATERIALS_COLUMN)),
        coolant_through=cfg['coolant_through'],
        geometry={
            'DC': dc,
            'RE': _dim(row, columns, 'RE', unit) or 0.0,
            'SFDM': _require(row, columns, 'SFDM', unit, what),
            'OAL': _require(row, columns, 'OAL', unit, what),
            'LCF': flute_length,
            'shoulder-length': (
                _dim(row, columns, 'shoulder-length', unit) or flute_length),
            'shoulder-diameter': (
                _dim(row, columns, 'shoulder-diameter', unit) or dc),
            'NOF': int(row['Z']),
        },
    )


RECORD_MAPPERS = {
    'drill': drill_record,
    'tap': tap_record,
    'endmill': endmill_record,
}
