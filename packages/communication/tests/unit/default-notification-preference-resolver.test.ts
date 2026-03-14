/**
 * Unit tests for DefaultNotificationPreferenceResolver (COMP-028.4).
 */

import { describe, it, expect } from "vitest";
import { DefaultNotificationPreferenceResolver } from "../../src/infrastructure/default-notification-preference-resolver.js";

describe("DefaultNotificationPreferenceResolver", () => {
  it("returns all three channels for any user and notification type", async () => {
    const resolver = new DefaultNotificationPreferenceResolver();
    const channels = await resolver.getEnabledChannels("user-1", "artifact_published");
    expect(channels).toEqual(["in_app", "email", "push"]);
  });

  it("returns same channels for different inputs", async () => {
    const resolver = new DefaultNotificationPreferenceResolver();
    const a = await resolver.getEnabledChannels("user-a", "type-x");
    const b = await resolver.getEnabledChannels("user-b", "type-y");
    expect(a).toEqual(b);
    expect(a).toHaveLength(3);
  });
});
