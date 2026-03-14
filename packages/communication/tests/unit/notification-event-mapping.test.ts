/**
 * Unit tests for notification event mapping (COMP-028.3).
 */

import { describe, it, expect } from "vitest";
import {
  mapEventToNotifications,
  recipientFromPayload,
  eventTypeToNotificationType,
  NOTIFICATION_TRIGGER_EVENT_TYPES,
} from "../../src/infrastructure/notification-event-mapping.js";

describe("notification-event-mapping (COMP-028.3)", () => {
  it("returns notification DTO for dip.artifact.published with actorId", () => {
    const payload = { actorId: "user-123", artifactId: "art-1", title: "My Artifact" };
    const result = mapEventToNotifications("dip.artifact.published", payload);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      userId: "user-123",
      notificationType: "dip_artifact_published",
      payload: expect.objectContaining({ eventType: "dip.artifact.published", artifactId: "art-1", title: "My Artifact" }),
    });
  });

  it("returns empty array for event type that does not trigger notifications", () => {
    const result = mapEventToNotifications("dip.artifact.drafted", { actorId: "u1" });
    expect(result).toHaveLength(0);
  });

  it("returns empty array when recipient cannot be determined", () => {
    const result = mapEventToNotifications("dip.artifact.published", { artifactId: "art-1" });
    expect(result).toHaveLength(0);
  });

  it("extracts recipient from author_id", () => {
    const result = mapEventToNotifications("labs.review.submitted", {
      author_id: "author-1",
      articleId: "art-1",
    });
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe("author-1");
  });

  it("eventTypeToNotificationType replaces dots with underscores", () => {
    expect(eventTypeToNotificationType("dip.artifact.published")).toBe("dip_artifact_published");
    expect(eventTypeToNotificationType("hub.contribution.integrated")).toBe("hub_contribution_integrated");
  });

  it("recipientFromPayload returns first matching field", () => {
    expect(recipientFromPayload({ actorId: "a1" })).toBe("a1");
    expect(recipientFromPayload({ actor_id: "a2" })).toBe("a2");
    expect(recipientFromPayload({ userId: "u1" })).toBe("u1");
    expect(recipientFromPayload({ recipientId: "r1" })).toBe("r1");
    expect(recipientFromPayload({})).toBeNull();
    expect(recipientFromPayload({ actorId: "" })).toBeNull();
  });

  it("all expected trigger event types are in the set", () => {
    expect(NOTIFICATION_TRIGGER_EVENT_TYPES.has("dip.artifact.published")).toBe(true);
    expect(NOTIFICATION_TRIGGER_EVENT_TYPES.has("hub.contribution.integrated")).toBe(true);
    expect(NOTIFICATION_TRIGGER_EVENT_TYPES.has("learn.mentorship.proposed")).toBe(true);
    expect(NOTIFICATION_TRIGGER_EVENT_TYPES.has("labs.review.submitted")).toBe(true);
  });
});
