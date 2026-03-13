/**
 * Publishes identity domain events to Kafka (COMP-002.5).
 *
 * Maps UserCreated, UserUpdated, Session to EventEnvelope and publishes to identity.events.
 */

import type { KafkaProducer } from "@syntropy/event-bus";
import type { User } from "../domain/entities/user.js";
import type { Session } from "../domain/entities/session.js";
import type { UserCreated, UserUpdated } from "../domain/events/user-events.js";

const IDENTITY_TOPIC = "identity.events";
const SCHEMA_VERSION = 1;

/**
 * Publisher for identity domain events. Injected with KafkaProducer from event-bus.
 */
export class IdentityEventPublisher {
  constructor(private readonly producer: KafkaProducer) {}

  /**
   * Publishes identity.user.created for a new user.
   */
  async publishUserCreated(event: UserCreated): Promise<void> {
    await this.producer.publish(IDENTITY_TOPIC, {
      eventType: "identity.user.created",
      payload: {
        userId: event.userId,
        actorId: String(event.actorId),
        email: event.email,
      },
      schemaVersion: SCHEMA_VERSION,
      timestamp: event.timestamp.toISOString(),
    });
  }

  /**
   * Convenience: publish UserCreated from a User (e.g. after User.create()).
   */
  async publishUserCreatedFromUser(_user: User, event: UserCreated): Promise<void> {
    await this.publishUserCreated(event);
  }

  /**
   * Publishes identity.user.updated when user profile or attributes change.
   */
  async publishUserUpdated(event: UserUpdated): Promise<void> {
    await this.producer.publish(IDENTITY_TOPIC, {
      eventType: "identity.user.updated",
      payload: {
        userId: event.userId,
        actorId: String(event.actorId),
        changes: event.changes,
      },
      schemaVersion: SCHEMA_VERSION,
      timestamp: event.timestamp.toISOString(),
    });
  }

  /**
   * Publishes identity.session.created when a new session is created.
   */
  async publishSessionCreated(session: Session): Promise<void> {
    await this.producer.publish(IDENTITY_TOPIC, {
      eventType: "identity.session.created",
      payload: {
        sessionId: session.sessionId,
        userId: session.userId,
        actorId: String(session.actorId),
        expiresAt: session.expiresAt.toISOString(),
      },
      schemaVersion: SCHEMA_VERSION,
      timestamp: new Date().toISOString(),
    });
  }
}
