import argparse
import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Any

from toolpath import Toolpath
from toolpath.generated.models import PartReportResponse


async def analyze(
    file_path: Path,
    *,
    api_key: str,
    api_url: str = "https://api.toolpath.com",
    httpx_args: dict[str, Any] | None = None,
    upload_httpx_args: dict[str, Any] | None = None,
    poll_interval_seconds: float = 2.0,
) -> PartReportResponse:
    toolpath = Toolpath(
        api_key,
        base_url=api_url,
        httpx_args=httpx_args,
        upload_httpx_args=upload_httpx_args,
    )
    return await toolpath.analyze_part(
        str(file_path),
        poll_interval_seconds=poll_interval_seconds,
        on_status=lambda message: print(message, file=sys.stderr),
    )


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
    print(json.dumps(report.to_dict(), indent=2))


if __name__ == "__main__":
    main()
