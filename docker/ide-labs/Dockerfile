# syntropy/ide-labs — COMP-035.5
# Extends ide-base with R, Jupyter, scientific Python libraries.

FROM syntropy/ide-base:latest

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    r-base \
    && rm -rf /var/lib/apt/lists/*

USER node

RUN pip3 install --user --no-cache-dir \
    jupyter \
    numpy \
    scipy \
    pandas \
    matplotlib

ENV PATH="/home/node/.local/bin:$PATH"

WORKDIR /workspace

CMD ["node"]
