/**
 * SupabaseAuthAdapter — ACL over Supabase Auth. Translates to IdentityToken and domain errors.
 * Architecture: COMP-002.4, ADR-005
 */

import { createActorId, type ActorId } from "../domain/value-objects/actor-id.js";
import { IdentityToken } from "../domain/value-objects/identity-token.js";
import type { AuthProvider } from "../domain/auth-provider.js";
import type { SignInCredentials } from "../domain/auth-provider.js";
import { InvalidTokenError, AuthProviderError } from "./errors.js";

/**
 * Minimal Supabase Auth surface used by the adapter (allows mocking without @supabase/supabase-js).
 */
export interface SupabaseAuthLike {
  getUser(jwt: string): Promise<{
    data: { user: SupabaseUser | null };
    error: { message: string } | null;
  }>;
  signInWithPassword(params: {
    email: string;
    password: string;
  }): Promise<{
    data: { session: SupabaseSession | null };
    error: { message: string } | null;
  }>;
  signOut(): Promise<{ error: { message: string } | null }>;
}

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

interface SupabaseSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: SupabaseUser;
}

/**
 * ACL: wraps Supabase Auth and returns domain types (IdentityToken); translates errors to domain errors.
 */
export class SupabaseAuthAdapter implements AuthProvider {
  constructor(private readonly auth: SupabaseAuthLike) {}

  async verifyToken(jwt: string): Promise<IdentityToken> {
    try {
      const { data, error } = await this.auth.getUser(jwt);
      if (error) {
        throw new InvalidTokenError(error.message);
      }
      const user = data?.user ?? null;
      if (!user) {
        throw new InvalidTokenError("User not found");
      }
      return this.userToIdentityToken(user, jwt);
    } catch (err) {
      if (err instanceof InvalidTokenError || err instanceof AuthProviderError) {
        throw err;
      }
      throw new AuthProviderError(
        err instanceof Error ? err.message : "Token verification failed",
        err
      );
    }
  }

  async signIn(credentials: SignInCredentials): Promise<IdentityToken> {
    try {
      if (!credentials.password) {
        throw new AuthProviderError("Magic link not implemented in this adapter");
      }
      const { data, error } = await this.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) {
        throw new AuthProviderError(error.message);
      }
      const session = data?.session;
      const user = session?.user;
      if (!user || !session?.access_token) {
        throw new AuthProviderError("Sign in did not return session");
      }
      return this.userToIdentityToken(user, session.access_token);
    } catch (err) {
      if (err instanceof InvalidTokenError || err instanceof AuthProviderError) {
        throw err;
      }
      throw new AuthProviderError(
        err instanceof Error ? err.message : "Sign in failed",
        err
      );
    }
  }

  async signOut(_sessionId: string): Promise<void> {
    try {
      const { error } = await this.auth.signOut();
      if (error) {
        throw new AuthProviderError(error.message);
      }
    } catch (err) {
      if (err instanceof AuthProviderError) throw err;
      throw new AuthProviderError(
        err instanceof Error ? err.message : "Sign out failed",
        err
      );
    }
  }

  private userToIdentityToken(
    user: SupabaseUser,
    accessToken: string
  ): IdentityToken {
    const actorId = this.resolveActorId(user);
    const { exp, iat } = this.getExpIatFromToken(accessToken);
    const roles = this.getRolesFromUser(user);
    return IdentityToken.fromClaims({
      sub: user.id,
      actor_id: actorId,
      roles,
      exp,
      iat,
    });
  }

  private resolveActorId(user: SupabaseUser): ActorId {
    const meta = user.user_metadata ?? user.app_metadata ?? {};
    const fromMeta = meta.actor_id;
    if (typeof fromMeta === "string") {
      return createActorId(fromMeta);
    }
    return createActorId(user.id);
  }

  private getRolesFromUser(user: SupabaseUser): string[] {
    const meta = user.app_metadata ?? user.user_metadata ?? {};
    const roles = meta.roles ?? meta.role;
    if (Array.isArray(roles)) return roles;
    if (typeof roles === "string") return [roles];
    return [];
  }

  private getExpIatFromToken(_accessToken: string): { exp: number; iat: number } {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;
    const iat = now;
    return { exp, iat };
  }
}
