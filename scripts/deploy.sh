#!/bin/bash
set -euo pipefail

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
