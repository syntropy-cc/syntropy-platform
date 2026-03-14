/**
 * Governance & Moderation package.
 * Architecture: COMP-031
 */

export {
  FlagStatus,
  isFlagStatus,
  type FlagStatusValue,
} from "./domain/flag-status.js";
export {
  ModerationFlag,
  type ModerationFlagParams,
} from "./domain/moderation-flag.js";
export {
  ActionType,
  isActionType,
  type ActionTypeValue,
} from "./domain/action-type.js";
export {
  ModerationAction,
  type ModerationActionParams,
} from "./domain/moderation-action.js";
export {
  PolicyRule,
  RuleType,
  isRuleType,
  type PolicyRuleParams,
  type RuleTypeValue,
} from "./domain/policy-rule.js";
export {
  PlatformPolicy,
  type PlatformPolicyParams,
} from "./domain/platform-policy.js";
export {
  createPolicyViolation,
  type PolicyViolation,
} from "./domain/policy-violation.js";
export {
  ContentPolicyEvaluator,
  evaluateContentAgainstPolicy,
  type EvaluableContent,
} from "./application/content-policy-evaluator.js";
export {
  ProposalStatus,
  isProposalStatus,
  type ProposalStatusValue,
} from "./domain/proposal-status.js";
export {
  CommunityProposal,
  MIN_VOTES_TO_ACCEPT,
  type CommunityProposalParams,
} from "./domain/community-proposal.js";
export {
  CommunityProposalService,
  type ExecuteProposalResult,
} from "./application/community-proposal-service.js";
