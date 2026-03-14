/**
 * ProposalStatus — lifecycle status for Proposal aggregate (COMP-007.2).
 * Architecture: DIP Institutional Governance subdomain
 */

export const ProposalStatus = {
  Open: "open",
  Closed: "closed",
  Executed: "executed",
} as const;

export type ProposalStatusValue =
  (typeof ProposalStatus)[keyof typeof ProposalStatus];

export function isProposalStatus(value: string): value is ProposalStatusValue {
  return Object.values(ProposalStatus).includes(value as ProposalStatusValue);
}
