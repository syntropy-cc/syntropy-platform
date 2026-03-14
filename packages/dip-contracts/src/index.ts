/**
 * DIP Smart Contract Engine — governance contract types and aggregate.
 * Architecture: COMP-004, smart-contract-engine subdomain
 */

export {
  ContractDSLParseError,
  ContractDSLParser,
  GovernanceContract,
  SmartContractEvaluator,
  type ContractClause,
  type ContractRepository,
  type EvaluationContext,
  type EvaluationResult,
} from "./domain/index.js";
