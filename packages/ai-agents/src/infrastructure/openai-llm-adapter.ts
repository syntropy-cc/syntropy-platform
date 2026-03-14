/**
 * OpenAI API adapter implementing LLMAdapter.
 * Architecture: COMP-012.3, ACL — LLM vocabulary does not leak into domain.
 */

import type { LLMAdapter, LLMResponse } from "../domain/orchestration/llm-adapter.js";

const DEFAULT_TIMEOUT_MS = 30_000;

export interface OpenAIAdapterConfig {
  /** OpenAI API key (from env in production). */
  apiKey?: string;
  /** Request timeout in ms. Default 30s. */
  timeoutMs?: number;
  /** Model id. Default gpt-4o. */
  model?: string;
}

/**
 * OpenAI-backed LLM adapter. Uses fetch with AbortController for timeout.
 */
export class OpenAIAdapter implements LLMAdapter {
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly model: string;

  constructor(config: OpenAIAdapterConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.OPENAI_API_KEY ?? "";
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.model = config.model ?? "gpt-4o";
    if (!this.apiKey) {
      throw new Error("OpenAI API key is required (config or OPENAI_API_KEY)");
    }
  }

  async complete(prompt: string, context?: string): Promise<LLMResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const messages: Array<{ role: "system" | "user"; content: string }> = [];
      if (context) {
        messages.push({ role: "system", content: context });
      }
      messages.push({ role: "user", content: prompt });

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 4096,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`OpenAI API error ${res.status}: ${body}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content =
        data.choices?.[0]?.message?.content ?? "";
      return { content };
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          throw new Error(`LLM request timed out after ${this.timeoutMs}ms`);
        }
        throw err;
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async *completeStreaming(
    prompt: string,
    context?: string
  ): AsyncIterable<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const messages: Array<{ role: "system" | "user"; content: string }> = [];
    if (context) {
      messages.push({ role: "system", content: context });
    }
    messages.push({ role: "user", content: prompt });

    let res: Response;
    try {
      res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 4096,
          stream: true,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${body}`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error("No response body for streaming");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") return;
            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const chunk = parsed.choices?.[0]?.delta?.content;
              if (chunk) yield chunk;
            } catch {
              // skip malformed chunk
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
