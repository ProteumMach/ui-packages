"""Where a per-family fact came from, as data rather than as a comment.

The rule this enforces: **when a vendor label is unclear, ask** — record the
answer and its date, and never guess and flag it afterwards. It was kept
scrupulously in the source package, and kept in prose: `JG 2026-08-06`,
breadcrumb citations, the three paragraphs deriving the KenDrill point angle by
least squares. All of it invisible to code, and therefore unenforceable against
a stranger who adds a family next month.

A `Fact` is the index into that prose. It carries the value the pipeline uses
plus **how it was arrived at**, which turns the cultural rule into a gate:
`check_fact` refuses an assumed fact with no note, date and initials, and
refuses a vendor-stated one with no citation. An assumptions document is
generated from the same data, so every guess is on one page instead of
scattered across 700 lines of config comments.

## The three sources, and why the distinction is not cosmetic

- **`vendor-stated`** — the vendor published it. Needs a `cite`: which column,
  breadcrumb, tagline or facet said so, specific enough to re-check with one
  request. `contact: 'face'` cites *"Shank - SK BT Taper Face Contact"*.
- **`derived`** — this repo's arithmetic over vendor inputs. Needs a `note`
  saying what was computed from what. The KenDrill 142° point angle is the
  worked example: no page states it, but `L5 = D1 / (2·tan(SIG/2))` over 49
  rows does. A derived fact is checkable, and `test_csv_to_fusion.py`
  re-derives that one from the CSVs.
- **`assumed`** — nobody said it and nothing proves it. Needs a note, a date
  and initials, because the only thing standing behind it is a person on a
  day. These are what `ASSUMPTIONS.md` exists to list: every place the catalog
  would be wrong if the guess were wrong.

The prose does not go away. A `Fact`'s note is a sentence; the KenDrill
derivation stays in `families.py` and the runbook where it has room.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

#: How a fact was arrived at. Closed, and ordered from strongest to weakest —
#: `ASSUMPTIONS.md` sorts by it, so the guesses are what a reader meets first.
SOURCES = ('vendor-stated', 'derived', 'assumed')

_DATE = re.compile(r'^\d{4}-\d{2}-\d{2}$')

#: What a note has to say, per source kind.
_WANTED = {
    'derived': 'computed from what',
    'assumed': 'guessed, and why',
}


@dataclass(frozen=True)
class Fact:
    """One per-family constant, with its provenance.

    Frozen, because a fact is a record of what somebody established; code that
    mutated one would be rewriting the evidence rather than the value.

    `value` is what the pipeline uses — the registry projects it onto the
    family config under the fact's own name, so readers say
    `cfg['point_angle']` and never learn about provenance. That projection is
    what keeps this from being a second source of truth: the `Fact` is the only
    authored copy, and a family that also set the plain key is refused.
    """

    value: Any
    source: str
    #: What the vendor said, and where. Required on `vendor-stated`.
    cite: str | None = None
    #: What was worked out, or what was guessed and why. Required on the
    #: other two.
    note: str | None = None
    #: When a person last checked it, `YYYY-MM-DD`. Required on `assumed`.
    checked: str | None = None
    #: Who. Required on `assumed`, for the same reason the date is: an
    #: assumption is only as good as someone being willing to be named beside
    #: it.
    by: str | None = None


def check_fact(family: str, key: str, fact: Fact) -> None:
    """Refuse a fact that does not carry what its source kind requires.

    Called for every fact of every family at import, so the failure names the
    family and the key rather than surfacing as a thin assumptions-document row
    nobody reads.
    """
    where = f'{family}: {key}'
    if fact.source not in SOURCES:
        raise SystemExit(
            f'{where}: source {fact.source!r} is not one of {list(SOURCES)}')

    if fact.source == 'vendor-stated':
        if not fact.cite:
            raise SystemExit(
                f'{where}: a vendor-stated fact needs a `cite` — which column, '
                f'breadcrumb, tagline or facet says so')
        return

    if not fact.note:
        raise SystemExit(
            f'{where}: a {fact.source} fact needs a `note` saying what was '
            f'{_WANTED[fact.source]}')

    if fact.source == 'assumed':
        # The whole weight of an assumption is a person on a day. Without both,
        # `ASSUMPTIONS.md` lists a guess nobody can be asked about.
        if not fact.checked or not _DATE.match(fact.checked):
            raise SystemExit(
                f'{where}: an assumed fact needs `checked` as YYYY-MM-DD, '
                f'not {fact.checked!r}')
        if not fact.by:
            raise SystemExit(f'{where}: an assumed fact needs `by`')


def assumptions(tables: dict[str, dict]) -> list[dict]:
    """Every non-vendor-stated fact in the catalog, flattened and sorted.

    `vendor-stated` facts are excluded because the document's purpose is the
    list of things that would be wrong if somebody guessed wrong — a citation
    is a different kind of claim and has its own re-check path (one `curl`).

    Sorted by source then family then key, so the assumed ones lead and the
    output is byte-stable for whatever gate reads it.
    """
    rows = []
    for table, families in tables.items():
        for family, cfg in families.items():
            for key, fact in sorted(cfg.get('facts', {}).items()):
                if fact.source == 'vendor-stated':
                    continue
                rows.append({
                    'table': table,
                    'family': family,
                    'key': key,
                    'value': fact.value,
                    'source': fact.source,
                    'note': fact.note,
                    'checked': fact.checked,
                    'by': fact.by,
                })
    return sorted(rows, key=lambda r: (SOURCES.index(r['source']),
                                       r['family'], r['key']))
