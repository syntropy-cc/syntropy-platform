/**
 * AI Agents context for REST routes (COMP-012.8).
 * Injected when registering ai-agents routes; built by bootstrap.
 */

import type {
  AgentEventPublisher,
  AgentSessionStore,
} from "@syntropy/ai-agents";
import type { AgentOrchestrator } from "@syntropy/ai-agents";

export interface AiAgentsContext {
  sessionStore: AgentSessionStore;
  eventPublisher: AgentEventPublisher;
  orchestrator: AgentOrchestrator;
}
