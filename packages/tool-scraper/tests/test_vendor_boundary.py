"""The line between the core and the vendor adapters, asserted rather than
described.

A layout is a convention until something checks it, and the thing that erodes
this one is not malice — it is one convenient import. In the source package a
core module imported `CAD_COLUMN` from `vendors/kennametal/cad.py` for exactly
one day, which is a core module depending on a vendor's file to know the name
of a column every vendor writes. That constant is `conventions.CAD_COLUMN`
here, and this is the test that keeps it there.

Two rules, and they say different things:

1. **The core never imports a vendor.** Break it and the core stops being
   installable without that vendor, and a fact about one manufacturer becomes
   a fact about the domain.
2. **No vendor imports another vendor.** Break it and the cheapest way to add
   manufacturer three is to reach into manufacturer one's parsing, which is
   how a "shared" scraper that serves nobody gets built.

Derived from the package tree rather than from a list, so a module added
tomorrow is covered without editing this file — which is the property a counted
roster deliberately does *not* have, and the right choice here for the opposite
reason: this is a structural invariant, not an inventory.

**Rule 1 is live now; rule 2 has nothing to iterate over yet.** No adapter has
landed, so the cases that need one skip with that reason rather than passing
over the empty set — a green suite that checks nothing is the failure mode of
every structural test, and the whole point of landing this file before the
adapters is that each one arrives into a rule that is already watching.
"""

from __future__ import annotations

import ast
import pathlib

import pytest

import toolpath_scraper

PKG = pathlib.Path(toolpath_scraper.__file__).resolve().parent
ROOT = PKG.name  # the top-level package name, so a rename does not touch this
VENDORS = PKG / 'vendors'


def _modules(where: pathlib.Path) -> list[pathlib.Path]:
    """Every `.py` under `where`."""
    return sorted(where.rglob('*.py')) if where.is_dir() else []


def _imported_modules(path: pathlib.Path) -> set[str]:
    """The dotted names this file imports from within this package."""
    tree = ast.parse(path.read_text())
    names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            names.add(node.module)
        elif isinstance(node, ast.Import):
            names.update(alias.name for alias in node.names)
    return {n for n in names if n == ROOT or n.startswith(f'{ROOT}.')}


CORE = [p for p in _modules(PKG) if VENDORS not in p.parents]
VENDOR_MODULES = _modules(VENDORS)

#: Why a case is skipped, in the words step 4 will make untrue.
NO_ADAPTER_YET = (
    'no vendor adapter has landed yet — step 4 of docs/TOOL-SCRAPER-PLAN.md')

needs_an_adapter = pytest.mark.skipif(not VENDOR_MODULES, reason=NO_ADAPTER_YET)

#: `VENDOR_MODULES`, or one skipped placeholder carrying the reason.
#:
#: pytest reports an empty parameter set as a skip already, but as "got empty
#: parameter set (path)" — which reads as a broken test rather than as a rule
#: waiting for its first adapter.
VENDOR_PARAMS = VENDOR_MODULES or [pytest.param(
    None, marks=pytest.mark.skip(reason=NO_ADAPTER_YET), id='(no adapter)')]

#: The files whose job **is** to know every vendor, and nothing else.
#:
#: A composition root wires the parts together; it is the one place a
#: dependency on all of them is the point rather than a leak. `registry.py` is
#: the module that maps a brand to the adapter serving it; `cli.py` is the
#: console entry points, so one command can drive any adapter. Neither holds
#: pipeline logic — they bind and parse argv — which is what keeps the
#: exception narrow.
#:
#: **`__init__.py` is deliberately not here.** It calls `bind_adapters` and
#: re-exports nothing, so it reaches a vendor only through `registry` and is
#: held to the same rule as any other core module. Listing it would licence a
#: direct vendor import into the package's front door for no reason anything
#: needs.
#:
#: `families/` is not here either. In the source package it briefly did the
#: binding, which made the config table import a manufacturer, and the table is
#: read by every test — none of which should drag a vendor's scraper in behind
#: it. That test is this one.
#:
#: Named rather than pattern-matched, so adding a third is a deliberate edit
#: here with a reason beside it.
COMPOSITION_ROOTS = {'cli.py', 'registry.py'}


def test_the_core_is_the_shape_these_rules_assume():
    """Guards `CORE`. A tree that moved would leave the rule below iterating
    nothing, and it would report that as a pass."""
    names = {p.relative_to(PKG).as_posix() for p in CORE}

    assert {'identity.py', 'records.py', 'provenance.py', 'thread.py',
            'conventions.py'} <= names, sorted(names)


@needs_an_adapter
def test_the_vendor_tree_is_the_shape_these_rules_assume():
    """Guards `VENDOR_MODULES`. Derived rather than rostered, for the same
    reason the module lists are: an adapter that lands in the wrong shape has
    to fail here, not be absent from a list nobody updated.

    Every directory under `vendors/` is one manufacturer and carries a
    `scrape.py`, because a directory here that fetches nothing is a vendor's
    name attached to no transport."""
    brands = [p for p in VENDORS.iterdir()
              if p.is_dir() and not p.name.startswith(('_', '.'))]

    assert brands, 'vendors/ holds modules but no manufacturer directory'
    for brand in brands:
        assert (brand / '__init__.py').is_file(), brand.name
        assert (brand / 'scrape.py').is_file(), brand.name


@pytest.mark.parametrize('path', CORE, ids=lambda p: str(p.relative_to(PKG)))
def test_only_a_composition_root_imports_a_vendor(path):
    """Both directions, because an exception nobody uses is an exception that
    has quietly stopped being needed.

    A core module that needs a vendor's constant is telling you the constant
    belongs in the core — that is exactly what `CAD_COLUMN` was, and moving it
    up is what this test forces.
    """
    imported = {n for n in _imported_modules(path)
                if n.startswith(f'{ROOT}.vendors')}

    if path.name in COMPOSITION_ROOTS and path.parent == PKG:
        if not VENDOR_MODULES:
            pytest.skip(NO_ADAPTER_YET)
        assert imported, (
            f'{path.name} is listed as a composition root but imports no '
            f'adapter — drop it from COMPOSITION_ROOTS')
        return
    assert imported == set(), (
        f'{path.relative_to(PKG)} imports {sorted(imported)} — a core module '
        f'must not depend on one manufacturer')


@pytest.mark.parametrize(
    'path', VENDOR_PARAMS, ids=lambda p: str(p.relative_to(VENDORS)))
def test_no_vendor_imports_another_vendor(path):
    own = path.relative_to(VENDORS).parts[0]
    for name in _imported_modules(path):
        if not name.startswith(f'{ROOT}.vendors.'):
            continue
        other = name.split('.')[2]
        assert other == own, (
            f'{path.relative_to(VENDORS)} imports {name} — adapters share the '
            f'core, never each other')


@needs_an_adapter
def test_the_adapters_really_do_share_no_code():
    """The claim the whole layout rests on, stated once as a total.

    REGO-FIX's scraper is an Elasticsearch proxy plus a DIN 4000 reader,
    Kennametal's is an AEM table client and Destiny Tool's is a Firestore
    client; if any two ever grew a common module it would belong in the core,
    not in one of them.
    """
    brands = sorted(p.name for p in VENDORS.iterdir() if p.is_dir()
                    and not p.name.startswith('_'))

    for brand in brands:
        imported = {n for p in _modules(VENDORS / brand)
                    for n in _imported_modules(p)}
        for other in brands:
            if other == brand:
                continue
            assert not {n for n in imported if f'.vendors.{other}' in n}, brand


def test_the_core_only_names_a_vendor_in_a_string():
    """The rule stated one layer down. `identity.BRANDS` is keyed on brand
    names and `conventions.IDENTITY_DEVIATIONS` names Destiny Tool outright —
    a core module knowing *that a vendor exists* is the core doing its job. A
    core module knowing *how* one serves a table is the leak."""
    for path in CORE:
        if path.name in COMPOSITION_ROOTS and path.parent == PKG:
            continue
        assert f'{ROOT}.vendors' not in path.read_text(), path.name
