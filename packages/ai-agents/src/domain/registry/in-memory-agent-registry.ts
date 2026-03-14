/**
 * In-memory implementation of AgentRegistry (COMP-013.1).
 * Used for tests and as default registry when no persistence is configured.
 */

import type { AIAgentDefinition } from "./ai-agent-definition.js";
import type { AgentRegistry } from "./agent-registry.js";

export class InMemoryAgentRegistry implements AgentRegistry {
  private readonly byId = new Map<string, AIAgentDefinition>();
  private readonly byPillar = new Map<string, AIAgentDefinition[]>();

  async register(definition: AIAgentDefinition): Promise<void> {
    const copy: AIAgentDefinition = {
      agentId: definition.agentId,
      name: definition.name,
      pillar: definition.pillar,
      toolIds: [...definition.toolIds],
      systemPromptId: definition.systemPromptId,
    };
    this.byId.set(definition.agentId, copy);
    const list = this.byPillar.get(definition.pillar) ?? [];
    const existing = list.findIndex((a) => a.agentId === definition.agentId);
    if (existing >= 0) {
      list[existing] = copy;
    } else {
      list.push(copy);
    }
    this.byPillar.set(definition.pillar, list);
  }

  async findByPillar(pillar: string): Promise<AIAgentDefinition[]> {
    const list = this.byPillar.get(pillar) ?? [];
    return [...list];
  }

  async findAll(): Promise<AIAgentDefinition[]> {
    return Array.from(this.byId.values());
  }

  async findById(agentId: string): Promise<AIAgentDefinition | null> {
    return this.byId.get(agentId) ?? null;
  }
}
