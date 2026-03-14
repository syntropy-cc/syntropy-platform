/**
 * ProposalStatus for CommunityProposal (COMP-031.5).
 * Architecture: Governance & Moderation domain.
 */

export const ProposalStatus = {
  Draft: "draft",
  Discussion: "discussion",
  Voting: "voting",
  Accepted: "accepted",
  Rejected: "rejected",
} as const;

export type ProposalStatusValue = (typeof ProposalStatus)[keyof typeof ProposalStatus];

export function isProposalStatus(s: string): s is ProposalStatusValue {
  return Object.values(ProposalStatus).includes(s as ProposalStatusValue);
}
