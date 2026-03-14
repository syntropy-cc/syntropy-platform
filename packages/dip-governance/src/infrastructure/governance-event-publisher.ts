/**
 * Kafka implementation of GovernanceEventPublisherPort (COMP-007.7).
 */

import type { KafkaProducer } from "@syntropy/event-bus";
import type { GovernanceEventPublisherPort } from "../domain/ports/governance-event-publisher.js";
import type {
  DigitalInstitutionCreatedEvent,
  ProposalExecutedEvent,
  ProposalOpenedEvent,
} from "../domain/events.js";

const DIP_GOVERNANCE_TOPIC = "dip.governance.events";
const SCHEMA_VERSION = 1;

export class GovernanceEventPublisher implements GovernanceEventPublisherPort {
  constructor(private readonly producer: KafkaProducer) {}

  async publishInstitutionCreated(event: DigitalInstitutionCreatedEvent): Promise<void> {
    await this.producer.publish(DIP_GOVERNANCE_TOPIC, {
      eventType: event.eventType,
      payload: {
        institutionId: event.institutionId,
        name: event.name,
        type: event.type,
        governanceContract: event.governanceContract,
        timestamp: event.timestamp,
      },
      schemaVersion: SCHEMA_VERSION,
      timestamp: event.timestamp,
    });
  }

  async publishProposalExecuted(event: ProposalExecutedEvent): Promise<void> {
    await this.producer.publish(DIP_GOVERNANCE_TOPIC, {
      eventType: event.eventType,
      payload: {
        institutionId: event.institutionId,
        proposalId: event.proposalId,
        proposalType: event.proposalType,
        timestamp: event.timestamp,
      },
      schemaVersion: SCHEMA_VERSION,
      timestamp: event.timestamp,
    });
  }

  async publishProposalOpened(event: ProposalOpenedEvent): Promise<void> {
    await this.producer.publish(DIP_GOVERNANCE_TOPIC, {
      eventType: event.eventType,
      payload: {
        institutionId: event.institutionId,
        proposalId: event.proposalId,
        proposalType: event.proposalType,
        timestamp: event.timestamp,
      },
      schemaVersion: SCHEMA_VERSION,
      timestamp: event.timestamp,
    });
  }
}
