# syntax=docker/dockerfile:1
FROM debian:bookworm-slim

# Prevent interactive prompts during apt operations
ENV DEBIAN_FRONTEND=noninteractive

# Build arguments for pinned versions
ARG BUN_VERSION=1.2.4
ARG NODE_VERSION=22.14.0
ARG PNPM_VERSION=12.9.0
ARG TYPST_VERSION=0.15.0
ARG OMP_VERSION=18.18.1

# Install baseline OS dependencies, Chromium, Python, PDF/OCR tools, age, postgresql-client, docker CLI, curl, git
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    chromium \
    curl \
    git \
    postgresql-client \
    docker.io \
    age \
    xz-utils \
    tar \
    unzip \
    libstdc++6 \
    zlib1g \
    procps \
    python3 \
    python3-pip \
    python3-venv \
    poppler-utils \
    mupdf-tools \
    ghostscript \
    tesseract-ocr \
    tesseract-ocr-spa \
    tesseract-ocr-eng \
    jq \
    ripgrep \
    file \
    fontconfig \
    fonts-liberation \
    fonts-dejavu-core \
    fonts-noto-core \
    fonts-crosextra-carlito \
    && rm -rf /var/lib/apt/lists/*

# Install uv / uvx (multi-arch via official installer)
RUN set -eux; \
    curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR=/usr/local/bin UV_NO_MODIFY_PATH=1 sh; \
    chmod +x /usr/local/bin/uv /usr/local/bin/uvx

# Install Bun (multi-arch support)
RUN set -eux; \
    ARCH="$(uname -m)"; \
    case "$ARCH" in \
        x86_64) BUN_ARCH="x64" ;; \
        aarch64|arm64) BUN_ARCH="aarch64" ;; \
        *) echo "Unsupported architecture for bun: $ARCH" && exit 1 ;; \
    esac; \
    curl -fsSL "https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-linux-${BUN_ARCH}.zip" -o /tmp/bun.zip; \
    unzip -q /tmp/bun.zip -d /tmp; \
    mv "/tmp/bun-linux-${BUN_ARCH}/bun" /usr/local/bin/bun; \
    chmod +x /usr/local/bin/bun; \
    rm -rf /tmp/bun*

# Install Typst (pinned 0.15, multi-arch support)
RUN set -eux; \
    ARCH="$(uname -m)"; \
    case "$ARCH" in \
        x86_64) TYPST_ARCH="x86_64-unknown-linux-musl" ;; \
        aarch64|arm64) TYPST_ARCH="aarch64-unknown-linux-musl" ;; \
        *) echo "Unsupported architecture for typst: $ARCH" && exit 1 ;; \
    esac; \
    curl -fsSL "https://github.com/typst/typst/releases/download/v${TYPST_VERSION}/typst-${TYPST_ARCH}.tar.xz" -o /tmp/typst.tar.xz; \
    tar -xf /tmp/typst.tar.xz -C /tmp; \
    mv "/tmp/typst-${TYPST_ARCH}/typst" /usr/local/bin/typst; \
    chmod +x /usr/local/bin/typst; \
    rm -rf /tmp/typst*

# Install omp via official installer method (pinned with ARG OMP_VERSION)
RUN set -eux; \
    PI_INSTALL_DIR=/usr/local/bin sh -c "$(curl -fsSL https://omp.sh/install)" -- --binary --ref "v${OMP_VERSION}"; \
    chmod +x /usr/local/bin/omp

# Install Node.js (>=20 required by @playwright/mcp, multi-arch support)
RUN set -eux; \
    ARCH="$(uname -m)"; \
    case "$ARCH" in \
        x86_64) NODE_ARCH="x64" ;; \
        aarch64|arm64) NODE_ARCH="arm64" ;; \
        *) echo "Unsupported architecture for node: $ARCH" && exit 1 ;; \
    esac; \
    curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" -o /tmp/node.tar.xz; \
    tar -xJf /tmp/node.tar.xz --strip-components=1 -C /usr/local; \
    rm -f /tmp/node.tar.xz

# Install runtime Node/Bun packages at /node_modules so .:/app bind mount never shadows them
COPY package.json bun.lock /tmp/deps/
RUN set -eux; \
    cd /tmp/deps && bun install --production --frozen-lockfile && \
    mv /tmp/deps/node_modules /node_modules && \
    rm -rf /tmp/deps

# Install pnpm (pinned to match client lockfile, multi-arch support)
RUN set -eux; \
    ARCH="$(uname -m)"; \
    case "$ARCH" in \
        x86_64) PNPM_ARCH="x64" ;; \
        aarch64|arm64) PNPM_ARCH="arm64" ;; \
        *) echo "Unsupported architecture for pnpm: $ARCH" && exit 1 ;; \
    esac; \
    mkdir -p /opt/pnpm; \
    curl -fsSL "https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linux-${PNPM_ARCH}.tar.gz" -o /tmp/pnpm.tar.gz; \
    tar -xzf /tmp/pnpm.tar.gz -C /opt/pnpm; \
    ln -sf /opt/pnpm/pnpm /usr/local/bin/pnpm; \
    chmod +x /opt/pnpm/pnpm; \
    rm -f /tmp/pnpm.tar.gz

# Build frontend SPA (apps/web/client) into /opt/pimsai-web/dist outside /app bind-mount
COPY apps/web/client/package.json apps/web/client/pnpm-lock.yaml apps/web/client/pnpm-workspace.yaml /tmp/web-client/
RUN set -eux; \
    cd /tmp/web-client && pnpm install --frozen-lockfile
COPY apps/web/client/ /tmp/web-client/
RUN set -eux; \
    cd /tmp/web-client && pnpm run build; \
    mkdir -p /opt/pimsai-web; \
    mv /tmp/web-client/dist /opt/pimsai-web/dist; \
    rm -rf /tmp/web-client

# Create unprivileged agent user and directories (never run as root)
RUN groupadd -g 1000 agent && \
    useradd -u 1000 -g agent -m -s /bin/bash agent && \
    mkdir -p /app /app/secrets /app/data/preserved_uploads /home/agent/.omp /home/agent/.local/share /home/agent/.cache /var/lib/pimsai/corpus_mirror /tmp/playwright-mcp && \
    chown -R agent:agent /app /home/agent /var/lib/pimsai /tmp/playwright-mcp /opt/pimsai-web

# Working directory and user configuration
WORKDIR /app

# Environment defaults
ENV HOME=/home/agent \
    PATH="/home/agent/.local/bin:/usr/local/bin:$PATH" \
    PI_SKIP_VERSION_CHECK=1 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Switch to unprivileged user
USER agent

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD curl -fsS http://127.0.0.1:8082/healthz || exit 1

# Default entrypoint / command
CMD ["bash"]
