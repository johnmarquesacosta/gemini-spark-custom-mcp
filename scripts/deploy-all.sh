#!/bin/bash
set -euo pipefail

TAG="${1:-latest}"

ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR"

echo "🚀 Iniciando deploy COMPLETO (Base + API + WEB) — tag: ${TAG}"
echo "============================================================"
echo ""

echo "🧱 Passo 1: Construindo a Imagem Base..."
echo "------------------------------------------------------------"
./scripts/build-base.sh "$TAG"

echo ""
echo "📦 Passo 2: Fazendo deploy da API & WEB..."
echo "------------------------------------------------------------"
# O deploy.sh já chama o deploy-api e deploy-web
./scripts/deploy.sh "$TAG"

echo ""
echo "============================================================"
echo "✅ Deploy completo (Base + App) concluído com sucesso!"
