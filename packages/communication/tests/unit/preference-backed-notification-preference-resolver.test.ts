/**
 * Unit tests for PreferenceBackedNotificationPreferenceResolver (COMP-028.5).
 */

import { describe, it, expect } from "vitest";
import { NotificationPreferences } from "../../src/domain/notification-preferences.js";
import { InMemoryNotificationPreferencesRepository } from "../../src/infrastructure/repositories/in-memory-notification-preferences-repository.js";
import { PreferenceBackedNotificationPreferenceResolver } from "../../src/infrastructure/preference-backed-notification-preference-resolver.js";

describe("PreferenceBackedNotificationPreferenceResolver", () => {
  it("returns all three channels when user has no preferences", async () => {
    const repo = new InMemoryNotificationPreferencesRepository();
    const resolver = new PreferenceBackedNotificationPreferenceResolver(repo);
    const channels = await resolver.getEnabledChannels("user-1", "dip_artifact_published");
    expect(channels).toEqual(["in_app", "email", "push"]);
  });

  it("returns empty array when muteUntil is in the future", async () => {
    const repo = new InMemoryNotificationPreferencesRepository();
    const future = new Date(Date.now() + 86400000);
    await repo.save(
      new NotificationPreferences({
        userId: "user-1",
        muteUntil: future,
        channelPreferences: { dip_artifact_published: ["in_app", "email"] },
      })
    );
    const resolver = new PreferenceBackedNotificationPreferenceResolver(repo);
    const channels = await resolver.getEnabledChannels("user-1", "dip_artifact_published");
    expect(channels).toEqual([]);
  });

  it("returns channels from preferences when muteUntil is in the past", async () => {
    const repo = new InMemoryNotificationPreferencesRepository();
    const past = new Date(Date.now() - 86400000);
    await repo.save(
      new NotificationPreferences({
        userId: "user-1",
        muteUntil: past,
        channelPreferences: { dip_artifact_published: ["in_app", "email"] },
      })
    );
    const resolver = new PreferenceBackedNotificationPreferenceResolver(repo);
    const channels = await resolver.getEnabledChannels("user-1", "dip_artifact_published");
    expect(channels).toEqual(["in_app", "email"]);
  });

  it("returns per-type channels for given notification type", async () => {
    const repo = new InMemoryNotificationPreferencesRepository();
    await repo.save(
      new NotificationPreferences({
        userId: "user-1",
        muteUntil: null,
        channelPreferences: {
          dip_artifact_published: ["in_app"],
          hub_contribution_integrated: ["in_app", "email", "push"],
        },
      })
    );
    const resolver = new PreferenceBackedNotificationPreferenceResolver(repo);
    expect(await resolver.getEnabledChannels("user-1", "dip_artifact_published")).toEqual([
      "in_app",
    ]);
    expect(await resolver.getEnabledChannels("user-1", "hub_contribution_integrated")).toEqual([
      "in_app",
      "email",
      "push",
    ]);
  });

  it("returns all channels for notification type missing from preferences", async () => {
    const repo = new InMemoryNotificationPreferencesRepository();
    await repo.save(
      new NotificationPreferences({
        userId: "user-1",
        muteUntil: null,
        channelPreferences: { dip_artifact_published: ["email"] },
      })
    );
    const resolver = new PreferenceBackedNotificationPreferenceResolver(repo);
    const channels = await resolver.getEnabledChannels("user-1", "unknown_type");
    expect(channels).toEqual(["in_app", "email", "push"]);
  });
});
