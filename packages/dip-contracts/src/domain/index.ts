/**
 * DIP Smart Contract Engine domain layer.
 */

export { ContractDSLParseError } from "./contract-dsl-errors.js";
export { ContractDSLParser } from "./contract-dsl-parser.js";
export { GovernanceContract } from "./governance-contract.js";
export { SmartContractEvaluator } from "./smart-contract-evaluator.js";
export type { ContractRepository } from "./repositories/contract-repository.js";
export type {
  AmendmentProcedure,
  ContractClause,
  EvaluationContext,
  EvaluationResult,
  ParticipationThreshold,
  TransparencyClause,
  VetoRight,
} from "./types.js";
