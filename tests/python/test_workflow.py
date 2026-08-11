import tempfile
from pathlib import Path
from unittest import IsolatedAsyncioTestCase

import httpx
from toolpath import Toolpath, ToolpathWorkflowError


class WorkflowTests(IsolatedAsyncioTestCase):
    async def test_runs_async_analysis_workflow(self) -> None:
        report_attempts = 0
        statuses: list[str] = []

        def api_handler(request: httpx.Request) -> httpx.Response:
            nonlocal report_attempts
            self.assertEqual(request.headers["Authorization"], "Bearer sdk-test-key")
            if request.method == "POST" and request.url.path == "/v1/parts":
                return httpx.Response(
                    201,
                    json={
                        "partId": "part-1",
                        "uploadUrl": "https://uploads.example.test/part-1",
                        "sourceBucket": "parts",
                        "sourceS3Key": "parts/part-1/source.step",
                    },
                )
            if request.method == "POST" and request.url.path.endswith("/analyze"):
                self.assertTrue(request.headers["Idempotency-Key"])
                return httpx.Response(
                    202, json={"jobId": "job-1", "partId": "part-1", "status": "queued"}
                )
            if request.method == "GET":
                report_attempts += 1
                if report_attempts == 1:
                    return httpx.Response(
                        404,
                        json={
                            "type": "https://api.toolpath.com/problems/report-not-found",
                            "title": "Part report not found",
                            "status": 404,
                            "code": "report_not_found",
                        },
                    )
                return httpx.Response(
                    200,
                    json={
                        "partId": "part-1",
                        "reportId": "report-1",
                        "jobId": "job-1",
                        "kernelVersion": "test",
                        "units": {"length": "mm", "angle": "rad"},
                        "regions": [],
                        "features": [],
                        "candidateDirections": [],
                        "meshPointCount": 0,
                        "meshTriangleCount": 0,
                        "thumbnailUrl": None,
                        "meshStlUrl": None,
                        "meshGlbUrl": None,
                        "downloadMs": 1,
                        "analysisMs": 2,
                        "totalMs": 3,
                    },
                )
            self.fail(f"Unexpected request: {request.method} {request.url}")

        def upload_handler(request: httpx.Request) -> httpx.Response:
            self.assertEqual(request.method, "PUT")
            self.assertEqual(request.content, b"STEP fixture")
            return httpx.Response(200)

        with tempfile.TemporaryDirectory() as directory:
            file_path = Path(directory) / "fixture.step"
            file_path.write_bytes(b"STEP fixture")
            toolpath = Toolpath(
                "sdk-test-key",
                base_url="https://api.example.test",
                httpx_args={"transport": httpx.MockTransport(api_handler)},
                upload_httpx_args={"transport": httpx.MockTransport(upload_handler)},
            )
            report = await toolpath.analyze_part(
                str(file_path), poll_interval_seconds=0, on_status=statuses.append
            )

        self.assertEqual(report.part_id, "part-1")
        self.assertEqual(report_attempts, 2)
        self.assertEqual(
            statuses, ["Analysis started as job job-1", "Waiting for the report..."]
        )

    async def test_identifies_workflow_failures(self) -> None:
        problem = {
            "type": "https://api.toolpath.com/problems/failed",
            "title": "Request failed",
            "status": 500,
            "code": "failed",
        }
        for stage in ("create", "upload", "analyze", "report"):
            with self.subTest(stage=stage), tempfile.TemporaryDirectory() as directory:
                file_path = Path(directory) / "fixture.step"
                file_path.write_bytes(b"STEP fixture")

                def api_handler(
                    request: httpx.Request, _stage: str = stage
                ) -> httpx.Response:
                    if request.method == "POST" and request.url.path == "/v1/parts":
                        return (
                            httpx.Response(500, json=problem)
                            if _stage == "create"
                            else httpx.Response(
                                201,
                                json={
                                    "partId": "part-1",
                                    "uploadUrl": "https://uploads.example.test/part-1",
                                    "sourceBucket": "parts",
                                    "sourceS3Key": "parts/part-1/source.step",
                                },
                            )
                        )
                    if request.method == "POST":
                        return (
                            httpx.Response(500, json=problem)
                            if _stage == "analyze"
                            else httpx.Response(
                                202,
                                json={
                                    "jobId": "job-1",
                                    "partId": "part-1",
                                    "status": "queued",
                                },
                            )
                        )
                    return httpx.Response(500, json=problem)

                def upload_handler(
                    request: httpx.Request, _stage: str = stage
                ) -> httpx.Response:
                    return httpx.Response(500 if _stage == "upload" else 200)

                toolpath = Toolpath(
                    "sdk-test-key",
                    httpx_args={"transport": httpx.MockTransport(api_handler)},
                    upload_httpx_args={
                        "transport": httpx.MockTransport(upload_handler)
                    },
                )
                with self.assertRaises(ToolpathWorkflowError) as raised:
                    await toolpath.analyze_part(str(file_path), poll_interval_seconds=0)
                self.assertEqual(raised.exception.stage, stage)
