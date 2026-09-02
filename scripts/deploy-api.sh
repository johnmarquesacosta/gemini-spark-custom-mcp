#!/bin/bash
set -euo pipefail

# ============================================================
# Build & push da imagem para o Docker Hub
# ============================================================

DOCKER_USER="johnmarquesacosta"
TAG="${1:-latest}"

if [ -z "${PLATFORMS:-}" ]; then
  echo "Escolha a plataforma para build:"
  echo "1) Ambas (linux/amd64,linux/arm64) [Padrão]"
  echo "2) Apenas linux/amd64"
  echo "3) Apenas linux/arm64"
  read -p "Opção [1]: " OPTION

  case "${OPTION:-1}" in
    1) export PLATFORMS="linux/amd64,linux/arm64" ;;
    2) export PLATFORMS="linux/amd64" ;;
    3) export PLATFORMS="linux/arm64" ;;
    *) echo "Opção inválida"; exit 1 ;;
  esac
fi
API_IMAGE="${DOCKER_USER}/mcp-api:${TAG}"

# Ensure we are in the monorepo root
ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR"

echo "🐳 Iniciando deploy multi-platform (${PLATFORMS}) — tag: ${TAG}"
echo ""

# ── CI (Testes e Build Local) ───────────────────────────────
echo "🧪 Rodando pipeline de CI local..."
echo "Instalando dependências..."
pnpm install --frozen-lockfile

echo "Rodando testes..."
pnpm run test --filter=mcp-api

echo "Compilando projeto..."
pnpm run build --filter=mcp-api
echo "✅ CI local concluído com sucesso!"
echo ""

# ── Docker Build & Push ─────────────────────────────────────
if ! docker buildx inspect mcp-builder &>/dev/null; then
  echo "⚙️  Criando buildx builder: mcp-builder"
  docker buildx create --name mcp-builder --driver docker-container --bootstrap
fi
docker buildx use mcp-builder

echo "▶ Buildando e publicando API: ${API_IMAGE}"
docker buildx build \
  --file apps/mcp-api/Dockerfile \
  --platform "${PLATFORMS}" \
  --tag "${API_IMAGE}" \
  --tag "${DOCKER_USER}/mcp-api:latest" \
  --push \
  .

echo "✅ API publicada: https://hub.docker.com/r/${DOCKER_USER}/mcp-api"
echo ""
echo "   No Coolify, use o docker-compose.yml da raiz do repositório."
