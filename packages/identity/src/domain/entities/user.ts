/**
 * User aggregate — authenticated individual with a persistent identity.
 * Architecture: COMP-002, domains/identity/ARCHITECTURE.md
 */

import type { ActorId } from "../value-objects/actor-id.js";
import { createActorId } from "../value-objects/actor-id.js";
import {
  createUserCreated,
  createUserUpdated,
  type UserCreated,
  type UserUpdated,
} from "../events/user-events.js";

export type UserId = string;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function assertValidEmail(email: string): void {
  if (!EMAIL_REGEX.test(email.trim())) {
    throw new Error(`Invalid email format: "${email}"`);
  }
}

/**
 * User aggregate. Created once; referenced by id everywhere.
 */
export class User {
  readonly id: UserId;
  readonly actorId: ActorId;
  readonly email: string;
  readonly displayName: string | null;
  readonly isActive: boolean;
  readonly isVerified: boolean;
  readonly createdAt: Date;

  private constructor(params: {
    id: UserId;
    actorId: ActorId;
    email: string;
    displayName?: string | null;
    isActive?: boolean;
    isVerified?: boolean;
    createdAt?: Date;
  }) {
    this.id = params.id;
    this.actorId = params.actorId;
    this.email = params.email;
    this.displayName = params.displayName ?? null;
    this.isActive = params.isActive ?? true;
    this.isVerified = params.isVerified ?? false;
    this.createdAt = params.createdAt ?? new Date();
  }

  /**
   * Factory: create a new User and the UserCreated domain event.
   *
   * @param id - Unique user id (e.g. from auth provider)
   * @param email - Valid email address
   * @param options - Optional displayName, actorId (defaults to id as ActorId)
   * @returns The new User and the UserCreated event to publish
   */
  static create(
    id: UserId,
    email: string,
    options?: { displayName?: string | null; actorId?: ActorId }
  ): { user: User; event: UserCreated } {
    assertValidEmail(email);
    const actorId = options?.actorId ?? createActorId(id);
    const user = new User({
      id,
      actorId,
      email: email.trim().toLowerCase(),
      displayName: options?.displayName ?? null,
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
    });
    const event = createUserCreated(user.id, user.actorId, user.email);
    return { user, event };
  }

  /**
   * Update profile fields and produce UserUpdated event.
   */
  updateProfile(changes: {
    displayName?: string | null;
    isActive?: boolean;
  }): { user: User; event: UserUpdated } {
    const updated = new User({
      id: this.id,
      actorId: this.actorId,
      email: this.email,
      displayName: changes.displayName !== undefined ? changes.displayName : this.displayName,
      isActive: changes.isActive !== undefined ? changes.isActive : this.isActive,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
    });
    const event = createUserUpdated(this.id, this.actorId, changes);
    return { user: updated, event };
  }
}
