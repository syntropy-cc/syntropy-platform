/**
 * LLM adapter interface — domain contract for LLM providers.
 * Architecture: COMP-012.3, orchestration-context-engine (ACL)
 */

/** Response from LLM completion; no provider-specific types. */
export interface LLMResponse {
  readonly content: string;
}

/**
 * Adapter interface for LLM completion.
 * Implementations (e.g. OpenAI) live in infrastructure; domain stays provider-agnostic.
 */
export interface LLMAdapter {
  /**
   * Completes a prompt with optional system/context and returns a single response.
   *
   * @param prompt - User or conversation prompt
   * @param context - Optional system/context string (e.g. user context snapshot)
   * @returns LLMResponse with content; rejects on timeout or provider errors
   */
  complete(prompt: string, context?: string): Promise<LLMResponse>;

  /**
   * Completes a prompt and streams tokens as they arrive.
   *
   * @param prompt - User or conversation prompt
   * @param context - Optional system/context string
   * @returns Async iterable of content chunks (e.g. for SSE)
   */
  completeStreaming?(
    prompt: string,
    context?: string
  ): AsyncIterable<string>;
}
