/**
 * Read model for institution summary with governance stats (COMP-007.8).
 */

export interface InstitutionSummary {
  readonly institutionId: string;
  readonly name: string;
  readonly status: string;
  readonly proposalCount: number;
  readonly lastProposalAt?: string; // ISO 8601
}
