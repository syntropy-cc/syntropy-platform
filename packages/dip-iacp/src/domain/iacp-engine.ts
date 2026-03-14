/**
 * IACPEngine — evaluates IACP records against consensus rules.
 * Architecture: COMP-005.5, DIP IACP Engine
 */

import type { IACPRecord } from "./iacp-record.js";
import type { ConsensusEvaluatorContext, ConsensusEvaluatorPort } from "./ports/consensus-evaluator-port.js";
import type { EvaluationResult } from "./evaluation-result.js";

/**
 * Engine that checks consensus rules (quorum, participation, governance contract) for an IACP record.
 * Delegates to ConsensusEvaluatorPort for contract-level evaluation.
 */
export class IACPEngine {
  constructor(private readonly consensusEvaluator: ConsensusEvaluatorPort) {}

  /**
   * Evaluates the record against consensus rules from the governance contract.
   * Returns whether the record is allowed to proceed (e.g. to activation).
   *
   * @param record - IACP record to evaluate
   * @param context - Optional context (e.g. contractId)
   * @returns EvaluationResult with allowed flag and optional reason
   */
  async evaluate(
    record: IACPRecord,
    context?: ConsensusEvaluatorContext,
  ): Promise<EvaluationResult> {
    return this.consensusEvaluator.evaluate(record, context);
  }
}
