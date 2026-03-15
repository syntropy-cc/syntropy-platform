/**
 * AI Agents package — orchestration and registry.
 * Architecture: COMP-012, COMP-013
 */

export {
  UserContextModel,
  UserContextSnapshot,
  DEFAULT_SKILL_LEVEL,
  createAIAgentDefinition,
  createToolDefinition,
  validateToolInput,
  InMemoryAgentRegistry,
  ToolPermissionEvaluator,
  type ActiveGoal,
  type RecentActivityItem,
  type SkillLevel,
  type UserContextUpdateEvent,
  type UserId,
  type AIAgentDefinition,
  type AgentRegistry,
  type SystemPromptRepository,
  type ToolDefinition,
  type ToolResolver,
  type RoleResolver,
  type PermissionCache,
} from "./domain/index.js";
export {
  AgentOrchestrator,
  type AgentSessionStore,
  type ContextSnapshotProvider,
  type AgentOrchestratorDeps,
} from "./domain/orchestration/agent-orchestrator.js";
export type { LLMAdapter, LLMResponse } from "./domain/orchestration/llm-adapter.js";
export { AgentSession } from "./domain/orchestration/agent-session.js";
export type { AgentSessionRepository } from "./domain/orchestration/repositories/agent-session-repository.js";
export {
  createLearnToolDefinitions,
  createHubToolDefinitions,
  createLabsToolDefinitions,
  createCrossPillarToolDefinitions,
  createIDEToolDefinitions,
  type LearnToolPort,
  type HubToolPort,
  type LabsToolPort,
  type CrossPillarToolPort,
  type IDEToolPort,
} from "./infrastructure/tool-handlers/index.js";
export { AgentEventPublisher } from "./infrastructure/agent-event-publisher.js";
export {
  PostgresAgentSessionRepository,
  PgAgentSessionDbClient,
  InMemorySystemPromptRepository,
  createSystemPromptRepositoryFromMap,
  loadSystemPromptsFromDirectory,
} from "./infrastructure/index.js";
export type { AgentSessionDbClient } from "./infrastructure/agent-session-db-client.js";
