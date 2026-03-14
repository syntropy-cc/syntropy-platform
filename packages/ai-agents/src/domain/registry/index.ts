/**
 * Agent registry subdomain — AIAgentDefinition, ToolDefinition, AgentRegistry (COMP-013), SystemPromptRepository (COMP-014.5).
 */

export type { AIAgentDefinition } from "./ai-agent-definition.js";
export { createAIAgentDefinition } from "./ai-agent-definition.js";
export type { AgentRegistry } from "./agent-registry.js";
export { InMemoryAgentRegistry } from "./in-memory-agent-registry.js";
export type { SystemPromptRepository } from "./system-prompt-repository.js";
export type { ToolDefinition } from "./tool-definition.js";
export {
  createToolDefinition,
  validateToolInput,
} from "./tool-definition.js";
export {
  ToolPermissionEvaluator,
  type ToolResolver,
  type RoleResolver,
  type PermissionCache,
} from "./tool-permission-evaluator.js";
