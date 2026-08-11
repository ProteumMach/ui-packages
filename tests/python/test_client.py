from http import HTTPStatus
from typing import cast
from unittest import TestCase

import httpx
from toolpath import AuthenticatedClient
from toolpath.generated.api.parts import create_part, get_part_report
from toolpath.generated.models import CreatePartResponse, ProblemDetails


class GeneratedClientTests(TestCase):
    def test_installed_package_authenticates_requests_and_decodes_responses(
        self,
    ) -> None:
        requests: list[httpx.Request] = []

        def handle(request: httpx.Request) -> httpx.Response:
            requests.append(request)
            self.assertEqual(request.headers["Authorization"], "Bearer sdk-test-key")

            if request.method == "POST" and request.url.path == "/v1/parts":
                self.assertEqual(request.url.params["filename"], "fixture.step")
                return httpx.Response(
                    HTTPStatus.CREATED,
                    json={
                        "partId": "part-1",
                        "uploadUrl": "https://uploads.example.test/part-1",
                        "sourceBucket": "parts",
                        "sourceS3Key": "parts/part-1/source.step",
                    },
                )

            if (
                request.method == "GET"
                and request.url.path == "/v1/parts/missing/report"
            ):
                return httpx.Response(
                    HTTPStatus.NOT_FOUND,
                    headers={"Content-Type": "application/problem+json"},
                    json={
                        "type": "https://api.toolpath.com/problems/report-not-found",
                        "title": "Part report not found",
                        "status": 404,
                        "code": "report_not_found",
                    },
                )

            self.fail(f"Unexpected request: {request.method} {request.url}")

        client = AuthenticatedClient(
            base_url="https://api.example.test",
            token="sdk-test-key",
            httpx_args={"transport": httpx.MockTransport(handle)},
        )

        created = create_part.sync_detailed(client=client, filename="fixture.step")
        self.assertEqual(created.status_code, HTTPStatus.CREATED)
        self.assertIsInstance(created.parsed, CreatePartResponse)
        created_response = cast(CreatePartResponse, created.parsed)
        self.assertEqual(created_response.part_id, "part-1")

        problem = get_part_report.sync_detailed("missing", client=client)
        self.assertEqual(problem.status_code, HTTPStatus.NOT_FOUND)
        self.assertIsInstance(problem.parsed, ProblemDetails)
        problem_response = cast(ProblemDetails, problem.parsed)
        self.assertEqual(problem_response.code, "report_not_found")
        self.assertEqual(len(requests), 2)
