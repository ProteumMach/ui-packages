"""The `Thread Pitch` column Kennametal's tap tables do not publish.

The arithmetic is in `toolpath_scraper.thread` — parsing a thread designation is
a standard, not a vendor's. What is Kennametal's, and therefore here, is that
the designation arrives in a column named `D1-TDZ`, that the thread system
arrives in a `Thread System` tag column this package appends at scrape time,
and that a pitch column has to be derived at all because the vendor's table
carries none.
"""

from __future__ import annotations

import csv
from pathlib import Path

from toolpath_scraper.thread import thread_pitch


def add_thread_pitch_to_csv(path: str | Path) -> int:
    """Add (or replace) a `Thread Pitch` column on a tap CSV, in place.

    Safe to re-run: an existing Thread Pitch column is dropped and rebuilt,
    and the column is always reinserted directly after `D1-TDZ`.
    """
    with open(path, newline='') as f:
        rows = list(csv.DictReader(f))
    fields = [k for k in rows[0] if k != 'Thread Pitch']
    fields.insert(fields.index('D1-TDZ') + 1, 'Thread Pitch')
    for r in rows:
        r['Thread Pitch'] = thread_pitch(r['D1-TDZ'], r['Thread System'])
    with open(path, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    return len(rows)
