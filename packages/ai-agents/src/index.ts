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
  InMemoryAgentRegistry,
  type ActiveGoal,
  type RecentActivityItem,
  type SkillLevel,
  type UserContextUpdateEvent,
  type UserId,
  type AIAgentDefinition,
  type AgentRegistry,
  type ToolDefinition,
} from "./domain/index.js";
export {
  AgentOrchestrator,
  type AgentSessionStore,
  type ContextSnapshotProvider,
  type AgentOrchestratorDeps,
} from "./domain/orchestration/agent-orchestrator.js";
export { AgentSession } from "./domain/orchestration/agent-session.js";
export type { AgentSessionRepository } from "./domain/orchestration/repositories/agent-session-repository.js";
export { AgentEventPublisher } from "./infrastructure/agent-event-publisher.js";
export {
  PostgresAgentSessionRepository,
  PgAgentSessionDbClient,
} from "./infrastructure/index.js";
export type { AgentSessionDbClient } from "./infrastructure/agent-session-db-client.js";
