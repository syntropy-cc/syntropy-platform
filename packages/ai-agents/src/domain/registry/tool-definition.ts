/**
 * ToolDefinition entity for the agent registry (COMP-013.2).
 * Catalog entry for a tool: id, name, description, input schema (Zod), required role.
 * Used for permission and validation; runtime handler is wired separately.
 */

import type { z } from "zod";

export interface ToolDefinition {
  readonly toolId: string;
  readonly name: string;
  readonly description?: string;
  /** Zod schema for tool input parameters. */
  readonly inputSchema: z.ZodType<unknown>;
  /** Role required to invoke this tool (e.g. "creator", "admin"). */
  readonly requiredRole: string;
}

/**
 * Creates an immutable ToolDefinition for registration in the registry.
 */
export function createToolDefinition(params: {
  toolId: string;
  name: string;
  description?: string;
  inputSchema: z.ZodType<unknown>;
  requiredRole: string;
}): ToolDefinition {
  return {
    toolId: params.toolId,
    name: params.name,
    description: params.description,
    inputSchema: params.inputSchema,
    requiredRole: params.requiredRole,
  };
}

/**
 * Validates params against the tool's input schema.
 * Returns the parsed value on success; throws ZodError on validation failure.
 */
export function validateToolInput(
  tool: ToolDefinition,
  params: unknown
): unknown {
  return tool.inputSchema.parse(params);
}
