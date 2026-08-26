"""Vendor identity: which brands this package knows, and how records are named.

Kept apart from the adapters because every one of them needs it — a scraper
resolves a brand to a host and, on the two AEM brands, to a component node;
record identity resolves the same brand to a `vendor` string, a product URL
and the UUID namespace its records are minted under.

**Every record's guid is minted in its own brand's namespace.** That is what
makes a guid collision across brands structurally impossible rather than
merely unlikely: a material number is a vendor-local integer, and nothing
reserves `100003658` to Kennametal. Until 2026-08-07 every record — WIDIA's
included — was minted under one namespace keyed on Kennametal's home page,
which was harmless while the two brands shared a number space by accident and
is the wrong shape the moment a third vendor exists.

The preset namespace is deliberately absent. Presets are the conversion half,
which stays in `tool_catalog` (see `docs/TOOL-SCRAPER-PLAN.md`, decision 1),
and a constant nothing here reads would be a pinned value with nothing pinning
it.
"""

from __future__ import annotations

import uuid

# WIDIA is Kennametal's sister brand on the same AEM/Hybris platform; only
# the host, the AEM component node and the vendor string differ. Families
# default to kennametal unless their config names a brand. `node` is read off
# a family page's data-path attribute when a new brand turns up.
#
# **`node` is AEM-specific and therefore optional** (2026-08-07). It names the
# component that serves a family's variant table, which is a fact about
# Kennametal's platform and not about vendors in general — REGO-FIX is a
# Drupal site with an Elasticsearch proxy and has no such node. The Kennametal
# scraper is the only reader; a brand without a `node` simply cannot be passed
# to it.
#
# **`home` is the guid namespace seed and is stated rather than derived.** It
# used to be built as `https://www.{host}`, which is right for the two AEM
# brands and wrong for a host that carries its own subdomain — REGO-FIX would
# have been minted under the nonsense URL `https://www.us.rego-fix.com`.
# Kennametal's and WIDIA's values are written out verbatim so that making it
# explicit churns no existing guid.
BRANDS: dict[str, dict[str, str]] = {
    'kennametal': {
        'host': 'kennametal.com',
        'home': 'https://www.kennametal.com',
        'node': 'product_variants',
        'vendor': 'Kennametal',
        'product_link': 'https://www.kennametal.com/us/en/products/p.{material}.html',
    },
    'widia': {
        'host': 'widia.com',
        'home': 'https://www.widia.com',
        'node': 'product_variants_cop',
        'vendor': 'WIDIA',
        'product_link': 'https://www.widia.com/us/en/products/p.{material}.html',
    },
    # REGO-FIX publishes no per-part page: the Drupal node behind a part
    # redirects to `/products`, and the only place a single part is addressable
    # is the ProductFinder, whose Searchkit `SearchBox` has the default
    # accessor id `q` and queries `field_sku_fulltext` among others (read off
    # `searchkit-starter-app/build/static/js/main.d1ba5577.js`, JG 2026-08-07).
    # So the link is a search for the part number rather than a page about it,
    # which is what the vendor actually offers.
    'regofix': {
        'host': 'us.rego-fix.com',
        'home': 'https://us.rego-fix.com',
        'vendor': 'REGO-FIX',
        'product_link': 'https://us.rego-fix.com/en/productfinder?q={material}',
    },
    # Destiny Tool is a Next.js SPA with no product data in the HTML at all —
    # it reads live from a Firestore database. Like REGO-FIX there is no
    # per-part page to link to, only a client-rendered products list; unlike
    # REGO-FIX's ProductFinder, nothing here has confirmed a search query
    # parameter the SPA actually reads, so this is a best-effort link to the
    # listing page rather than a verified deep link (JG 2026-08-19).
    'destinytool': {
        'host': 'destinytool.com',
        'home': 'https://destinytool.com',
        'vendor': 'Destiny Tool',
        'product_link': 'https://destinytool.com/products?search={material}',
    },
}


def vendor_namespace(brand: str) -> uuid.UUID:
    """The UUID namespace records of `brand` are minted under.

    Seeded from the brand's own home page, so a new brand gets a distinct
    namespace for free. Deterministic across machines and runs, which is the
    whole point: tool guids are the join key for every downstream consumer of
    a scrape.

    Kennametal's value is unchanged from the single namespace this package
    used before 2026-08-07 — the migration therefore churned WIDIA's six tools
    and nothing else.
    """
    return uuid.uuid5(uuid.NAMESPACE_URL, BRANDS[brand]['home'])


def product_link(brand: str, material: str) -> str:
    """The vendor's own page for one orderable part.

    Per-brand rather than one template, because the shape is not shared: the
    two AEM brands serve a product page per material number, REGO-FIX serves
    none at all and is linked into its ProductFinder instead. A single format
    string with a `{host}` hole encoded the AEM path as though it were
    universal.
    """
    return BRANDS[brand]['product_link'].format(material=material)


def record_guid(brand: str, material: str) -> str:
    """The stable guid for one orderable part, from its vendor material number.

    One function because tools and toolholding must mint identically: a holder
    and a tool are different kinds of record but they share a guid space, and
    a consumer that builds a catalog from both refuses a collision between
    them.
    """
    return str(uuid.uuid5(vendor_namespace(brand), material))
