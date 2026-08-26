"""Record identity: one guid space per vendor, and what shares it.

A guid is the join key for every downstream consumer of a scrape, so what
these pin is not arithmetic — it is that the arithmetic never moves.

Ported from the source package with the two cases that reach the conversion
half left behind: they assert a converted tool's and a converted holder's guid,
and neither converter is in this package. What they were really testing — that
a brand's records are minted in that brand's namespace — is
`test_two_vendors_sharing_a_material_number_do_not_share_a_guid` below, and it
holds without them.
"""

from __future__ import annotations

import uuid

import pytest

from toolpath_scraper.identity import (
    BRANDS,
    product_link,
    record_guid,
    vendor_namespace,
)

# The single namespace this package minted every record under before
# 2026-08-07, spelled out rather than imported. Kennametal's per-vendor
# namespace has to equal it, or the migration to per-vendor namespaces churned
# 793 Kennametal guids as well as the six WIDIA ones — and every stored cart
# line, bookmark and saved order that named one would have gone stale.
HISTORICAL_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_URL, 'https://www.kennametal.com')


def test_kennametal_guids_are_unchanged_by_the_move_to_per_vendor_namespaces():
    assert vendor_namespace('kennametal') == HISTORICAL_NAMESPACE


def test_the_port_did_not_move_a_single_guid():
    """The whole point of copying `BRANDS` verbatim rather than deriving
    `home` from `host`. A guid minted here has to equal the one the source
    package minted for the same part, or every catalog built from an earlier
    scrape is stale on the day this package first runs."""
    assert record_guid('widia', '5872291') == str(
        uuid.uuid5(uuid.uuid5(uuid.NAMESPACE_URL, 'https://www.widia.com'),
                   '5872291'))
    assert record_guid('regofix', '2130.70610') == str(
        uuid.uuid5(uuid.uuid5(uuid.NAMESPACE_URL, 'https://us.rego-fix.com'),
                   '2130.70610'))


def test_every_brand_gets_its_own_namespace():
    namespaces = {brand: vendor_namespace(brand) for brand in BRANDS}
    assert len(set(namespaces.values())) == len(BRANDS), namespaces


def test_two_vendors_sharing_a_material_number_do_not_share_a_guid():
    # The failure this prevents: a material number is a vendor-local integer,
    # and nothing reserves one to Kennametal. Under a single namespace the two
    # records below were the same guid, and the second silently shadowed the
    # first in every lookup a catalog builds.
    assert record_guid('kennametal', '100003658') != record_guid('widia', '100003658')


def test_a_guid_is_stable_across_calls():
    assert record_guid('widia', '5872291') == record_guid('widia', '5872291')


def test_an_unknown_brand_is_refused_rather_than_given_a_namespace_of_its_own():
    # Not defensive: a typo'd brand that minted a namespace anyway would
    # produce guids no re-run reproduces, which is the one property this
    # module exists to guarantee.
    with pytest.raises(KeyError):
        vendor_namespace('sandvik')


def test_a_product_link_is_per_brand_because_the_shape_is_not_shared():
    """One format string with a `{host}` hole encoded the AEM product path as
    though it were universal. Two of the four brands publish no per-part page
    at all, and linking a search is the honest answer rather than a 404."""
    assert product_link('kennametal', '4151623') == (
        'https://www.kennametal.com/us/en/products/p.4151623.html')
    assert product_link('regofix', '2130.70610') == (
        'https://us.rego-fix.com/en/productfinder?q=2130.70610')


def test_every_brand_carries_what_identity_reads_off_it():
    """`node` is deliberately absent from two of them — it names an AEM
    component, which is a fact about Kennametal's platform and not about
    vendors in general. The other four keys are read for every brand."""
    for brand, cfg in BRANDS.items():
        assert {'host', 'home', 'vendor', 'product_link'} <= set(cfg), brand
        assert cfg['home'].startswith('https://'), brand
        assert '{material}' in cfg['product_link'], brand
    assert {b for b, cfg in BRANDS.items() if 'node' in cfg} == {
        'kennametal', 'widia'}
