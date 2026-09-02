# Stage base: herdado da imagem otimizada no Docker Hub
FROM johnmarquesacosta/mcp-base:latest AS base

# Stage builder: compila o app Next.js
FROM base AS builder
WORKDIR /app

# Copia arquivos de lock e manifests (camada raramente muda → boa para cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages/

# Instala dependências com cache persistente do pnpm store entre builds
RUN --mount=type=cache,id=pnpm-web,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copia o código-fonte e compila
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build --filter=web

# Stage runner: imagem final enxuta (sem deps nativas de build)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia a saída "standalone" gerada pelo Next.js (arquivos reduzidos)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
