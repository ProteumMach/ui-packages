"""Helpers for uploading part content to Engine API presigned URLs."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

import httpx


async def upload_to_presigned_url(
    upload_url: str,
    content: bytes,
    *,
    httpx_args: Mapping[str, Any] | None = None,
) -> None:
    """Upload content to the URL returned by the Engine API's create-part operation."""
    try:
        async with httpx.AsyncClient(**dict(httpx_args or {})) as client:
            response = await client.put(upload_url, content=content)
    except httpx.HTTPError as error:
        raise RuntimeError("Could not upload the part to the presigned URL") from error

    if response.is_error:
        raise RuntimeError(
            f"Could not upload the part to the presigned URL: HTTP {response.status_code}"
        )
