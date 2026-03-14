/**
 * AIAgentDefinition entity (COMP-013.1).
 * Immutable definition of an agent: id, name, pillar, toolIds, systemPromptId.
 */

export interface AIAgentDefinition {
  readonly agentId: string;
  readonly name: string;
  readonly pillar: string;
  readonly toolIds: readonly string[];
  readonly systemPromptId: string;
}

/**
 * Creates an AIAgentDefinition. Use for registration in the registry.
 */
export function createAIAgentDefinition(params: {
  agentId: string;
  name: string;
  pillar: string;
  toolIds: readonly string[];
  systemPromptId: string;
}): AIAgentDefinition {
  return {
    agentId: params.agentId,
    name: params.name,
    pillar: params.pillar,
    toolIds: [...params.toolIds],
    systemPromptId: params.systemPromptId,
  };
}
