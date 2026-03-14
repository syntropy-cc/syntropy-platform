/**
 * API tests for Communication routes (COMP-028.6).
 * Verifies GET/PUT notifications and POST/GET message threads with mock context.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import type { CommunicationContext } from "../types/communication-context.js";
import {
  Notification,
  Thread,
  InMemoryNotificationRepository,
  InMemoryThreadRepository,
  InMemoryMessageRepository,
} from "@syntropy/communication";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const OTHER_USER_ID = "b2c3d4e5-f6a7-4890-b123-456789012345";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-communication-test-jwt";
const NOTIFICATION_ID = "c3d4e5f6-a7b8-4901-c234-567890123456";
const THREAD_ID = "d4e5f6a7-b8c9-4012-d345-678901234567";

function createMockAuth(validJwt: string): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: TEST_ACTOR_ID,
    roles: ["Learner"],
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  });
  return {
    async verifyToken(jwt: string) {
      if (jwt !== validJwt) throw new InvalidTokenError("Invalid or expired token");
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
  const threadRepo = new InMemoryThreadRepository();
  const messageRepo = new InMemoryMessageRepository();

  const seedNotification = new Notification({
    id: NOTIFICATION_ID,
    userId: TEST_USER_ID,
    notificationType: "achievement.unlocked",
    sourceEventType: "platform_core.achievement.unlocked",
    payload: { title: "First step" },
    isRead: false,
    createdAt: new Date(),
  });
  notificationRepo.save(seedNotification);

  return {
    notificationRepository: notificationRepo,
    threadRepository: threadRepo,
    messageRepository: messageRepo,
  };
}

describe("communication routes (COMP-028.6)", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  const mockContext = createMockCommunicationContext();

  beforeAll(async () => {
    app = await createApp({
      auth: createMockAuth(VALID_JWT),
      supabaseClient: null,
      communication: mockContext,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/v1/notifications", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/notifications",
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 200 with items and pagination when authenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/notifications",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data.items)).toBe(true);
      expect(body.data.limit).toBe(20);
      expect(body.data.offset).toBe(0);
      expect(body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(body.data.items[0]).toMatchObject({
        id: NOTIFICATION_ID,
        userId: TEST_USER_ID,
        notificationType: "achievement.unlocked",
        isRead: false,
      });
    });

    it("respects limit and offset query params", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/notifications?limit=5&offset=0",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.limit).toBe(5);
      expect(body.data.offset).toBe(0);
    });
  });

  describe("PUT /api/v1/notifications/:id/read", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await app.inject({
        method: "PUT",
        url: `/api/v1/notifications/${NOTIFICATION_ID}/read`,
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 200 when marking own notification as read", async () => {
      const res = await app.inject({
        method: "PUT",
        url: `/api/v1/notifications/${NOTIFICATION_ID}/read`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toMatchObject({ id: NOTIFICATION_ID, read: true });
    });

    it("returns 404 for non-existent or other user notification", async () => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/notifications/00000000-0000-0000-0000-000000000000/read",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe("POST /api/v1/messages/threads", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages/threads",
        payload: { participantIds: [OTHER_USER_ID] },
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 201 with thread when authenticated with valid body", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages/threads",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { participantIds: [OTHER_USER_ID] },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(body.data.threadId).toBeDefined();
      expect(body.data.participants).toContain(TEST_USER_ID);
      expect(body.data.participants).toContain(OTHER_USER_ID);
      expect(["direct", "group"]).toContain(body.data.type);
    });

    it("returns 201 with empty participantIds (only current user)", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages/threads",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: {},
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data.participants).toEqual([TEST_USER_ID]);
    });
  });

  describe("GET /api/v1/messages/threads/:id", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/messages/threads/${THREAD_ID}`,
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 404 for non-existent thread", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/messages/threads/00000000-0000-0000-0000-000000000000",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(404);
    });

    it("returns 200 with thread and messages when user is participant", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/messages/threads",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { participantIds: [OTHER_USER_ID] },
      });
      expect(createRes.statusCode).toBe(201);
      const threadId = (createRes.json() as { data: { threadId: string } }).data.threadId;

      const getRes = await app.inject({
        method: "GET",
        url: `/api/v1/messages/threads/${threadId}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(getRes.statusCode).toBe(200);
      const body = getRes.json();
      expect(body.data.threadId).toBe(threadId);
      expect(body.data.participants).toContain(TEST_USER_ID);
      expect(Array.isArray(body.data.messages)).toBe(true);
    });

    it("returns 403 when user is not a participant", async () => {
      const otherOnlyThread = new Thread({
        threadId: THREAD_ID,
        participants: [OTHER_USER_ID, "e5f6a7b8-c9d0-4123-e456-789012345678"],
        type: "group",
      });
      await mockContext.threadRepository.save(otherOnlyThread);

      const res = await app.inject({
        method: "GET",
        url: `/api/v1/messages/threads/${THREAD_ID}`,
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(403);
    });
  });
});
