/**
 * Agent registry interface (COMP-013.1).
 * Stores and queries AIAgentDefinition by pillar.
 */

import type { AIAgentDefinition } from "./ai-agent-definition.js";

export interface AgentRegistry {
  register(definition: AIAgentDefinition): Promise<void>;
  findByPillar(pillar: string): Promise<AIAgentDefinition[]>;
  /** Returns all registered agents (for list endpoint). */
  findAll(): Promise<AIAgentDefinition[]>;
}
