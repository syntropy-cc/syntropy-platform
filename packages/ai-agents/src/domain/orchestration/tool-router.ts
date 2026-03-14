/**
 * ToolRouter — routes tool calls to registry, validates params, returns ToolResult.
 * Architecture: COMP-012.4, orchestration-context-engine
 */

import type { ToolRegistry } from "./tool-types.js";
import { ToolNotFoundError, type ToolResult } from "./tool-types.js";

/**
 * Routes tool invocations by name: looks up definition, validates params with Zod, invokes handler.
 */
export class ToolRouter {
  constructor(private readonly registry: ToolRegistry) {}

  /**
   * Routes a tool call by name with given params.
   *
   * @param toolName - Registered tool name
   * @param params - Raw params (validated against tool schema)
   * @returns ToolResult from handler
   * @throws ToolNotFoundError when tool is not in registry
   * @throws ZodError when params fail validation
   */
  async route(toolName: string, params: unknown): Promise<ToolResult> {
    const definition = this.registry.get(toolName);
    if (!definition) {
      throw new ToolNotFoundError(toolName);
    }
    const parsed = definition.paramsSchema.parse(params);
    return Promise.resolve(definition.handler(parsed));
  }
}
