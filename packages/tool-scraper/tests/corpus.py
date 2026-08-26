"""Reading a scrape, when there is one on this machine.

Some of these tests check the **scraped data** rather than the scraper: that
every holder satisfies the taper arithmetic, that every collet round-trips to
its own designation, that the material sweep filled a column. They are worth
having and they cannot run in CI, because the CSVs they read are vendor data
and are never committed.

So they skip, **with a named reason and the environment variable that turns the
skip into a failure**. A machine holding a scrape checks it; CI skips and says
why. A silent pass would be worse than no test — it would report the corpus as
checked on a machine that has never seen it.
"""

from __future__ import annotations

import csv
import os

import pytest

from toolpath_scraper.families import describe_root, family_csv

#: Set this where a scrape is expected to exist — a machine that keeps the
#: corpus, or a job whose whole purpose is checking it. A missing CSV then
#: fails instead of skipping, which is the difference between "not checked
#: here" and "checked, and it is gone".
REQUIRE_ENV = 'TOOLPATH_REQUIRE_CORPUS'


def rows(name: str) -> list[dict]:
    """One family's scraped CSV, or a skip naming what is absent and where.

    The reason carries the resolved root, because "no corpus" and "a corpus
    somewhere this run is not looking" are the same symptom and different
    problems — and `TOOLPATH_SCRAPE_ROOT` is what separates them.
    """
    path = family_csv(name)
    if not path.is_file():
        message = (
            f'{name} has not been scraped on this machine — {describe_root()}. '
            f'Set {REQUIRE_ENV}=1 to make this a failure instead.')
        if os.environ.get(REQUIRE_ENV):
            raise AssertionError(message)
        pytest.skip(message)
    with open(path, newline='') as f:
        return list(csv.DictReader(f))


def row(name: str, catalog_number: str) -> dict:
    """One row of a scraped CSV, by its catalog number."""
    for entry in rows(name):
        if entry['ISO Catalog Number'] == catalog_number:
            return entry
    raise AssertionError(f'{catalog_number} not in {name}')
