/**
 * In-memory ToolDefinitionStore for agent registry (COMP-013.4).
 */

import type { ToolDefinition } from "@syntropy/ai-agents";
import type { ToolDefinitionStore } from "../types/ai-agents-context.js";

export class InMemoryToolDefinitionStore implements ToolDefinitionStore {
  private readonly byId = new Map<string, ToolDefinition>();

  get(toolId: string): ToolDefinition | undefined {
    return this.byId.get(toolId);
  }

  register(tool: ToolDefinition): void {
    this.byId.set(tool.toolId, tool);
  }
}
