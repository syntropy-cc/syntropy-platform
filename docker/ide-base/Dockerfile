# syntropy/ide-base — COMP-035.5
# Node.js 20, Python 3.11, common CLI tools for IDE sessions.

FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    build-essential \
    python3 \
    python3-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*
# Bookworm provides Python 3.11 as python3

ENV WORKSPACE_DIR=/workspace
RUN mkdir -p "$WORKSPACE_DIR" && chown -R node:node "$WORKSPACE_DIR"

USER node
WORKDIR $WORKSPACE_DIR

CMD ["node"]
