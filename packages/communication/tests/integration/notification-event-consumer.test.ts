/**
 * Integration tests for NotificationEventConsumer (COMP-028.3).
 * Uses in-memory repository and mock consumer; no real Kafka.
 */

import { describe, it, expect } from "vitest";
import type { ConsumedMessage } from "@syntropy/event-bus";
import { NotificationEventConsumer } from "../../src/infrastructure/consumers/notification-event-consumer.js";
import { InMemoryNotificationRepository } from "../../src/infrastructure/repositories/in-memory-notification-repository.js";

function makeMessage(
  topic: string,
  eventType: string,
  payload: Record<string, unknown>
): ConsumedMessage {
  const value = Buffer.from(JSON.stringify({ eventType, payload }), "utf8");
  return {
    topic,
    partition: 0,
    offset: "0",
    key: null,
    value,
  };
}

describe("NotificationEventConsumer (COMP-028.3)", () => {
  it("creates and persists notification when processing dip.artifact.published event", async () => {
    const repository = new InMemoryNotificationRepository();
    let capturedHandler: ((msg: ConsumedMessage) => Promise<void>) | null = null;
    const mockConsumer = {
      subscribeMany(_topics: string[], handler: (msg: ConsumedMessage) => Promise<void>) {
        capturedHandler = handler;
      },
      disconnect: async () => {},
    };

    const consumer = new NotificationEventConsumer({
      consumer: mockConsumer as any,
      repository,
    });
    consumer.start();
    expect(capturedHandler).not.toBeNull();

    const msg = makeMessage("dip.events", "dip.artifact.published", {
      actorId: "user-123",
      artifactId: "art-1",
      title: "My Artifact",
    });
    await capturedHandler!(msg);

    const all = repository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].userId).toBe("user-123");
    expect(all[0].notificationType).toBe("dip_artifact_published");
    expect(all[0].sourceEventType).toBe("dip.artifact.published");
    expect(all[0].payload).toMatchObject({ eventType: "dip.artifact.published", artifactId: "art-1", title: "My Artifact" });
    expect(all[0].isRead).toBe(false);
    expect(all[0].createdAt).toBeInstanceOf(Date);
    expect(all[0].id).toBeDefined();
    expect(typeof all[0].id).toBe("string");
  });

  it("does not create notification for event type that does not trigger notifications", async () => {
    const repository = new InMemoryNotificationRepository();
    let capturedHandler: ((msg: ConsumedMessage) => Promise<void>) | null = null;
    const mockConsumer = {
      subscribeMany(_topics: string[], handler: (msg: ConsumedMessage) => Promise<void>) {
        capturedHandler = handler;
      },
      disconnect: async () => {},
    };

    const consumer = new NotificationEventConsumer({
      consumer: mockConsumer as any,
      repository,
    });
    consumer.start();

    const msg = makeMessage("dip.events", "dip.artifact.drafted", {
      actorId: "user-1",
      artifactId: "art-1",
    });
    await capturedHandler!(msg);

    expect(repository.getAll()).toHaveLength(0);
  });

  it("does not create notification when payload has no recipient", async () => {
    const repository = new InMemoryNotificationRepository();
    let capturedHandler: ((msg: ConsumedMessage) => Promise<void>) | null = null;
    const mockConsumer = {
      subscribeMany(_topics: string[], handler: (msg: ConsumedMessage) => Promise<void>) {
        capturedHandler = handler;
      },
      disconnect: async () => {},
    };

    const consumer = new NotificationEventConsumer({
      consumer: mockConsumer as any,
      repository,
    });
    consumer.start();

    const msg = makeMessage("dip.events", "dip.artifact.published", {
      artifactId: "art-1",
    });
    await capturedHandler!(msg);

    expect(repository.getAll()).toHaveLength(0);
  });

  it("accepts envelope with type instead of eventType", async () => {
    const repository = new InMemoryNotificationRepository();
    let capturedHandler: ((msg: ConsumedMessage) => Promise<void>) | null = null;
    const mockConsumer = {
      subscribeMany(_topics: string[], handler: (msg: ConsumedMessage) => Promise<void>) {
        capturedHandler = handler;
      },
      disconnect: async () => {},
    };

    const consumer = new NotificationEventConsumer({
      consumer: mockConsumer as any,
      repository,
    });
    consumer.start();

    const value = Buffer.from(
      JSON.stringify({ type: "hub.contribution.integrated", payload: { userId: "u-1" } }),
      "utf8"
    );
    await capturedHandler!({
      topic: "hub.events",
      partition: 0,
      offset: "0",
      key: null,
      value,
    });

    const all = repository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].sourceEventType).toBe("hub.contribution.integrated");
    expect(all[0].userId).toBe("u-1");
  });
});
