# ADR-004: Database Strategy — Supabase / PostgreSQL with Per-Domain Schema Isolation

## Status

Accepted

## Date

2026-03-12

## Context

The Syntropy Ecosystem has 12 bounded contexts, each owning distinct data with different access patterns. A database strategy must be chosen that satisfies the following requirements:

- **Relational model fitness**: The core domain entities — Artifact, DigitalProject, GovernanceContract, DependencyGraph, Career/Track/Course/Fragment, Issue/Contribution — are richly relational with foreign key constraints, complex joins for reporting, and transactional consistency requirements.
- **Domain autonomy**: Per ARCH-003, no domain may directly access another domain's tables. Cross-domain data access must go through APIs or events, not SQL joins across schemas.
- **Team size constraint**: A 2–5 developer team cannot maintain, migrate, and operate 12 separate database instances. The overhead of managing separate databases, connection pools, backup strategies, and monitoring for each domain is prohibitive.
- **Compliance requirements**: Personal data (PII) must be encrypted at rest (AES-256) and in transit (TLS 1.3). GDPR, LGPD, and CCPA compliance is required from launch (Vision Section 10). Row-Level Security (RLS) for multi-tenant isolation is needed.
- **Authentication integration**: The chosen database platform must integrate cleanly with the authentication layer (ADR-005) to enforce row-level security policies scoped to authenticated users.
- **Cost efficiency**: The initial deployment must be cost-effective. Managed cloud databases with predictable pricing and no per-query costs are preferred.
- **Migration tooling**: The team needs reliable, reversible schema migrations with a clear rollback path.

The key tension is between **domain autonomy** (each domain should own its data) and **operational simplicity** (a small team cannot manage 12 separate databases). The resolution is to separate the *logical* concern (each domain owns its schema) from the *physical* concern (schemas can share an infrastructure instance).

## Decision

We will use **Supabase** as the managed database platform, backed by **PostgreSQL**, with **per-domain PostgreSQL schemas** providing logical isolation within a shared PostgreSQL instance.

Specifically:

1. **One PostgreSQL schema per domain**:
   ```
   platform_core.*
   identity.*
   dip.*
   ai_agents.*
   learn.*
   hub.*
   labs.*
   sponsorship.*
   communication.*
   planning.*
   ide.*
   governance_moderation.*
   ```
   Each domain's tables, views, functions, and RLS policies are contained within its named schema.

2. **No cross-schema SQL queries in application code**: Domain packages may only query tables in their own schema. Cross-domain data access requires calling the owning domain's application API or consuming events. This is enforced by code review and, where possible, by database role grants (each domain's service role has `USAGE` grant only on its own schema).

3. **Supabase as managed platform**: Supabase provides PostgreSQL (v15+) with:
   - Built-in connection pooling (PgBouncer)
   - Automated backups and point-in-time recovery
   - Row-Level Security (RLS) policies for multi-tenant data isolation
   - Realtime subscriptions (used selectively for live UI updates)
   - Storage (for artifact file content, separate from metadata)
   - Edge Functions (for lightweight webhooks and transformations)
   - Built-in Auth integration with PostgreSQL RLS (the `auth.uid()` function in RLS policies)

4. **Migration tooling**: All schema migrations use **Supabase CLI** with versioned SQL migration files stored in `supabase/migrations/`. Migrations are reviewed as pull requests and applied in CI before deployment. Each migration must have a corresponding down migration for the 30-day reversibility window (per CON-003).

5. **Production scaling path**: When any domain's query load requires dedicated resources, that domain's schema can be migrated to a dedicated PostgreSQL instance with minimal application changes (only the connection string in the Infrastructure layer changes; no domain or application layer code is affected due to ARCH-002 dependency inversion).

6. **Supabase Storage** for large artifacts (articles, datasets, code packages): Files are stored in Supabase Storage (S3-compatible). The DIP domain stores a `storage_reference` (bucket + object path) in the `dip.artifacts` table, not the file content.

## Alternatives Considered

### Alternative 1: One PostgreSQL Database Per Domain (Separate Instances)

Deploy 12 independent PostgreSQL instances, each owned by one domain.

**Pros**:
- True physical isolation: a slow query in one domain cannot affect another
- Independent scaling per domain
- Schema changes in one domain never risk other domains

**Cons**:
- 12 database instances to manage, monitor, back up, and pay for — operationally prohibitive for a 2–5 developer team
- Cross-domain reporting (e.g., admin dashboards aggregating data across domains) requires application-level joins — complex and slow
- Connection pool management across 12 databases multiplies infrastructure surface area
- GDPR compliance requires knowing the location of all PII — 12 databases makes this audit more complex

**Why rejected**: The operational overhead is incompatible with a small team delivering a complex product. Schema isolation within a single Supabase instance provides the same logical boundary at a fraction of the operational cost. Physical isolation can be added incrementally as specific domains demonstrate scaling needs.

### Alternative 2: MongoDB (Document Store)

Use MongoDB as the primary data store. Each domain's collections are namespaced within a single MongoDB instance.

**Pros**:
- Schema-less: flexible document structure for evolving entity models
- Native support for nested document structures (e.g., Fragment's Problem/Theory/Artifact structure)
- Horizontal scaling via sharding

**Cons**:
- DIP's dependency graph, legitimacy chain, and IACP state machine are highly relational — graph traversals and foreign key integrity are awkward in a document model
- MongoDB does not support server-side foreign key enforcement; referential integrity must be maintained at the application level — a significant risk for Core Domains
- ACID transactions across collections require replica sets and are more limited than PostgreSQL's transactional guarantees
- PostgreSQL is already mandated for Supabase Auth (ADR-005) — introducing a second database technology adds operational complexity for no clear gain
- The team has expertise in relational databases; switching to document modeling adds a learning curve

**Why rejected**: The domain models are intrinsically relational. Relational integrity (foreign keys, cascades) and transactional guarantees are not optional for DIP's IACP engine and institutional governance. MongoDB would require re-implementing referential integrity in application code — error-prone and undesirable.

### Alternative 3: PlanetScale (MySQL-Compatible Serverless Database)

Use PlanetScale as a managed MySQL-compatible serverless database with branching workflows.

**Pros**:
- Serverless scaling (no connection management)
- Schema branching (database schemas versioned like code)
- Very developer-friendly migration experience

**Cons**:
- PlanetScale uses Vitess under the hood, which does not support foreign key constraints by default — a significant limitation for DIP's relational model
- MySQL-compatible means some PostgreSQL features (RLS, arrays, JSONB, full-text search, `pg_crypto`) are unavailable — the team would need workarounds for functionality already available in PostgreSQL
- Supabase Auth (ADR-005) requires PostgreSQL; using a separate database technology for the main application data creates split infrastructure
- PlanetScale moved away from its free tier, increasing cost

**Why rejected**: Lack of foreign key constraint support is a non-starter for DIP's domain model. Supabase integration requires PostgreSQL. Adding a second database technology without compelling benefit adds unnecessary complexity.

### Alternative 4: CockroachDB (Distributed PostgreSQL)

Use CockroachDB for global distribution and horizontal scaling.

**Pros**:
- PostgreSQL wire-compatible: existing PostgreSQL tooling works
- Global distribution: low-latency reads across regions
- Automatic sharding and horizontal scaling

**Cons**:
- Significantly more expensive than Supabase at startup scale
- Distributed transactions have higher latency than single-node PostgreSQL
- Not all PostgreSQL features are supported (e.g., some extension functions, `LISTEN/NOTIFY`)
- Supabase integration is not native — Auth and RLS features are Supabase-specific
- Over-engineered for the current scale: the system starts at community scale, not global distributed scale

**Why rejected**: CockroachDB solves global distribution problems the system does not yet have. The additional cost and latency trade-offs are unjustified. Supabase's managed PostgreSQL with read replicas covers the scaling needs for the initial phases, and migration to CockroachDB is possible if global distribution becomes necessary.

## Consequences

### Positive

- A single Supabase instance means one backup strategy, one monitoring setup, one set of credentials to manage — dramatically reducing operational overhead for the initial team.
- PostgreSQL schemas provide genuine logical isolation; a mistake in one domain's migration cannot corrupt another domain's data (schema-scoped roles enforce this at the database level).
- Supabase's RLS integration with `auth.uid()` means per-row access policies can be defined declaratively and enforced at the database level — defense in depth for PII.
- JSONB columns in PostgreSQL handle semi-structured data (e.g., event payloads, governance contract terms) without sacrificing relational integrity for structured fields.
- Supabase Storage + PostgreSQL metadata provides a clean separation between file storage (S3-compatible object storage) and metadata storage (relational tables).

### Negative

- Shared PostgreSQL instance means a poorly optimized query in one domain could degrade performance for all domains.
  - **Mitigation**: Per-domain connection pool limits (PgBouncer pool mode per schema). Query performance monitoring via Supabase dashboard. Index requirements reviewed as part of ADR-level domain architecture decisions.
- Schema migrations across 12 domains in a single instance require careful coordination — a blocked migration can hold a table lock visible to all consumers.
  - **Mitigation**: Migrations are additive by default (add columns, create new tables). Breaking schema changes use the expand/contract pattern: add new schema, migrate data, remove old schema in a separate deployment.
- Supabase's managed PostgreSQL is a third-party dependency. If Supabase experiences an outage, the platform is unavailable.
  - **Mitigation**: Supabase offers SLA guarantees on paid plans. Point-in-time recovery (PITR) provides RPO < 1 minute. The connection string abstraction in the Infrastructure layer means migrating to a self-hosted PostgreSQL instance is a configuration change, not a code change.

### Neutral

- Per-domain database roles require initial setup during project initialization. This is a one-time cost that pays dividends in access control clarity.
- The "single instance, multiple schemas" pattern means the production scaling path (per ADR) requires data migration to extract a domain — this will be a non-trivial operation if a domain's traffic warrants it. However, the clean domain boundaries in the application code ensure this migration is well-defined.

## Implementation Notes

### Schema Isolation Setup

```sql
-- Create per-domain schemas
CREATE SCHEMA platform_core;
CREATE SCHEMA dip;
CREATE SCHEMA learn;
-- ... etc

-- Create per-domain service roles
CREATE ROLE platform_core_service;
GRANT USAGE ON SCHEMA platform_core TO platform_core_service;
GRANT ALL ON ALL TABLES IN SCHEMA platform_core TO platform_core_service;

-- Cross-schema access is explicitly denied
REVOKE ALL ON SCHEMA learn FROM platform_core_service;
```

### Migration File Convention

```
supabase/migrations/
  YYYYMMDDHHMMSS_domain_description.sql

Examples:
  20260312000001_dip_create_artifact_tables.sql
  20260312000002_learn_create_course_tables.sql
  20260312000003_identity_create_user_tables.sql
```

### Connection String per Domain (Infrastructure Layer)

```typescript
// packages/dip/infrastructure/database/connection.ts
const dipDb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  schema: 'dip'  // Supabase client scoped to DIP schema
});
```

## References

- Vision Document: Section 10 (Known Constraints: compliance GDPR/LGPD/CCPA from launch)
- ADR-001: Modular Monolith — domain autonomy requirement
- ADR-005: Authentication Approach — Supabase Auth integration with PostgreSQL RLS
- `docs/architecture/cross-cutting/security/ARCHITECTURE.md` — Encryption at rest, RLS policies

## Derived Rules

- `architecture.mdc`: ARCH-003 — No direct cross-context database access; per-schema role enforcement
- `architecture.mdc`: ARCH-005 — Single source of truth; each domain owns exactly one schema
- `constraints.mdc`: CON-001 — Database: Supabase / PostgreSQL as mandated technology stack

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2026-03-12 | System Architect | Accepted | Supabase + per-domain schemas balances domain autonomy with small-team operational simplicity |
