/**
 * Unit tests for IdentityEventPublisher (COMP-002.5).
 */

import { describe, it, expect, vi } from "vitest";
import { IdentityEventPublisher } from "./IdentityEventPublisher.js";
import type { UserCreated, UserUpdated } from "../domain/events/user-events.js";
import { createUserCreated, createUserUpdated } from "../domain/events/user-events.js";
import { createActorId } from "../domain/value-objects/actor-id.js";
import { Session } from "../domain/entities/session.js";

function createMockProducer(): { publish: ReturnType<typeof vi.fn> } {
  return {
    publish: vi.fn().mockResolvedValue(undefined),
  };
}

describe("IdentityEventPublisher", () => {
  it("publishUserCreated sends identity.user.created with correct payload", async () => {
    const producer = createMockProducer();
    const publisher = new IdentityEventPublisher(producer as never);
    const userId = "a1b2c3d4-e5f6-4789-a012-345678901234";
    const event: UserCreated = createUserCreated(
      userId,
      createActorId(userId),
      "test@example.com",
    );

    await publisher.publishUserCreated(event);

    expect(producer.publish).toHaveBeenCalledTimes(1);
    expect(producer.publish).toHaveBeenCalledWith("identity.events", {
      eventType: "identity.user.created",
      payload: {
        userId,
        actorId: userId,
        email: "test@example.com",
      },
      schemaVersion: 1,
      timestamp: expect.any(String),
    });
  });

  it("publishUserUpdated sends identity.user.updated with changes", async () => {
    const producer = createMockProducer();
    const publisher = new IdentityEventPublisher(producer as never);
    const userId = "b2c3d4e5-f6a7-4890-b123-456789012345";
    const event: UserUpdated = createUserUpdated(
      userId,
      createActorId(userId),
      { displayName: "New Name" },
    );

    await publisher.publishUserUpdated(event);

    expect(producer.publish).toHaveBeenCalledTimes(1);
    expect(producer.publish).toHaveBeenCalledWith("identity.events", {
      eventType: "identity.user.updated",
      payload: {
        userId,
        actorId: userId,
        changes: { displayName: "New Name" },
      },
      schemaVersion: 1,
      timestamp: expect.any(String),
    });
  });

  it("publishSessionCreated sends identity.session.created with session data", async () => {
    const producer = createMockProducer();
    const publisher = new IdentityEventPublisher(producer as never);
    const userId = "c3d4e5f6-a7b8-4901-8234-567890123456";
    const expiresAt = new Date("2025-12-31T23:59:59Z");
    const session = new Session({
      sessionId: "sess-1",
      userId,
      actorId: createActorId(userId),
      expiresAt,
    });

    await publisher.publishSessionCreated(session);

    expect(producer.publish).toHaveBeenCalledTimes(1);
    expect(producer.publish).toHaveBeenCalledWith("identity.events", {
      eventType: "identity.session.created",
      payload: {
        sessionId: "sess-1",
        userId,
        actorId: userId,
        expiresAt: "2025-12-31T23:59:59.000Z",
      },
      schemaVersion: 1,
      timestamp: expect.any(String),
    });
  });
});
