/**
 * Identity domain — entities, value objects, events.
 * Architecture: COMP-002
 */

export { User, type UserId } from "./entities/user.js";
export { RBACRole } from "./entities/rbac-role.js";
export { Role } from "./entities/role.js";
export { Session, type SessionId } from "./entities/session.js";
export { createActorId, isActorId, type ActorId } from "./value-objects/actor-id.js";
export { Permission } from "./value-objects/permission.js";
export {
  IdentityToken,
  type IdentityTokenClaims,
} from "./value-objects/identity-token.js";
export type { AuthProvider, SignInCredentials } from "./auth-provider.js";
export {
  createUserCreated,
  createUserUpdated,
  type UserCreated,
  type UserUpdated,
} from "./events/user-events.js";
