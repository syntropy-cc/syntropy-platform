/**
 * Unit tests for Notification entity (COMP-028.3).
 */

import { describe, it, expect } from "vitest";
import { Notification } from "../../src/domain/notification.js";

describe("Notification (COMP-028.3)", () => {
  it("creates with valid params", () => {
    const createdAt = new Date("2026-03-14T12:00:00Z");
    const notification = new Notification({
      id: "notif-1",
      userId: "user-1",
      notificationType: "artifact_published",
      sourceEventType: "dip.artifact.published",
      payload: { entityId: "art-1", title: "My Artifact" },
      isRead: false,
      createdAt,
    });
    expect(notification.id).toBe("notif-1");
    expect(notification.userId).toBe("user-1");
    expect(notification.notificationType).toBe("artifact_published");
    expect(notification.sourceEventType).toBe("dip.artifact.published");
    expect(notification.payload).toEqual({ entityId: "art-1", title: "My Artifact" });
    expect(notification.isRead).toBe(false);
    expect(notification.createdAt).toBe(createdAt);
  });

  it("throws when id is empty", () => {
    expect(
      () =>
        new Notification({
          id: "",
          userId: "u1",
          notificationType: "x",
          sourceEventType: "dip.artifact.published",
          payload: {},
          isRead: false,
          createdAt: new Date(),
        })
    ).toThrow("id cannot be empty");
  });

  it("throws when userId is empty", () => {
    expect(
      () =>
        new Notification({
          id: "n1",
          userId: "",
          notificationType: "x",
          sourceEventType: "dip.artifact.published",
          payload: {},
          isRead: false,
          createdAt: new Date(),
        })
    ).toThrow("userId cannot be empty");
  });

  it("throws when notificationType is empty", () => {
    expect(
      () =>
        new Notification({
          id: "n1",
          userId: "u1",
          notificationType: "",
          sourceEventType: "dip.artifact.published",
          payload: {},
          isRead: false,
          createdAt: new Date(),
        })
    ).toThrow("notificationType cannot be empty");
  });

  it("throws when sourceEventType is empty", () => {
    expect(
      () =>
        new Notification({
          id: "n1",
          userId: "u1",
          notificationType: "x",
          sourceEventType: "",
          payload: {},
          isRead: false,
          createdAt: new Date(),
        })
    ).toThrow("sourceEventType cannot be empty");
  });

  it("throws when createdAt is invalid", () => {
    expect(
      () =>
        new Notification({
          id: "n1",
          userId: "u1",
          notificationType: "x",
          sourceEventType: "dip.artifact.published",
          payload: {},
          isRead: false,
          createdAt: new Date("invalid"),
        })
    ).toThrow("createdAt must be a valid Date");
  });
});
