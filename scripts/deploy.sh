#!/bin/bash
set -euo pipefail

TAG="${1:-latest}"

ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR"

echo "🚀 Iniciando deploy de toda a stack (API + WEB) — tag: ${TAG}"
echo "============================================================"

echo ""
echo "📦 1/2: Fazendo deploy da API..."
echo "------------------------------------------------------------"
./scripts/deploy-api.sh "$TAG"

echo ""
echo "📦 2/2: Fazendo deploy do Web..."
echo "------------------------------------------------------------"
./scripts/deploy-web.sh "$TAG"

echo ""
echo "============================================================"
echo "✅ Deploy completo de todos os serviços concluído com sucesso!"
