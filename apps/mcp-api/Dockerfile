# Stage base: herdado da imagem otimizada no Docker Hub
FROM johnmarquesacosta/mcp-base:latest AS base

# Stage builder: compila a API
FROM base AS builder
WORKDIR /app

# Copia arquivos de lock e manifests (camada raramente muda → boa para cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/mcp-api/package.json ./apps/mcp-api/

# Instala dependências com cache persistente do pnpm store entre builds
RUN --mount=type=cache,id=pnpm-mcp-api,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copia o código-fonte e compila
COPY apps/mcp-api ./apps/mcp-api
RUN pnpm run build --filter=mcp-api

# Stage runner: imagem final enxuta
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copia manifests e instala apenas dependências de produção
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/mcp-api/package.json ./apps/mcp-api/

RUN --mount=type=cache,id=pnpm-mcp-api,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --filter=mcp-api

# Copia os artefatos compilados do builder
COPY --from=builder /app/apps/mcp-api/dist ./apps/mcp-api/dist

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/health || exit 1

CMD ["node", "apps/mcp-api/dist/main"]
