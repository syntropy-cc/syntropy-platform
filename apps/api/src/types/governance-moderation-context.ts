/**
 * Governance & Moderation context for REST API (COMP-031.6).
 *
 * Injected when registering moderation and community-proposal routes.
 * Provides use-case style ports; implementations can use in-memory or persistence.
 */

import type {
  ModerationFlag,
  ModerationAction,
  CommunityProposal,
} from "@syntropy/governance-moderation";

export interface RecordFlagParams {
  entityType: string;
  entityId: string;
  reason: string;
  reporterId: string;
}

export interface RecordActionParams {
  flagId: string;
  moderatorId: string;
  actionType: "approve" | "remove" | "warn" | "ban";
  reason: string;
}

export interface CreateProposalParams {
  authorId: string;
  title: string;
  description: string;
  proposalType: string;
}

export interface ListFlagsOptions {
  status?: string;
  limit?: number;
  offset?: number;
}

export interface GovernanceModerationContext {
  recordFlag(params: RecordFlagParams): Promise<ModerationFlag>;
  listFlags(opts?: ListFlagsOptions): Promise<ModerationFlag[]>;
  recordAction(params: RecordActionParams): Promise<ModerationAction>;
  createProposal(params: CreateProposalParams): Promise<CommunityProposal>;
  getProposal(id: string): Promise<CommunityProposal | null>;
  voteProposal(proposalId: string, userId: string): Promise<CommunityProposal>;
}
