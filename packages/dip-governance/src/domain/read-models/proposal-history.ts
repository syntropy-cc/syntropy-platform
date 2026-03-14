/**
 * Read model for proposal history (COMP-007.8).
 */

import type { VoteSummary } from "../voting-service.js";

export interface ProposalHistoryItem {
  readonly proposalId: string;
  readonly institutionId: string;
  readonly type: string;
  readonly status: string;
  readonly voteSummary?: VoteSummary;
}

export interface ProposalHistoryPage {
  readonly items: ProposalHistoryItem[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}
