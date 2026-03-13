#!/usr/bin/env bash
# Syntropy Platform — one-shot setup: install deps and start local infra (COMP-001.5).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Installing dependencies..."
pnpm install

if [[ ! -f .env ]]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "Edit .env with your secrets before running apps."
fi

echo "Starting local infrastructure (Postgres, Redis, Kafka)..."
pnpm dev:infra

echo "Done. Run 'pnpm build' to build the workspace."
