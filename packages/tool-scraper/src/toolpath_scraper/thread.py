"""Thread designations in, native-unit numbers out.

**Core, not an adapter**, and the distinction is the one this package draws
everywhere: a thread designation is a *standard* — `#2-56` is a UTS thread and
`M6 X 1` an ISO metric one whoever prints it — so parsing one is domain
arithmetic that every vendor's taps need and none of them owns. What is
Kennametal's is that its tables publish the designation in a column called
`D1-TDZ` and publish no pitch at all, and that fact lives in
`vendors/kennametal/thread_column.py` with the CSV step that fixes it.

Native units throughout — millimetres for metric threads, inches for inch
threads. A tap's system is a per-row fact, so the caller passes it in rather
than this module assuming a family's.
"""

from __future__ import annotations

import re


def thread_major_diameter(tdz: str, thread_system: str) -> float:
    """Major diameter from a thread designation string, in the
    thread system's native unit (mm for metric, inches for inch).

    Formats seen in the scraped tables: 'M10X1.5', '#2-56', '#0 - 80',
    '1/4 - 20', '5/16-18'.
    """
    s = tdz.replace(' ', '')
    if thread_system == 'metric':
        m = re.fullmatch(r'M([0-9]+(?:\.[0-9]+)?)X[0-9.]+', s)
        if not m:
            raise ValueError(f'unrecognized metric thread designation: {tdz!r}')
        return float(m.group(1))
    size = s.split('-', 1)[0]
    if size.startswith('#'):
        # ANSI machine-screw numbers: major dia = 0.060 + 0.013 * N inches
        return round(0.060 + 0.013 * int(size[1:]), 4)
    if '/' in size:
        num, den = size.split('/')
        return float(num) / float(den)
    raise ValueError(f'unrecognized inch thread designation: {tdz!r}')


def thread_pitch(designation: str, thread_system: str) -> str:
    """Pitch from a thread designation, in the thread system's native unit.

      metric: 'M6X1'     -> '1'        (mm, the value after the X)
      inch:   '#4-40'    -> '0.025'    (in, 1 / threads-per-inch)
              '1/4 - 20' -> '0.05'

    Returned as the string that goes into the CSV, so re-running the step is
    a no-op rather than a float round-trip.
    """
    if thread_system == 'metric':
        m = re.search(r'[xX]\s*([\d.]+)\s*$', designation)
        if m:
            return m.group(1)
    elif thread_system == 'inch':
        m = re.search(r'-\s*([\d.]+)\s*$', designation)
        if m:
            return str(round(1 / float(m.group(1)), 6))
    raise ValueError(
        f'cannot parse pitch from {designation!r} ({thread_system})')
