/**
 * Unit tests for ContentPolicyEvaluator (COMP-031.4).
 */

import { describe, it, expect } from "vitest";
import { ContentPolicyEvaluator } from "../../src/application/content-policy-evaluator.js";
import { PlatformPolicy } from "../../src/domain/platform-policy.js";
import { PolicyRule } from "../../src/domain/policy-rule.js";
import { RuleType } from "../../src/domain/policy-rule.js";

describe("ContentPolicyEvaluator", () => {
  const evaluator = new ContentPolicyEvaluator();

  describe("evaluate", () => {
    it("returns no violations when policy has no rules", () => {
      const policy = PlatformPolicy.create({
        id: "p1",
        policyType: "content",
      });
      const violations = evaluator.evaluate(
        { text: "anything", metadata: {} },
        policy
      );
      expect(violations).toHaveLength(0);
    });

    it("returns no violations when content passes text pattern rule", () => {
      const rule = PolicyRule.create({
        ruleId: "r1",
        ruleType: RuleType.TextPattern,
        pattern: "spam",
      });
      const policy = PlatformPolicy.create({
        id: "p1",
        policyType: "content",
      }).addRule(rule);
      const violations = evaluator.evaluate(
        { text: "hello world" },
        policy
      );
      expect(violations).toHaveLength(0);
    });

    it("returns violation when content matches text pattern rule", () => {
      const rule = PolicyRule.create({
        ruleId: "r1",
        ruleType: RuleType.TextPattern,
        pattern: "spam",
      });
      const policy = PlatformPolicy.create({
        id: "p1",
        policyType: "content",
      }).addRule(rule);
      const violations = evaluator.evaluate(
        { text: "this is spam content" },
        policy
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe("r1");
      expect(violations[0].message).toContain("disallowed pattern");
      expect(violations[0].severity).toBe("high");
    });

    it("returns violation when content matches regex pattern", () => {
      const rule = PolicyRule.create({
        ruleId: "r2",
        ruleType: RuleType.TextPattern,
        pattern: "\\b(viagra|casino)\\b",
      });
      const policy = PlatformPolicy.create({
        id: "p1",
        policyType: "content",
      }).addRule(rule);
      const violations = evaluator.evaluate(
        { text: "check out this casino offer" },
        policy
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe("r2");
    });

    it("returns violation when metadata missing required key", () => {
      const rule = PolicyRule.create({
        ruleId: "r1",
        ruleType: RuleType.Metadata,
        config: { requiredKeys: ["authorId", "contentType"] },
      });
      const policy = PlatformPolicy.create({
        id: "p1",
        policyType: "content",
      }).addRule(rule);
      const violations = evaluator.evaluate(
        { metadata: { authorId: "u1" } },
        policy
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe("r1");
      expect(violations[0].message).toContain("Missing required metadata key");
      expect(violations[0].message).toContain("contentType");
    });

    it("returns no violations when metadata has all required keys", () => {
      const rule = PolicyRule.create({
        ruleId: "r1",
        ruleType: RuleType.Metadata,
        config: { requiredKeys: ["authorId"] },
      });
      const policy = PlatformPolicy.create({
        id: "p1",
        policyType: "content",
      }).addRule(rule);
      const violations = evaluator.evaluate(
        { metadata: { authorId: "u1" } },
        policy
      );
      expect(violations).toHaveLength(0);
    });

    it("returns violation when text exceeds maxLength from metadata rule", () => {
      const rule = PolicyRule.create({
        ruleId: "r1",
        ruleType: RuleType.Metadata,
        config: { maxLength: 10 },
      });
      const policy = PlatformPolicy.create({
        id: "p1",
        policyType: "content",
      }).addRule(rule);
      const violations = evaluator.evaluate(
        { text: "this is way too long" },
        policy
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe("r1");
      expect(violations[0].message).toContain("exceeds max 10");
    });

    it("returns multiple violations when several rules fail", () => {
      const r1 = PolicyRule.create({
        ruleId: "r1",
        ruleType: RuleType.TextPattern,
        pattern: "spam",
      });
      const r2 = PolicyRule.create({
        ruleId: "r2",
        ruleType: RuleType.Metadata,
        config: { requiredKeys: ["authorId"] },
      });
      const policy = PlatformPolicy.create({
        id: "p1",
        policyType: "content",
      })
        .addRule(r1)
        .addRule(r2);
      const violations = evaluator.evaluate(
        { text: "spam here", metadata: {} },
        policy
      );
      expect(violations).toHaveLength(2);
      const ruleIds = violations.map((v) => v.ruleId).sort();
      expect(ruleIds).toEqual(["r1", "r2"]);
    });

    it("returns no violations when policy is inactive", () => {
      const rule = PolicyRule.create({
        ruleId: "r1",
        ruleType: RuleType.TextPattern,
        pattern: "spam",
      });
      const policy = PlatformPolicy.create({
        id: "p1",
        policyType: "content",
      })
        .addRule(rule)
        .setActive(false);
      const violations = evaluator.evaluate(
        { text: "spam content" },
        policy
      );
      expect(violations).toHaveLength(0);
    });
  });
});
