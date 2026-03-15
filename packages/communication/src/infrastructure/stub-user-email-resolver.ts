/**
 * Stub user email resolver for tests and default (COMP-028.4).
 * Architecture: COMP-028. Returns a configurable email or null; production can use Identity lookup.
 */

import type { UserEmailResolver } from "../domain/ports/user-email-resolver.js";

export interface StubUserEmailResolverOptions {
  /** Email to return for any userId; null to simulate no email. */
  email?: string | null;
}

/**
 * Resolver that returns a fixed email (or null) for every user.
 * Used in tests and when no real Identity integration is wired.
 */
export class StubUserEmailResolver implements UserEmailResolver {
  private readonly email: string | null;

  constructor(options: StubUserEmailResolverOptions = {}) {
    this.email = options.email ?? null;
  }

  async resolveEmail(_userId: string): Promise<string | null> {
    return this.email;
  }
}
