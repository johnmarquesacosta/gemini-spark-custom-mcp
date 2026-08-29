FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
# Necessário para algumas dependências nativas
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia os arquivos de lock e config do workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copia os pacotes e package.json do web para instalar dependências
COPY apps/web/package.json ./apps/web/
# Se houver pacotes internos no futuro, copia-os também
COPY packages ./packages/

# Instala as dependências de forma otimizada usando cache do docker
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copia o código-fonte restante
COPY . .

# Faz o build do app web
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build --filter=web

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia a saída "standalone" gerada pelo Next.js (arquivos reduzidos)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Se você criar uma pasta public no futuro, descomente a linha abaixo:
# COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# O Next.js no modo standalone dentro de monorepos reproduz a estrutura de pastas
CMD ["node", "apps/web/server.js"]
