#!/usr/bin/env bash
# Atualiza o your-tab na VPS. Idempotente: pode rodar quantas vezes quiser.
# Uso (em /opt/your-tab): ./scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "falta o .env (cp .env.example .env)"; exit 1; }

if ! docker network inspect proxy >/dev/null 2>&1; then
  echo "rede 'proxy' não existe: suba o edge antes (/opt/infra/edge)"
  exit 1
fi

echo "== git pull =="
git pull --ff-only

echo "== build + up =="
# --wait: só termina quando mongo, api e web estiverem saudáveis
docker compose up -d --build --wait --wait-timeout 180

echo "== status =="
docker compose ps

# Remove só imagens órfãs (as camadas antigas do build); imagens com tag ficam
echo "== limpeza =="
docker image prune -f >/dev/null 2>&1 || echo "   image prune falhou (seguindo em frente)"
