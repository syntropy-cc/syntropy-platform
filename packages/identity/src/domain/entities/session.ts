/**
 * Session aggregate — authenticated context for a User.
 * Architecture: COMP-002, domains/identity/ARCHITECTURE.md
 */

import type { ActorId } from "../value-objects/actor-id.js";

export type SessionId = string;

/**
 * Clock abstraction for testing expiry without relying on real time.
 */
export interface Clock {
  now(): Date;
}

const defaultClock: Clock = {
  now: () => new Date(),
};

/**
 * Session aggregate: sessionId, userId, expiresAt; isExpired() checks expiry.
 */
export class Session {
  readonly sessionId: SessionId;
  readonly userId: string;
  readonly actorId: ActorId;
  readonly expiresAt: Date;
  private readonly clock: Clock;

  constructor(params: {
    sessionId: SessionId;
    userId: string;
    actorId: ActorId;
    expiresAt: Date;
    clock?: Clock;
  }) {
    this.sessionId = params.sessionId;
    this.userId = params.userId;
    this.actorId = params.actorId;
    this.expiresAt = params.expiresAt;
    this.clock = params.clock ?? defaultClock;
  }

  /**
   * Returns true if the current time (or clock) is past expiresAt.
   */
  isExpired(): boolean {
    return this.clock.now() >= this.expiresAt;
  }
}
