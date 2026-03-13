# Identity Implementation Record

> **Component ID**: COMP-002
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/identity/ARCHITECTURE.md](../../architecture/domains/identity/ARCHITECTURE.md)
> **Stage Assignment**: S1 — Foundation
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Identity is a **Generic Subdomain** responsible for authentication, session management, and RBAC enforcement. It wraps Supabase Auth behind an Anti-Corruption Layer (`SupabaseAuthAdapter`) to isolate the rest of the system from Supabase's vocabulary. It mints `IdentityToken` (JWT) with `ActorId` and role claims, which every other domain consumes via an Open Host Service pattern (ADR-005).

**Responsibilities**:
- User registration, login, logout, and magic-link authentication via Supabase Auth
- Session lifecycle management (issue, refresh, revoke)
- RBAC enforcement: assign/revoke roles, check permissions per resource+action
- Provide `ActorId` (stable, globally unique actor identifier used for DIP cryptographic signing)
- Publish `identity.user.created`, `identity.role.assigned`, `identity.role.revoked` events

**Key Interfaces**:
- Public REST API: `/api/v1/auth/*`, `/api/v1/users/*` — user-facing auth and profile management
- Internal API: `http://identity.internal/api/v1/tokens/verify`, `/permissions/check`, `/users/{id}/actor-id`
- Event bus: publishes to `identity.events` Kafka topic

### Implementation Scope

**In Scope**:
- `User`, `Session`, `Role`, `Permission` domain entities and value objects
- `SupabaseAuthAdapter` (ACL wrapping Supabase Auth SDK)
- `RBACEngine` domain service (role assignment, permission checks)
- `SessionManager` application service
- PostgreSQL repository implementations using Supabase client
- Public and internal API endpoints
- Database migration: `users`, `sessions`, `roles`, `permissions`, `user_roles` tables
- Unit + integration tests for all domain logic and adapters

**Out of Scope**:
- Platform-level moderation policies (COMP-031 Governance & Moderation)
- Sponsorship access tier enforcement (COMP-027)
- DIP actor key management (COMP-003 — keys are client-side only)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 7 |
| **Total** | **7** |

**Component Coverage**: 0%

### Item List

#### [COMP-002.1] Identity domain entities and value objects

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | identity/ARCHITECTURE.md |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `User`, `Session`, `Role`, `Permission` domain entities and associated value objects (`ActorId`, `Email`, `IdentityToken`). Define the `UserRepository` interface.

**Acceptance Criteria**:
- [ ] `User` entity: `id (UserId)`, `actor_id (ActorId)`, `email (Email)`, `is_active`, `is_verified`, `created_at`
- [ ] `Session` entity: `id`, `user_id`, `supabase_session_ref`, `expires_at`, `is_revoked`
- [ ] `Role` entity: `name`, `is_system_role`; predefined system roles: Learner, Creator, Researcher, InstitutionAdmin, PlatformModerator, PlatformAdmin
- [ ] `Permission` value object: `resource`, `action`
- [ ] `ActorId` branded type derived from stable user identifier
- [ ] `UserRepository` interface with `findById`, `findByEmail`, `save`
- [ ] All entities pass strict TypeScript with no `any`
- [ ] Unit tests for entity invariants (active user, valid email format)

**Files Created/Modified**:
- `packages/identity/src/domain/entities/user.ts`
- `packages/identity/src/domain/entities/session.ts`
- `packages/identity/src/domain/entities/role.ts`
- `packages/identity/src/domain/value-objects/actor-id.ts`
- `packages/identity/src/domain/value-objects/email.ts`
- `packages/identity/src/domain/value-objects/identity-token.ts`
- `packages/identity/src/domain/repositories/user-repository.ts`
- `packages/identity/src/domain/index.ts`
- `packages/identity/tests/unit/domain/user.test.ts`

---

#### [COMP-002.2] SupabaseAuthAdapter (ACL)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | identity/ARCHITECTURE.md, ADR-005 |
| **Dependencies** | COMP-002.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `SupabaseAuthAdapter` as the ACL layer over Supabase Auth. Handles OAuth2/OIDC flows, magic-link authentication, session refresh, and translates Supabase token format into `IdentityToken` with `ActorId` and role claims.

**Acceptance Criteria**:
- [ ] `SupabaseAuthAdapter` implements `AuthProvider` interface (defined in domain)
- [ ] `login(email, password)` → returns `IdentityToken`
- [ ] `loginWithMagicLink(email)` → triggers Supabase magic link flow
- [ ] `handleOAuthCallback(code)` → exchanges code, returns `IdentityToken`
- [ ] `refreshSession(refreshToken)` → returns new `IdentityToken`
- [ ] `logout(sessionId)` → revokes Supabase session
- [ ] `IdentityToken` JWT contains: `sub (UserId)`, `actor_id (ActorId)`, `roles[]`, `exp`, `iat`
- [ ] Supabase vocabulary does not appear in domain types
- [ ] Integration test with Supabase local emulator

**Files Created/Modified**:
- `packages/identity/src/domain/auth-provider.ts` (interface)
- `packages/identity/src/infrastructure/supabase-auth-adapter.ts`
- `packages/identity/src/infrastructure/supabase-client.ts`
- `packages/identity/tests/integration/supabase-auth-adapter.test.ts`

---

#### [COMP-002.3] RBAC Engine

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | identity/ARCHITECTURE.md, ADR-005 |
| **Dependencies** | COMP-002.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `RBACEngine` domain service for role assignment, permission checking, and role-to-permission mapping. Support expiring role grants.

**Acceptance Criteria**:
- [ ] `RBACEngine.assignRole(userId, roleName, grantedBy, expiresAt?)` assigns role
- [ ] `RBACEngine.revokeRole(userId, roleName)` revokes role
- [ ] `RBACEngine.checkPermission(userId, resource, action)` returns `boolean`
- [ ] Role-to-permission matrix defined for all 6 system roles
- [ ] Expired role grants are automatically excluded from permission checks
- [ ] `identity.role.assigned` and `identity.role.revoked` events published on state change
- [ ] Unit tests: 20+ test cases covering all role combinations and edge cases

**Files Created/Modified**:
- `packages/identity/src/domain/services/rbac-engine.ts`
- `packages/identity/src/domain/services/role-permission-matrix.ts`
- `packages/identity/tests/unit/domain/rbac-engine.test.ts`

---

#### [COMP-002.4] PostgreSQL repository implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | identity/ARCHITECTURE.md, ADR-004 |
| **Dependencies** | COMP-002.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `PostgresUserRepository` and `PostgresSessionRepository` using Supabase/PostgreSQL. Create database migration for `users`, `sessions`, `roles`, `permissions`, `user_roles` tables.

**Acceptance Criteria**:
- [ ] `PostgresUserRepository` implements `UserRepository` interface
- [ ] `findById`, `findByEmail`, `save` methods work with PostgreSQL
- [ ] Database migration creates all required tables with correct indexes
- [ ] `users` table: unique constraint on `email` and `actor_id`
- [ ] `user_roles` table: composite PK, supports `expires_at`
- [ ] Integration tests run against local PostgreSQL

**Files Created/Modified**:
- `packages/identity/src/infrastructure/repositories/postgres-user-repository.ts`
- `packages/identity/src/infrastructure/repositories/postgres-session-repository.ts`
- `packages/identity/src/infrastructure/migrations/001_identity_schema.sql`
- `packages/identity/tests/integration/repositories/user-repository.test.ts`

---

#### [COMP-002.5] Application services and event publisher

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | identity/ARCHITECTURE.md |
| **Dependencies** | COMP-002.2, COMP-002.3, COMP-002.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `AuthenticationService`, `UserProfileService`, and `IdentityEventPublisher`. These orchestrate domain services and adapters, and publish domain events to Kafka.

**Acceptance Criteria**:
- [ ] `AuthenticationService.register(email, name)` creates User, publishes `identity.user.created`
- [ ] `AuthenticationService.login(email, password)` returns `IdentityToken`
- [ ] `UserProfileService.getProfile(userId)` returns user profile
- [ ] `UserProfileService.updateProfile(userId, changes)` updates allowed fields
- [ ] `IdentityEventPublisher` publishes to `identity.events` Kafka topic with `correlation_id`
- [ ] All use cases validated against `packages/events` schema

**Files Created/Modified**:
- `packages/identity/src/application/authentication-service.ts`
- `packages/identity/src/application/user-profile-service.ts`
- `packages/identity/src/infrastructure/identity-event-publisher.ts`
- `packages/identity/tests/unit/application/authentication-service.test.ts`

---

#### [COMP-002.6] Public and internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | identity/ARCHITECTURE.md |
| **Dependencies** | COMP-002.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement REST API route handlers for public auth endpoints and internal service-to-service endpoints.

**Acceptance Criteria**:
- [ ] `POST /api/v1/auth/login` → returns `IdentityToken`
- [ ] `POST /api/v1/auth/callback` → handles OAuth callback
- [ ] `POST /api/v1/auth/logout` → revokes session
- [ ] `GET /api/v1/users/me` → returns current user profile
- [ ] `PATCH /api/v1/users/me` → updates profile
- [ ] `GET /api/v1/users/{id}/roles`, `POST`, `DELETE` → role management (admin only)
- [ ] Internal: `POST /internal/tokens/verify` → validates JWT, returns claims
- [ ] Internal: `GET /internal/permissions/check` → RBAC permission check
- [ ] Internal: `GET /internal/users/{id}/actor-id` → returns `ActorId`
- [ ] All endpoints: proper error responses per CONV-017 envelope format
- [ ] Rate limiting applied at API gateway level (COMP-033)

**Files Created/Modified**:
- `packages/identity/src/api/routes/auth.ts`
- `packages/identity/src/api/routes/users.ts`
- `packages/identity/src/api/routes/internal.ts`
- `packages/identity/src/api/middleware/auth-guard.ts`
- `packages/identity/tests/integration/api/auth.test.ts`

---

#### [COMP-002.7] Token verification middleware (shared)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | identity/ARCHITECTURE.md, ADR-005 |
| **Dependencies** | COMP-002.6 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement a shared `verifyIdentityToken` middleware function that all other packages can import from `packages/identity` to authenticate requests. This is the primary integration point for all domains.

**Acceptance Criteria**:
- [ ] `verifyIdentityToken(token: string)` exported from `packages/identity`
- [ ] Returns `{ userId, actorId, roles }` on valid token
- [ ] Throws `UnauthorizedError` on invalid/expired token
- [ ] Calls internal identity service (cache-able, ≤5ms p99 per ARCH)
- [ ] Exported from `packages/identity/src/index.ts` as public API

**Files Created/Modified**:
- `packages/identity/src/api/middleware/verify-token.ts`
- `packages/identity/src/index.ts` (exports public API)
- `packages/identity/tests/unit/middleware/verify-token.test.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | Package shell and shared types |
| Supabase Auth | External | ✅ Available | OAuth2/OIDC provider |
| PostgreSQL (Supabase) | External | ✅ Available | User and session persistence |
| Kafka | External | ✅ Available | Event bus for identity events |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-003 DIP Artifact Registry | Uses `ActorId` for artifact signing | Blocks DIP implementation |
| COMP-009 Event Bus & Audit | Uses `verifyIdentityToken` | Blocks all authenticated requests |
| COMP-015 through COMP-031 (all domains) | Uses token verification | Blocks all domain implementations |
| COMP-032 Web Application | Auth Provider integration | Blocks frontend auth |

---

## Technical Details

### File Structure

```
packages/identity/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.ts
│   │   │   ├── session.ts
│   │   │   └── role.ts
│   │   ├── value-objects/
│   │   │   ├── actor-id.ts
│   │   │   ├── email.ts
│   │   │   └── identity-token.ts
│   │   ├── repositories/
│   │   │   └── user-repository.ts  (interface)
│   │   ├── services/
│   │   │   ├── rbac-engine.ts
│   │   │   └── role-permission-matrix.ts
│   │   └── auth-provider.ts        (interface)
│   ├── application/
│   │   ├── authentication-service.ts
│   │   └── user-profile-service.ts
│   ├── infrastructure/
│   │   ├── supabase-auth-adapter.ts
│   │   ├── supabase-client.ts
│   │   ├── identity-event-publisher.ts
│   │   ├── repositories/
│   │   │   ├── postgres-user-repository.ts
│   │   │   └── postgres-session-repository.ts
│   │   └── migrations/
│   │       └── 001_identity_schema.sql
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   └── internal.ts
│   │   └── middleware/
│   │       ├── auth-guard.ts
│   │       └── verify-token.ts
│   └── index.ts                    (public API exports)
└── tests/
    ├── unit/
    │   ├── domain/
    │   │   ├── user.test.ts
    │   │   └── rbac-engine.test.ts
    │   ├── application/
    │   │   └── authentication-service.test.ts
    │   └── middleware/
    │       └── verify-token.test.ts
    └── integration/
        ├── supabase-auth-adapter.test.ts
        ├── repositories/
        │   └── user-repository.test.ts
        └── api/
            └── auth.test.ts
```

### Key Classes/Functions

| Name | Type | Purpose |
|------|------|---------|
| `User` | Entity | Core user aggregate with `ActorId` |
| `RBACEngine` | Domain Service | Role assignment and permission checking |
| `SupabaseAuthAdapter` | Infrastructure (ACL) | Translates Supabase auth into domain types |
| `verifyIdentityToken` | Exported Function | Used by all other packages to authenticate requests |
| `AuthenticationService` | Application Service | Orchestrates login/register flows |

---

## Implementation Log

### 2026-03-13 - Component Created

- Created initial implementation record
- Extracted 7 work items from identity/ARCHITECTURE.md and ADR-005
- Key dependency: Supabase project must be provisioned before integration tests can run

---

## References

### Architecture Documents

- [Identity Domain Architecture](../../architecture/domains/identity/ARCHITECTURE.md)
- [Domain Overview](../../architecture/ARCHITECTURE.md#domain-overview)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-005](../../architecture/decisions/ADR-005-authentication-approach.md) | Supabase Auth + custom RBAC | Primary decision for this component |
| [ADR-004](../../architecture/decisions/ADR-004-database-strategy.md) | Supabase/PostgreSQL | Data persistence strategy |

### Related Components

| Component | Relationship |
|-----------|--------------|
| [COMP-001](./COMP-001-monorepo-infrastructure.md) | Provides package shell |
| [COMP-003](./COMP-003-dip-artifact-registry.md) | Consumes `ActorId` for artifact signing |
| [COMP-009](./COMP-009-event-bus-audit.md) | Token verification for event publishing |
| [COMP-031](./COMP-031-governance-moderation.md) | Supplies role policy updates via events |
