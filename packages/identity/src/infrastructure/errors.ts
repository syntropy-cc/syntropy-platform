/**
 * Domain auth errors — used by adapters so Supabase vocabulary does not leak.
 * Architecture: COMP-002.4, ADR-005
 */

export class InvalidTokenError extends Error {
  constructor(message: string = "Invalid or expired token") {
    super(message);
    this.name = "InvalidTokenError";
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}

export class AuthProviderError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AuthProviderError";
    Object.setPrototypeOf(this, AuthProviderError.prototype);
  }
}

/**
 * Thrown when an actor lacks permission for a resource/action (RBAC denial).
 * Architecture: COMP-037.1, cross-cutting/security
 */
export class ForbiddenError extends Error {
  constructor(
    message: string = "Insufficient permissions",
    public readonly resource?: string,
    public readonly action?: string
  ) {
    super(message);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
