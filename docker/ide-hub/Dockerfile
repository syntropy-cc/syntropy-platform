# syntropy/ide-hub — COMP-035.5
# Extends ide-base with common build tools for Hub contributions.

FROM syntropy/ide-base:latest

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    make \
    g++ \
    cmake \
    && rm -rf /var/lib/apt/lists/*

USER node

WORKDIR /workspace

CMD ["node"]
