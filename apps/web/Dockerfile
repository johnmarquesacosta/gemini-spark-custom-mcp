# ============================================================
# Stage 1: builder — compila shared-types + Next.js
# ============================================================
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.9.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/config/package.json        ./packages/config/
COPY apps/web/package.json               ./apps/web/

RUN pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Build shared-types antes do Next.js
RUN pnpm --filter @repo/shared-types build

# Build do Next.js (standalone para imagem enxuta)
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter web build

# ============================================================
# Stage 2: runner — imagem final
# ============================================================
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

WORKDIR /app

# Copia o output standalone do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public            ./apps/web/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/web/server.js"]
