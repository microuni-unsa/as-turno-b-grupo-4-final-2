#!/usr/bin/env bash
# Backports a live-built connector from staging to the pristine repo for
# deliberate promotion (staging is disposable; connectors built live are
# DEMO-LOCAL unless backported).
# Usage (on deploy host): scripts/backport-connector.sh <name>
#   copies <staging>/connectors/<name>/ -> <repo>/connectors/<name>/
#   and prints the registerConnector + index export lines still needed in repo.
set -euo pipefail

PIMSAI_HOME="${PIMSAI_HOME:-$HOME/server-data/pimsai}"
REPO="$PIMSAI_HOME/repo"
STAGING="$PIMSAI_HOME/app"

if [ $# -ne 1 ]; then
  echo "Usage: $0 <connector-name>" >&2
  exit 2
fi
NAME="$1"

SRC="$STAGING/connectors/$NAME"
DST="$REPO/connectors/$NAME"

if [ ! -d "$SRC" ]; then
  echo "error: no live connector at $SRC" >&2
  exit 2
fi
if [ -e "$DST" ]; then
  echo "error: repo already has connectors/$NAME (merge manually)" >&2
  exit 2
fi

mkdir -p "$DST"
cp -r "$SRC/" "$DST/"
echo "backported: $SRC -> $DST"
echo "still needed in repo (manual):"
echo "  1. export * from \"./$NAME/client\"; in connectors/index.ts"
echo "  2. registerConnector({ connectorDir: \"connectors/$NAME\" }) for .omp/skills/connectors/SKILL.md"
echo "  3. review client.ts for hardcoded secrets/URLs before commit"
