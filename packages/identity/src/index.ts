/**
 * Identity domain package.
 * Architecture: COMP-002
 */

export {
  User,
  type UserId,
  RBACRole,
  Role,
  Session,
  type SessionId,
  createActorId,
  isActorId,
  type ActorId,
  Permission,
  IdentityToken,
  type IdentityTokenClaims,
  createUserCreated,
  createUserUpdated,
  type UserCreated,
  type UserUpdated,
} from "./domain/index.js";
export type { AuthProvider, SignInCredentials } from "./domain/index.js";
export {
  SupabaseAuthAdapter,
  type SupabaseAuthLike,
} from "./infrastructure/supabase-auth-adapter.js";
export { IdentityEventPublisher } from "./infrastructure/IdentityEventPublisher.js";
export {
  InvalidTokenError,
  AuthProviderError,
  ForbiddenError,
} from "./infrastructure/errors.js";
export {
  hasPermission,
  requirePermission,
  PermissionChecker,
  createPermissionChecker,
  InMemoryPermissionCache,
  RequireRole,
  getPermissionsForRole,
  DEFAULT_ROLE_PERMISSIONS,
  type RoleResolver,
  type PermissionCache,
  type PermissionCheckerOptions,
} from "./rbac/index.js";
