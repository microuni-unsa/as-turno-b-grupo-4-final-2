# ==============================================================================
# Dockerfile: files-sidecar (Upload Sidecar Service for UNSA PIMS)
# Base: Debian bookworm-slim (node:22-bookworm-slim)
# ==============================================================================

FROM node:22-bookworm-slim

# Create working directory
WORKDIR /app

# Prepare preservation directory and assign permissions to unprivileged user (node:node)
RUN mkdir -p /app/data/preserved_uploads && \
    chown -R node:node /app

# Copy application files
COPY --chown=node:node package.json tsconfig.json ./
COPY --chown=node:node server.ts ./

# Switch to unprivileged user
USER node

# Port configuration via environment variable (default 3000)
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE ${PORT}

# Healthcheck validating the service status endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start service using Node native TypeScript execution
CMD ["node", "--experimental-strip-types", "server.ts"]
