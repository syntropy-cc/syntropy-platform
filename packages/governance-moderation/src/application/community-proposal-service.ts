/**
 * CommunityProposalService (COMP-031.5).
 * Architecture: Governance & Moderation application layer.
 */

import type { CommunityProposal } from "../domain/community-proposal.js";
import { ProposalStatus } from "../domain/proposal-status.js";

/**
 * Result of executing an accepted proposal.
 * Stub for "applies policy change"; full implementation would update PlatformPolicy or publish events.
 */
export interface ExecuteProposalResult {
  readonly success: boolean;
  readonly proposalId: string;
  readonly message?: string;
}

/**
 * Service that executes an accepted community proposal (e.g. apply policy change).
 * Execution is only performed when proposal status is Accepted.
 */
export class CommunityProposalService {
  /**
   * Execute an accepted proposal. No-op if not accepted; returns result indicating success or reason.
   */
  execute(proposal: CommunityProposal): ExecuteProposalResult {
    if (proposal.status !== ProposalStatus.Accepted) {
      return {
        success: false,
        proposalId: proposal.id,
        message: `Proposal is not accepted (status: ${proposal.status}). Only accepted proposals can be executed.`,
      };
    }
    // Stub: in full implementation would apply policy change (update PlatformPolicy or publish event).
    return {
      success: true,
      proposalId: proposal.id,
      message: "Proposal executed (policy change applied).",
    };
  }
}
