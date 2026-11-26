#!/usr/bin/env bash
# Staging-copy deploy (P3.8): keeps the deploy-host repo pristine and runs the
# stack from a disposable staging copy that can be wiped on every update.
#
# Layout on deploy host (PIMSAI_HOME, default ~/server-data/pimsai):
#   repo/     pristine checkout — rsync target from workstation, NEVER mounted.
#   app/      disposable staging copy — compose cwd + `.:/app` bind. Wipe freely.
#   .env      host-level secrets — passed via PIMSAI_ENV_FILE, never bind-mounted.
#
# Usage (on deploy host):
#   PIMSAI_HOME=~/server-data/pimsai scripts/deploy-sync.sh [--wipe] [--build] [--no-up]
#   --wipe   rm -rf staging before sync (default: rsync --delete only)
#   --build  docker compose build after sync
#   --no-up  skip `docker compose up -d` (sync only)
set -euo pipefail

PIMSAI_HOME="${PIMSAI_HOME:-$HOME/server-data/pimsai}"
REPO="$PIMSAI_HOME/repo"
STAGING="$PIMSAI_HOME/app"
ENV_FILE="$PIMSAI_HOME/.env"

WIPE=0
BUILD=0
DO_UP=1

while [ $# -gt 0 ]; do
  case "$1" in
    --wipe) WIPE=1; shift ;;
    --build) BUILD=1; shift ;;
    --no-up) DO_UP=0; shift ;;
    --help|-h) sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "error: unknown argument '$1'" >&2; exit 2 ;;
  esac
done

if [ ! -d "$REPO" ]; then
  echo "error: repo dir missing: $REPO (rsync the working tree there first)" >&2
  exit 2
fi
if [ ! -f "$ENV_FILE" ]; then
  echo "error: env file missing: $ENV_FILE" >&2
  exit 2
fi

if [ "$WIPE" = 1 ]; then
  echo "wiping staging: $STAGING"
  rm -rf "$STAGING"
fi
mkdir -p "$STAGING"

echo "syncing repo -> staging (excludes keep runtime-only + dev-only out)..."
rsync -a --delete \
  --exclude='/.env' \
  --exclude='/.enc.env' \
  --exclude='/.sops.yaml' \
  --exclude='/data/' \
  --exclude='/secrets/' \
  --exclude='/corpus_mirror/' \
  --exclude='/.playwright-mcp/' \
  --exclude='/prompt*' \
  --exclude='/omp-session-*' \
  --exclude='/docs/' \
  --exclude='/corpus_g4_src/' \
  --exclude='/CHECK.md' \
  --exclude='/CHECK*' \
  --exclude='/FIXUP_PLAN.md' \
  --exclude='.git/' \
  --exclude='/flake.*' \
  --exclude='node_modules/' \
  --exclude='/apps/web/client/node_modules/' \
  --exclude='/apps/web/client/dist/' \
  --exclude='.direnv/' \
  "$REPO/" "$STAGING/"

export PIMSAI_ENV_FILE="$ENV_FILE"
# Export host env into the shell so compose `${VAR}` interpolation resolves
# (env_file alone does NOT feed interpolation — only container env).
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a
cd "$STAGING"

if [ "$BUILD" = 1 ]; then
  echo "building images..."
  docker compose build
fi

if [ "$DO_UP" = 1 ]; then
  echo "starting stack from staging..."
  docker compose up -d
  docker compose ps --format '{{.Name}} {{.Status}}'
fi

echo "deploy-sync done: repo=$REPO staging=$STAGING"
