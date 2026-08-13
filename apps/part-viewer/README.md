# Part Viewer

A public, bring-your-own-key reference application for inspecting Toolpath Engine part features
and meshes. It intentionally keeps the `@toolpath/api` workflow visible and delegates HTTP,
validation, sessions, SSE, and SSR plumbing to Hono and React Router.

## Run locally

```sh
cp apps/part-viewer/.env.example apps/part-viewer/.env
# Generate a value, paste it after APP_SESSION_SECRET= in apps/part-viewer/.env, then:
openssl rand -base64 32
pnpm install
pnpm --filter @toolpath/part-viewer dev
```

`APP_SESSION_SECRET` and `TOOLPATH_API_BASE_URL` are required in every environment.
`APP_SESSION_SECRET` is the encryption key for the BYOK session cookie and must remain stable
across restarts. `TOOLPATH_API_BASE_URL` is the server-only Engine API URL; this reference app has
no default environment.

## Architecture

- `server/` is Hono-only. It seals the BYOK connection cookie with `jose`, validates requests with
  Zod, and is the sole location that constructs the Toolpath SDK.
- `server/routes/parts.ts` is the core SDK example: it creates a part through the SDK, returns its
  short-lived presigned PUT URL, then starts analysis through the SDK. The browser uploads the CAD
  file directly to object storage; Part Viewer never receives or buffers CAD bytes.
- `server/routes/analysis.ts` sends app-owned SSE. It polls the job server-side today; an Engine
  SSE implementation can replace that loop without changing the browser.
- `app/` is React Router UI only. It calls app-owned `/api/*` routes and never receives the API
  key or raw Engine artifact URLs.
- `app/shared/` holds public response contracts and pure report-to-view-model helpers.

## Request flow

1. `POST /api/session` seals a submitted API key in an encrypted, eight-hour `HttpOnly`, `Secure`,
   `SameSite=Lax` cookie.
   Engine has no authenticated identity endpoint, so the first meaningful call validates the key.
2. `POST /api/parts` calls `POST /v1/parts` and returns its short-lived, single-object PUT URL.
   The browser uploads directly to that URL, then `POST /api/parts/:partId/analyze` calls
   `POST /v1/parts/{id}/analyze` through `@toolpath/api`.
3. `GET /api/parts/:partId/events` polls `GET /v1/jobs/{id}` once every two seconds and emits a
   URL-redacted report once it succeeds.
4. `GET /api/parts/:partId/mesh` reads a report solely to obtain an artifact URL, streams it, and
   retries once with a fresh report if the URL has expired.

There is deliberately no application-level Engine-response cache. Every upstream request has one
clear owner. The viewer package still caches decoded mesh geometry, so React rerenders and camera
movement do not refetch the mesh or call Engine.

Engine diagnostics, including the configured Engine URL, are written only to the server log. Browser
responses contain generic status-bearing errors and never disclose connection configuration.

## Direct-upload CORS

The source-object bucket must allow the deployed Part Viewer origins to make `PUT` requests and
allow the `Content-Type` request header. A presigned URL grants the short-lived, object-specific
upload capability; it is visible to the browser for this direct upload, but the API key and all
report/mesh artifact URLs remain server-only. Use explicit deployment origins rather than `*`.

## Checks

```sh
pnpm --filter @toolpath/part-viewer check-types
pnpm --filter @toolpath/part-viewer test
pnpm --filter @toolpath/part-viewer build
pnpm --filter @toolpath/part-viewer test:e2e
```
