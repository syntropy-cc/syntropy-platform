/**
 * Integration tests for auth routes (COMP-002.6).
 *
 * Covers login (400 bad body, 503 unconfigured, 200 with mock), logout (204),
 * and GET /auth/me (401 missing/invalid token, 200 with valid token).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const TEST_ACTOR_ID = createActorId(TEST_USER_ID);
const VALID_JWT = "valid-test-jwt";

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
    async signOut() {
      // no-op
    },
  };
}

function createMockSupabaseForLogin(accessToken: string) {
  return {
    auth: {
      signInWithPassword: async () => ({
        data: {
          session: {
            access_token: accessToken,
            refresh_token: null,
            expires_at: 0,
            user: { id: TEST_USER_ID, email: "test@example.com" },
          },
        },
        error: null,
      }),
      getUser: async () => ({ data: { user: null }, error: { message: "bad" } }),
      signOut: async () => ({ error: null }),
    },
  } as unknown as import("@supabase/supabase-js").SupabaseClient;
}

describe("auth routes", () => {
  describe("when auth is not configured", () => {
    let app: Awaited<ReturnType<typeof createApp>>;

    beforeAll(async () => {
      app = await createApp({ auth: null, supabaseClient: null });
    });

    afterAll(async () => {
      await app.close();
    });

    it("POST /api/v1/auth/login returns 503 with envelope", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: { email: "a@b.com", password: "secret" },
      });
      expect(response.statusCode).toBe(503);
      const body = JSON.parse(response.payload);
      expect(body.error).toBeDefined();
      expect(body.error.code).toBe("SERVICE_UNAVAILABLE");
      expect(body.meta).toBeDefined();
      expect(body.meta.timestamp).toBeDefined();
    });

    it("GET /api/v1/auth/me returns 503 when auth not configured", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/auth/me",
        headers: { authorization: "Bearer any" },
      });
      expect(response.statusCode).toBe(503);
      const body = JSON.parse(response.payload);
      expect(body.error?.code).toBe("SERVICE_UNAVAILABLE");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("returns 400 when body is not { email, password }", async () => {
      const app = await createApp({ auth: null, supabaseClient: null });
      try {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/auth/login",
          payload: {},
        });
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("BAD_REQUEST");
      } finally {
        await app.close();
      }
    });

    it("returns 200 and envelope with token and claims when mock auth and supabase provided", async () => {
      const mockAuth = createMockAuth(VALID_JWT);
      const mockSupabase = createMockSupabaseForLogin(VALID_JWT);
      const app = await createApp({ auth: mockAuth, supabaseClient: mockSupabase });
      try {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/auth/login",
          payload: { email: "test@example.com", password: "secret" },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.data).toBeDefined();
        expect(body.data.token).toBe(VALID_JWT);
        expect(body.data.userId).toBe(TEST_USER_ID);
        expect(body.data.actorId).toBe(TEST_ACTOR_ID);
        expect(body.data.roles).toEqual(["Learner"]);
        expect(body.meta?.timestamp).toBeDefined();
      } finally {
        await app.close();
      }
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("returns 204", async () => {
      const app = await createApp({ auth: createMockAuth(VALID_JWT), supabaseClient: null });
      try {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/auth/logout",
        });
        expect(response.statusCode).toBe(204);
      } finally {
        await app.close();
      }
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const app = await createApp({ auth: createMockAuth(VALID_JWT), supabaseClient: null });
      try {
        const response = await app.inject({ method: "GET", url: "/api/v1/auth/me" });
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("UNAUTHORIZED");
        expect(body.meta?.timestamp).toBeDefined();
      } finally {
        await app.close();
      }
    });

    it("returns 401 when token is invalid", async () => {
      const app = await createApp({ auth: createMockAuth(VALID_JWT), supabaseClient: null });
      try {
        const response = await app.inject({
          method: "GET",
          url: "/api/v1/auth/me",
          headers: { authorization: "Bearer invalid-token" },
        });
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("UNAUTHORIZED");
      } finally {
        await app.close();
      }
    });

    it("returns 200 and user profile when token is valid", async () => {
      const app = await createApp({ auth: createMockAuth(VALID_JWT), supabaseClient: null });
      try {
        const response = await app.inject({
          method: "GET",
          url: "/api/v1/auth/me",
          headers: { authorization: `Bearer ${VALID_JWT}` },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.data).toEqual({
          userId: TEST_USER_ID,
          actorId: TEST_ACTOR_ID,
          roles: ["Learner"],
        });
        expect(body.meta?.timestamp).toBeDefined();
      } finally {
        await app.close();
      }
    });
  });
});
