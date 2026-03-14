/**
 * Agent domain event payload types for Kafka (COMP-012.7).
 * Used by AgentEventPublisher; payloads are JSON-serializable.
 */

/** Payload for ai.agent.session_started. */
export interface SessionStartedPayload {
  sessionId: string;
  userId: string;
  agentId: string;
  startedAt: string;
}

/** Payload for ai.agent.invoked. */
export interface InvokedPayload {
  sessionId: string;
  userId: string;
  messageId?: string;
  invokedAt: string;
}
