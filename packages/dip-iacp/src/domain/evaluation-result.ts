/**
 * Result of IACP consensus evaluation (quorum and participation).
 * Architecture: COMP-005.5, DIP IACP Engine
 */

export interface EvaluationResult {
  readonly allowed: boolean;
  readonly reason?: string;
}

export function createEvaluationResult(allowed: boolean, reason?: string): EvaluationResult {
  return reason !== undefined ? { allowed, reason } : { allowed };
}
