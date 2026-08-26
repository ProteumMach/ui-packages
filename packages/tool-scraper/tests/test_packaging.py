"""The package is importable the way a consumer gets it.

Thin on purpose, and it earns its place anyway: it is what makes the repo's
`pnpm check` gate live over this package from its first commit, rather than
passing over a directory with nothing in it to run.
"""

from __future__ import annotations

import toolpath_scraper


def test_the_package_imports_under_its_own_name():
    assert toolpath_scraper.__name__ == 'toolpath_scraper'


def test_nothing_is_exported_yet():
    """Guards the docstring's claim. When the port starts re-exporting a
    surface, this fails and is replaced by tests of that surface."""
    assert toolpath_scraper.__all__ == []
