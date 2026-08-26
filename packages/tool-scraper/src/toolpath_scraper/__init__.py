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

Nothing is re-exported yet — the port lands module by module, and this file
grows a supported surface as it does.
"""

from __future__ import annotations

__all__: list[str] = []
