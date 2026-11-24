#!/usr/bin/env bash
# Compose wrapper for the staging-copy topology (P3.8).
# Sources the host-level .env (for ${VAR} interpolation) and runs
# `docker compose` with cwd=<staging>/.
# Usage (on deploy host): scripts/compose.sh [compose args...]
#   e.g. scripts/compose.sh ps | scripts/compose.sh logs -n 50 agent
set -euo pipefail

PIMSAI_HOME="${PIMSAI_HOME:-$HOME/server-data/pimsai}"
STAGING="$PIMSAI_HOME/app"
ENV_FILE="$PIMSAI_HOME/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "error: env file missing: $ENV_FILE" >&2
  exit 2
fi
if [ ! -f "$STAGING/docker-compose.yml" ]; then
  echo "error: staging not deployed: $STAGING (run deploy-sync.sh first)" >&2
  exit 2
fi

export PIMSAI_ENV_FILE="$ENV_FILE"
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a
cd "$STAGING"
exec docker compose "$@"
