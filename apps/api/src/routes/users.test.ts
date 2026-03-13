/**
 * Integration tests for users routes (COMP-002.6).
 *
 * Covers GET /users/:id (401 no token, 403 other user, 200 self)
 * and PUT /users/:id/roles (401 no token, 501 stub).
 */

import { describe, it, expect } from "vitest";
import { createApp } from "../server.js";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";

const TEST_USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const OTHER_USER_ID = "b2c3d4e5-f6a7-4890-b123-456789012345";
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
    async signOut() {},
  };
}

describe("users routes", () => {
  describe("GET /api/v1/users/:id", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const app = await createApp({ auth: createMockAuth(VALID_JWT), supabaseClient: null });
      try {
        const response = await app.inject({
          method: "GET",
          url: `/api/v1/users/${TEST_USER_ID}`,
        });
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("UNAUTHORIZED");
      } finally {
        await app.close();
      }
    });

    it("returns 403 when requesting another user's profile", async () => {
      const app = await createApp({ auth: createMockAuth(VALID_JWT), supabaseClient: null });
      try {
        const response = await app.inject({
          method: "GET",
          url: `/api/v1/users/${OTHER_USER_ID}`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
        });
        expect(response.statusCode).toBe(403);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("FORBIDDEN");
        expect(body.error?.message).toContain("own profile");
      } finally {
        await app.close();
      }
    });

    it("returns 200 and profile when requesting own id", async () => {
      const app = await createApp({ auth: createMockAuth(VALID_JWT), supabaseClient: null });
      try {
        const response = await app.inject({
          method: "GET",
          url: `/api/v1/users/${TEST_USER_ID}`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.data).toEqual({
          id: TEST_USER_ID,
          actorId: TEST_ACTOR_ID,
          roles: ["Learner"],
        });
        expect(body.meta?.timestamp).toBeDefined();
      } finally {
        await app.close();
      }
    });
  });

  describe("PUT /api/v1/users/:id/roles", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const app = await createApp({ auth: createMockAuth(VALID_JWT), supabaseClient: null });
      try {
        const response = await app.inject({
          method: "PUT",
          url: `/api/v1/users/${TEST_USER_ID}/roles`,
          payload: { roles: ["Creator"] },
        });
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("UNAUTHORIZED");
      } finally {
        await app.close();
      }
    });

    it("returns 501 with envelope (stub not implemented)", async () => {
      const app = await createApp({ auth: createMockAuth(VALID_JWT), supabaseClient: null });
      try {
        const response = await app.inject({
          method: "PUT",
          url: `/api/v1/users/${TEST_USER_ID}/roles`,
          headers: { authorization: `Bearer ${VALID_JWT}` },
          payload: { roles: ["Creator"] },
        });
        expect(response.statusCode).toBe(501);
        const body = JSON.parse(response.payload);
        expect(body.error?.code).toBe("NOT_IMPLEMENTED");
        expect(body.meta?.timestamp).toBeDefined();
      } finally {
        await app.close();
      }
    });
  });
});
