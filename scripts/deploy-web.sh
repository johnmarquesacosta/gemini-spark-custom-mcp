#!/bin/bash
set -euo pipefail

# ============================================================
# Build & push da imagem Web para o Docker Hub
# ============================================================

DOCKER_USER="johnmarquesacosta"
TAG="${1:-latest}"
PLATFORMS="linux/amd64,linux/arm64"
WEB_IMAGE="${DOCKER_USER}/mcp-web:${TAG}"

# Ensure we are in the monorepo root
ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR"

echo "🐳 Iniciando deploy multi-platform (${PLATFORMS}) — tag: ${TAG}"
echo ""

# ── CI (Testes e Build Local) ───────────────────────────────
echo "🧪 Rodando pipeline de CI local..."
echo "Instalando dependências..."
pnpm install --frozen-lockfile

# Web might not have a test script in package.json, checking...
if pnpm --filter web run | grep -q "test"; then
  echo "Rodando testes..."
  pnpm run test --filter=web
else
  echo "Pulo: nenhum script de test encontrado no pacote web."
fi

echo "Compilando projeto..."
pnpm run build --filter=web
echo "✅ CI local concluído com sucesso!"
echo ""

# ── Docker Build & Push ─────────────────────────────────────
if ! docker buildx inspect mcp-builder &>/dev/null; then
  echo "⚙️  Criando buildx builder: mcp-builder"
  docker buildx create --name mcp-builder --driver docker-container --bootstrap
fi
docker buildx use mcp-builder

echo "▶ Buildando e publicando WEB: ${WEB_IMAGE}"
docker buildx build \
  --file apps/web/Dockerfile \
  --platform "${PLATFORMS}" \
  --tag "${WEB_IMAGE}" \
  --tag "${DOCKER_USER}/mcp-web:latest" \
  --push \
  .

echo "✅ WEB publicada: https://hub.docker.com/r/${DOCKER_USER}/mcp-web"
echo ""
echo "   No Coolify, use o docker-compose.yml da raiz do repositório."
