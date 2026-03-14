/**
 * AgentResponse — response shape from AgentOrchestrator.invoke.
 * Architecture: COMP-012.6, orchestration-context-engine
 */

/** Result of a single tool call (when LLM response includes tool calls). */
export interface ToolCallResult {
  readonly toolName: string;
  readonly success: boolean;
  readonly data?: unknown;
  readonly error?: string;
}

/** Response returned by AgentOrchestrator.invoke. */
export interface AgentResponse {
  readonly content: string;
  readonly toolResults?: readonly ToolCallResult[];
}
