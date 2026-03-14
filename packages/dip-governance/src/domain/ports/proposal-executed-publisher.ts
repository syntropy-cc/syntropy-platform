/**
 * Port for publishing proposal-executed domain events (COMP-007.4).
 * Architecture: DIP Institutional Governance — dependency inversion
 */

import type { ProposalExecutedEvent } from "../events.js";

/**
 * Publishes governance.proposal_executed events (e.g. to Kafka).
 * Used by GovernanceService after successfully executing a proposal.
 */
export interface ProposalExecutedPublisherPort {
  publish(event: ProposalExecutedEvent): Promise<void>;
}
