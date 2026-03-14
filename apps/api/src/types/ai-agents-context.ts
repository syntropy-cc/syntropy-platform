/**
 * AI Agents context for REST routes (COMP-012.8, COMP-013.4).
 * Injected when registering ai-agents and agents routes; built by bootstrap.
 */

import type {
  AgentEventPublisher,
  AgentSessionStore,
} from "@syntropy/ai-agents";
import type { AgentOrchestrator } from "@syntropy/ai-agents";
import type { AgentRegistry } from "@syntropy/ai-agents";
import type { ToolDefinition } from "@syntropy/ai-agents";

/** Store for tool definitions by toolId (register and get). */
export interface ToolDefinitionStore {
  get(toolId: string): ToolDefinition | undefined;
  register(tool: ToolDefinition): void;
}

export interface AiAgentsContext {
  sessionStore: AgentSessionStore;
  eventPublisher: AgentEventPublisher;
  orchestrator: AgentOrchestrator;
  /** Agent registry for POST/GET /api/v1/agents (COMP-013.4). */
  agentRegistry: AgentRegistry;
  /** Tool definitions for GET /api/v1/agents/:id/tools. */
  toolStore: ToolDefinitionStore;
}
