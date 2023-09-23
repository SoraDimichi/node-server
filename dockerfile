FROM node:18-slim AS base
ENV PNPM_HOME="/pnpm"
ENV API_PORT=${API_PORT}
ENV STAT_PORT=${STAT_PORT}
ENV PATH="$PNPM_HOME:$PATH"
ENV ENV=${ENV}
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build
RUN ls

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 8000 8001