/**
 * Unit tests for PlatformPolicy aggregate (COMP-031.3).
 */

import { describe, it, expect } from "vitest";
import { PlatformPolicy } from "../../src/domain/platform-policy.js";
import { PolicyRule } from "../../src/domain/policy-rule.js";
import { RuleType } from "../../src/domain/policy-rule.js";

describe("PlatformPolicy", () => {
  describe("create", () => {
    it("creates a policy with default version 1 and empty rules", () => {
      const policy = PlatformPolicy.create({
        id: "pol-1",
        policyType: "content",
      });

      expect(policy.id).toBe("pol-1");
      expect(policy.policyType).toBe("content");
      expect(policy.version).toBe(1);
      expect(policy.rules).toHaveLength(0);
      expect(policy.isActive).toBe(true);
      expect(policy.enactedAt).toBeInstanceOf(Date);
    });

    it("throws when id is empty", () => {
      expect(() =>
        PlatformPolicy.create({ id: "", policyType: "content" })
      ).toThrow(/id cannot be empty/);
    });

    it("throws when policyType is empty", () => {
      expect(() =>
        PlatformPolicy.create({ id: "pol-1", policyType: "" })
      ).toThrow(/policyType cannot be empty/);
    });
  });

  describe("addRule / removeRule", () => {
    it("addRule returns new policy with rule added", () => {
      const policy = PlatformPolicy.create({ id: "p1", policyType: "content" });
      const rule = PolicyRule.create({
        ruleId: "r1",
        ruleType: RuleType.TextPattern,
        pattern: "spam",
      });

      const updated = policy.addRule(rule);

      expect(updated.rules).toHaveLength(1);
      expect(updated.rules[0].ruleId).toBe("r1");
      expect(policy.rules).toHaveLength(0);
    });

    it("removeRule returns new policy with rule removed", () => {
      const rule = PolicyRule.create({
        ruleId: "r1",
        ruleType: RuleType.Metadata,
      });
      const policy = PlatformPolicy.fromPersistence({
        id: "p1",
        policyType: "content",
        version: 1,
        rules: [rule],
        isActive: true,
        enactedAt: new Date(),
      });

      const updated = policy.removeRule("r1");

      expect(updated.rules).toHaveLength(0);
      expect(policy.rules).toHaveLength(1);
    });

    it("addRule throws when ruleId already exists", () => {
      const rule = PolicyRule.create({
        ruleId: "r1",
        ruleType: RuleType.TextPattern,
      });
      const policy = PlatformPolicy.create({ id: "p1", policyType: "content" })
        .addRule(rule);

      expect(() => policy.addRule(rule)).toThrow(/already has rule with id/);
    });

    it("removeRule throws when ruleId not found", () => {
      const policy = PlatformPolicy.create({ id: "p1", policyType: "content" });

      expect(() => policy.removeRule("r99")).toThrow(/has no rule with id/);
    });
  });

  describe("versioning", () => {
    it("withNextVersion increments version and updates enactedAt", () => {
      const enacted = new Date("2026-01-01T00:00:00Z");
      const policy = PlatformPolicy.fromPersistence({
        id: "p1",
        policyType: "content",
        version: 2,
        rules: [],
        isActive: true,
        enactedAt: enacted,
      });

      const next = policy.withNextVersion();

      expect(next.version).toBe(3);
      expect(next.enactedAt.getTime()).toBeGreaterThanOrEqual(enacted.getTime());
    });

    it("setActive returns new policy with isActive updated", () => {
      const policy = PlatformPolicy.create({ id: "p1", policyType: "content" });
      const inactive = policy.setActive(false);

      expect(inactive.isActive).toBe(false);
      expect(policy.isActive).toBe(true);
    });
  });

  describe("fromPersistence", () => {
    it("reconstructs policy with all fields", () => {
      const rule = PolicyRule.create({
        ruleId: "r1",
        ruleType: RuleType.TextPattern,
        pattern: ".*spam.*",
      });
      const enacted = new Date("2026-01-15T10:00:00Z");
      const policy = PlatformPolicy.fromPersistence({
        id: "pol-1",
        policyType: "privacy",
        version: 3,
        rules: [rule],
        isActive: false,
        enactedAt: enacted,
      });

      expect(policy.id).toBe("pol-1");
      expect(policy.policyType).toBe("privacy");
      expect(policy.version).toBe(3);
      expect(policy.rules).toHaveLength(1);
      expect(policy.rules[0].ruleId).toBe("r1");
      expect(policy.isActive).toBe(false);
      expect(policy.enactedAt).toEqual(enacted);
    });
  });
});
