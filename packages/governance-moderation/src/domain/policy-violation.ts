/**
 * PolicyViolation value type for ContentPolicyEvaluator (COMP-031.4).
 * Architecture: Governance & Moderation domain.
 */

export interface PolicyViolation {
  readonly ruleId: string;
  readonly message: string;
  readonly severity?: "low" | "medium" | "high";
}

export function createPolicyViolation(params: {
  ruleId: string;
  message: string;
  severity?: "low" | "medium" | "high";
}): PolicyViolation {
  return {
    ruleId: params.ruleId,
    message: params.message,
    severity: params.severity,
  };
}
