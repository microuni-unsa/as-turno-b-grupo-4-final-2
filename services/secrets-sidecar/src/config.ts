/**
 * Centralized configuration constants for secrets sidecar service and client.
 */

export const CONFIG = {
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT || '3000', 10),
  BASE_URL: process.env.BASE_URL || 'https://secrets.pimsai.mistercricro8.top:444',
  TOKEN_EXPIRY_MS: 5 * 60 * 1000, // 5 minutes in milliseconds
  STORE_DIR: process.env.SECRETS_STORE_DIR || '/var/lib/secrets-store',
  DEFAULT_POLL_INTERVAL_MS: 1000,
  DEFAULT_POLL_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
  MAX_POLL_WAIT_SECONDS: 300,
  DEFAULT_POLL_WAIT_SECONDS: 300,
  HANDLE_PREFIX: 'secret:',
  HANDLE_REGEX: /^secret:([a-zA-Z0-9_.-]+)@v?([0-9]+)$/,
  TRAEFIK_ROUTER: 'pimsai-secrets',
  EXACT_HOST: 'secrets.pimsai.mistercricro8.top',
  TRAEFIK_NETWORK: 'internal-proxy',
  TRAEFIK_CERTRESOLVER: 'cloudflare',
  TRAEFIK_ENTRYPOINT: 'https'
} as const;
