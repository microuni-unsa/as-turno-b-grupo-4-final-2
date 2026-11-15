FROM node:20-bookworm-slim

# Install age encryption CLI, curl for healthcheck, and ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    age \
    curl \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create secrets store directory owned by unprivileged node user
RUN mkdir -p /var/lib/secrets-store && chown -R node:node /var/lib/secrets-store

# Default environment configuration (port via env)
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    BASE_URL=https://secrets.pimsai.mistercricro8.top:444 \
    SECRETS_STORE_DIR=/var/lib/secrets-store

# Copy configuration and source files
COPY --chown=node:node package.json tsconfig.json ./
COPY --chown=node:node src/ ./src/
COPY --chown=node:node client/ ./client/
COPY --chown=node:node server.ts ./

# Install dependencies and compile TypeScript
RUN corepack enable && pnpm install --frozen-lockfile=false && pnpm run build

# Run as unprivileged user
USER node

# Expose port (configured via env)
EXPOSE ${PORT}

# Healthcheck probing /healthz
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/healthz || exit 1

# Start server
CMD ["node", "dist/server.js"]
