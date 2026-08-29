# Stage 1: builder - compila a API
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.9.0 --activate

WORKDIR /app

# Copia arquivos da raiz do monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/mcp-api/package.json ./apps/mcp-api/

# Instala todas as dependências
RUN pnpm install --frozen-lockfile

# Copia o código-fonte do app
COPY apps/mcp-api ./apps/mcp-api

# Compila a API
RUN pnpm run build --filter=mcp-api

# Stage 2: runner - imagem final enxuta
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.9.0 --activate
RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

# Copia arquivos para produção
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/mcp-api/package.json ./apps/mcp-api/

# Instala somente dependências de produção do mcp-api
RUN pnpm install --frozen-lockfile --prod --filter=mcp-api

# Copia os arquivos compilados do builder
COPY --from=builder /app/apps/mcp-api/dist ./apps/mcp-api/dist

EXPOSE 3001

ENV NODE_ENV=production

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/health || exit 1

CMD ["node", "apps/mcp-api/dist/main"]
