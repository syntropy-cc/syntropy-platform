/**
 * Unit tests for User aggregate and ActorId.
 * Tests: COMP-002.1
 */

import { describe, it, expect } from "vitest";
import { User } from "./user.js";
import { createActorId } from "../value-objects/actor-id.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("ActorId", () => {
  it("createActorId_accepts_valid_uuid", () => {
    const actorId = createActorId(VALID_UUID);
    expect(actorId).toBe(VALID_UUID);
  });

  it("createActorId_throws_for_invalid_format", () => {
    expect(() => createActorId("not-a-uuid")).toThrow(/Invalid ActorId/);
    expect(() => createActorId("")).toThrow(/Invalid ActorId/);
  });
});

describe("User.create", () => {
  it("produces_user_and_UserCreated_event", () => {
    const { user, event } = User.create(VALID_UUID, "alice@example.com");

    expect(user.id).toBe(VALID_UUID);
    expect(user.actorId).toBe(VALID_UUID);
    expect(user.email).toBe("alice@example.com");
    expect(user.displayName).toBeNull();
    expect(user.isActive).toBe(true);
    expect(user.isVerified).toBe(false);
    expect(user.createdAt).toBeInstanceOf(Date);

    expect(event.type).toBe("UserCreated");
    expect(event.userId).toBe(VALID_UUID);
    expect(event.actorId).toBe(VALID_UUID);
    expect(event.email).toBe("alice@example.com");
    expect(event.timestamp).toBeInstanceOf(Date);
  });

  it("normalizes_email_to_lowercase", () => {
    const { user } = User.create(VALID_UUID, "Alice@Example.COM");
    expect(user.email).toBe("alice@example.com");
  });

  it("accepts_optional_displayName_and_actorId", () => {
    const otherActorId = createActorId("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
    const { user } = User.create(VALID_UUID, "bob@example.com", {
      displayName: "Bob",
      actorId: otherActorId,
    });
    expect(user.displayName).toBe("Bob");
    expect(user.actorId).toBe(otherActorId);
  });

  it("throws_for_invalid_email", () => {
    expect(() => User.create(VALID_UUID, "invalid")).toThrow(/Invalid email/);
    expect(() => User.create(VALID_UUID, "")).toThrow(/Invalid email/);
    expect(() => User.create(VALID_UUID, "no-at-sign")).toThrow(/Invalid email/);
  });
});

describe("User.updateProfile", () => {
  it("produces_updated_user_and_UserUpdated_event", () => {
    const { user: initial } = User.create(VALID_UUID, "alice@example.com");
    const { user: updated, event } = initial.updateProfile({
      displayName: "Alice",
      isActive: false,
    });

    expect(updated.displayName).toBe("Alice");
    expect(updated.isActive).toBe(false);
    expect(updated.id).toBe(initial.id);
    expect(updated.actorId).toBe(initial.actorId);
    expect(updated.email).toBe(initial.email);

    expect(event.type).toBe("UserUpdated");
    expect(event.userId).toBe(VALID_UUID);
    expect(event.changes).toEqual({ displayName: "Alice", isActive: false });
    expect(event.timestamp).toBeInstanceOf(Date);
  });
});
