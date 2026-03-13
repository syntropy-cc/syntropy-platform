/**
 * Unit tests for Session and IdentityToken.
 * Tests: COMP-002.3
 */

import { describe, it, expect } from "vitest";
import { Session } from "./session.js";
import { IdentityToken } from "../value-objects/identity-token.js";
import { createActorId } from "../value-objects/actor-id.js";

const ACTOR_ID = createActorId("550e8400-e29b-41d4-a716-446655440000");

describe("Session", () => {
  it("isExpired_returns_false_when_expiresAt_in_future", () => {
    const future = new Date(Date.now() + 60_000);
    const session = new Session({
      sessionId: "sess-1",
      userId: ACTOR_ID,
      actorId: ACTOR_ID,
      expiresAt: future,
    });
    expect(session.isExpired()).toBe(false);
  });

  it("isExpired_returns_true_when_expiresAt_in_past", () => {
    const past = new Date(Date.now() - 60_000);
    const session = new Session({
      sessionId: "sess-2",
      userId: ACTOR_ID,
      actorId: ACTOR_ID,
      expiresAt: past,
    });
    expect(session.isExpired()).toBe(true);
  });

  it("isExpired_uses_injected_clock_for_deterministic_tests", () => {
    const expiresAt = new Date("2025-06-15T12:00:00Z");
    const clock = {
      now: () => new Date("2025-06-15T11:00:00Z"),
    };
    const session = new Session({
      sessionId: "sess-3",
      userId: ACTOR_ID,
      actorId: ACTOR_ID,
      expiresAt,
      clock,
    });
    expect(session.isExpired()).toBe(false);

    const clockPast = {
      now: () => new Date("2025-06-15T13:00:00Z"),
    };
    const sessionPast = new Session({
      sessionId: "sess-4",
      userId: ACTOR_ID,
      actorId: ACTOR_ID,
      expiresAt,
      clock: clockPast,
    });
    expect(sessionPast.isExpired()).toBe(true);
  });
});

describe("IdentityToken", () => {
  it("fromClaims_exposes_sub_actor_id_roles_exp_iat", () => {
    const token = IdentityToken.fromClaims({
      sub: "user-uuid",
      actor_id: ACTOR_ID,
      roles: ["learner", "creator"],
      exp: 1000,
      iat: 900,
    });
    expect(token.userId).toBe("user-uuid");
    expect(token.actorId).toBe(ACTOR_ID);
    expect(token.roles).toEqual(["learner", "creator"]);
    expect(token.exp).toBe(1000);
    expect(token.iat).toBe(900);
  });

  it("fromClaims_handles_missing_roles", () => {
    const token = IdentityToken.fromClaims({
      sub: "user-uuid",
      actor_id: ACTOR_ID,
      exp: 1000,
      iat: 900,
    });
    expect(token.roles).toEqual([]);
  });
});
