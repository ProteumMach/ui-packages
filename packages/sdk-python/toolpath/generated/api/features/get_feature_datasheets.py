from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.feature_datasheets_response import FeatureDatasheetsResponse
from ...models.problem_details import ProblemDetails
from ...types import UNSET, Response


def _get_kwargs(
    *,
    ids: str,
) -> dict[str, Any]:

    params: dict[str, Any] = {}

    params["ids"] = ids

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/v1/features/datasheets",
        "params": params,
    }

    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> FeatureDatasheetsResponse | ProblemDetails | None:
    if response.status_code == 200:
        response_200 = FeatureDatasheetsResponse.from_dict(response.json())

        return response_200

    if response.status_code == 400:
        response_400 = ProblemDetails.from_dict(response.json())

        return response_400

    if response.status_code == 401:
        response_401 = ProblemDetails.from_dict(response.json())

        return response_401

    if response.status_code == 500:
        response_500 = ProblemDetails.from_dict(response.json())

        return response_500

    if response.status_code == 503:
        response_503 = ProblemDetails.from_dict(response.json())

        return response_503

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> Response[FeatureDatasheetsResponse | ProblemDetails]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,
    ids: str,
) -> Response[FeatureDatasheetsResponse | ProblemDetails]:
    """Get datasheets for a list of features

    Args:
        ids (str): Comma-separated feature ids (from a part report) to fetch datasheets for.
            Example: 0195f02c-4b4a-7b5d-9b6e-8f139d5e2820,0195f02c-4b4a-7b5d-9b6e-8f139d5e2821.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[FeatureDatasheetsResponse | ProblemDetails]
    """

    kwargs = _get_kwargs(
        ids=ids,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: AuthenticatedClient | Client,
    ids: str,
) -> FeatureDatasheetsResponse | ProblemDetails | None:
    """Get datasheets for a list of features

    Args:
        ids (str): Comma-separated feature ids (from a part report) to fetch datasheets for.
            Example: 0195f02c-4b4a-7b5d-9b6e-8f139d5e2820,0195f02c-4b4a-7b5d-9b6e-8f139d5e2821.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        FeatureDatasheetsResponse | ProblemDetails
    """

    return sync_detailed(
        client=client,
        ids=ids,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,
    ids: str,
) -> Response[FeatureDatasheetsResponse | ProblemDetails]:
    """Get datasheets for a list of features

    Args:
        ids (str): Comma-separated feature ids (from a part report) to fetch datasheets for.
            Example: 0195f02c-4b4a-7b5d-9b6e-8f139d5e2820,0195f02c-4b4a-7b5d-9b6e-8f139d5e2821.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[FeatureDatasheetsResponse | ProblemDetails]
    """

    kwargs = _get_kwargs(
        ids=ids,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient | Client,
    ids: str,
) -> FeatureDatasheetsResponse | ProblemDetails | None:
    """Get datasheets for a list of features

    Args:
        ids (str): Comma-separated feature ids (from a part report) to fetch datasheets for.
            Example: 0195f02c-4b4a-7b5d-9b6e-8f139d5e2820,0195f02c-4b4a-7b5d-9b6e-8f139d5e2821.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        FeatureDatasheetsResponse | ProblemDetails
    """

    return (
        await asyncio_detailed(
            client=client,
            ids=ids,
        )
    ).parsed
