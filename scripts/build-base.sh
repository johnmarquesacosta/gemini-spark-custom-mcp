#!/bin/bash
set -euo pipefail

# ============================================================
# Build & push da imagem base (OS + dependências pesadas)
# ============================================================

DOCKER_USER="johnmarquesacosta"
TAG="${1:-latest}"
PLATFORMS="linux/amd64,linux/arm64"
BASE_IMAGE="${DOCKER_USER}/mcp-base:${TAG}"

ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR"

echo "🐳 Iniciando build da Imagem Base (${PLATFORMS}) — tag: ${TAG}"
echo "============================================================"
echo ""

# ── Docker Build & Push ─────────────────────────────────────
if ! docker buildx inspect mcp-builder &>/dev/null; then
  echo "⚙️  Criando buildx builder: mcp-builder"
  docker buildx create --name mcp-builder --driver docker-container --bootstrap
fi
docker buildx use mcp-builder

echo "▶ Buildando e publicando a imagem base: ${BASE_IMAGE}"
docker buildx build \
  --file Dockerfile.base \
  --platform "${PLATFORMS}" \
  --tag "${BASE_IMAGE}" \
  --tag "${DOCKER_USER}/mcp-base:latest" \
  --push \
  .

echo "✅ Imagem Base publicada com sucesso: https://hub.docker.com/r/${DOCKER_USER}/mcp-base"
echo ""
