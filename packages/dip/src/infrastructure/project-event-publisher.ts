/**
 * Publishes project domain events to Kafka (COMP-006.5).
 * Maps ProjectCreated and ProjectManifestUpdated to dip.project.events topic.
 */

import type { KafkaProducer } from "@syntropy/event-bus";
import type { ProjectCreatedEvent } from "../domain/project-manifest-dag/events/project-events.js";
import type { ProjectManifestUpdatedEvent } from "../domain/project-manifest-dag/events/project-events.js";
import type { ProjectEventPublisherPort } from "../domain/project-manifest-dag/ports/project-event-publisher-port.js";

const DIP_PROJECT_TOPIC = "dip.project.events";
const SCHEMA_VERSION = 1;

function toPayload(
  event: ProjectCreatedEvent | ProjectManifestUpdatedEvent,
): Record<string, unknown> {
  return {
    projectId: event.projectId,
    institutionId: event.institutionId,
    manifestId: event.manifestId,
    title: event.title,
    description: event.description,
    timestamp: event.timestamp.toISOString(),
  };
}

/**
 * Kafka implementation of ProjectEventPublisherPort.
 * Publishes dip.project.created and dip.project.manifest_updated to Kafka.
 */
export class ProjectEventPublisher implements ProjectEventPublisherPort {
  constructor(private readonly producer: KafkaProducer) {}

  async publishProjectCreated(event: ProjectCreatedEvent): Promise<void> {
    await this.producer.publish(DIP_PROJECT_TOPIC, {
      eventType: "dip.project.created",
      payload: toPayload(event),
      schemaVersion: SCHEMA_VERSION,
      timestamp: event.timestamp.toISOString(),
    });
  }

  async publishProjectManifestUpdated(
    event: ProjectManifestUpdatedEvent,
  ): Promise<void> {
    await this.producer.publish(DIP_PROJECT_TOPIC, {
      eventType: "dip.project.manifest_updated",
      payload: toPayload(event),
      schemaVersion: SCHEMA_VERSION,
      timestamp: event.timestamp.toISOString(),
    });
  }
}
