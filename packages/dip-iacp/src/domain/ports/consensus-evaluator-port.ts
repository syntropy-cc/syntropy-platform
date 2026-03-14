/**
 * Port for evaluating IACP consensus rules (governance contract, quorum, participation).
 * Architecture: COMP-005.5, DIP IACP Engine (ARCH-002: depend on abstractions)
 */

import type { IACPRecord } from "../iacp-record.js";
import type { EvaluationResult } from "../evaluation-result.js";

export interface ConsensusEvaluatorContext {
  readonly contractId?: string;
}

/**
 * Port for contract/consensus evaluation. Implementations may call Smart Contract Engine or other services.
 */
export interface ConsensusEvaluatorPort {
  evaluate(
    record: IACPRecord,
    context?: ConsensusEvaluatorContext,
  ): Promise<EvaluationResult>;
}
