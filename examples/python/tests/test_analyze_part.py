import importlib.util
import tempfile
import unittest
from pathlib import Path

import httpx

MODULE_PATH = Path(__file__).parents[1] / "src" / "analyze_part.py"
SPEC = importlib.util.spec_from_file_location("analyze_part_example", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class AnalyzePartExampleTests(unittest.TestCase):
    def test_complete_workflow(self) -> None:
        report_attempts = 0

        def api_handler(request: httpx.Request) -> httpx.Response:
            nonlocal report_attempts
            self.assertEqual(request.headers["Authorization"], "Bearer test-key")
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
                return httpx.Response(
                    202,
                    json={"jobId": "job-1", "partId": "part-1", "status": "queued"},
                )
            if request.method == "GET" and request.url.path.endswith("/report"):
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
            self.assertNotIn("Authorization", request.headers)
            self.assertEqual(request.content, b"STEP fixture")
            return httpx.Response(200)

        with tempfile.TemporaryDirectory() as directory:
            file_path = Path(directory) / "fixture.step"
            file_path.write_bytes(b"STEP fixture")
            report = MODULE.analyze(
                file_path,
                api_key="test-key",
                api_url="https://api.example.test",
                api_transport=httpx.MockTransport(api_handler),
                upload_transport=httpx.MockTransport(upload_handler),
                poll_interval=0,
                sleep=lambda _: None,
                status=lambda _: None,
            )

        self.assertEqual(
            report.to_dict(),
            {
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
        self.assertEqual(report_attempts, 2)


if __name__ == "__main__":
    unittest.main()
