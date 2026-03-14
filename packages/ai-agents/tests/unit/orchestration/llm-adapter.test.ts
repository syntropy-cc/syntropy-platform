/**
 * Unit tests for LLMAdapter contract using mock adapter.
 * Architecture: COMP-012.3
 */

import { describe, it, expect } from "vitest";
import type { LLMAdapter, LLMResponse } from "../../../src/domain/orchestration/llm-adapter.js";

/** Mock adapter for testing code that depends on LLMAdapter. */
class MockLLMAdapter implements LLMAdapter {
  private readonly response: LLMResponse;
  private readonly delayMs: number;

  constructor(response: LLMResponse = { content: "Mock response" }, delayMs = 0) {
    this.response = response;
    this.delayMs = delayMs;
  }

  async complete(_prompt: string, context?: string): Promise<LLMResponse> {
    if (this.delayMs > 0) {
      await new Promise((r) => setTimeout(r, this.delayMs));
    }
    const content =
      this.response.content +
      (context ? ` [context: ${context.slice(0, 20)}...]` : "");
    return { content };
  }
}

describe("LLMAdapter", () => {
  describe("mock adapter complete", () => {
    it("returns fixed content when given prompt and no context", async () => {
      const adapter: LLMAdapter = new MockLLMAdapter({ content: "Hello" });

      const result = await adapter.complete("Hi");

      expect(result.content).toBe("Hello");
    });

    it("returns content incorporating context when context provided", async () => {
      const adapter: LLMAdapter = new MockLLMAdapter({ content: "Reply" });

      const result = await adapter.complete("Hi", "User is a developer");

      expect(result.content).toContain("Reply");
      expect(result.content).toContain("context:");
    });

    it("returns LLMResponse shape with content field", async () => {
      const adapter: LLMAdapter = new MockLLMAdapter({ content: "Test" });

      const result = await adapter.complete("x");

      expect(result).toHaveProperty("content");
      expect(typeof result.content).toBe("string");
    });
  });

  describe("consumer contract", () => {
    it("can be invoked with prompt only", async () => {
      const adapter: LLMAdapter = new MockLLMAdapter({ content: "OK" });

      const response = await adapter.complete("Hello");

      expect(response.content).toBe("OK");
    });

    it("can be invoked with prompt and context", async () => {
      const adapter: LLMAdapter = new MockLLMAdapter({ content: "OK" });

      const response = await adapter.complete("Hello", "System context");

      expect(response).toEqual({ content: expect.any(String) });
    });
  });
});
