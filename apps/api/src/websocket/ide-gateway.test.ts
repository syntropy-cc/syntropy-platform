/**
 * Integration tests for IDE WebSocket gateway (COMP-035.2).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import type { IDEContext } from "../types/ide-context.js";
import { IDESession } from "@syntropy/ide";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";
import type {
  IDESessionRepository,
  WorkspaceSnapshotRepository,
} from "@syntropy/ide";
import { WorkspaceSnapshot } from "@syntropy/ide";
import WebSocket from "ws";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901230";
const VALID_JWT = "valid-ws-test-jwt";

function createMockAuth(): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: TEST_USER_ID,
    actor_id: createActorId(TEST_USER_ID),
    roles: ["User"],
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  });
  return {
    async verifyToken(jwt: string) {
      if (jwt !== VALID_JWT) throw new InvalidTokenError("Invalid token");
      return token;
    },
    async signIn() {
      return token;
    },
    async signOut() {},
  };
}

function createInMemorySessionRepo(): IDESessionRepository {
  const map = new Map<string, IDESession>();
  return {
    async findById(sessionId: string) {
      return map.get(sessionId) ?? null;
    },
    async save(session: IDESession) {
      map.set(session.sessionId, session);
    },
    async findActiveSessionsInactiveSince(_since: Date) {
      return [];
    },
  };
}

describe("IDE WebSocket gateway (COMP-035.2)", () => {
  let server: { close: () => Promise<void> } | undefined;
  let app: Awaited<ReturnType<typeof createApp>>;
  let baseUrl: string;

  beforeAll(async () => {
    const sessionRepo = createInMemorySessionRepo();
    const session = IDESession.create({
      sessionId: "sess-ws-1",
      userId: TEST_USER_ID,
      projectId: null,
    });
    await sessionRepo.save(session);

    const terminatedSession = IDESession.create({
      sessionId: "sess-terminated",
      userId: TEST_USER_ID,
      projectId: null,
    })
      .withContainerStarted("c1")
      .terminate();
    await sessionRepo.save(terminatedSession);

    const ideContext: IDEContext = {
      sessionRepository: sessionRepo,
      provisioningService: {} as IDEContext["provisioningService"],
      quotaEnforcer: {} as IDEContext["quotaEnforcer"],
    };

    app = await createApp({
      auth: createMockAuth(),
      ide: ideContext,
    });

    await new Promise<void>((resolve, reject) => {
      app.listen({ port: 0, host: "127.0.0.1" }, (err, addr) => {
        if (err) {
          reject(err);
          return;
        }
        baseUrl = (addr as string).replace("http://", "ws://");
        resolve();
      });
    });
    server = {
      close: () =>
        new Promise<void>((resolve, reject) => {
          app.server.close((err) => (err ? reject(err) : resolve()));
        }),
    };
  });

  afterAll(async () => {
    if (server) await server.close();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const url = `${baseUrl}/api/v1/ide/sessions/sess-ws-1/ws`;
    await expect(
      new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(url);
        ws.on("open", () => reject(new Error("Expected connection to be rejected")));
        ws.on("error", (err: Error) => {
          if (String(err.message).includes("401") || String(err.message).includes("Unexpected server response")) {
            resolve();
          } else {
            reject(err);
          }
        });
      })
    ).resolves.toBeUndefined();
  });

  it("accepts WebSocket upgrade with valid Bearer token and sends welcome with session_id", async () => {
    const url = `${baseUrl}/api/v1/ide/sessions/sess-ws-1/ws`;
    const welcome = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const ws = new WebSocket(url, {
        headers: { Authorization: `Bearer ${VALID_JWT}` },
      });
      ws.on("open", () => {
        // Wait for first message (welcome)
      });
      ws.on("message", (data: Buffer) => {
        try {
          const msg = JSON.parse(data.toString()) as Record<string, unknown>;
          if (msg.type === "welcome") {
            ws.close();
            resolve(msg);
          }
        } catch {
          reject(new Error("Invalid JSON"));
        }
      });
      ws.on("close", () => reject(new Error("Closed before welcome")));
      ws.on("error", reject);
    });

    expect(welcome.type).toBe("welcome");
    expect(welcome.session_id).toBe("sess-ws-1");
  });

  it("replies to heartbeat with heartbeat payload", async () => {
    const url = `${baseUrl}/api/v1/ide/sessions/sess-ws-1/ws`;
    const reply = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const ws = new WebSocket(url, {
        headers: { Authorization: `Bearer ${VALID_JWT}` },
      });
      let welcomeReceived = false;
      ws.on("message", (data: Buffer) => {
        const msg = JSON.parse(data.toString()) as Record<string, unknown>;
        if (msg.type === "welcome") {
          welcomeReceived = true;
          ws.send(JSON.stringify({ type: "heartbeat", payload: {} }));
        } else if (msg.type === "heartbeat" && welcomeReceived) {
          ws.close();
          resolve(msg);
        }
      });
      ws.on("close", () => reject(new Error("Closed before heartbeat reply")));
      ws.on("error", reject);
    });

    expect(reply.type).toBe("heartbeat");
    expect(reply.payload).toBeDefined();
  });

  it("sends session_expired when session is terminated (COMP-035.4)", async () => {
    const url = `${baseUrl}/api/v1/ide/sessions/sess-terminated/ws`;
    const firstMessage = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const ws = new WebSocket(url, {
        headers: { Authorization: `Bearer ${VALID_JWT}` },
      });
      ws.on("message", (data: Buffer) => {
        const msg = JSON.parse(data.toString()) as Record<string, unknown>;
        ws.close();
        resolve(msg);
      });
      ws.on("close", () => reject(new Error("Closed before message")));
      ws.on("error", reject);
    });

    expect(firstMessage.type).toBe("error");
    expect(firstMessage.code).toBe("session_expired");
  });

  it("sends workspace_restore_progress then welcome when resuming suspended session with snapshot (COMP-035.6)", async () => {
    const sessionRepo = createInMemorySessionRepo();
    const suspendedSession = IDESession.create({
      sessionId: "sess-suspended",
      userId: TEST_USER_ID,
      projectId: null,
    })
      .withContainerStarted("c-suspended")
      .suspend();
    await sessionRepo.save(suspendedSession);

    const snapshotRepo: WorkspaceSnapshotRepository = {
      save: async () => {},
      getLatestBySessionId: async (sessionId: string) => {
        if (sessionId === "sess-suspended") {
          return WorkspaceSnapshot.create("sess-suspended", [
            { path: "index.ts", content: "// restored" },
          ]);
        }
        return null;
      },
    };

    const app = await createApp({
      auth: createMockAuth(),
      ide: {
        sessionRepository: sessionRepo,
        provisioningService: {} as IDEContext["provisioningService"],
        quotaEnforcer: {} as IDEContext["quotaEnforcer"],
        workspaceSnapshotRepository: snapshotRepo,
      },
    });

    const listenAddr = await new Promise<string>((resolve, reject) => {
      app.listen({ port: 0, host: "127.0.0.1" }, (err, addr) => {
        if (err) reject(err);
        else resolve((addr as string).replace("http://", "ws://"));
      });
    });

    const url = `${listenAddr}/api/v1/ide/sessions/sess-suspended/ws`;
    const messages: Record<string, unknown>[] = [];
    const done = new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(url, {
        headers: { Authorization: `Bearer ${VALID_JWT}` },
      });
      ws.on("message", (data: Buffer) => {
        const msg = JSON.parse(data.toString()) as Record<string, unknown>;
        messages.push(msg);
        if (msg.type === "welcome") {
          ws.close();
          resolve();
        }
      });
      ws.on("close", () => {
        if (messages.some((m) => m.type === "welcome")) resolve();
        else reject(new Error("Closed before welcome"));
      });
      ws.on("error", reject);
    });

    await done;
    await app.close();

    const progress = messages.find(
      (m) => m.type === "workspace_restore_progress"
    );
    const welcome = messages.find((m) => m.type === "welcome");
    expect(progress).toBeDefined();
    expect(progress!.message).toContain("Restoring");
    expect(progress!.fileCount).toBe(1);
    expect(welcome).toBeDefined();
    expect(welcome!.session_id).toBe("sess-suspended");
    const progressIndex = messages.indexOf(progress!);
    const welcomeIndex = messages.indexOf(welcome!);
    expect(progressIndex).toBeLessThan(welcomeIndex);
  });
});
