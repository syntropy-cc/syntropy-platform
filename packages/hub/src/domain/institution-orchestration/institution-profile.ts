/**
 * InstitutionProfile read model — display-ready view of an institution (COMP-020.3).
 * Architecture: Hub Institution Orchestration, institution-orchestration.md
 */

/**
 * Read model aggregating public institution data for display.
 * Sourced from DIP and platform; no governance state owned by Hub.
 */
export interface InstitutionProfile {
  institutionId: string;
  name: string;
  institutionType: string;
  memberCount: number;
  activeProposalsCount: number;
  legitimacyChainLength: number;
  governanceContractSummary: string;
  treasuryBalanceAvu: number;
  openIssueCount: number;
}
