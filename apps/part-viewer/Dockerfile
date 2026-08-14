# syntax=docker/dockerfile:1
# Part Viewer is a client-rendered React Router app served by its Hono API server.
# Build from the repository root so the local SDK, UI, and viewer workspaces are available.
ARG NODE_VERSION=24.18.0

FROM node:${NODE_VERSION}-slim AS base
RUN corepack enable && corepack prepare pnpm@10.6.5 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/part-viewer/package.json apps/part-viewer/package.json
COPY packages/sdk-typescript/package.json packages/sdk-typescript/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/viewer/package.json packages/viewer/package.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
# The app imports the SDK at runtime and packages/ui + packages/viewer while Vite bundles the SPA.
RUN pnpm --filter @toolpath/api build \
 && pnpm --filter @toolpath/ui build \
 && pnpm --filter @toolpath/viewer build \
 && pnpm --filter @toolpath/part-viewer build
# A self-contained production dependency closure keeps the runtime image independent of pnpm.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm --filter @toolpath/part-viewer deploy --legacy --prod /prod

FROM node:${NODE_VERSION}-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /prod .
EXPOSE 3000
CMD ["node_modules/.bin/tsx", "server/prod.ts"]
