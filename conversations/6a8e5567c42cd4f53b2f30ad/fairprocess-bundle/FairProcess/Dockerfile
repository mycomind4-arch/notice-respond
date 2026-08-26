# FairProcess API Server — production Docker image
# Builds the entire monorepo and runs the API server

FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies (cached layer)
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/api-server/package.json packages/api-server/
COPY packages/database/package.json packages/database/
COPY packages/audit-engine/package.json packages/audit-engine/
COPY packages/policy-engine/package.json packages/policy-engine/
COPY packages/case-model/package.json packages/case-model/
RUN pnpm install --frozen-lockfile

# Build all packages
FROM deps AS build
COPY packages/ ./packages/
RUN pnpm -r build

# Runtime image
FROM node:22-slim AS runtime
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=build /app/packages/ ./packages/
COPY --from=build /app/node_modules/ ./node_modules/
COPY packages/database/migrations/ ./packages/database/migrations/

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Run migrations on startup, then start the server
CMD ["sh", "-c", "node packages/database/dist/migrate.js up && node packages/api-server/dist/server.js"]
