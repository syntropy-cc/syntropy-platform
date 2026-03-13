/**
 * AuthProvider interface — abstraction for authentication (ACL boundary).
 * Implemented by SupabaseAuthAdapter; no Supabase types here.
 * Architecture: COMP-002.4, ADR-005
 */

import type { IdentityToken } from "./value-objects/identity-token.js";

/**
 * Credentials for sign-in (e.g. email + password or magic link).
 */
export interface SignInCredentials {
  email: string;
  password?: string;
}

/**
 * Abstraction for authentication. Adapters (e.g. Supabase) implement this.
 */
export interface AuthProvider {
  /**
   * Verify a JWT and return decoded claims as IdentityToken.
   * @throws InvalidTokenError when token is invalid or expired
   * @throws AuthProviderError on provider errors
   */
  verifyToken(jwt: string): Promise<IdentityToken>;

  /**
   * Sign in with email and optional password (magic link when password omitted).
   */
  signIn(credentials: SignInCredentials): Promise<IdentityToken>;

  /**
   * Sign out / revoke session.
   */
  signOut(sessionId: string): Promise<void>;
}
