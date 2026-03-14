/**
 * Unit tests for ModerationAction entity (COMP-031.2).
 */

import { describe, it, expect } from "vitest";
import { ModerationAction } from "../../src/domain/moderation-action.js";
import { ActionType } from "../../src/domain/action-type.js";

describe("ModerationAction", () => {
  describe("create", () => {
    it("creates an action with required fields and sets audit trail createdAt", () => {
      const action = ModerationAction.create({
        id: "act-1",
        flagId: "flag-1",
        moderatorId: "mod-1",
        actionType: ActionType.Remove,
        reason: "Spam content",
      });

      expect(action.id).toBe("act-1");
      expect(action.flagId).toBe("flag-1");
      expect(action.moderatorId).toBe("mod-1");
      expect(action.actionType).toBe(ActionType.Remove);
      expect(action.reason).toBe("Spam content");
      expect(action.createdAt).toBeInstanceOf(Date);
    });

    it("accepts all action types: approve, remove, warn, ban", () => {
      const types = [ActionType.Approve, ActionType.Remove, ActionType.Warn, ActionType.Ban];
      for (const actionType of types) {
        const action = ModerationAction.create({
          id: `act-${actionType}`,
          flagId: "f1",
          moderatorId: "m1",
          actionType,
          reason: "Test",
        });
        expect(action.actionType).toBe(actionType);
      }
    });

    it("throws when reason is empty", () => {
      expect(() =>
        ModerationAction.create({
          id: "act-1",
          flagId: "f1",
          moderatorId: "m1",
          actionType: ActionType.Warn,
          reason: "   ",
        })
      ).toThrow(/reason cannot be empty/);
    });

    it("throws when actionType is invalid", () => {
      expect(() =>
        ModerationAction.create({
          id: "act-1",
          flagId: "f1",
          moderatorId: "m1",
          actionType: "invalid" as never,
          reason: "Test",
        })
      ).toThrow(/actionType must be one of/);
    });

    it("throws when id is empty", () => {
      expect(() =>
        ModerationAction.create({
          id: "",
          flagId: "f1",
          moderatorId: "m1",
          actionType: ActionType.Ban,
          reason: "Test",
        })
      ).toThrow(/id cannot be empty/);
    });

    it("throws when flagId is empty", () => {
      expect(() =>
        ModerationAction.create({
          id: "act-1",
          flagId: "",
          moderatorId: "m1",
          actionType: ActionType.Approve,
          reason: "Test",
        })
      ).toThrow(/flagId cannot be empty/);
    });

    it("throws when moderatorId is empty", () => {
      expect(() =>
        ModerationAction.create({
          id: "act-1",
          flagId: "f1",
          moderatorId: "",
          actionType: ActionType.Warn,
          reason: "Test",
        })
      ).toThrow(/moderatorId cannot be empty/);
    });
  });

  describe("fromPersistence", () => {
    it("reconstructs action with all fields including createdAt", () => {
      const createdAt = new Date("2026-01-15T10:00:00Z");
      const action = ModerationAction.fromPersistence({
        id: "act-1",
        flagId: "flag-1",
        moderatorId: "mod-1",
        actionType: ActionType.Ban,
        reason: "Repeated violations",
        createdAt,
      });

      expect(action.id).toBe("act-1");
      expect(action.flagId).toBe("flag-1");
      expect(action.moderatorId).toBe("mod-1");
      expect(action.actionType).toBe(ActionType.Ban);
      expect(action.reason).toBe("Repeated violations");
      expect(action.createdAt).toEqual(createdAt);
    });
  });
});
