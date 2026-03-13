# Monorepo Infrastructure Implementation Record

> **Component ID**: COMP-001
> **Architecture Reference**: [ARCHITECTURE.md#modular-monolith-layer-structure](../../architecture/ARCHITECTURE.md#modular-monolith-layer-structure)
> **Domain Architecture**: Root — see [ARCHITECTURE.md](../../architecture/ARCHITECTURE.md)
> **Stage Assignment**: S1 — Foundation
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

The Syntropy Ecosystem is built as a **modular monolith** using Turborepo and pnpm workspaces (ADR-001). The repository is organized into `apps/` (Next.js pillar applications) and `packages/` (domain packages + shared utilities). Bounded contexts are isolated as workspace packages; communication between packages happens exclusively via the event bus or versioned APIs — no direct imports between pillar apps.

**Responsibilities**:
- Initialize Turborepo monorepo with pnpm workspaces
- Set up all `apps/` shells (learn, hub, labs, admin, institutional-site)
- Set up all `packages/` shells (platform-core, dip, ai-agents, learn, hub, labs, sponsorship, communication, planning, ide, governance-moderation, identity, types, events, ui)
- Configure shared tooling: TypeScript, ESLint, Prettier, Vitest, database migrations
- Establish the 4-layer package internal structure (`domain/`, `application/`, `infrastructure/`, `api/`)

**Key Interfaces**:
- `packages/types`: shared TypeScript types and branded IDs shared across all packages
- `packages/events`: Event Schema Registry types and Kafka topic constants
- `packages/ui`: shared design system component shells (detailed implementation in COMP-032)

### Implementation Scope

**In Scope**:
- `turbo.json` + root `package.json` with workspace config
- All `apps/*` Next.js shells with `package.json`, `tsconfig.json`, base directory structure
- All `packages/*` shells with `package.json`, `tsconfig.json`, internal `domain/`, `application/`, `infrastructure/`, `api/` structure
- `packages/types` — branded ID types (`UserId`, `ArtifactId`, etc.), common value objects
- `packages/events` — event topic constants, base event envelope type, schema registry placeholder
- `packages/ui` — shell with design tokens import and empty component index
- Docker Compose for local development (PostgreSQL, Redis, Kafka, Zookeeper)
- Root `tsconfig.json`, ESLint config, Prettier config, Vitest workspace config
- `.env.example` with all required environment variables

**Out of Scope**:
- Business logic in any domain package (implemented in COMP-002 through COMP-031)
- Next.js page components and routing (COMP-032)
- CI/CD pipeline (TASK-003)
- Database schema/migrations (each domain owns its own, starting with COMP-002)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 5 |
| **Total** | **5** |

**Component Coverage**: 0%

### Item List

#### [COMP-001.1] Initialize Turborepo + pnpm workspaces

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | ADR-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Create the root repository structure with Turborepo pipeline configuration and pnpm workspace declarations. Establish the `apps/` and `packages/` top-level directories.

**Acceptance Criteria**:
- [ ] `turbo.json` defines `build`, `test`, `lint`, `dev` pipelines with correct dependencies
- [ ] Root `pnpm-workspace.yaml` declares all workspace packages
- [ ] Root `package.json` configures pnpm and Turborepo
- [ ] `pnpm install` succeeds from the root
- [ ] `turbo run build` resolves dependency graph correctly (dry-run)

**Files Created/Modified**:
- `turbo.json`
- `pnpm-workspace.yaml`
- `package.json` (root)
- `.npmrc`

---

#### [COMP-001.2] Create all app and package shells

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | ADR-001 |
| **Dependencies** | COMP-001.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Scaffold all `apps/*` (learn, hub, labs, admin, institutional-site) as Next.js 14 App Router projects and all `packages/*` domain packages with their 4-layer internal structure (`domain/`, `application/`, `infrastructure/`, `api/`).

**Acceptance Criteria**:
- [ ] All 5 `apps/*` have `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- [ ] All 12 domain `packages/*` have `package.json`, `tsconfig.json`, `src/domain/`, `src/application/`, `src/infrastructure/`, `src/api/` (empty `index.ts` in each)
- [ ] All `packages/shared/*` (types, events, ui) have `package.json`, `tsconfig.json`, `src/index.ts`
- [ ] `pnpm build` succeeds for all packages (no-op initially)
- [ ] Each package exports an empty module that can be imported

**Files Created/Modified**:
- `apps/learn/`, `apps/hub/`, `apps/labs/`, `apps/admin/`, `apps/institutional-site/` (each with Next.js scaffold)
- `packages/platform-core/`, `packages/dip/`, `packages/ai-agents/`, `packages/learn/`, `packages/hub/`, `packages/labs/`, `packages/sponsorship/`, `packages/communication/`, `packages/planning/`, `packages/ide/`, `packages/governance-moderation/`, `packages/identity/` (each with 4-layer structure)
- `packages/types/`, `packages/events/`, `packages/ui/`

---

#### [COMP-001.3] Set up shared packages (types, events, ui shell)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | ADR-001 |
| **Dependencies** | COMP-001.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement the content of shared packages: `packages/types` with all branded ID types and common value objects, `packages/events` with event envelope types and topic constants, and `packages/ui` shell with design token imports.

**Acceptance Criteria**:
- [ ] `packages/types` exports branded IDs: `UserId`, `ArtifactId`, `ProjectId`, `InstitutionId`, `TrackId`, `CourseId`, `FragmentId`, `IssueId`, `ContributionId`, `ArticleId`, `SessionId`, and at minimum 10 more domain IDs
- [ ] `packages/events` exports `EcosystemEvent` base type, `EventEnvelope<T>`, topic name constants for all domains, `correlation_id` / `causation_id` fields
- [ ] `packages/ui` exports a `theme` object with design tokens (colors, typography, spacing) from the design system
- [ ] All packages pass TypeScript strict type-checking

**Files Created/Modified**:
- `packages/types/src/index.ts`, `packages/types/src/ids.ts`, `packages/types/src/common.ts`
- `packages/events/src/index.ts`, `packages/events/src/envelope.ts`, `packages/events/src/topics.ts`
- `packages/ui/src/index.ts`, `packages/ui/src/theme.ts`

---

#### [COMP-001.4] Configure tooling (TypeScript, ESLint, Prettier, Vitest)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | ADR-001, CON-010 |
| **Dependencies** | COMP-001.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Configure root-level and per-package TypeScript, ESLint, Prettier, and Vitest. Establish test infrastructure with proper workspace configuration.

**Acceptance Criteria**:
- [ ] Root `tsconfig.json` with strict mode and path aliases
- [ ] All packages inherit from root tsconfig via `extends`
- [ ] ESLint config enforces no cross-domain direct imports (using import/no-restricted-paths)
- [ ] Prettier config applied uniformly
- [ ] `vitest.workspace.ts` at root runs all package test suites
- [ ] `turbo run test` runs all tests across workspace

**Files Created/Modified**:
- `tsconfig.json` (root)
- `eslint.config.js` (root)
- `.prettierrc`
- `vitest.workspace.ts`
- `packages/*/vitest.config.ts` (each package)

---

#### [COMP-001.5] Docker Compose for local development

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | ADR-002, ADR-004 |
| **Dependencies** | COMP-001.1 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Set up Docker Compose for local development with all required services: PostgreSQL (Supabase-compatible), Redis, Kafka, and Zookeeper.

**Acceptance Criteria**:
- [ ] `docker-compose.yml` defines: postgres (port 5432), redis (port 6379), kafka (port 9092), zookeeper (port 2181)
- [ ] `docker-compose up -d` starts all services successfully
- [ ] `.env.example` documents all environment variables: `DATABASE_URL`, `REDIS_URL`, `KAFKA_BROKERS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `NOSTR_RELAY_URLS`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATACITE_API_KEY`
- [ ] `README.md` at root documents local setup steps

**Files Created/Modified**:
- `docker-compose.yml`
- `.env.example`
- `README.md`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Node.js ≥ 20 | External | ✅ Available | Runtime requirement |
| pnpm ≥ 9 | External | ✅ Available | Package manager |
| Turborepo | External | ✅ Available | Monorepo build system |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-002 Identity | Package shell | Blocks all domain implementation |
| COMP-003 through COMP-040 | Package shells | Blocks all implementation |

---

## Technical Details

### File Structure

```
/ (root)
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
├── vitest.workspace.ts
├── docker-compose.yml
├── .env.example
├── README.md
│
├── apps/
│   ├── learn/          (Next.js 14 App Router)
│   ├── hub/            (Next.js 14 App Router)
│   ├── labs/           (Next.js 14 App Router)
│   ├── admin/          (Next.js 14 App Router)
│   └── institutional-site/ (Next.js 14 SSG/ISR)
│
└── packages/
    ├── types/          src/ids.ts, common.ts, index.ts
    ├── events/         src/envelope.ts, topics.ts, index.ts
    ├── ui/             src/theme.ts, index.ts
    ├── platform-core/  src/{domain,application,infrastructure,api}/
    ├── dip/            src/{domain,application,infrastructure,api}/
    ├── ai-agents/      src/{domain,application,infrastructure,api}/
    ├── learn/          src/{domain,application,infrastructure,api}/
    ├── hub/            src/{domain,application,infrastructure,api}/
    ├── labs/           src/{domain,application,infrastructure,api}/
    ├── sponsorship/    src/{domain,application,infrastructure,api}/
    ├── communication/  src/{domain,application,infrastructure,api}/
    ├── planning/       src/{domain,application,infrastructure,api}/
    ├── ide/            src/{domain,application,infrastructure,api}/
    ├── governance-moderation/ src/{domain,application,infrastructure,api}/
    └── identity/       src/{domain,application,infrastructure,api}/
```

### Key Classes/Functions

| Name | Type | Purpose |
|------|------|---------|
| `UserId` | Branded type | `string & { readonly _brand: 'UserId' }` |
| `ArtifactId` | Branded type | Stable DIP artifact identifier |
| `EcosystemEvent<T>` | Generic type | Base envelope for all event bus messages |
| `EventTopics` | Constants | Kafka topic names per domain |

---

## Implementation Log

### 2026-03-13 - Component Created

- Created initial implementation record
- Extracted 5 work items from ADR-001 and root ARCHITECTURE.md
- No external dependencies; this is the foundation for all other components

---

## References

### Architecture Documents

- [Modular Monolith Layer Structure](../../architecture/ARCHITECTURE.md#modular-monolith-layer-structure)
- [Technology Radar](../../architecture/ARCHITECTURE.md#technology-radar)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-001](../../architecture/decisions/ADR-001-modular-monolith.md) | Modular Monolith with Turborepo | Primary architecture decision |
| [ADR-002](../../architecture/decisions/ADR-002-event-bus-technology.md) | Event Bus Technology | Kafka in Docker Compose |
| [ADR-004](../../architecture/decisions/ADR-004-database-strategy.md) | Database Strategy | PostgreSQL in Docker Compose |

### Related Components

| Component | Relationship |
|-----------|--------------|
| All COMP-002 to COMP-040 | Depend on this package structure |
