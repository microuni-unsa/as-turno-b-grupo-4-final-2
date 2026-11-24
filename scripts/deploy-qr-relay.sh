#!/usr/bin/env bash
# Deploys a token-gated WhatsApp QR relay as a sibling container.
# Usage (on deploy host): scripts/deploy-qr-relay.sh --slug wa-qr --instance unsa-pims
# Prints the handoff URL on success. Evolution key is read from the running
# Evolution container env and never printed.
set -euo pipefail

SLUG="wa-qr"
INSTANCE="unsa-pims"
EVO_CONTAINER="pimsai-wa-evo"
PORT="8787"

while [ $# -gt 0 ]; do
  case "$1" in
    --slug) SLUG="$2"; shift 2 ;;
    --instance) INSTANCE="$2"; shift 2 ;;
    --evo-container) EVO_CONTAINER="$2"; shift 2 ;;
    --port) PORT="$2"; shift 2 ;;
    --help|-h) echo "Usage: $0 [--slug wa-qr] [--instance unsa-pims] [--evo-container pimsai-wa-evo] [--port 8787]"; exit 0 ;;
    *) echo "error: unknown argument '$1'" >&2; exit 2 ;;
  esac
done

case "$SLUG" in
  demo|files|secrets) echo "error: slug '$SLUG' is reserved" >&2; exit 2 ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELAY_SRC="$SCRIPT_DIR/../connectors/_template/qr-relay.ts"
if [ ! -f "$RELAY_SRC" ]; then
  echo "error: relay template missing: $RELAY_SRC" >&2
  exit 2
fi

# Determine docker endpoint: prefer docker-proxy (inside agent) else local daemon
if getent hosts docker-proxy >/dev/null 2>&1; then
  export DOCKER_HOST="${DOCKER_HOST:-tcp://docker-proxy:2375}"
fi

TOKEN="$(openssl rand -hex 16)"
EVOKEY="$(docker exec "$EVO_CONTAINER" printenv AUTHENTICATION_API_KEY)"
NAME="pimsai-$SLUG"

docker rm -f "$NAME" >/dev/null 2>&1 || true
docker create \
  --name "$NAME" \
  --network internal-proxy \
  --restart unless-stopped \
  -e EVO_BASE="http://$EVO_CONTAINER:8080" \
  -e "EVO_KEY=$EVOKEY" \
  -e EVO_INSTANCE="$INSTANCE" \
  -e "RELAY_TOKEN=$TOKEN" \
  -e PORT="$PORT" \
  --label traefik.enable=true \
  --label traefik.docker.network=internal-proxy \
  --label "traefik.http.routers.pimsai-$SLUG.rule=Host(\`$SLUG.pimsai.mistercricro8.top\`)" \
  --label "traefik.http.routers.pimsai-$SLUG.entrypoints=https" \
  --label "traefik.http.routers.pimsai-$SLUG.tls=true" \
  --label "traefik.http.routers.pimsai-$SLUG.tls.certresolver=cloudflare" \
  --label "traefik.http.services.pimsai-$SLUG.loadbalancer.server.port=$PORT" \
  pimsai-agent bun /tmp/server-qr-relay.ts >/dev/null
docker cp "$RELAY_SRC" "$NAME:/tmp/server-qr-relay.ts"
docker start "$NAME" >/dev/null
sleep 4

STATE="$(curl -sk --max-time 10 "https://$SLUG.pimsai.mistercricro8.top:444/api/state?t=$TOKEN" || true)"
echo "state: $STATE"
echo "URL=https://$SLUG.pimsai.mistercricro8.top:444/?t=$TOKEN"
unset EVOKEY
