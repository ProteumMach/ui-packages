# Part Viewer Hono Rebuild

## Summary

The canonical application is `apps/part-viewer`: Hono owns all `/api/*` routes and the Portal's
`hono-react-router-adapter` pattern renders React Router SSR pages for every other request. The
previous implementation has been removed; root build and test scripts target the canonical
application.

## Design

- Hono owns encrypted BYOK session handling, request validation, presigned uploads, Engine calls,
  analysis SSE, mesh delivery, error responses, CSRF protection, secure headers, and the 100 MiB
  upload limit. React Router is UI only: it has no Engine loader or action.
- `jose` seals the API key in an eight-hour JWE `HttpOnly`, `SameSite=Lax` cookie, marked `Secure`
  in production. `APP_SESSION_SECRET` is required in every environment and remains stable across
  restarts.
- `TOOLPATH_API_BASE_URL` is also required in every environment. The reference app never defaults
  to staging or another Engine deployment.
- `server/engine.ts` is the only SDK construction point. Connect validates only non-empty input:
  Engine does not expose an authenticated identity endpoint, so `POST /v1/parts` is the first real
  validation of a supplied key.
- Public data uses `PublicInspectionReport`, which converts raw Engine artifact URLs into mesh /
  thumbnail availability flags. API keys and presigned URLs never enter React state, HTML, JSON
  loader data, or SSE output.
- No Engine-response cache exists. The job watcher owns polling; the ready UI owns one report
  request; mesh delivery owns its separate report read. The viewer's decoded-geometry cache remains
  responsible for avoiding mesh work on React rerenders and camera movement.

## API Flow

- `GET /api/session` returns connection state only; `POST /api/session` creates the sealed session;
  `DELETE /api/session` clears it.
- `POST /api/parts` validates a supported CAD filename and uses the typed SDK to create a part.
  The browser uploads directly to the returned short-lived PUT URL, then
  `POST /api/parts/:partId/analyze` starts analysis with a generated idempotency key.
- `GET /api/parts/:partId/events?jobId=…` uses Hono `streamSSE`; it reads a job every two seconds
  and emits queued, running, failed, or one URL-redacted ready report. A future Engine SSE source
  replaces this server loop only.
- `GET /api/parts/:partId/mesh?jobId=…&format=…` obtains an artifact URL from a report, streams the
  artifact, and retries exactly once with a freshly read report if the URL has expired.

## Verification

- Route tests cover sealed-cookie connect/disconnect, expired sessions, invalid CAD files,
  create→upload→analyze ordering, generated idempotency keys, queued/failed/ready analysis states,
  redacted SSE payloads, and single-retry mesh delivery.
- Pure tests cover report presentation, filtering, detail formatting, and ambiguous feature
  ownership. The Playwright flow mocks application resources, connects, uploads, reaches the
  inspector, focuses a feature, and confirms sensitive values do not render.
- The legacy app remains independently type-checkable and testable while review is in progress.
