/**
 * PlatformPolicy aggregate (COMP-031.3).
 * Architecture: Governance & Moderation domain, PAT-004.
 */

import type { PolicyRule } from "./policy-rule.js";

export interface PlatformPolicyParams {
  id: string;
  policyType: string;
  version: number;
  rules: readonly PolicyRule[];
  isActive: boolean;
  enactedAt: Date;
}

/**
 * PlatformPolicy aggregate. Versioned set of policy rules.
 * Immutable; addRule/removeRule return new instances.
 */
export class PlatformPolicy {
  readonly id: string;
  readonly policyType: string;
  readonly version: number;
  readonly rules: readonly PolicyRule[];
  readonly isActive: boolean;
  readonly enactedAt: Date;

  private constructor(params: PlatformPolicyParams) {
    this.id = params.id;
    this.policyType = params.policyType;
    this.version = params.version;
    this.rules = [...params.rules];
    this.isActive = params.isActive;
    this.enactedAt = params.enactedAt;
  }

  static create(params: {
    id: string;
    policyType: string;
    version?: number;
    enactedAt?: Date;
  }): PlatformPolicy {
    if (!params.id?.trim()) {
      throw new Error("PlatformPolicy.id cannot be empty");
    }
    if (!params.policyType?.trim()) {
      throw new Error("PlatformPolicy.policyType cannot be empty");
    }
    return new PlatformPolicy({
      id: params.id,
      policyType: params.policyType,
      version: params.version ?? 1,
      rules: [],
      isActive: true,
      enactedAt: params.enactedAt ?? new Date(),
    });
  }

  static fromPersistence(params: PlatformPolicyParams): PlatformPolicy {
    return new PlatformPolicy(params);
  }

  /**
   * Return a new policy with the rule added.
   */
  addRule(rule: PolicyRule): PlatformPolicy {
    const existingIds = new Set(this.rules.map((r) => r.ruleId));
    if (existingIds.has(rule.ruleId)) {
      throw new Error(`PlatformPolicy already has rule with id: ${rule.ruleId}`);
    }
    return new PlatformPolicy({
      ...this,
      rules: [...this.rules, rule],
    });
  }

  /**
   * Return a new policy with the rule removed by ruleId.
   */
  removeRule(ruleId: string): PlatformPolicy {
    const filtered = this.rules.filter((r) => r.ruleId !== ruleId);
    if (filtered.length === this.rules.length) {
      throw new Error(`PlatformPolicy has no rule with id: ${ruleId}`);
    }
    return new PlatformPolicy({
      ...this,
      rules: filtered,
    });
  }

  /**
   * Return a new policy with isActive set (e.g. for versioning: deactivate old, activate new).
   */
  setActive(active: boolean): PlatformPolicy {
    return new PlatformPolicy({
      id: this.id,
      policyType: this.policyType,
      version: this.version,
      rules: this.rules,
      isActive: active,
      enactedAt: this.enactedAt,
    });
  }

  /**
   * Return a new policy with incremented version (for versioned updates).
   */
  withNextVersion(): PlatformPolicy {
    return new PlatformPolicy({
      id: this.id,
      policyType: this.policyType,
      version: this.version + 1,
      rules: this.rules,
      isActive: this.isActive,
      enactedAt: new Date(),
    });
  }
}
