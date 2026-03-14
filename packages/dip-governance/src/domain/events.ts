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
