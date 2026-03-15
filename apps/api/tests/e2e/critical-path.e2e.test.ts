/**
 * E2E test: One critical authenticated path (COMP-028, COMP-033).
 * Run with E2E=true to execute. Verifies auth + API response shape.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../../src/server.js";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";
import {
  InMemoryNotificationRepository,
  InMemoryThreadRepository,
  InMemoryMessageRepository,
} from "@syntropy/communication";
import type { CommunicationContext } from "../../src/types/communication-context.js";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const E2E_JWT = "e2e-test-jwt";

function createMockAuth(validJwt: string): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: createActorId(TEST_USER_ID),
    roles: ["Learner"],
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  });
  return {
    async verifyToken(jwt: string) {
      if (jwt !== validJwt)
        throw new InvalidTokenError("Invalid or expired token");
      return token;
    },
    async signIn() {
      return token;
    },
    async signOut() {},
  };
}

function createMockCommunicationContext(): CommunicationContext {
  const notificationRepo = new InMemoryNotificationRepository();
  return {
    notificationRepository: notificationRepo,
    threadRepository: new InMemoryThreadRepository(),
    messageRepository: new InMemoryMessageRepository(),
  };
}

const runE2E = process.env.E2E === "true";
const describeE2E = runE2E ? describe : describe.skip;

describeE2E("E2E critical path (auth + API)", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp({
      auth: createMockAuth(E2E_JWT),
      supabaseClient: null,
      communication: createMockCommunicationContext(),
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/notifications returns 200 with items array when authenticated", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/notifications",
      headers: { authorization: `Bearer ${E2E_JWT}` },
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload) as {
      data?: { items?: unknown[]; limit?: number; offset?: number };
    };
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data!.items)).toBe(true);
  });
});
