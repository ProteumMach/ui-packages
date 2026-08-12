from http import HTTPStatus
from typing import Any

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.compute_feature_datasheets_request import ComputeFeatureDatasheetsRequest
from ...models.compute_feature_datasheets_response import ComputeFeatureDatasheetsResponse
from ...models.problem_details import ProblemDetails
from ...types import UNSET, Response, Unset


def _get_kwargs(
    *,
    body: ComputeFeatureDatasheetsRequest | Unset = UNSET,
) -> dict[str, Any]:
    headers: dict[str, Any] = {}

    _kwargs: dict[str, Any] = {
        "method": "post",
        "url": "/v1/features/datasheets",
    }

    if not isinstance(body, Unset):
        _kwargs["json"] = body.to_dict()

    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: AuthenticatedClient | Client, response: httpx.Response
) -> ComputeFeatureDatasheetsResponse | ProblemDetails | None:
    if response.status_code == 202:
        response_202 = ComputeFeatureDatasheetsResponse.from_dict(response.json())

        return response_202

    if response.status_code == 400:
        response_400 = ProblemDetails.from_dict(response.json())

        return response_400

    if response.status_code == 401:
        response_401 = ProblemDetails.from_dict(response.json())

        return response_401

    if response.status_code == 404:
        response_404 = ProblemDetails.from_dict(response.json())

        return response_404

    if response.status_code == 409:
        response_409 = ProblemDetails.from_dict(response.json())

        return response_409

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
) -> Response[ComputeFeatureDatasheetsResponse | ProblemDetails]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: ComputeFeatureDatasheetsRequest | Unset = UNSET,
) -> Response[ComputeFeatureDatasheetsResponse | ProblemDetails]:
    """Queue datasheet computation for a list of features

    Args:
        body (ComputeFeatureDatasheetsRequest | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[ComputeFeatureDatasheetsResponse | ProblemDetails]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: AuthenticatedClient | Client,
    body: ComputeFeatureDatasheetsRequest | Unset = UNSET,
) -> ComputeFeatureDatasheetsResponse | ProblemDetails | None:
    """Queue datasheet computation for a list of features

    Args:
        body (ComputeFeatureDatasheetsRequest | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        ComputeFeatureDatasheetsResponse | ProblemDetails
    """

    return sync_detailed(
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,
    body: ComputeFeatureDatasheetsRequest | Unset = UNSET,
) -> Response[ComputeFeatureDatasheetsResponse | ProblemDetails]:
    """Queue datasheet computation for a list of features

    Args:
        body (ComputeFeatureDatasheetsRequest | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[ComputeFeatureDatasheetsResponse | ProblemDetails]
    """

    kwargs = _get_kwargs(
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient | Client,
    body: ComputeFeatureDatasheetsRequest | Unset = UNSET,
) -> ComputeFeatureDatasheetsResponse | ProblemDetails | None:
    """Queue datasheet computation for a list of features

    Args:
        body (ComputeFeatureDatasheetsRequest | Unset):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        ComputeFeatureDatasheetsResponse | ProblemDetails
    """

    return (
        await asyncio_detailed(
            client=client,
            body=body,
        )
    ).parsed
