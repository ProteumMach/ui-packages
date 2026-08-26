"""Scrape cutting-tool geometry from vendor catalogs into per-vendor CSVs.

The package is a small vendor-neutral core plus one adapter per manufacturer
under `vendors/`. The line between them is **what a fact is about**: a module
under `vendors/` knows one manufacturer's transport, its column vocabulary or
its own dimension codes, and a module here knows the domain — what a tool
record is, how a guid is minted, what the ISO workpiece groups are.

Two adapters share no code with each other, and `tests/test_vendor_boundary.py`
asserts it from the package tree rather than from a list. What they share is
the core, and that sharing is the point: it is what makes two vendors'
catalogs comparable.

**Scraped output is never committed.** A CSV is a vendor's data and a working
file, not source; see `docs/TOOL-SCRAPER-PLAN.md`.

Importing this package binds every family to its adapter, so a column map that
names a field no vendor publishes is a startup error naming the family rather
than a `KeyError` from inside a mapper on row 1 of a scrape that already ran.
Nothing is re-exported: callers import the module they mean, which is what
keeps `registry` the only place that knows both halves.
"""

from __future__ import annotations

from toolpath_scraper.registry import bind_adapters

__all__: list[str] = []

bind_adapters()
