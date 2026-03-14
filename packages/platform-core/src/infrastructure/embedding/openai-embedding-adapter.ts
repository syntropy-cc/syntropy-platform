/**
 * OpenAI embeddings adapter (COMP-011.4).
 * Architecture: Platform Core — Search & Recommendation, PAT-005.
 * Calls OpenAI Embeddings API; key from OPENAI_API_KEY env.
 */

import type { EmbeddingPort } from "../../domain/search-recommendation/ports/embedding-port.js";

const EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const MODEL = "text-embedding-3-small";
const DEFAULT_DIMENSIONS = 1536;

export interface OpenAIEmbeddingAdapterConfig {
  apiKey: string;
  dimensions?: number;
  timeoutMs?: number;
}

/**
 * Adapter that calls OpenAI Embeddings API. Returns 1536-dimensional vectors.
 */
export class OpenAIEmbeddingAdapter implements EmbeddingPort {
  private readonly apiKey: string;
  private readonly dimensions: number;
  private readonly timeoutMs: number;

  constructor(config: OpenAIEmbeddingAdapterConfig) {
    this.apiKey = config.apiKey;
    this.dimensions = config.dimensions ?? DEFAULT_DIMENSIONS;
    this.timeoutMs = config.timeoutMs ?? 10_000;
  }

  async embed(text: string): Promise<number[]> {
    const trimmed = (text ?? "").trim();
    if (!trimmed) {
      return new Array<number>(this.dimensions).fill(0);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(EMBEDDINGS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          input: trimmed,
          dimensions: this.dimensions,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`OpenAI embeddings API error ${res.status}: ${body}`);
      }

      const data = (await res.json()) as { data?: Array<{ embedding?: number[] }> };
      const embedding = data.data?.[0]?.embedding;
      if (!Array.isArray(embedding) || embedding.length !== this.dimensions) {
        throw new Error(`OpenAI returned invalid embedding (expected length ${this.dimensions})`);
      }
      return embedding;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") throw new Error("Embedding request timed out");
        throw err;
      }
      throw new Error("Embedding request failed");
    }
  }
}
