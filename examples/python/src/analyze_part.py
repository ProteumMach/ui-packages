import argparse
import json
import os
import sys
import time
from collections.abc import Callable
from pathlib import Path
from typing import Any, NoReturn, cast
from uuid import uuid4

import httpx
from toolpath import AuthenticatedClient
from toolpath.api.parts import analyze_part, create_part, get_part_report
from toolpath.models import (
    AnalyzeJobResponse,
    CreatePartResponse,
    PartReportResponse,
    ProblemDetails,
)


def fail(operation: str, problem: object | None) -> NoReturn:
    details = problem.to_dict() if isinstance(problem, ProblemDetails) else problem
    raise RuntimeError(f"{operation}: {json.dumps(details, indent=2)}")


def analyze(
    file_path: Path,
    *,
    api_key: str,
    api_url: str = "https://api.toolpath.com",
    api_transport: httpx.BaseTransport | None = None,
    upload_transport: httpx.BaseTransport | None = None,
    poll_interval: float = 2.0,
    sleep: Callable[[float], None] = time.sleep,
    status: Callable[[str], Any] = lambda message: print(message, file=sys.stderr),
) -> PartReportResponse:
    client = AuthenticatedClient(
        base_url=api_url,
        token=api_key,
        httpx_args={"transport": api_transport} if api_transport else {},
    )
    created = create_part.sync(client=client, filename=file_path.name)
    if not isinstance(created, CreatePartResponse):
        fail("Could not create the part", created)

    with httpx.Client(transport=upload_transport) as upload_client:
        uploaded = upload_client.put(created.upload_url, content=file_path.read_bytes())
        uploaded.raise_for_status()

    queued = analyze_part.sync(
        created.part_id,
        client=client,
        idempotency_key=str(uuid4()),
    )
    if not isinstance(queued, AnalyzeJobResponse):
        fail("Could not start analysis", queued)

    status(f"Analysis started as job {queued.job_id}")
    while True:
        report = get_part_report.sync(
            created.part_id,
            client=client,
            job_id=queued.job_id,
        )
        if isinstance(report, PartReportResponse):
            return report
        if not isinstance(report, ProblemDetails) or report.status != 404:
            fail("Could not get the report", report)

        status("Waiting for the report...")
        sleep(poll_interval)


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze a CAD part with Toolpath")
    parser.add_argument("part", type=Path)
    args = parser.parse_args()
    api_key = os.environ.get("TOOLPATH_API_KEY")
    if not api_key:
        parser.error("TOOLPATH_API_KEY is required")

    report = analyze(
        cast(Path, args.part),
        api_key=api_key,
        api_url=os.environ.get("TOOLPATH_API_URL", "https://api.toolpath.com"),
    )
    print(json.dumps(report.to_dict(), indent=2))


if __name__ == "__main__":
    main()
