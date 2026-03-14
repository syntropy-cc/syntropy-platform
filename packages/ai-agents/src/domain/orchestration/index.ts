/**
 * Orchestration & context engine — UserContextModel, snapshot, session, types.
 * Architecture: COMP-012
 */

export type { AgentResponse, ToolCallResult } from "./agent-response.js";
export { AgentSession } from "./agent-session.js";
export type { AgentSessionStatus, SessionMessage } from "./agent-session.js";
export {
  AgentOrchestrator,
  type AgentOrchestratorDeps,
  type AgentSessionStore,
  type ContextSnapshotProvider,
} from "./agent-orchestrator.js";
export type { LLMAdapter, LLMResponse } from "./llm-adapter.js";
export { ContextModelUpdater } from "./context-model-updater.js";
export type { UserContextModelRepository } from "./context-model-updater.js";
export { ToolRouter } from "./tool-router.js";
export {
  ToolNotFoundError,
  type ToolDefinition,
  type ToolRegistry,
  type ToolResult,
} from "./tool-types.js";
export { UserContextModel } from "./user-context-model.js";
export { UserContextSnapshot } from "./user-context-snapshot.js";
export {
  DEFAULT_SKILL_LEVEL,
  type ActiveGoal,
  type RecentActivityItem,
  type SkillLevel,
  type UserContextUpdateEvent,
  type UserId,
} from "./types.js";
