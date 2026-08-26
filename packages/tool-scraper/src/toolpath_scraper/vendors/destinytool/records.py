"""Destiny Tool CSV rows -> `ToolRecord`.

Destiny Tool publishes exactly one identifier (`itemNumber`), no carbide
grade, no structured shank column, and dimensions as fractional-inch
**strings** rather than decimal columns — the closest precedent in
this package is `thread.thread_major_diameter`'s designation parsing, not any
other vendor's dimension reader, all of which already publish decimals.

**Three geometry fields are derived from the free-text `description` rather
than a column, because no column exists for them**: a shank diameter from a
"SHK" annotation, a corner radius from a "RAD" annotation when the vendor's own
`rad` cell is blank, and a neck diameter from a "NECK" annotation. The latter
two were found scraping the real collection 2026-08-19. All three follow the
same shape: real vendor data (a populated column) wins when present, and the
description is read only when the column is not — absence is a stated fact,
not a gap to fill.

**A per-record derivation is not a `Fact`.** These three are arithmetic over a
row, so they belong in code with their evidence beside them; a `Fact` is a
per-family constant nothing in the table states, and putting one of these there
would claim a whole family's provenance for a value that varies row by row.
"""

from __future__ import annotations

import re

from toolpath_scraper.records import ISO_MATERIAL_GROUPS, ColumnMap, ToolRecord

#: Destiny Tool's one identifier. There is no second catalog number the way
#: Kennametal publishes an ISO number alongside a material number — the item
#: number fills both roles on a `ToolRecord`.
ITEM_NUMBER = 'itemNumber'

#: `"1/8 SHK"`, `"1/4\" SHK"` — a shank diameter, stated only when it differs
#: from the cutting diameter (a necked or reduced-shank tool). Every value
#: observed across the real scrape (2026-08-19, 642 of 3,898 rows) is a
#: simple fraction, optionally quoted; `parse_fraction_inches` also handles
#: the decimal and mixed-number forms `cutDia`/`loc`/`oal`/`rad` use, since a
#: future SKU stating a shank that way is not implausible.
SHANK_RE = re.compile(r'([\d.\-/"]+)\s*SHK', re.IGNORECASE)

#: `".035-.040 RAD"` — a corner-radius *range*, read only as a fallback when
#: the vendor's own `rad` cell is blank. See `_corner_radius`.
RAD_RANGE_RE = re.compile(r'([\d.]+)-([\d.]+)\s*RAD', re.IGNORECASE)

#: `".090 RAD"` — a single corner-radius value, same fallback role.
#:
#: **No `\b` anchor before the capture group.** A word boundary sits between
#: a non-word `.` and a word digit, so `\b[\d.]+` on `.090 RAD` starts
#: matching at the `0` and drops the leading dot — `float('090')` is 90, not
#: 0.09, and that silently produced a 90-inch corner radius the first time
#: this ran against the real scrape (2026-08-19). The character class itself
#: already excludes the comma and space that precede every real match, so
#: nothing anchors the start position but the class.
#:
#: `(?<!-)` keeps this from matching the upper bound of a range as if it were
#: a lone value when both patterns are tried against the same string; the
#: caller tries RAD_RANGE_RE first regardless, so this is a belt-and-
#: suspenders guard rather than the thing doing the exclusion.
RAD_SINGLE_RE = re.compile(r'(?<!-)([\d.]+)\s*RAD', re.IGNORECASE)

#: `".074 NECK"` — a neck (shoulder) diameter, stated only on necked tools
#: (171 of 3,898 rows, 2026-08-19). Always a plain decimal in the scraped
#: data; no fraction or mixed-number form has been observed.
NECK_RE = re.compile(r'([\d.]+)\s*NECK', re.IGNORECASE)

#: Flute counts at or below this route to the non-ferrous material-group
#: fallback — see `_material_groups`.
NON_FERROUS_MAX_FLUTES = 3


def parse_fraction_inches(text: str) -> float:
    """A Destiny Tool dimension string, in inches.

    Every form seen across the real scrape (2026-08-19): a decimal
    (`.093`), a bare or quoted whole number (`1`, `1"`), a simple fraction
    (`3/4`), or a mixed number, quoted or not (`1-1/2`, `1-1/2"`).
    """
    s = text.strip().rstrip('"')
    if not s:
        raise ValueError(f'empty dimension: {text!r}')
    if '.' in s:
        return float(s)
    if '-' in s:
        whole, frac = s.split('-', 1)
        num, den = frac.split('/')
        return float(whole) + float(num) / float(den)
    if '/' in s:
        num, den = s.split('/')
        return float(num) / float(den)
    return float(s)


def _require(row: dict, columns: ColumnMap, canonical: str, what: str) -> float:
    """A dimension the kind requires, parsed as an inch fraction."""
    column = columns.column(canonical, 'inches')
    raw = row.get(column)
    if raw is None or raw.strip() == '':
        raise SystemExit(f'{what}: no value for {canonical} in column {column!r}')
    return parse_fraction_inches(raw)


def _shank_diameter(description: str, dc: float) -> float:
    """The shank diameter: parsed off a "SHK" annotation when the tool is
    necked or reduced-shank, or the cutting diameter otherwise.

    Destiny Tool has no structured shank column at all — unlike Kennametal,
    where an absent `D` column would be a scrape bug, here a shank equal to
    the cut diameter is simply never stated in the vendor's own text either
    (checked over the full scrape, 2026-08-19)."""
    match = SHANK_RE.search(description)
    return parse_fraction_inches(match.group(1)) if match else dc


def _corner_radius(description: str, end_style: str, what: str, dc: float,
                    rad_cell: float | None) -> float:
    """The corner radius, in priority order.

    1. The vendor's own `rad` cell, when populated — real data wins, and this
       is trusted outright the way every scraped column in this package is.
    2. `DC / 2` on a `Ball` end mill, which Destiny Tool publishes with no
       radius column at all for that style (checked 2026-08-19).
    3. The description's own "RAD" annotation, for the 123 of 3,898 rows
       found 2026-08-19 where `endStyle` is `"Corner Radius"` but the `rad`
       cell is blank and the text states one anyway. A range like
       `".035-.040 RAD"` resolves to its **upper** bound: across the 370 rows
       that state a range and also publish a populated `rad` cell, the cell
       equals the upper bound 352 times (95%) and the lower bound 18 times,
       so the upper bound is the better-corroborated guess for the rows
       where only the range is available.

       **Recovered from text, so it is checked rather than trusted
       outright.** `V33220R093` states `"0.93 RAD"` where its two siblings
       (identical geometry, different coating) both say `".093 RAD"` and the
       item number's own `093` suffix agrees with them — a vendor typo
       missing a leading zero, found running this against the real scrape.
       A value that would make the tool geometrically impossible (2xRE > DC)
       is not used; the row falls through to 4 instead, with a warning.
    4. `0.0` — a real square end — when nothing states one (2 of 3,898 rows),
       or when 3 recovered a value this package will not ship.
    """
    if rad_cell is not None:
        return rad_cell
    if end_style == 'Ball':
        return dc / 2
    range_match = RAD_RANGE_RE.search(description)
    recovered = float(range_match.group(2)) if range_match else None
    if recovered is None:
        single_match = RAD_SINGLE_RE.search(description)
        recovered = float(single_match.group(1)) if single_match else None
    if recovered is None:
        return 0.0
    if recovered * 2 > dc:
        print(f'  WARNING: {what}: description states a corner radius of '
              f'{recovered:g}in, which exceeds half the {dc:g}in cutting '
              f'diameter — likely a vendor typo; shipped as a flat end mill '
              f'instead')
        return 0.0
    return recovered


def _shoulder_diameter(description: str, dc: float) -> float:
    """The neck (shoulder) diameter: parsed off a "NECK" annotation when the
    tool is necked, or the cutting diameter otherwise — a plain-shank tool
    below the flutes, the same convention a family with no neck column at all
    uses. Destiny Tool never publishes a structured neck column; the
    description states one on 171 of 3,898 rows (2026-08-19) and this reads it
    rather than defaulting every row to plain-shank."""
    match = NECK_RE.search(description)
    return float(match.group(1)) if match else dc


def _material_groups(row: dict, flutes: int) -> tuple[str, ...]:
    """The ISO workpiece-material groups: the vendor's own `isoMaterialGroups`
    column when populated, or a fallback keyed on flute count when it is not
    (blank on 423 of 3,898 rows, 2026-08-19).

    The fallback is not a new rule invented for this vendor — it is the split
    cutting-data presets are routed by downstream (<=3 flutes non-ferrous, >3
    ferrous), applied here to the material-groups facet instead. Real vendor
    data wins when present: the full scrape shows 92 <=3-flute rows whose
    stated groups are not exactly `('N',)` and 168 >3-flute rows whose stated
    groups include `N`, so this is deliberately a fallback for the blank
    cells and not a correction of the populated ones.

    **The populated cell is reordered onto `ISO_MATERIAL_GROUPS`, not passed
    through in Destiny Tool's own order.** Its `isoMaterialGroups` array comes
    back as e.g. `['M', 'P', 'S']` — alphabetical-ish, not the ISO 513
    sequence every other list agrees on — and a consumer that renders a facet
    from one array and a tool's own list from another has no way to notice the
    two disagree.
    """
    cell = row.get('isoMaterialGroups', '')
    if cell.strip():
        present = set(cell.split())
        return tuple(g for g in ISO_MATERIAL_GROUPS if g in present)
    if flutes <= NON_FERROUS_MAX_FLUTES:
        return ('N',)
    return ('P', 'M', 'K', 'S', 'H')


def endmill_record(row: dict, cfg: dict, columns: ColumnMap) -> ToolRecord:
    """A solid end mill, always in inches — Destiny Tool publishes no metric
    line (`unit` fact on the family)."""
    what = row[ITEM_NUMBER]
    description = row.get('description', '')
    dc = _require(row, columns, 'DC', what)
    flute_length = _require(row, columns, 'LCF', what)
    oal = _require(row, columns, 'OAL', what)

    rad_column = columns.column('RE', 'inches')
    rad_raw = row.get(rad_column)
    rad_cell = (parse_fraction_inches(rad_raw)
                if rad_raw and rad_raw.strip() else None)

    flutes = int(row['flutes'])
    return ToolRecord(
        vendor='destinytool',
        material_number=row[ITEM_NUMBER],
        catalog_number=row[ITEM_NUMBER],
        description=description,
        kind='endmill',
        unit='inches',
        substrate=(row.get('material') or cfg['bmc']).lower(),
        # No carbide grade is published; the coating id fills GRADE instead.
        grade=row.get('coatingId', ''),
        material_groups=_material_groups(row, flutes),
        coolant_through=cfg['coolant_through'],
        geometry={
            'DC': dc,
            'RE': _corner_radius(description, row.get('endStyle', ''), what,
                                  dc, rad_cell),
            'SFDM': _shank_diameter(description, dc),
            'OAL': oal,
            'LCF': flute_length,
            'shoulder-length': flute_length,
            'shoulder-diameter': _shoulder_diameter(description, dc),
            'NOF': flutes,
        },
    )


RECORD_MAPPERS = {'endmill': endmill_record}
