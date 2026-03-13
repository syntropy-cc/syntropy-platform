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
