/**
 * DIP Governance package (COMP-007).
 * Architecture: DIP Institutional Governance subdomain
 */

export { DigitalInstitution } from "./domain/digital-institution.js";
export type { DigitalInstitutionStatus } from "./domain/digital-institution.js";
export type {
  DigitalInstitutionCreatedEvent,
  ProposalExecutedEvent,
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
export type { ProposalRepositoryPort } from "./domain/ports/proposal-repository.js";
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
