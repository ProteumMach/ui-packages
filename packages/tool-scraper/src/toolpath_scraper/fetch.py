"""The polite stdlib GET every transport here was copying.

Three vendors, three unrelated transports — an AEM variant-table GET, a
Firestore REST walk, an Elasticsearch proxy POST — and all three arrived at the
same four lines: build a `Request`, set a browser `User-Agent`, `urlopen` with a
timeout, decode. Four copies of four lines is not expensive; four copies of the
*decisions* in them is, because the decisions are the part that has to be
consistent. A vendor whose transport needs something else — a session, a
retry policy, a browser — keeps it in its own module rather than widening this
one.

**The `User-Agent` is not evasion.** These are unauthenticated, publicly
served endpoints; a default Python agent gets a 403 from ordinary CDN rules on
two of the three hosts, and the request is otherwise exactly what a browser on
the vendor's own page makes.

**`urlopen` is imported by name**, so a test can replace `fetch.urlopen` and
stub one module rather than reaching into `urllib.request` and changing it for
the whole interpreter.
"""

from __future__ import annotations

import json
from typing import Any
from urllib.request import Request, urlopen

#: What every request here identifies as. See the module docstring.
USER_AGENT = 'Mozilla/5.0'

#: Seconds. Long, because a vendor's variant table for a 259-row family is a
#: slow render on their side and a timeout would read as a scrape failure.
TIMEOUT = 60


def _open(url: str, data: bytes | None = None,
          headers: dict[str, str] | None = None, timeout: int = TIMEOUT) -> Any:
    """The one `urlopen` call in this package, as a context manager.

    `Any` because what `urlopen` returns depends on the scheme — an
    `HTTPResponse` here, something else for `file:` — and the four callers below
    use only `read()`.
    """
    request = Request(url, data=data,
                      headers={'User-Agent': USER_AGENT, **(headers or {})})
    return urlopen(request, timeout=timeout)


def get_bytes(url: str, timeout: int = TIMEOUT) -> bytes:
    """One GET, verbatim. For anything that is not text — a STEP model."""
    with _open(url, timeout=timeout) as response:
        return response.read()


def get_text(url: str, timeout: int = TIMEOUT) -> str:
    """One GET, decoded as UTF-8.

    `errors='replace'` because these are vendor HTML and XML documents that
    occasionally carry a stray byte in a description, and refusing the whole
    257-row table over one of them would lose the 256 good rows to no purpose.
    """
    with _open(url, timeout=timeout) as response:
        return response.read().decode('utf-8', errors='replace')


def get_json(url: str, timeout: int = TIMEOUT) -> Any:
    """One GET, parsed as JSON.

    Strict UTF-8, unlike `get_text`: a JSON document with an undecodable byte
    in it is a broken response, and replacing the byte would hand the parser a
    document the server never sent.
    """
    with _open(url, timeout=timeout) as response:
        return json.loads(response.read().decode('utf-8'))


def post_json(url: str, payload: Any, timeout: int = TIMEOUT) -> Any:
    """One POST of a JSON body, parsed as JSON."""
    body = json.dumps(payload).encode('utf-8')
    with _open(url, data=body, headers={'Content-Type': 'application/json'},
               timeout=timeout) as response:
        return json.loads(response.read().decode('utf-8'))
