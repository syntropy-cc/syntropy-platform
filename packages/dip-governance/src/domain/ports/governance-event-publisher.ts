/**
 * Port for publishing governance domain events (COMP-007.7).
 * Architecture: DIP Institutional Governance — dependency inversion
 */

import type {
  DigitalInstitutionCreatedEvent,
  ProposalExecutedEvent,
  ProposalOpenedEvent,
} from "../events.js";

/**
 * Publishes DIP governance events (e.g. to Kafka). Used by governance use cases
 * and services after institution creation, proposal open, or proposal execution.
 */
export interface GovernanceEventPublisherPort {
  publishInstitutionCreated(event: DigitalInstitutionCreatedEvent): Promise<void>;
  publishProposalExecuted(event: ProposalExecutedEvent): Promise<void>;
  publishProposalOpened(event: ProposalOpenedEvent): Promise<void>;
}
