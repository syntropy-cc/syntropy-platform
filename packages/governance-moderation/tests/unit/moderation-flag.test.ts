/**
 * Unit tests for ModerationFlag aggregate (COMP-031.1).
 */

import { describe, it, expect } from "vitest";
import { ModerationFlag } from "../../src/domain/moderation-flag.js";
import { FlagStatus } from "../../src/domain/flag-status.js";

describe("ModerationFlag", () => {
  describe("create", () => {
    it("creates a flag in Pending status with required fields", () => {
      const flag = ModerationFlag.create({
        flagId: "flag-1",
        entityType: "article",
        entityId: "art-123",
        reason: "Potential spam",
      });

      expect(flag.flagId).toBe("flag-1");
      expect(flag.entityType).toBe("article");
      expect(flag.entityId).toBe("art-123");
      expect(flag.reason).toBe("Potential spam");
      expect(flag.status).toBe(FlagStatus.Pending);
      expect(flag.createdAt).toBeInstanceOf(Date);
    });

    it("throws when reason is empty", () => {
      expect(() =>
        ModerationFlag.create({
          flagId: "f1",
          entityType: "article",
          entityId: "a1",
          reason: "   ",
        })
      ).toThrow(/reason cannot be empty/);
    });

    it("throws when entityType is empty", () => {
      expect(() =>
        ModerationFlag.create({
          flagId: "f1",
          entityType: "",
          entityId: "a1",
          reason: "Spam",
        })
      ).toThrow(/entityType cannot be empty/);
    });

    it("throws when entityId is empty", () => {
      expect(() =>
        ModerationFlag.create({
          flagId: "f1",
          entityType: "article",
          entityId: "",
          reason: "Spam",
        })
      ).toThrow(/entityId cannot be empty/);
    });

    it("throws when flagId is empty", () => {
      expect(() =>
        ModerationFlag.create({
          flagId: "",
          entityType: "article",
          entityId: "a1",
          reason: "Spam",
        })
      ).toThrow(/flagId cannot be empty/);
    });
  });

  describe("startReview", () => {
    it("transitions Pending to UnderReview", () => {
      const flag = ModerationFlag.create({
        flagId: "f1",
        entityType: "comment",
        entityId: "c1",
        reason: "Harassment",
      });
      const updated = flag.startReview();

      expect(updated.status).toBe(FlagStatus.UnderReview);
      expect(updated.flagId).toBe(flag.flagId);
    });

    it("throws when status is not Pending", () => {
      const flag = ModerationFlag.create({
        flagId: "f1",
        entityType: "comment",
        entityId: "c1",
        reason: "Spam",
      }).startReview();

      expect(() => flag.startReview()).toThrow(/Cannot start review/);
    });
  });

  describe("resolve", () => {
    it("transitions Pending to Resolved", () => {
      const flag = ModerationFlag.create({
        flagId: "f1",
        entityType: "post",
        entityId: "p1",
        reason: "Spam",
      });
      const updated = flag.resolve();

      expect(updated.status).toBe(FlagStatus.Resolved);
    });

    it("transitions UnderReview to Resolved", () => {
      const flag = ModerationFlag.create({
        flagId: "f1",
        entityType: "post",
        entityId: "p1",
        reason: "Spam",
      })
        .startReview()
        .resolve();

      expect(flag.status).toBe(FlagStatus.Resolved);
    });

    it("throws when status is already Resolved", () => {
      const flag = ModerationFlag.create({
        flagId: "f1",
        entityType: "post",
        entityId: "p1",
        reason: "Spam",
      }).resolve();

      expect(() => flag.resolve()).toThrow(/Cannot resolve/);
    });
  });

  describe("dismiss", () => {
    it("transitions Pending to Dismissed", () => {
      const flag = ModerationFlag.create({
        flagId: "f1",
        entityType: "post",
        entityId: "p1",
        reason: "False report",
      }).dismiss();

      expect(flag.status).toBe(FlagStatus.Dismissed);
    });

    it("throws when status is already Resolved", () => {
      const flag = ModerationFlag.create({
        flagId: "f1",
        entityType: "post",
        entityId: "p1",
        reason: "Spam",
      }).resolve();

      expect(() => flag.dismiss()).toThrow(/Cannot dismiss/);
    });
  });

  describe("fromPersistence", () => {
    it("reconstructs flag with all fields", () => {
      const created = new Date("2026-01-15T10:00:00Z");
      const flag = ModerationFlag.fromPersistence({
        flagId: "f1",
        entityType: "article",
        entityId: "a1",
        reason: "Spam",
        status: FlagStatus.UnderReview,
        createdAt: created,
      });

      expect(flag.flagId).toBe("f1");
      expect(flag.status).toBe(FlagStatus.UnderReview);
      expect(flag.createdAt).toEqual(created);
    });
  });
});
