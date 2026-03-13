/**
 * IdentityToken — short-lived JWT claims (sub, actor_id, roles, exp, iat).
 * Architecture: COMP-002, domains/identity/ARCHITECTURE.md
 */

import type { ActorId } from "./actor-id.js";

/**
 * Decoded claims from an IdentityToken JWT.
 * Read-only; created from verified token or builder.
 */
export interface IdentityTokenClaims {
  readonly sub: string;
  readonly actor_id: ActorId;
  readonly roles?: readonly string[];
  readonly exp: number;
  readonly iat: number;
}

/**
 * IdentityToken value object — wraps JWT claims for use across domains.
 */
export class IdentityToken {
  readonly claims: IdentityTokenClaims;

  constructor(claims: IdentityTokenClaims) {
    this.claims = Object.freeze({ ...claims });
  }

  get userId(): string {
    return this.claims.sub;
  }

  get actorId(): ActorId {
    return this.claims.actor_id;
  }

  get roles(): readonly string[] {
    return this.claims.roles ?? [];
  }

  get exp(): number {
    return this.claims.exp;
  }

  get iat(): number {
    return this.claims.iat;
  }

  /**
   * Build from decoded JWT payload (e.g. after Supabase verify).
   */
  static fromClaims(claims: IdentityTokenClaims): IdentityToken {
    return new IdentityToken(claims);
  }
}
