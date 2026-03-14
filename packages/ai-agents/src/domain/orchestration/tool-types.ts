/**
 * Tool registry and result types for ToolRouter.
 * Architecture: COMP-012.4, orchestration-context-engine
 */

import type { z } from "zod";

/** Result of a tool invocation. */
export interface ToolResult {
  readonly success: boolean;
  readonly data?: unknown;
  readonly error?: string;
}

/** Thrown when a tool name is not found in the registry. */
export class ToolNotFoundError extends Error {
  readonly toolName: string;

  constructor(toolName: string) {
    super(`Tool not found: ${toolName}`);
    this.name = "ToolNotFoundError";
    this.toolName = toolName;
    Object.setPrototypeOf(this, ToolNotFoundError.prototype);
  }
}

/**
 * Definition of a single tool: name, param schema, and handler.
 * Schema is Zod for validation; handler receives parsed params.
 */
export interface ToolDefinition {
  readonly name: string;
  readonly description?: string;
  /** Zod schema for params. */
  readonly paramsSchema: z.ZodType<unknown>;
  /** Handler invoked with validated params. */
  readonly handler: (params: unknown) => Promise<ToolResult> | ToolResult;
}

/**
 * Registry interface for looking up tools by name.
 * COMP-013.1 will provide the real implementation; this stage uses mocks.
 */
export interface ToolRegistry {
  get(name: string): ToolDefinition | undefined;
}
