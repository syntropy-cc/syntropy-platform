/**
 * Unit tests for NotificationPreferences entity (COMP-028.5).
 */

import { describe, it, expect } from "vitest";
import { NotificationPreferences } from "../../src/domain/notification-preferences.js";

describe("NotificationPreferences (COMP-028.5)", () => {
  it("creates with valid params and null muteUntil", () => {
    const prefs = new NotificationPreferences({
      userId: "user-1",
      muteUntil: null,
      channelPreferences: {
        dip_artifact_published: ["in_app", "email"],
      },
    });
    expect(prefs.userId).toBe("user-1");
    expect(prefs.muteUntil).toBeNull();
    expect(prefs.channelPreferences).toEqual({
      dip_artifact_published: ["in_app", "email"],
    });
  });

  it("creates with muteUntil set to a valid date", () => {
    const muteUntil = new Date("2026-12-31T23:59:59Z");
    const prefs = new NotificationPreferences({
      userId: "user-2",
      muteUntil,
      channelPreferences: {},
    });
    expect(prefs.userId).toBe("user-2");
    expect(prefs.muteUntil).toEqual(muteUntil);
    expect(prefs.channelPreferences).toEqual({});
  });

  it("creates with empty channelPreferences", () => {
    const prefs = new NotificationPreferences({
      userId: "user-3",
      muteUntil: null,
      channelPreferences: {},
    });
    expect(prefs.channelPreferences).toEqual({});
  });

  it("throws when userId is empty", () => {
    expect(
      () =>
        new NotificationPreferences({
          userId: "",
          muteUntil: null,
          channelPreferences: {},
        })
    ).toThrow("userId cannot be empty");
  });

  it("throws when userId is whitespace only", () => {
    expect(
      () =>
        new NotificationPreferences({
          userId: "   ",
          muteUntil: null,
          channelPreferences: {},
        })
    ).toThrow("userId cannot be empty");
  });

  it("throws when muteUntil is invalid date", () => {
    expect(
      () =>
        new NotificationPreferences({
          userId: "user-1",
          muteUntil: new Date("invalid"),
          channelPreferences: {},
        })
    ).toThrow("muteUntil must be null or a valid Date");
  });

  it("throws when channelPreferences contains invalid channel", () => {
    expect(
      () =>
        new NotificationPreferences({
          userId: "user-1",
          muteUntil: null,
          channelPreferences: {
            some_type: ["in_app", "sms"] as ("in_app" | "email" | "push")[],
          },
        })
    ).toThrow(/Invalid channel/);
  });

  it("accepts all three valid channels in channelPreferences", () => {
    const prefs = new NotificationPreferences({
      userId: "user-1",
      muteUntil: null,
      channelPreferences: {
        type_a: ["in_app", "email", "push"],
      },
    });
    expect(prefs.channelPreferences.type_a).toEqual(["in_app", "email", "push"]);
  });
});
