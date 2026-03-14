/**
 * API tests for IDE routes (COMP-030.8).
 * Verifies POST/GET sessions, POST start, POST suspend with mock context.
 */

import { describe, it, expect, vi } from "vitest";
import { createApp } from "../server.js";
import type { IDEContext } from "../types/ide-context.js";
import {
  IDESession,
  QuotaExceededError,
  SessionNotFoundError,
  type IDESessionRepository,
  type IDESessionProvisioningService,
  type ResourceQuotaEnforcer,
} from "@syntropy/ide";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901230";
const VALID_JWT = "valid-ide-test-jwt";

function createMockAuth(validJwt: string): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: createActorId(TEST_USER_ID),
    roles: ["User"],
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

function createInMemorySessionRepository(): IDESessionRepository {
  const map = new Map<string, IDESession>();
  return {
    async findById(sessionId: string) {
      return map.get(sessionId) ?? null;
    },
    async save(session: IDESession) {
      map.set(session.sessionId, session);
    },
  };
}

function createMockQuotaEnforcer(): ResourceQuotaEnforcer {
  return {
    enforce: vi.fn().mockResolvedValue(undefined),
  } as unknown as ResourceQuotaEnforcer;
}

function createMockProvisioningService(
  sessionRepo: IDESessionRepository
): IDESessionProvisioningService {
  return {
    async start(sessionId: string) {
      const session = await sessionRepo.findById(sessionId);
      if (!session) throw new SessionNotFoundError(sessionId);
      const updated = session.withContainerStarted("cont-mock-1");
      await sessionRepo.save(updated);
      return updated;
    },
    async suspend(sessionId: string, _files: readonly { path: string; content: string }[]) {
      const session = await sessionRepo.findById(sessionId);
      if (!session) throw new SessionNotFoundError(sessionId);
      const suspended = session.suspend();
      await sessionRepo.save(suspended);
      return suspended;
    },
  } as IDESessionProvisioningService;
}

describe("IDE routes (COMP-030.8)", () => {
  it("POST /api/v1/ide/sessions creates session and returns 201 when quota allows", async () => {
    const sessionRepo = createInMemorySessionRepository();
    const quotaEnforcer = createMockQuotaEnforcer();
    const provisioningService = createMockProvisioningService(sessionRepo);
    const ideContext: IDEContext = {
      sessionRepository: sessionRepo,
      provisioningService,
      quotaEnforcer,
    };
    const app = await createApp({
      auth: createMockAuth(VALID_JWT),
      ide: ideContext,
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/ide/sessions",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {},
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data).toBeDefined();
    expect(body.data.sessionId).toBeDefined();
    expect(body.data.userId).toBe(TEST_USER_ID);
    expect(body.data.status).toBe("pending");
    expect(body.data.projectId).toBeNull();
    expect(quotaEnforcer.enforce).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it("POST /api/v1/ide/sessions returns 429 when quota exceeded", async () => {
    const sessionRepo = createInMemorySessionRepository();
    const quotaEnforcer = createMockQuotaEnforcer();
    vi.mocked(quotaEnforcer.enforce).mockRejectedValue(
      new QuotaExceededError(
        "Quota exceeded",
        TEST_USER_ID,
        { activeSessionCount: 2 },
        { maxConcurrentSessions: 2 }
      )
    );
    const provisioningService = createMockProvisioningService(sessionRepo);
    const app = await createApp({
      auth: createMockAuth(VALID_JWT),
      ide: {
        sessionRepository: sessionRepo,
        provisioningService,
        quotaEnforcer,
      },
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/ide/sessions",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {},
    });

    expect(res.statusCode).toBe(429);
    const body = res.json();
    expect(body.error?.code).toBe("QUOTA_EXCEEDED");
  });

  it("GET /api/v1/ide/sessions/:id returns 200 with session when owned by user", async () => {
    const sessionRepo = createInMemorySessionRepository();
    const session = IDESession.create({
      sessionId: "sess-get-1",
      userId: TEST_USER_ID,
      projectId: "proj-1",
    });
    await sessionRepo.save(session);
    const app = await createApp({
      auth: createMockAuth(VALID_JWT),
      ide: {
        sessionRepository: sessionRepo,
        provisioningService: createMockProvisioningService(sessionRepo),
        quotaEnforcer: createMockQuotaEnforcer(),
      },
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/v1/ide/sessions/sess-get-1",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.sessionId).toBe("sess-get-1");
    expect(body.data.userId).toBe(TEST_USER_ID);
    expect(body.data.projectId).toBe("proj-1");
  });

  it("GET /api/v1/ide/sessions/:id returns 404 when session not found", async () => {
    const sessionRepo = createInMemorySessionRepository();
    const app = await createApp({
      auth: createMockAuth(VALID_JWT),
      ide: {
        sessionRepository: sessionRepo,
        provisioningService: createMockProvisioningService(sessionRepo),
        quotaEnforcer: createMockQuotaEnforcer(),
      },
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/v1/ide/sessions/nonexistent",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().error?.code).toBe("NOT_FOUND");
  });

  it("POST /api/v1/ide/sessions/:id/start returns 200 and updates session", async () => {
    const sessionRepo = createInMemorySessionRepository();
    const session = IDESession.create({
      sessionId: "sess-start-1",
      userId: TEST_USER_ID,
    });
    await sessionRepo.save(session);
    const provisioningService = createMockProvisioningService(sessionRepo);
    const app = await createApp({
      auth: createMockAuth(VALID_JWT),
      ide: {
        sessionRepository: sessionRepo,
        provisioningService,
        quotaEnforcer: createMockQuotaEnforcer(),
      },
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/ide/sessions/sess-start-1/start",
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.status).toBe("active");
    expect(body.data.containerId).toBe("cont-mock-1");
  });

  it("POST /api/v1/ide/sessions/:id/suspend returns 200 with suspended session", async () => {
    const sessionRepo = createInMemorySessionRepository();
    const pending = IDESession.create({
      sessionId: "sess-suspend-1",
      userId: TEST_USER_ID,
    });
    const session = pending.withContainerStarted("cont-1");
    await sessionRepo.save(session);
    const provisioningService = createMockProvisioningService(sessionRepo);
    const app = await createApp({
      auth: createMockAuth(VALID_JWT),
      ide: {
        sessionRepository: sessionRepo,
        provisioningService,
        quotaEnforcer: createMockQuotaEnforcer(),
      },
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/ide/sessions/sess-suspend-1/suspend",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: { files: [{ path: "src/index.ts", content: "export {};" }] },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.status).toBe("suspended");
  });

  it("POST /api/v1/ide/sessions requires auth", async () => {
    const app = await createApp({
      auth: createMockAuth(VALID_JWT),
      ide: {
        sessionRepository: createInMemorySessionRepository(),
        provisioningService: createMockProvisioningService(
          createInMemorySessionRepository()
        ),
        quotaEnforcer: createMockQuotaEnforcer(),
      },
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/ide/sessions",
      payload: {},
    });

    expect(res.statusCode).toBe(401);
  });
});
