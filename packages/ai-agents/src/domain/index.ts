/**
 * AI Agents domain layer — aggregates, value objects, registry.
 * Architecture: COMP-012, COMP-013
 */

export {
  UserContextModel,
  UserContextSnapshot,
  DEFAULT_SKILL_LEVEL,
  type ActiveGoal,
  type RecentActivityItem,
  type SkillLevel,
  type UserContextUpdateEvent,
  type UserId,
} from "./orchestration/index.js";
export {
  createAIAgentDefinition,
  InMemoryAgentRegistry,
  type AIAgentDefinition,
  type AgentRegistry,
} from "./registry/index.js";
