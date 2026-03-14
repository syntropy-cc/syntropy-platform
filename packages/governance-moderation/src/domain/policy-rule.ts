/**
 * PolicyRule value object for PlatformPolicy (COMP-031.3).
 * Architecture: Governance & Moderation domain.
 */

export const RuleType = {
  TextPattern: "text_pattern",
  Metadata: "metadata",
} as const;

export type RuleTypeValue = (typeof RuleType)[keyof typeof RuleType];

export interface PolicyRuleParams {
  ruleId: string;
  ruleType: RuleTypeValue;
  /** For text_pattern: regex or substring pattern. For metadata: key or config. */
  pattern?: string;
  /** Optional config for metadata rules (e.g. requiredKeys, maxLength). */
  config?: Record<string, unknown>;
}

export function isRuleType(s: string): s is RuleTypeValue {
  return Object.values(RuleType).includes(s as RuleTypeValue);
}

/**
 * PolicyRule value object. Immutable.
 */
export class PolicyRule {
  readonly ruleId: string;
  readonly ruleType: RuleTypeValue;
  readonly pattern: string | undefined;
  readonly config: Record<string, unknown> | undefined;

  private constructor(params: PolicyRuleParams) {
    this.ruleId = params.ruleId;
    this.ruleType = params.ruleType;
    this.pattern = params.pattern;
    this.config = params.config ?? undefined;
  }

  static create(params: PolicyRuleParams): PolicyRule {
    if (!params.ruleId?.trim()) {
      throw new Error("PolicyRule.ruleId cannot be empty");
    }
    if (!isRuleType(params.ruleType)) {
      throw new Error(
        `PolicyRule.ruleType must be one of: ${Object.values(RuleType).join(", ")}`
      );
    }
    return new PolicyRule(params);
  }
}
