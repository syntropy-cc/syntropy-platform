/**
 * Unit tests for SupabaseAuthAdapter (mocked Supabase).
 * Tests: COMP-002.4
 */

import { describe, it, expect, vi } from "vitest";
import { SupabaseAuthAdapter, type SupabaseAuthLike } from "./supabase-auth-adapter.js";
import { createActorId } from "../domain/value-objects/actor-id.js";
import { InvalidTokenError, AuthProviderError } from "./errors.js";

const ACTOR_ID = createActorId("550e8400-e29b-41d4-a716-446655440000");

const defaultUser = {
  id: ACTOR_ID,
  email: "test@example.com",
  user_metadata: {},
  app_metadata: {},
};

function createMockAuth(overrides: Partial<SupabaseAuthLike> = {}): SupabaseAuthLike {
  return {
    getUser: vi.fn().mockResolvedValue({
      data: { user: defaultUser },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: {
        session: {
          access_token: "mock-jwt",
          user: defaultUser,
        },
      },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    ...overrides,
  };
}

describe("SupabaseAuthAdapter.verifyToken", () => {
  it("returns_IdentityToken_for_valid_response", async () => {
    const mock = createMockAuth();
    const adapter = new SupabaseAuthAdapter(mock);

    const token = await adapter.verifyToken("valid-jwt");

    expect(token.userId).toBe(ACTOR_ID);
    expect(token.actorId).toBe(ACTOR_ID);
    expect(mock.getUser).toHaveBeenCalledWith("valid-jwt");
  });

  it("throws_InvalidTokenError_when_user_is_null", async () => {
    const mock = createMockAuth({
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    });
    const adapter = new SupabaseAuthAdapter(mock);

    await expect(adapter.verifyToken("bad-jwt")).rejects.toThrow(InvalidTokenError);
  });

  it("throws_InvalidTokenError_when_error_returned", async () => {
    const mock = createMockAuth({
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid token" },
      }),
    });
    const adapter = new SupabaseAuthAdapter(mock);

    await expect(adapter.verifyToken("bad-jwt")).rejects.toThrow(InvalidTokenError);
  });
});

describe("SupabaseAuthAdapter.signIn", () => {
  it("calls_signInWithPassword_and_returns_IdentityToken", async () => {
    const mock = createMockAuth();
    const adapter = new SupabaseAuthAdapter(mock);

    const token = await adapter.signIn({
      email: "alice@example.com",
      password: "secret",
    });

    expect(token.userId).toBe(ACTOR_ID);
    expect(mock.signInWithPassword).toHaveBeenCalledWith({
      email: "alice@example.com",
      password: "secret",
    });
  });

  it("throws_AuthProviderError_when_password_omitted", async () => {
    const adapter = new SupabaseAuthAdapter(createMockAuth());

    await expect(
      adapter.signIn({ email: "alice@example.com" })
    ).rejects.toThrow(AuthProviderError);
  });
});

describe("SupabaseAuthAdapter.signOut", () => {
  it("delegates_to_auth_signOut", async () => {
    const mock = createMockAuth();
    const adapter = new SupabaseAuthAdapter(mock);

    await adapter.signOut("sess-1");

    expect(mock.signOut).toHaveBeenCalled();
  });
});
