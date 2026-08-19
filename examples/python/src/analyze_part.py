import argparse
import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Any
from uuid import uuid4

from httpx_sse import aconnect_sse
from toolpath import AuthenticatedClient, upload_to_presigned_url
from toolpath.generated.api.features import get_part_features
from toolpath.generated.api.parts import create_part, get_part, update_part
from toolpath.generated.models import (
    CreatePartResponse,
    JobDetail,
    JobDetailStatus,
    PartFeaturesResponse,
    PartResponse,
    UpdatePartFeatureDetails,
    UpdatePartResponse,
)
from toolpath.generated.types import Unset


async def wait_for_job(
    api: AuthenticatedClient,
    *,
    job_id: str,
) -> JobDetail:
    async with aconnect_sse(
        api.get_async_httpx_client(), "GET", f"/v1/jobs/{job_id}/events"
    ) as events:
        events.response.raise_for_status()
        async for event in events.aiter_sse():
            if event.event != "job":
                continue

            job = JobDetail.from_dict(json.loads(event.data))
            if job.status is JobDetailStatus.RUNNING:
                print("Analyzing geometry...", file=sys.stderr)
            elif job.status is JobDetailStatus.QUEUED:
                print("Analysis is queued...", file=sys.stderr)
            if job.status in (JobDetailStatus.SUCCEEDED, JobDetailStatus.FAILED):
                return job

    raise RuntimeError("The Toolpath Engine closed the event stream before analysis completed.")


async def add_feature_datasheets(
    api: AuthenticatedClient, report: PartResponse
) -> dict[str, Any]:
    datasheets_by_tag: dict[str, dict[str, Any]] = {}
    feature_ids = list(dict.fromkeys(feature.feature_id for feature in report.features))

    for index in range(0, len(feature_ids), 50):
        response = await get_part_features.asyncio(
            str(report.part_id),
            client=api,
            ids=",".join(feature_ids[index : index + 50]),
        )
        if not isinstance(response, PartFeaturesResponse):
            raise TypeError(f"Could not get feature datasheets: {response}")
        for entry in response.datasheets:
            if entry.datasheet is not None and not isinstance(entry.datasheet, Unset):
                datasheets_by_tag[entry.feature_tag] = entry.datasheet.to_dict()

    report_data = report.to_dict()
    report_data["features"] = [
        {
            **feature.to_dict(),
            "datasheet": datasheets_by_tag.get(feature.feature_tag),
        }
        for feature in report.features
    ]
    return report_data


async def analyze(
    file_path: Path,
    *,
    api_key: str,
    api_url: str = "https://api.toolpath.com",
) -> dict[str, Any]:
    api = AuthenticatedClient(api_url, token=api_key, httpx_args={"timeout": None})
    created = await create_part.asyncio(client=api, filename=file_path.name)
    if not isinstance(created, CreatePartResponse):
        raise TypeError(f"Could not create part: {created}")

    await upload_to_presigned_url(created.upload_url, file_path.read_bytes())

    queued = await update_part.asyncio(
        str(created.part_id),
        client=api,
        feature_details=UpdatePartFeatureDetails.TRUE,
        idempotency_key=str(uuid4()),
    )
    if not isinstance(queued, UpdatePartResponse):
        raise TypeError(f"Could not start analysis: {queued}")
    print(f"Analysis started as job {queued.job_id}", file=sys.stderr)

    job = await wait_for_job(api, job_id=queued.job_id)
    if job.status is JobDetailStatus.FAILED:
        raise RuntimeError(job.error or "The Toolpath Engine could not analyze this part.")

    report = await get_part.asyncio(client=api, id=str(created.part_id), job_id=str(queued.job_id))
    if not isinstance(report, PartResponse):
        raise TypeError(f"Could not get the report: {report}")
    return await add_feature_datasheets(api, report)


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze a CAD part with Toolpath")
    parser.add_argument("part", type=Path)
    args = parser.parse_args()
    api_key = os.environ.get("TOOLPATH_API_KEY")
    if not api_key:
        parser.error("TOOLPATH_API_KEY is required")

    report = asyncio.run(
        analyze(
            args.part,
            api_key=api_key,
            api_url=os.environ.get("TOOLPATH_API_URL", "https://api.toolpath.com"),
        )
    )
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
