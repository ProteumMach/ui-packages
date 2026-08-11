from __future__ import annotations

import asyncio
from collections.abc import Callable, Mapping
from pathlib import Path
from typing import Any, Literal
from uuid import uuid4

import httpx

from .generated.api.parts import analyze_part as generated_analyze_part
from .generated.api.parts import create_part, get_part_report
from .generated.client import AuthenticatedClient
from .generated.models import AnalyzeJobResponse, CreatePartResponse, PartReportResponse, ProblemDetails

WorkflowStage = Literal["create", "upload", "analyze", "report"]


class ToolpathWorkflowError(RuntimeError):
    """A failure in a high-level Toolpath SDK workflow."""

    def __init__(self, stage: WorkflowStage, message: str, details: object | None = None) -> None:
        super().__init__(message)
        self.stage = stage
        self.details = details


def _problem_message(problem: object | None) -> str:
    if isinstance(problem, ProblemDetails):
        return str(problem.to_dict())
    return str(problem) if problem is not None else "Unknown API error"


class Toolpath:
    """Async façade for Toolpath's supported workflows."""

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = "https://api.toolpath.com",
        httpx_args: Mapping[str, Any] | None = None,
        upload_httpx_args: Mapping[str, Any] | None = None,
    ) -> None:
        self.api = AuthenticatedClient(
            base_url=base_url,
            token=api_key,
            httpx_args=dict(httpx_args or {}),
        )
        self._upload_httpx_args = dict(upload_httpx_args or {})

    async def analyze_part(
        self,
        file_path: str,
        *,
        idempotency_key: str | None = None,
        poll_interval_seconds: float = 2.0,
        on_status: Callable[[str], None] | None = None,
    ) -> PartReportResponse:
        """Upload a local part file, analyze it, and wait for its report."""
        path = Path(file_path)
        try:
            contents = await asyncio.to_thread(path.read_bytes)
        except OSError as error:
            raise ToolpathWorkflowError("upload", f"Could not read part file: {path}") from error

        created = await create_part.asyncio(client=self.api, filename=path.name)
        if not isinstance(created, CreatePartResponse):
            raise ToolpathWorkflowError("create", f"Could not create the part: {_problem_message(created)}", created)

        try:
            async with httpx.AsyncClient(**self._upload_httpx_args) as upload_client:
                uploaded = await upload_client.put(created.upload_url, content=contents)
        except httpx.HTTPError as error:
            raise ToolpathWorkflowError("upload", "Could not upload the part") from error
        if uploaded.is_error:
            raise ToolpathWorkflowError("upload", f"Could not upload the part: HTTP {uploaded.status_code}", uploaded)

        queued = await generated_analyze_part.asyncio(
            created.part_id,
            client=self.api,
            idempotency_key=idempotency_key or str(uuid4()),
        )
        if not isinstance(queued, AnalyzeJobResponse):
            raise ToolpathWorkflowError("analyze", f"Could not start analysis: {_problem_message(queued)}", queued)

        if on_status:
            on_status(f"Analysis started as job {queued.job_id}")
        while True:
            report = await get_part_report.asyncio(
                created.part_id,
                client=self.api,
                job_id=queued.job_id,
            )
            if isinstance(report, PartReportResponse):
                return report
            if not isinstance(report, ProblemDetails) or report.status != 404:
                raise ToolpathWorkflowError("report", f"Could not get the report: {_problem_message(report)}", report)

            if on_status:
                on_status("Waiting for the report...")
            await asyncio.sleep(poll_interval_seconds)
