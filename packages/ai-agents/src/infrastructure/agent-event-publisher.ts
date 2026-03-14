/**
 * Publishes AI agent domain events to Kafka (COMP-012.7).
 * Event types: ai.agent.session_started, ai.agent.invoked.
 */

import type { KafkaProducer } from "@syntropy/event-bus";
import type { SessionStartedPayload, InvokedPayload } from "../domain/orchestration/events/agent-events.js";

const AI_AGENT_TOPIC = "ai.agent.events";
const SCHEMA_VERSION = 1;

/**
 * Kafka implementation for agent session and invocation events.
 */
export class AgentEventPublisher {
  constructor(private readonly producer: KafkaProducer) {}

  /**
   * Publishes ai.agent.session_started when a session is created.
   */
  async publishSessionStarted(
    sessionId: string,
    userId: string,
    agentId: string,
    options?: { correlationId?: string }
  ): Promise<void> {
    const payload: SessionStartedPayload = {
      sessionId,
      userId,
      agentId,
      startedAt: new Date().toISOString(),
    };
    await this.producer.publish(AI_AGENT_TOPIC, {
      eventType: "ai.agent.session_started",
      payload,
      schemaVersion: SCHEMA_VERSION,
      timestamp: payload.startedAt,
      correlationId: options?.correlationId,
    });
  }

  /**
   * Publishes ai.agent.invoked when the agent is invoked for a session.
   */
  async publishInvoked(
    sessionId: string,
    userId: string,
    options?: { messageId?: string; correlationId?: string }
  ): Promise<void> {
    const invokedAt = new Date().toISOString();
    const payload: InvokedPayload = {
      sessionId,
      userId,
      messageId: options?.messageId,
      invokedAt,
    };
    await this.producer.publish(AI_AGENT_TOPIC, {
      eventType: "ai.agent.invoked",
      payload,
      schemaVersion: SCHEMA_VERSION,
      timestamp: invokedAt,
      correlationId: options?.correlationId,
    });
  }
}
