# Package-to-Component (COMP) Traceability Mapping

This table maps workspace packages to their primary architecture component(s). Use it when adding `Architecture: COMP-XXX` traceability comments to source files.

| Package | Primary COMP | Component record |
|---------|--------------|------------------|
| `packages/communication` | COMP-028 | [COMP-028-communication](components/COMP-028-communication.md) |
| `packages/learn` | COMP-015, COMP-016, COMP-017, COMP-018 | Learn content, fragment engine, creator tools, mentorship |
| `packages/ide` | COMP-030 | [COMP-030-ide-domain](components/COMP-030-ide-domain.md) |
| `packages/platform-core` | COMP-009, COMP-010, COMP-011, COMP-038, COMP-039, COMP-040 | Event bus, portfolio, search, observability, data integrity, resilience |
| `packages/identity` | COMP-002 | [COMP-002-identity](components/COMP-002-identity.md) |
| `packages/governance-moderation` | COMP-031 | [COMP-031-governance-moderation](components/COMP-031-governance-moderation.md) |
| `packages/ai-agents` | COMP-012, COMP-013, COMP-014 | Registry, orchestration, pillar |
| `packages/hub-package` | COMP-019, COMP-020, COMP-021 | Hub collaboration, institution orchestration, public square |
| `packages/labs-package` | COMP-022–COMP-026 | Labs scientific context, article editor, experiment design, peer review, DOI |
| `packages/planning` | COMP-029 | [COMP-029-planning](components/COMP-029-planning.md) |
| `packages/sponsorship` | COMP-027 | [COMP-027-sponsorship](components/COMP-027-sponsorship.md) |
| `packages/dip-governance` | COMP-007 | [COMP-007-dip-institutional-governance](components/COMP-007-dip-institutional-governance.md) |
| `packages/dip-iacp` | COMP-005 | [COMP-005-dip-iacp-engine](components/COMP-005-dip-iacp-engine.md) |
| `packages/dip` (DIP contracts, artifacts, projects, IACP) | COMP-003, COMP-004, COMP-006, COMP-008 | Artifact registry, contract engine, project manifest DAG, treasury |
| `packages/event-bus` | COMP-009 | [COMP-009-event-bus-audit](components/COMP-009-event-bus-audit.md) |
| `packages/ui` | COMP-001, COMP-032 | Monorepo infra, web app |
| `apps/api` | COMP-033 | [COMP-033-rest-api](components/COMP-033-rest-api.md) |
| `apps/platform` | COMP-032 | [COMP-032-web-application](components/COMP-032-web-application.md) — Single web application (institutional home + Learn, Hub, Labs, dashboard, admin). Not a separate "Platform" pillar (ADR-012). |
| `apps/workers` | COMP-034 | [COMP-034-background-services](components/COMP-034-background-services.md) |

**Usage**: When adding traceability to a file under `packages/<name>/src` or `apps/<name>/src`, add a line `Architecture: COMP-XXX` (or `COMP-XXX, …`) in the file’s top docblock, using the primary COMP for that package. A single package may map to multiple COMPs; use the most specific one for the file (e.g. COMP-028.6 for communication notification repository).
