/**
 * Publishes artifact lifecycle domain events to Kafka (COMP-003.5).
 * Implements ArtifactLifecycleEventPublisher; event schema version 1; authorId in payload for actor attribution.
 */

import type { KafkaProducer } from "@syntropy/event-bus";
import type { ArtifactLifecycleEvent } from "../domain/artifact-registry/events/artifact-lifecycle-events.js";

const DIP_ARTIFACT_TOPIC = "dip.artifact.events";
const SCHEMA_VERSION = 1;

/**
 * Kafka implementation of ArtifactLifecycleEventPublisher.
 * Publishes dip.artifact.drafted, submitted, published, archived to Kafka with schema version 1.
 */
export class ArtifactEventPublisher {
  constructor(private readonly producer: KafkaProducer) {}

  /**
   * Publishes a lifecycle event to Kafka. Maps event.type to eventType; payload includes artifactId, authorId, timestamp (actor attribution).
   */
  async publish(event: ArtifactLifecycleEvent): Promise<void> {
    await this.producer.publish(DIP_ARTIFACT_TOPIC, {
      eventType: event.type,
      payload: {
        artifactId: event.artifactId,
        authorId: event.authorId,
        timestamp: event.timestamp.toISOString(),
      },
      schemaVersion: SCHEMA_VERSION,
      timestamp: event.timestamp.toISOString(),
    });
  }
}
