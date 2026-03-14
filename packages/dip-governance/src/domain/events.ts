/**
 * Domain events for DIP Governance (COMP-007.1).
 * Architecture: DIP Institutional Governance subdomain
 */

/**
 * Emitted when a new DigitalInstitution is created.
 */
export interface DigitalInstitutionCreatedEvent {
  readonly eventType: "dip.governance.institution_created";
  readonly institutionId: string;
  readonly name: string;
  readonly type: string;
  readonly governanceContract: string;
  readonly timestamp: string;
}

/**
 * Emitted when a governance proposal is executed (COMP-007.4).
 */
export interface ProposalExecutedEvent {
  readonly eventType: "dip.governance.proposal_executed";
  readonly institutionId: string;
  readonly proposalId: string;
  readonly proposalType: string;
  readonly timestamp: string;
}

/**
 * Emitted when a proposal is opened for voting (COMP-007.7).
 */
export interface ProposalOpenedEvent {
  readonly eventType: "dip.governance.proposal_opened";
  readonly institutionId: string;
  readonly proposalId: string;
  readonly proposalType: string;
  readonly timestamp: string;
}
