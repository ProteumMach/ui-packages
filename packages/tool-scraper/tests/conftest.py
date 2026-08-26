"""No test in this suite reaches a vendor.

Every transport here goes through `fetch`, and every test that exercises one
replaces the seam it needs — `fetch.urlopen`, or the vendor function above it.
This makes the *absence* of that replacement loud instead of slow: without it,
a test that forgets to mock quietly pages a vendor's whole catalog and passes,
and the only symptom is a suite that takes thirty seconds.

Which happened while porting Destiny Tool onto the shared `fetch`, when four
tests kept patching the module they used to call directly.

Live-network tests belong in `tests/live/`, behind an environment variable and
out of CI — reaching three vendors' endpoints on every pull request is slow and
impolite.
"""

from __future__ import annotations

import pytest

from toolpath_scraper import fetch


@pytest.fixture(autouse=True)
def _no_network(monkeypatch):
    """Refuse a real request, naming the URL that asked for one."""

    def refuse(request, timeout=None):
        url = getattr(request, 'full_url', request)
        raise AssertionError(
            f'a test tried to reach {url} — mock `fetch.urlopen`, or the '
            f'vendor function above it')

    monkeypatch.setattr(fetch, 'urlopen', refuse)
