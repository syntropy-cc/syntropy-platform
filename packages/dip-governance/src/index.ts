/**
 * DIP Governance package (COMP-007).
 * Architecture: DIP Institutional Governance subdomain
 */

export { DigitalInstitution } from "./domain/digital-institution.js";
export type { DigitalInstitutionStatus } from "./domain/digital-institution.js";
export type {
  DigitalInstitutionCreatedEvent,
  ProposalExecutedEvent,
  ProposalOpenedEvent,
} from "./domain/events.js";
export { Proposal, InvalidProposalTransitionError } from "./domain/proposal.js";
export {
  ProposalStatus,
  isProposalStatus,
} from "./domain/proposal-status.js";
export type { ProposalStatusValue } from "./domain/proposal-status.js";
export {
  VotingService,
  DuplicateVoteError,
  NotEligibleToVoteError,
} from "./domain/voting-service.js";
export type {
  VoteSummary,
  EligibilityChecker,
} from "./domain/voting-service.js";
export type {
  ProposalRepositoryPort,
  ProposalListOptions,
} from "./domain/ports/proposal-repository.js";
export type {
  VoteStorePort,
  VoteValue,
  VoteRecord,
} from "./domain/ports/vote-store.js";
export type { GovernanceContractResolverPort } from "./domain/ports/governance-contract-resolver.js";
export type { ProposalExecutedPublisherPort } from "./domain/ports/proposal-executed-publisher.js";
export type { TotalEligibleResolverPort } from "./domain/ports/total-eligible-resolver.js";
export {
  GovernanceService,
  ProposalExecutionRejectedError,
} from "./domain/services/governance-service.js";
export type { ContractEvaluatorPort } from "./domain/services/governance-service.js";
export { InMemoryVoteStore } from "./infrastructure/in-memory-vote-store.js";
export {
  LegitimacyChain,
  LegitimacyChainVerifier,
  LEGITIMACY_CHAIN_GENESIS_HASH,
} from "./domain/legitimacy-chain.js";
export {
  LegitimacyChainEntry,
  type LegitimacyChainEntryPayload,
} from "./domain/legitimacy-chain-entry.js";
export type { LegitimacyChainRepositoryPort } from "./domain/ports/legitimacy-chain-repository.js";
export type { DigitalInstitutionRepositoryPort } from "./domain/ports/digital-institution-repository.js";
export type { GovernanceDbClient } from "./infrastructure/governance-db-client.js";
export { PostgresLegitimacyChainRepository } from "./infrastructure/postgres-legitimacy-chain-repository.js";
export { PostgresDigitalInstitutionRepository } from "./infrastructure/postgres-digital-institution-repository.js";
export { PostgresProposalRepository } from "./infrastructure/postgres-proposal-repository.js";
export { PostgresVoteStore } from "./infrastructure/postgres-vote-store.js";
export type { GovernanceEventPublisherPort } from "./domain/ports/governance-event-publisher.js";
export { GovernanceEventPublisher } from "./infrastructure/governance-event-publisher.js";
export type { InstitutionSummary } from "./domain/read-models/institution-summary.js";
export type {
  ProposalHistoryItem,
  ProposalHistoryPage,
} from "./domain/read-models/proposal-history.js";
export { GovernanceQueryService } from "./application/governance-query-service.js";
export type { GovernanceQueryServiceOptions } from "./application/governance-query-service.js";
