/**
 * ContentPolicyEvaluator (COMP-031.4).
 * Architecture: Governance & Moderation application layer.
 */

import type { PlatformPolicy } from "../domain/platform-policy.js";
import type { PolicyRule } from "../domain/policy-rule.js";
import { RuleType } from "../domain/policy-rule.js";
import {
  createPolicyViolation,
  type PolicyViolation,
} from "../domain/policy-violation.js";

export interface EvaluableContent {
  text?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Evaluates content against a platform policy. Returns list of violations.
 */
export function evaluateContentAgainstPolicy(
  content: EvaluableContent,
  policy: PlatformPolicy
): PolicyViolation[] {
  if (!policy.isActive) {
    return [];
  }
  const violations: PolicyViolation[] = [];
  for (const rule of policy.rules) {
    const v = evaluateRule(content, rule);
    if (v) violations.push(v);
  }
  return violations;
}

function evaluateRule(
  content: EvaluableContent,
  rule: PolicyRule
): PolicyViolation | null {
  if (rule.ruleType === RuleType.TextPattern) {
    return evaluateTextPatternRule(content, rule);
  }
  if (rule.ruleType === RuleType.Metadata) {
    return evaluateMetadataRule(content, rule);
  }
  return null;
}

function evaluateTextPatternRule(
  content: EvaluableContent,
  rule: PolicyRule
): PolicyViolation | null {
  const text = content.text ?? "";
  const pattern = rule.pattern;
  if (!pattern) {
    return null;
  }
  let regex: RegExp;
  try {
    regex = new RegExp(pattern);
  } catch {
    return createPolicyViolation({
      ruleId: rule.ruleId,
      message: `Invalid regex pattern in rule ${rule.ruleId}`,
      severity: "medium",
    });
  }
  if (regex.test(text)) {
    return createPolicyViolation({
      ruleId: rule.ruleId,
      message: `Content matches disallowed pattern (rule: ${rule.ruleId})`,
      severity: "high",
    });
  }
  return null;
}

function evaluateMetadataRule(
  content: EvaluableContent,
  rule: PolicyRule
): PolicyViolation | null {
  const metadata = content.metadata ?? {};
  const config = rule.config ?? {};

  const requiredKeys = config.requiredKeys as string[] | undefined;
  if (Array.isArray(requiredKeys)) {
    for (const key of requiredKeys) {
      if (!(key in metadata)) {
        return createPolicyViolation({
          ruleId: rule.ruleId,
          message: `Missing required metadata key: ${key}`,
          severity: "medium",
        });
      }
    }
  }

  const maxLength = config.maxLength as number | undefined;
  if (typeof maxLength === "number" && typeof content.text === "string") {
    if (content.text.length > maxLength) {
      return createPolicyViolation({
        ruleId: rule.ruleId,
        message: `Content length ${content.text.length} exceeds max ${maxLength}`,
        severity: "low",
      });
    }
  }

  return null;
}

/**
 * Application service that evaluates content against policy.
 */
export class ContentPolicyEvaluator {
  /**
   * Evaluate content against the given policy. Returns all violations.
   */
  evaluate(content: EvaluableContent, policy: PlatformPolicy): PolicyViolation[] {
    return evaluateContentAgainstPolicy(content, policy);
  }
}
