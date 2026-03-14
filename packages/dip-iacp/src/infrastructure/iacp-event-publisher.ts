/**
 * Publishes IACP lifecycle events to Kafka (COMP-005.7).
 */

import type { KafkaProducer } from "@syntropy/event-bus";
import type { IACPEventPublisherPort } from "../domain/ports/iacp-event-publisher-port.js";
import type {
  IACPCreatedEvent,
  IACPActivatedEvent,
  IACPTerminatedEvent,
} from "../domain/events/iacp-events.js";

const DIP_IACP_TOPIC = "dip.iacp.events";
const SCHEMA_VERSION = 1;

function toPayload(event: IACPCreatedEvent | IACPActivatedEvent | IACPTerminatedEvent) {
  return {
    iacpId: event.iacpId,
    type: event.type,
    institutionId: event.institutionId,
    timestamp: event.timestamp,
  };
}

/**
 * Kafka implementation of IACPEventPublisherPort.
 * Publishes dip.iacp.created, dip.iacp.activated, dip.iacp.terminated to Kafka.
 */
export class IACPEventPublisher implements IACPEventPublisherPort {
  constructor(private readonly producer: KafkaProducer) {}

  async publishCreated(event: IACPCreatedEvent): Promise<void> {
    await this.producer.publish(DIP_IACP_TOPIC, {
      eventType: "dip.iacp.created",
      payload: toPayload(event),
      schemaVersion: SCHEMA_VERSION,
      timestamp: event.timestamp,
    });
  }

  async publishActivated(event: IACPActivatedEvent): Promise<void> {
    await this.producer.publish(DIP_IACP_TOPIC, {
      eventType: "dip.iacp.activated",
      payload: toPayload(event),
      schemaVersion: SCHEMA_VERSION,
      timestamp: event.timestamp,
    });
  }

  async publishTerminated(event: IACPTerminatedEvent): Promise<void> {
    await this.producer.publish(DIP_IACP_TOPIC, {
      eventType: "dip.iacp.terminated",
      payload: toPayload(event),
      schemaVersion: SCHEMA_VERSION,
      timestamp: event.timestamp,
    });
  }
}
