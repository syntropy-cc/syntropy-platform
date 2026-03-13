# ADR-005: Authentication Approach — Supabase Auth + Custom RBAC with Anti-Corruption Layer

## Status

Accepted

## Date

2026-03-12

## Context

The Identity domain is classified as a **Generic Subdomain** (ARCH-011): authentication and session management are solved problems with well-known solutions. However, the Syntropy Ecosystem requires a non-trivial authorization model that goes beyond what any off-the-shelf provider delivers natively:

- **Role-Based Access Control (RBAC)** spanning all 12 domains — a single user can be a Learner in Learn, an Institution Admin in Hub, and a Reviewer in Labs simultaneously
- **Dynamic role transitions**: roles change as a result of domain events (e.g., a Contributor becomes an Institution Admin after a governance vote in DIP)
- **Per-resource authorization**: access policies are evaluated at the resource level (e.g., access to a specific artifact depends on the IACP agreement state in DIP)
- **Cross-pillar permission inheritance**: completing a course in Learn grants a Skill, which may grant access to a restricted Track — this requires cross-domain permission evaluation

Forces in tension:

1. **Build vs. Buy**: Authentication is a commodity. Custom-building auth (JWT generation, OAuth flows, email verification, password reset) is expensive and error-prone. An off-the-shelf provider eliminates entire attack surface categories.
2. **ACL requirement**: The Identity domain, as a Generic Subdomain consumed by Core Domains (Learn, Hub, Labs, DIP), must be wrapped behind an Anti-Corruption Layer (ARCH-012). The Core Domains' ubiquitous language must not be contaminated by Supabase-specific concepts (`auth.users`, `supabase_auth_admin`, Supabase session format).
3. **Event-driven role changes**: Role assignments that result from domain events (governance votes, course completions, moderation actions) must flow through the event bus — they must not require direct database writes by non-Identity domains.
4. **PostgreSQL RLS integration**: The chosen auth provider must integrate with Supabase PostgreSQL's Row-Level Security policies (ADR-004), enabling per-row access control enforced at the database level.
5. **Compliance**: GDPR/LGPD/CCPA require right-to-deletion, consent management, and PII data minimization. The authentication layer processes email addresses, which are PII.

## Decision

We will use **Supabase Auth** as the authentication provider (email/password, OAuth2 — Google, GitHub), wrapped behind a **custom RBAC layer** implemented within the Identity domain package, with a **SupabaseAuthAdapter** (Anti-Corruption Layer) isolating Core Domains from Supabase-specific concepts.

Specifically:

1. **Supabase Auth handles**:
   - Email/password authentication with email verification
   - OAuth2 social login (Google, GitHub — extensible to additional providers)
   - Password reset flows
   - Session management (JWT generation and refresh tokens)
   - Email confirmation and magic links
   - User account management (email change, account deletion with GDPR cascade)

2. **Custom RBAC layer** (Identity domain application layer) handles:
   - Role definitions: `learner`, `creator`, `researcher`, `institution_admin`, `reviewer`, `moderator`, `platform_admin`
   - Permission model: `{domain}:{resource}:{action}` (e.g., `dip:artifact:publish`, `hub:institution:govern`, `learn:track:author`)
   - Role-to-permission mapping stored in `identity.roles` and `identity.permissions` tables
   - Role assignment: persisted in `identity.user_roles` table; RBAC service queries this at authorization time
   - Context-sensitive permissions: some permissions depend on runtime context (e.g., `labs:review:submit` requires the user not be the artifact's author — evaluated in the Labs domain, not Identity)

3. **SupabaseAuthAdapter** (Anti-Corruption Layer in `packages/identity/infrastructure/`):
   - Translates Supabase's `User` object to the Identity domain's `AuthenticatedUser` value object
   - Translates Supabase session format to the Identity domain's `Session` entity
   - Core Domains call `IdentityService.getCurrentUser()` — they never reference `supabase.auth.*` directly
   - If Supabase Auth is replaced, only this adapter changes

4. **Event-driven role transitions**: When a domain event triggers a role change (e.g., `hub.governance.proposal_executed` → grant Institution Admin role), the **Identity domain subscribes** to these events on the event bus and applies the role change:
   ```
   Event: hub.governance.proposal_executed (role grant type)
   → Identity domain handler: RoleAssignmentService.grantRole(userId, role, context)
   → Writes to identity.user_roles
   → Emits: identity.role_granted (for downstream consumers)
   ```
   No other domain directly writes to identity tables.

5. **JWT token structure**: Supabase JWTs are extended with a custom `roles` claim populated by a Supabase Edge Function that queries `identity.user_roles`. This allows stateless RBAC evaluation at the presentation layer for common access decisions, with full RBAC evaluation available via the Identity domain service for complex cases.

6. **PostgreSQL RLS integration**: All domain schemas define RLS policies that reference `auth.uid()` (Supabase's built-in function). The Identity domain publishes the `user_id` → `roles` mapping as a PostgreSQL function (`identity.get_user_roles(user_id)`) that other schemas' RLS policies can reference.

## Alternatives Considered

### Alternative 1: Auth0 / Okta

A market-leading identity provider (IdP) with enterprise-grade SSO, SAML, multi-factor authentication, and extensive integrations.

**Pros**:
- Extremely feature-rich: SSO, SAML/OIDC, MFA, anomaly detection, breached password detection
- Enterprise-grade compliance certifications (SOC 2, HIPAA)
- Universal Login with customizable UI
- Extensible with Auth0 Actions (custom code on auth events)

**Cons**:
- Expensive: pricing is per Monthly Active User (MAU); at community scale, costs grow significantly
- PostgreSQL RLS integration requires custom implementation: Auth0 does not natively emit `auth.uid()` in PostgreSQL context — requires a custom token validator and database function
- Not open source: the platform cannot self-host Auth0; this contradicts Vision's open-source deployment goal
- The custom RBAC layer still needs to be built regardless — Auth0's RBAC is limited and does not support event-driven role transitions

**Why rejected**: Cost at community scale, absence of self-hosting capability (contradicts open-source Vision mandate), and the fact that the custom RBAC layer must be built regardless make Auth0's advantages insufficient to justify the additional cost and complexity.

### Alternative 2: Keycloak (Self-Hosted)

An open-source identity and access management solution with comprehensive RBAC, OIDC, SAML, and social login support.

**Pros**:
- Open source, self-hostable — aligns with Vision's open-source mandate
- Built-in role management and permission model
- Extensive OIDC/SAML compatibility
- No per-MAU pricing

**Cons**:
- Operational overhead: Keycloak requires a dedicated JVM server instance with its own database, memory requirements (≥ 512MB RAM minimum), and upgrade process — significant burden for a 2–5 developer team
- Event-driven role transitions still require custom implementation (Keycloak events → Kafka → Identity domain)
- PostgreSQL RLS integration requires custom JWT validator and `auth.uid()` equivalent — same work as with Auth0
- Not integrated with Supabase's ecosystem (Storage, Realtime, Edge Functions) — the team would manage two separate infrastructure platforms

**Why rejected**: Keycloak's operational overhead (separate JVM server, its own database, complex upgrade paths) is disproportionate for the initial team size. Supabase Auth is purpose-built for PostgreSQL integration — the combination of Auth + Database + Storage in one managed platform dramatically reduces operational surface area for a small team.

### Alternative 3: Custom JWT Implementation from Scratch

Implement all authentication logic (JWT generation, OAuth2 flows, refresh tokens, email verification) as custom code within the Identity domain.

**Pros**:
- Complete control over every aspect of authentication
- No external dependency for the authentication pathway

**Cons**:
- Authentication security is extremely difficult to get right; common vulnerabilities (timing attacks, JWT algorithm confusion, CSRF, session fixation) require expert implementation
- Email delivery, OAuth2 state parameter management, and secure password hashing are non-trivial
- Months of engineering effort for solved problems — violates ARCH-011 (Generic Subdomains should buy/integrate off-the-shelf solutions)
- GDPR compliance for authentication data (email, IP logs) requires additional engineering

**Why rejected**: ARCH-011 explicitly states that Generic Subdomains should use off-the-shelf solutions. Building custom authentication is expensive, risky, and strategically misaligned — the team's scarce engineering hours should be invested in Core Domains (DIP, Platform Core, Learn, Hub, Labs).

### Alternative 4: Clerk

A modern developer-first authentication platform with React component libraries and pre-built UI.

**Pros**:
- Excellent developer experience with pre-built React components
- Built-in MFA, session management, and organization management
- JWT customization via Clerk webhooks

**Cons**:
- Not open source — cannot self-host
- PostgreSQL RLS integration requires custom JWT validation setup
- Organization management in Clerk partially overlaps with Hub's Institution model and DIP's DigitalInstitution — risk of conceptual confusion and potential ACL leakage
- Pricing model similar to Auth0

**Why rejected**: Clerk's Organization concept would leak into the Core Domain boundary if used for Hub institutions — a direct ARCH-012 violation. Not open source contradicts Vision's deployment goals.

## Consequences

### Positive

- Supabase Auth + PostgreSQL is a native combination: RLS policies referencing `auth.uid()` work out of the box; no custom token validation infrastructure needed.
- Event-driven role transitions mean the RBAC system evolves automatically as governance events, course completions, and moderation actions occur — no manual role management UI needed for most cases.
- The `SupabaseAuthAdapter` ACL means all Core Domains are insulated from Supabase specifics. If Supabase Auth is replaced (e.g., with a self-hosted solution), only the adapter changes.
- Social login (Google, GitHub) supports the target user population (developers, researchers, educators) who typically have these accounts.

### Negative

- Custom RBAC layer must be designed and maintained by the team.
  - **Mitigation**: RBAC layer is scoped to Identity domain and has a clear data model (`identity.roles`, `identity.permissions`, `identity.user_roles`). The domain-scoped permission string format `{domain}:{resource}:{action}` is self-documenting.
- JWT size grows with custom roles claim; large role sets increase token size affecting every request.
  - **Mitigation**: JWT contains only role names (short strings), not full permission sets. Full permission evaluation happens server-side via the RBAC service for complex queries.
- Supabase Auth's GDPR compliance (right-to-deletion) requires cascading deletes across all domain schemas.
  - **Mitigation**: The Identity domain exposes a `UserDeletionService` that orchestrates GDPR deletion across all domains via domain events; each domain handles its own data cleanup upon receiving `identity.user_deletion_requested`.

### Neutral

- Supabase Auth stores user metadata in `auth.users` (Supabase-managed schema). The Identity domain maintains a shadow `identity.profiles` table for domain-owned user attributes (display name, preferences, portfolio settings). These are kept in sync via Supabase Auth webhooks.
- The ACL adapter approach means the Identity domain's test suite can mock the entire auth provider — unit tests do not require a Supabase instance.

## References

- Vision Document: Section 1 (Capability 1: Identity and authentication); Section 10 (compliance GDPR/LGPD/CCPA)
- ADR-001: Modular Monolith — Identity as Generic Subdomain consumed by Core Domains
- ADR-004: Database Strategy — Supabase PostgreSQL + RLS
- `docs/architecture/domains/identity/ARCHITECTURE.md` — Full Identity domain design
- `docs/architecture/cross-cutting/security/ARCHITECTURE.md` — AuthN/AuthZ cross-cutting requirements

## Derived Rules

- `architecture.mdc`: ARCH-011 — Identity classified as Generic Subdomain; Supabase Auth is the off-the-shelf solution
- `architecture.mdc`: ARCH-012 — Mandatory ACL (`SupabaseAuthAdapter`) when Core Domains consume Identity (Generic Subdomain)
- `architecture.mdc`: ARCH-003 — Only Identity domain writes to identity tables; role changes from other domains must flow through Identity via event bus

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2026-03-12 | System Architect | Accepted | Supabase Auth eliminates commodity auth work; custom RBAC layer provides the ecosystem-specific authorization model; ACL enforces domain boundary |
