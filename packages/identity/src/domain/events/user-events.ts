/**
 * Domain events for User aggregate.
 * Architecture: COMP-002, domains/identity/ARCHITECTURE.md
 */

import type { ActorId } from "../value-objects/actor-id.js";

/**
 * Emitted when a new user account is created.
 */
export interface UserCreated {
  readonly type: "UserCreated";
  readonly userId: string;
  readonly actorId: ActorId;
  readonly email: string;
  readonly timestamp: Date;
}

/**
 * Emitted when a user's profile or attributes are updated.
 */
export interface UserUpdated {
  readonly type: "UserUpdated";
  readonly userId: string;
  readonly actorId: ActorId;
  readonly changes: Readonly<Record<string, unknown>>;
  readonly timestamp: Date;
}

export function createUserCreated(
  userId: string,
  actorId: ActorId,
  email: string,
  timestamp: Date = new Date()
): UserCreated {
  return {
    type: "UserCreated",
    userId,
    actorId,
    email,
    timestamp,
  };
}

export function createUserUpdated(
  userId: string,
  actorId: ActorId,
  changes: Readonly<Record<string, unknown>>,
  timestamp: Date = new Date()
): UserUpdated {
  return {
    type: "UserUpdated",
    userId,
    actorId,
    changes,
    timestamp,
  };
}
