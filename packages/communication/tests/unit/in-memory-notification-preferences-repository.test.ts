/**
 * Unit tests for InMemoryNotificationPreferencesRepository (COMP-028.5).
 */

import { describe, it, expect } from "vitest";
import { NotificationPreferences } from "../../src/domain/notification-preferences.js";
import { InMemoryNotificationPreferencesRepository } from "../../src/infrastructure/repositories/in-memory-notification-preferences-repository.js";

describe("InMemoryNotificationPreferencesRepository", () => {
  it("returns null when no preferences saved for user", async () => {
    const repo = new InMemoryNotificationPreferencesRepository();
    const result = await repo.getByUserId("user-1");
    expect(result).toBeNull();
  });

  it("saves and retrieves preferences by userId", async () => {
    const repo = new InMemoryNotificationPreferencesRepository();
    const prefs = new NotificationPreferences({
      userId: "user-1",
      muteUntil: null,
      channelPreferences: { type_a: ["in_app"] },
    });
    await repo.save(prefs);
    const loaded = await repo.getByUserId("user-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.userId).toBe("user-1");
    expect(loaded!.channelPreferences).toEqual({ type_a: ["in_app"] });
  });

  it("overwrites existing preferences when saving same userId again", async () => {
    const repo = new InMemoryNotificationPreferencesRepository();
    await repo.save(
      new NotificationPreferences({
        userId: "user-1",
        muteUntil: null,
        channelPreferences: { type_a: ["in_app"] },
      })
    );
    const updated = new NotificationPreferences({
      userId: "user-1",
      muteUntil: new Date("2026-06-01Z"),
      channelPreferences: { type_a: ["email"], type_b: ["push"] },
    });
    await repo.save(updated);
    const loaded = await repo.getByUserId("user-1");
    expect(loaded!.muteUntil).toEqual(new Date("2026-06-01Z"));
    expect(loaded!.channelPreferences).toEqual({
      type_a: ["email"],
      type_b: ["push"],
    });
  });

  it("clear removes all stored preferences", async () => {
    const repo = new InMemoryNotificationPreferencesRepository();
    await repo.save(
      new NotificationPreferences({
        userId: "user-1",
        muteUntil: null,
        channelPreferences: {},
      })
    );
    repo.clear();
    const result = await repo.getByUserId("user-1");
    expect(result).toBeNull();
  });
});
