/**
 * Unit tests for NotificationDeliveryService (COMP-028.4).
 */

import { describe, it, expect, vi } from "vitest";
import { Notification } from "../../src/domain/notification.js";
import { NotificationDeliveryService } from "../../src/application/notification-delivery-service.js";
import { InMemoryNotificationRepository } from "../../src/infrastructure/repositories/in-memory-notification-repository.js";

function createNotification(overrides: Partial<ConstructorParameters<typeof Notification>[0]> = {}): Notification {
  return new Notification({
    id: "n-1",
    userId: "user-1",
    notificationType: "artifact_published",
    sourceEventType: "dip.artifact.published",
    payload: { title: "My Artifact" },
    isRead: false,
    createdAt: new Date("2026-03-14T12:00:00Z"),
    ...overrides,
  });
}

describe("NotificationDeliveryService (COMP-028.4)", () => {
  it("delivers in_app only when preference resolver returns only in_app", async () => {
    const repository = new InMemoryNotificationRepository();
    const saveSpy = vi.spyOn(repository, "save");
    const preferenceResolver = {
      getEnabledChannels: vi.fn().mockResolvedValue(["in_app"]),
    };
    const userEmailResolver = { resolveEmail: vi.fn().mockResolvedValue("u@example.com") };
    const pushTokenProvider = { getTokens: vi.fn().mockResolvedValue(["token1"]) };
    const emailSender = { send: vi.fn().mockResolvedValue(undefined) };
    const pushSender = { send: vi.fn().mockResolvedValue(undefined) };

    const service = new NotificationDeliveryService({
      repository,
      preferenceResolver: preferenceResolver as any,
      userEmailResolver: userEmailResolver as any,
      pushTokenProvider: pushTokenProvider as any,
      emailSender: emailSender as any,
      pushSender: pushSender as any,
    });

    const notification = createNotification();
    const result = await service.deliver(notification);

    expect(result.inApp).toBe(true);
    expect(result.emailSent).toBe(false);
    expect(result.pushSent).toBe(false);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(notification);
    expect(emailSender.send).not.toHaveBeenCalled();
    expect(pushSender.send).not.toHaveBeenCalled();
  });

  it("delivers in_app and email when email channel enabled and user has email", async () => {
    const repository = new InMemoryNotificationRepository();
    const preferenceResolver = {
      getEnabledChannels: vi.fn().mockResolvedValue(["in_app", "email"]),
    };
    const userEmailResolver = { resolveEmail: vi.fn().mockResolvedValue("user@example.com") };
    const pushTokenProvider = { getTokens: vi.fn().mockResolvedValue([]) };
    const emailSender = { send: vi.fn().mockResolvedValue(undefined) };
    const pushSender = { send: vi.fn().mockResolvedValue(undefined) };

    const service = new NotificationDeliveryService({
      repository,
      preferenceResolver: preferenceResolver as any,
      userEmailResolver: userEmailResolver as any,
      pushTokenProvider: pushTokenProvider as any,
      emailSender: emailSender as any,
      pushSender: pushSender as any,
    });

    const notification = createNotification();
    const result = await service.deliver(notification);

    expect(result.inApp).toBe(true);
    expect(result.emailSent).toBe(true);
    expect(result.pushSent).toBe(false);
    expect(emailSender.send).toHaveBeenCalledTimes(1);
    expect(emailSender.send).toHaveBeenCalledWith({
      to: "user@example.com",
      subject: "Notification: artifact published",
      body: "You have a new notification: My Artifact.",
    });
    expect(pushSender.send).not.toHaveBeenCalled();
  });

  it("does not call email sender when UserEmailResolver returns null", async () => {
    const repository = new InMemoryNotificationRepository();
    const preferenceResolver = {
      getEnabledChannels: vi.fn().mockResolvedValue(["in_app", "email"]),
    };
    const userEmailResolver = { resolveEmail: vi.fn().mockResolvedValue(null) };
    const emailSender = { send: vi.fn().mockResolvedValue(undefined) };

    const service = new NotificationDeliveryService({
      repository,
      preferenceResolver: preferenceResolver as any,
      userEmailResolver: userEmailResolver as any,
      pushTokenProvider: { getTokens: vi.fn().mockResolvedValue([]) } as any,
      emailSender: emailSender as any,
      pushSender: null,
    });

    const result = await service.deliver(createNotification());

    expect(result.emailSent).toBe(false);
    expect(emailSender.send).not.toHaveBeenCalled();
  });

  it("delivers in_app and push when push channel enabled and user has tokens", async () => {
    const repository = new InMemoryNotificationRepository();
    const preferenceResolver = {
      getEnabledChannels: vi.fn().mockResolvedValue(["in_app", "push"]),
    };
    const pushTokenProvider = { getTokens: vi.fn().mockResolvedValue(["fcm-token-1"]) };
    const pushSender = { send: vi.fn().mockResolvedValue(undefined) };

    const service = new NotificationDeliveryService({
      repository,
      preferenceResolver: preferenceResolver as any,
      userEmailResolver: { resolveEmail: vi.fn().mockResolvedValue(null) } as any,
      pushTokenProvider: pushTokenProvider as any,
      emailSender: null,
      pushSender: pushSender as any,
    });

    const notification = createNotification();
    const result = await service.deliver(notification);

    expect(result.inApp).toBe(true);
    expect(result.pushSent).toBe(true);
    expect(pushSender.send).toHaveBeenCalledTimes(1);
    expect(pushSender.send).toHaveBeenCalledWith(
      expect.objectContaining({
        tokens: ["fcm-token-1"],
        title: "artifact published",
        body: "My Artifact",
        data: { notificationId: "n-1", notificationType: "artifact_published" },
      })
    );
  });

  it("does not call push sender when PushTokenProvider returns empty array", async () => {
    const repository = new InMemoryNotificationRepository();
    const preferenceResolver = {
      getEnabledChannels: vi.fn().mockResolvedValue(["in_app", "push"]),
    };
    const pushTokenProvider = { getTokens: vi.fn().mockResolvedValue([]) };
    const pushSender = { send: vi.fn().mockResolvedValue(undefined) };

    const service = new NotificationDeliveryService({
      repository,
      preferenceResolver: preferenceResolver as any,
      userEmailResolver: { resolveEmail: vi.fn().mockResolvedValue(null) } as any,
      pushTokenProvider: pushTokenProvider as any,
      emailSender: null,
      pushSender: pushSender as any,
    });

    const result = await service.deliver(createNotification());

    expect(result.pushSent).toBe(false);
    expect(pushSender.send).not.toHaveBeenCalled();
  });

  it("retries email send on transient failure", async () => {
    const repository = new InMemoryNotificationRepository();
    const preferenceResolver = {
      getEnabledChannels: vi.fn().mockResolvedValue(["in_app", "email"]),
    };
    const userEmailResolver = { resolveEmail: vi.fn().mockResolvedValue("u@example.com") };
    const emailSender = {
      send: vi.fn().mockRejectedValueOnce(new Error("ECONNRESET")).mockResolvedValueOnce(undefined),
    };

    const service = new NotificationDeliveryService({
      repository,
      preferenceResolver: preferenceResolver as any,
      userEmailResolver: userEmailResolver as any,
      pushTokenProvider: { getTokens: vi.fn().mockResolvedValue([]) } as any,
      emailSender: emailSender as any,
      pushSender: null,
    });

    const result = await service.deliver(createNotification());

    expect(result.emailSent).toBe(true);
    expect(emailSender.send).toHaveBeenCalledTimes(2);
  });
});
