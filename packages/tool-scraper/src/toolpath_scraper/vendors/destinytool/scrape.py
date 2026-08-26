"""Destiny Tool's Firestore REST API -> a CSV of End Mill rows.

Not a page to parse: destinytool.com is a Next.js SPA built on Firebase
Studio with no product data anywhere in its HTML. Every product lives in one
Firestore collection, `products`, in project `studio-6030841929-4a1a2, and
the only transport is Firestore's own REST document API — unauthenticated
reads against it work today (confirmed 2026-08-19):

    GET https://firestore.googleapis.com/v1/projects/{project}/databases/
        (default)/documents/products
        ?pageSize=300&pageToken=<token>&mask.fieldPaths=<field>&...

`documents.list` supports no server-side filter — that needs the separate
`:runQuery` structured-query endpoint instead — so this pages through the
**whole** collection (4,309 documents as of 2026-08-19) and the caller
narrows to `type == 'End Mill'` after decoding. `pageToken` is opaque and
random-looking; nothing about pagination here assumes an order, so a page
with a token but zero documents still stops the walk rather than looping.

## Column naming, and where it differs from every other vendor here

Firestore field names carry no unit suffix — `cutDia`, not `cutDia_in` — so
the four dimensional fields (`cutDia`, `loc`, `oal`, `rad`) are written to
the CSV **with** an `_in` suffix appended here, to fit
`conventions.UNIT_SUFFIX` — the rule every other family's CSV already follows
(`D1_mm`/`D1_in` on a Kennametal table). There is no `_mm` half to publish —
Destiny Tool states every dimension in US customary fractional inches, see the
`unit` fact on `families.destinytool` — so only the `_in` column exists.

**This vendor is also the one that broke the identity convention**, and the
break is visible in the header this module writes: `itemNumber` where every
other CSV says `Material Number`. It is recorded in
`conventions.IDENTITY_DEVIATIONS` rather than corrected, because the CSV is the
receipt, and relabelling a vendor's own field in it would put a lie in the file
whose job is to record what the vendor published.

Every other field here (`itemNumber`, `type`, `description`, `series`,
`flutes`, `endStyle`, `angle`, `material`, `isoMaterialGroups`, `coatingId`) is
unitless and keeps its Firestore name verbatim — no relabelling step, because
the field *is* the vendor's own label.
"""

from __future__ import annotations

import csv
import json
import urllib.parse
import urllib.request
from pathlib import Path

PROJECT = 'studio-6030841929-4a1a2'
DOCUMENTS_URL = (
    f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/'
    f'(default)/documents/products')

USER_AGENT = 'Mozilla/5.0'

#: Fields pulled from the `products` collection — everything `records.py`
#: reads, plus `series` and `angle` for the record (unused today, but the
#: CSV is the receipt of what the vendor published, same as REGO-FIX's
#: unmapped `DIN_*` columns).
FIELDS = (
    'itemNumber', 'type', 'description', 'series', 'cutDia', 'loc', 'oal',
    'rad', 'flutes', 'endStyle', 'angle', 'material', 'isoMaterialGroups',
    'coatingId',
)

#: The dimensional subset of FIELDS — see the module docstring for why these
#: get an `_in` suffix in the CSV and the rest do not.
DIMENSIONAL_FIELDS = frozenset({'cutDia', 'loc', 'oal', 'rad'})

PAGE_SIZE = 300


def _fetch_page(token: str | None) -> dict:
    params = [('pageSize', str(PAGE_SIZE))]
    params += [('mask.fieldPaths', f) for f in FIELDS]
    if token:
        params.append(('pageToken', token))
    url = f'{DOCUMENTS_URL}?{urllib.parse.urlencode(params)}'
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


def decode_value(value: dict) -> object:
    """One Firestore `Value` -> a plain Python value.

    The REST API wraps every field in a type tag
    (`{"stringValue": "..."}`, `{"arrayValue": {"values": [...]}}`) so that a
    document can be typed without a schema; nothing downstream of this
    function should have to know that shape.
    """
    if 'stringValue' in value:
        return value['stringValue']
    if 'integerValue' in value:
        return int(value['integerValue'])
    if 'doubleValue' in value:
        return value['doubleValue']
    if 'booleanValue' in value:
        return value['booleanValue']
    if 'nullValue' in value:
        return None
    if 'arrayValue' in value:
        return [decode_value(v) for v in value['arrayValue'].get('values', [])]
    raise ValueError(f'unrecognized Firestore value shape: {sorted(value)}')


def decode_document(document: dict) -> dict:
    """One `documents.list` entry -> its fields, decoded and flattened."""
    return {k: decode_value(v) for k, v in document.get('fields', {}).items()}


def fetch_products() -> list[dict]:
    """Every document in the `products` collection, decoded, unfiltered.

    One request per `PAGE_SIZE` documents. `documents.list` returns rows in
    document-ID order, and Firestore auto-IDs are random, so nothing about
    pagination here can be an artifact of insertion order.
    """
    documents: list[dict] = []
    token = None
    while True:
        page = _fetch_page(token)
        docs = page.get('documents', [])
        documents.extend(decode_document(d) for d in docs)
        token = page.get('nextPageToken')
        if not token or not docs:
            break
    return documents


def _csv_cell(value: object) -> str:
    """A decoded Firestore value as a CSV cell.

    `isoMaterialGroups` is the one array field here; it is written space-
    separated, which is the multi-value convention every vendor's CSV follows
    (`Material Groups` on a Kennametal table) — `records.py` reads it back with
    `.split()`.
    """
    if value is None:
        return ''
    if isinstance(value, list):
        return ' '.join(str(v) for v in value)
    return str(value)


def _row(product: dict) -> dict[str, str]:
    row = {}
    for field in FIELDS:
        label = f'{field}_in' if field in DIMENSIONAL_FIELDS else field
        row[label] = _csv_cell(product.get(field))
    return row


def scrape_end_mills(out_path: str | Path) -> int:
    """Every `End Mill` row -> a CSV, sorted by item number.

    Filtering to `type == 'End Mill'` happens here rather than server-side —
    `documents.list` has no filter parameter — so the whole collection is
    fetched and narrowed after decoding. A collection with zero matching rows
    is refused rather than written as an empty CSV: it is the difference
    between "the vendor published nothing" and "this broke."
    """
    products = fetch_products()
    rows = [p for p in products if p.get('type') == 'End Mill']
    if not rows:
        raise SystemExit(
            f'{DOCUMENTS_URL}: no End Mill rows among {len(products)} '
            f'products — the schema or the type label changed')
    rows.sort(key=lambda p: p['itemNumber'])
    header = [
        f'{f}_in' if f in DIMENSIONAL_FIELDS else f for f in FIELDS]
    with open(out_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=header, restval='')
        writer.writeheader()
        writer.writerows(_row(p) for p in rows)
    return len(rows)
