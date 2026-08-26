"""Thread designations in, native-unit numbers out.

A thread designation is a *standard* — `#2-56` is a UTS thread and `M6X1` an
ISO metric one whoever prints it — so these are domain arithmetic, not a
vendor's table. The parametrized cases are the designations actually seen in
the scraped tables, spacing variants included, because the spacing is where
this last broke.
"""

from __future__ import annotations

import pytest

from toolpath_scraper.thread import thread_major_diameter, thread_pitch


@pytest.mark.parametrize('tdz, expected', [
    ('M2X0.4', 2.0),
    ('M12X1.75', 12.0),
    ('M30X3.5', 30.0),
])
def test_metric_thread_major(tdz, expected):
    assert thread_major_diameter(tdz, 'metric') == expected


@pytest.mark.parametrize('tdz, expected', [
    ('#0-80', 0.060),
    ('#0 - 80', 0.060),        # space variant seen in scrape
    ('#2-56', 0.086),
    ('#10-32', 0.190),
    ('#12-24', 0.216),
    ('1/4-20', 0.25),
    ('1/4 - 20', 0.25),
    ('5/16-18', 0.3125),
    ('3/4 - 10', 0.75),
])
def test_inch_thread_major(tdz, expected):
    assert thread_major_diameter(tdz, 'inch') == pytest.approx(expected)


def test_the_machine_screw_numbers_come_from_the_ansi_formula():
    """`0.060 + 0.013 * N` inches, not a lookup table — which is why `#12`
    works without anybody having entered it."""
    assert thread_major_diameter('#12-24', 'inch') == pytest.approx(
        0.060 + 0.013 * 12)


@pytest.mark.parametrize('tdz, system', [
    ('garbage', 'inch'),
    ('M2', 'metric'),          # no pitch: not a designation
    ('2-56', 'inch'),          # no `#`: not a machine-screw number
])
def test_thread_major_rejects_unrecognized(tdz, system):
    with pytest.raises(ValueError):
        thread_major_diameter(tdz, system)


@pytest.mark.parametrize('designation, system, expected', [
    ('M6X1', 'metric', '1'),
    ('M12X1.75', 'metric', '1.75'),
    ('#4-40', 'inch', '0.025'),
    ('1/4 - 20', 'inch', '0.05'),
])
def test_pitch_is_returned_in_the_threads_native_unit(designation, system, expected):
    """Millimetres on a metric thread, `1/TPI` inches on an inch one. The two
    are read from one CSV column, which is only sound because the value is
    already in the tap's own system when it is written."""
    assert thread_pitch(designation, system) == expected


def test_pitch_is_the_string_that_goes_into_the_csv():
    """So re-running the step is a no-op rather than a float round-trip that
    rewrites `1` as `1.0` in every row."""
    assert isinstance(thread_pitch('M6X1', 'metric'), str)
    assert thread_pitch('M6X1', 'metric') == '1'


@pytest.mark.parametrize('designation, system', [
    ('M6', 'metric'),
    ('#4', 'inch'),
    ('M6X1', 'inch'),          # right designation, wrong system
])
def test_a_pitch_that_cannot_be_parsed_is_refused(designation, system):
    """Rather than defaulted. A tap shipped with a guessed pitch is a tap that
    cuts the wrong thread."""
    with pytest.raises(ValueError):
        thread_pitch(designation, system)
