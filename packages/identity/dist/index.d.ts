/**
 * Identity domain package.
 * Architecture: COMP-002
 */
export { User, type UserId, RBACRole, Role, Session, type SessionId, createActorId, isActorId, type ActorId, Permission, IdentityToken, type IdentityTokenClaims, createUserCreated, createUserUpdated, type UserCreated, type UserUpdated, } from "./domain/index.js";
export type { AuthProvider, SignInCredentials } from "./domain/index.js";
export { SupabaseAuthAdapter, type SupabaseAuthLike, } from "./infrastructure/supabase-auth-adapter.js";
export { IdentityEventPublisher } from "./infrastructure/IdentityEventPublisher.js";
export { InvalidTokenError, AuthProviderError } from "./infrastructure/errors.js";
//# sourceMappingURL=index.d.ts.map