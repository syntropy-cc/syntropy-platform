# Implementation Backlog

> **Project**: Syntropy Platform
> **Last Updated**: 2026-03-13
> **Total Items**: 270 | **Done**: 0 | **In Progress**: 0 | **Ready**: 270 | **Backlog**: 0

## Overview

This document contains ALL identified work items for the Syntropy Platform. Items are organized by architectural component and prioritized for implementation. Each component links to its detailed implementation record.

For items currently being worked on, see [CURRENT-WORK.md](./CURRENT-WORK.md).

---

## Quick Stats

| Status | Count | Percentage |
|--------|-------|------------|
| Done | 0 | 0% |
| Review | 0 | 0% |
| In Progress | 0 | 0% |
| Ready | 270 | 100% |
| Backlog | 0 | 0% |
| **Total** | **270** | **100%** |

---

## Backlog by Component

Items are grouped by architectural component. Each component links to its detailed implementation record.

---

### COMP-001 — Monorepo Infrastructure

**Implementation Record**: [COMP-001-monorepo-infrastructure.md](./components/COMP-001-monorepo-infrastructure.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-001.1 | Initialize Turborepo monorepo | ⬜ Ready | Critical | S | — |
| COMP-001.2 | Configure pnpm workspaces and packages | ⬜ Ready | Critical | S | COMP-001.1 |
| COMP-001.3 | Shared TypeScript and tooling config | ⬜ Ready | High | S | COMP-001.2 |
| COMP-001.4 | Set up shared packages (types, events, ui) | ⬜ Ready | High | M | COMP-001.2 |
| COMP-001.5 | Docker Compose for local development | ⬜ Ready | High | S | COMP-001.2 |

---

### COMP-002 — Identity Domain

**Implementation Record**: [COMP-002-identity.md](./components/COMP-002-identity.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-002.1 | Identity domain entities and value objects | ⬜ Ready | Critical | S | COMP-001 |
| COMP-002.2 | Supabase Auth ACL (adapter) | ⬜ Ready | Critical | S | COMP-002.1 |
| COMP-002.3 | RBAC: roles, permissions matrix | ⬜ Ready | Critical | M | COMP-002.2 |
| COMP-002.4 | Actor management (User / Institutional) | ⬜ Ready | High | M | COMP-002.3 |
| COMP-002.5 | Session management and token verification | ⬜ Ready | Critical | S | COMP-002.4 |
| COMP-002.6 | Identity API: REST endpoints | ⬜ Ready | High | S | COMP-002.5 |
| COMP-002.7 | Identity event publishing | ⬜ Ready | High | S | COMP-002.6, COMP-009 |

---

### COMP-003 — DIP: Artifact Registry

**Implementation Record**: [COMP-003-dip-artifact-registry.md](./components/COMP-003-dip-artifact-registry.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-003.1 | DIP package setup | ⬜ Ready | Critical | S | COMP-001 |
| COMP-003.2 | Artifact aggregate and value objects | ⬜ Ready | Critical | M | COMP-003.1 |
| COMP-003.3 | IdentityRecord (Nostr-anchored immutability) | ⬜ Ready | Critical | M | COMP-003.2, COMP-039 |
| COMP-003.4 | Artifact lifecycle state machine | ⬜ Ready | High | M | COMP-003.3 |
| COMP-003.5 | ArtifactRepository implementation | ⬜ Ready | High | S | COMP-003.4 |
| COMP-003.6 | Artifact publication event publishing | ⬜ Ready | High | S | COMP-003.5, COMP-009 |
| COMP-003.7 | Artifact API: REST endpoints | ⬜ Ready | High | S | COMP-003.6 |
| COMP-003.8 | Artifact registry tests | ⬜ Ready | High | M | COMP-003.7 |

---

### COMP-004 — DIP: Smart Contract Engine

**Implementation Record**: [COMP-004-dip-smart-contract-engine.md](./components/COMP-004-dip-smart-contract-engine.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-004.1 | GovernanceContract aggregate | ⬜ Ready | Critical | M | COMP-003.1 |
| COMP-004.2 | Deterministic ContractEvaluator | ⬜ Ready | Critical | M | COMP-004.1 |
| COMP-004.3 | ContractVersionManager | ⬜ Ready | High | S | COMP-004.2 |
| COMP-004.4 | Smart Contract API endpoints | ⬜ Ready | High | S | COMP-004.3 |
| COMP-004.5 | Contract template library | ⬜ Ready | High | S | COMP-004.4 |
| COMP-004.6 | Smart Contract tests | ⬜ Ready | High | M | COMP-004.5 |

---

### COMP-005 — DIP: IACP Engine

**Implementation Record**: [COMP-005-dip-iacp-engine.md](./components/COMP-005-dip-iacp-engine.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-005.1 | UsageAgreement aggregate | ⬜ Ready | Critical | M | COMP-003.1 |
| COMP-005.2 | IACP 4-phase state machine | ⬜ Ready | Critical | M | COMP-005.1 |
| COMP-005.3 | Co-signing workflow | ⬜ Ready | Critical | S | COMP-005.2 |
| COMP-005.4 | Nostr anchoring for agreements | ⬜ Ready | High | S | COMP-005.3, COMP-039 |
| COMP-005.5 | IACP API endpoints | ⬜ Ready | High | S | COMP-005.4 |
| COMP-005.6 | Smart Contract integration | ⬜ Ready | High | S | COMP-005.5, COMP-004 |
| COMP-005.7 | UsageRegistered event publishing | ⬜ Ready | High | S | COMP-005.6, COMP-009 |
| COMP-005.8 | IACP tests | ⬜ Ready | High | M | COMP-005.7 |

---

### COMP-006 — DIP: Project Manifest DAG

**Implementation Record**: [COMP-006-dip-project-manifest-dag.md](./components/COMP-006-dip-project-manifest-dag.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-006.1 | DigitalProject aggregate and DAG | ⬜ Ready | Critical | M | COMP-003.1 |
| COMP-006.2 | DAGAcyclicityEnforcer | ⬜ Ready | Critical | S | COMP-006.1 |
| COMP-006.3 | ArtifactManifesto builder | ⬜ Ready | High | S | COMP-006.2 |
| COMP-006.4 | Project API endpoints | ⬜ Ready | High | S | COMP-006.3 |
| COMP-006.5 | DAG traversal for dependency graph | ⬜ Ready | High | M | COMP-006.4 |
| COMP-006.6 | Project DAG tests | ⬜ Ready | High | M | COMP-006.5 |

---

### COMP-007 — DIP: Institutional Governance

**Implementation Record**: [COMP-007-dip-institutional-governance.md](./components/COMP-007-dip-institutional-governance.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-007.1 | DigitalInstitution aggregate | ⬜ Ready | Critical | M | COMP-003.1, COMP-002 |
| COMP-007.2 | Chamber composition and membership | ⬜ Ready | High | M | COMP-007.1 |
| COMP-007.3 | Proposal lifecycle state machine | ⬜ Ready | Critical | M | COMP-007.2, COMP-004 |
| COMP-007.4 | LegitimacyChain (append-only, Nostr-anchored) | ⬜ Ready | Critical | M | COMP-007.3, COMP-039 |
| COMP-007.5 | Quorum calculator | ⬜ Ready | High | S | COMP-007.4 |
| COMP-007.6 | Governance event publishing | ⬜ Ready | High | S | COMP-007.5, COMP-009 |
| COMP-007.7 | Governance API endpoints | ⬜ Ready | High | S | COMP-007.6 |
| COMP-007.8 | Smart Contract execution on proposal approval | ⬜ Ready | High | S | COMP-007.7 |
| COMP-007.9 | Governance tests | ⬜ Ready | High | M | COMP-007.8 |

---

### COMP-008 — DIP: Value Distribution & Treasury

**Implementation Record**: [COMP-008-dip-value-distribution-treasury.md](./components/COMP-008-dip-value-distribution-treasury.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-008.1 | Treasury aggregate | ⬜ Ready | Critical | M | COMP-003.1 |
| COMP-008.2 | AVU accounting and ledger | ⬜ Ready | Critical | M | COMP-008.1 |
| COMP-008.3 | AVUComputationService | ⬜ Ready | Critical | M | COMP-008.2, COMP-006 |
| COMP-008.4 | DistributionService over DAG | ⬜ Ready | High | M | COMP-008.3 |
| COMP-008.5 | LiquidationService (oracle integration) | ⬜ Ready | High | M | COMP-008.4 |
| COMP-008.6 | Treasury API endpoints | ⬜ Ready | High | S | COMP-008.5 |
| COMP-008.7 | AVU distribution event publishing | ⬜ Ready | High | S | COMP-008.6, COMP-009 |
| COMP-008.8 | Treasury and AVU tests | ⬜ Ready | High | M | COMP-008.7 |

---

### COMP-009 — Event Bus & Audit (Platform Core)

**Implementation Record**: [COMP-009-event-bus-audit.md](./components/COMP-009-event-bus-audit.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-009.1 | Platform Core package setup | ⬜ Ready | Critical | S | COMP-001 |
| COMP-009.2 | EventSchema Registry (ADR-010) | ⬜ Ready | Critical | M | COMP-009.1 |
| COMP-009.3 | Kafka producer and consumer infrastructure | ⬜ Ready | Critical | M | COMP-009.2 |
| COMP-009.4 | AppendOnlyLog with hash-chain integrity | ⬜ Ready | Critical | M | COMP-009.3 |
| COMP-009.5 | Schema validation middleware | ⬜ Ready | High | S | COMP-009.4 |
| COMP-009.6 | Event signing and causal chain tracing | ⬜ Ready | High | M | COMP-009.5 |
| COMP-009.7 | Event bus API (schema registry REST) | ⬜ Ready | High | S | COMP-009.6 |
| COMP-009.8 | Event bus integration tests | ⬜ Ready | High | M | COMP-009.7 |

---

### COMP-010 — Portfolio Aggregation (Platform Core)

**Implementation Record**: [COMP-010-portfolio-aggregation.md](./components/COMP-010-portfolio-aggregation.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-010.1 | Portfolio aggregate and read models | ⬜ Ready | High | M | COMP-009 |
| COMP-010.2 | XPEvaluationService | ⬜ Ready | High | M | COMP-010.1 |
| COMP-010.3 | AchievementEvaluationService | ⬜ Ready | High | M | COMP-010.2 |
| COMP-010.4 | SkillDerivationService | ⬜ Ready | Medium | M | COMP-010.3 |
| COMP-010.5 | ReputationComputationService | ⬜ Ready | High | M | COMP-010.4 |
| COMP-010.6 | PortfolioRebuildService (event-sourced) | ⬜ Ready | High | M | COMP-010.5 |
| COMP-010.7 | Portfolio API endpoints | ⬜ Ready | High | S | COMP-010.6 |
| COMP-010.8 | Portfolio tests | ⬜ Ready | High | M | COMP-010.7 |

---

### COMP-011 — Search & Recommendation (Platform Core)

**Implementation Record**: [COMP-011-search-recommendation.md](./components/COMP-011-search-recommendation.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-011.1 | SearchIndex (FTS + semantic, pgvector) | ⬜ Ready | High | M | COMP-009 |
| COMP-011.2 | SearchQueryService | ⬜ Ready | High | M | COMP-011.1 |
| COMP-011.3 | SearchIndexer Kafka consumer | ⬜ Ready | High | S | COMP-011.2 |
| COMP-011.4 | RecommendationEngine (collaborative filtering) | ⬜ Ready | High | M | COMP-011.3 |
| COMP-011.5 | RecommendationSet API | ⬜ Ready | Medium | S | COMP-011.4 |
| COMP-011.6 | Search API endpoints | ⬜ Ready | High | S | COMP-011.5 |
| COMP-011.7 | Search tests | ⬜ Ready | High | M | COMP-011.6 |

---

### COMP-012 — AI Agents: Orchestration

**Implementation Record**: [COMP-012-ai-agents-orchestration.md](./components/COMP-012-ai-agents-orchestration.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-012.1 | AI Agents package setup | ⬜ Ready | High | S | COMP-001 |
| COMP-012.2 | UserContextModel aggregate | ⬜ Ready | High | M | COMP-012.1, COMP-002 |
| COMP-012.3 | AgentSession lifecycle management | ⬜ Ready | High | M | COMP-012.2 |
| COMP-012.4 | AgentMemory (short/long-term) | ⬜ Ready | Medium | M | COMP-012.3 |
| COMP-012.5 | LLMAdapter ACL (Anthropic/OpenAI) | ⬜ Ready | Critical | M | COMP-012.4, COMP-040 |
| COMP-012.6 | InvocationRouter and ContextSnapshotBuilder | ⬜ Ready | High | M | COMP-012.5 |
| COMP-012.7 | AI Agent API (SSE streaming) | ⬜ Ready | High | S | COMP-012.6 |
| COMP-012.8 | Agent orchestration tests | ⬜ Ready | High | M | COMP-012.7 |

---

### COMP-013 — AI Agents: Registry

**Implementation Record**: [COMP-013-ai-agents-registry.md](./components/COMP-013-ai-agents-registry.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-013.1 | AIAgentDefinition and ToolDefinition | ⬜ Ready | High | M | COMP-012.1 |
| COMP-013.2 | Agent registry seeding (12 pillar agents) | ⬜ Ready | High | S | COMP-013.1 |
| COMP-013.3 | ToolPermissionEvaluator | ⬜ Ready | High | S | COMP-013.2, COMP-002 |
| COMP-013.4 | AgentDiscoveryService | ⬜ Ready | Medium | S | COMP-013.3 |
| COMP-013.5 | Registry API endpoints | ⬜ Ready | Medium | S | COMP-013.4 |

---

### COMP-014 — AI Agents: Pillar Tool Handlers

**Implementation Record**: [COMP-014-ai-agents-pillar.md](./components/COMP-014-ai-agents-pillar.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-014.1 | Learn pillar agent tools | ⬜ Ready | High | M | COMP-013, COMP-015 |
| COMP-014.2 | Hub pillar agent tools | ⬜ Ready | High | M | COMP-013, COMP-019 |
| COMP-014.3 | Labs pillar agent tools | ⬜ Ready | High | M | COMP-013, COMP-022 |
| COMP-014.4 | DIP agent tools | ⬜ Ready | High | M | COMP-013, COMP-003 |
| COMP-014.5 | Cross-pillar agent tools (search, portfolio) | ⬜ Ready | Medium | M | COMP-013, COMP-011 |
| COMP-014.6 | Pillar agent integration tests | ⬜ Ready | High | M | COMP-014.5 |

---

### COMP-015 — Learn: Content Hierarchy

**Implementation Record**: [COMP-015-learn-content-hierarchy.md](./components/COMP-015-learn-content-hierarchy.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-015.1 | Learn package setup | ⬜ Ready | High | S | COMP-001 |
| COMP-015.2 | Career and Track aggregates | ⬜ Ready | High | M | COMP-015.1, COMP-006 |
| COMP-015.3 | Course aggregate and navigation | ⬜ Ready | High | M | COMP-015.2 |
| COMP-015.4 | FogOfWarNavigationService | ⬜ Ready | High | M | COMP-015.3 |
| COMP-015.5 | Content hierarchy API endpoints | ⬜ Ready | High | S | COMP-015.4 |
| COMP-015.6 | Content hierarchy tests | ⬜ Ready | High | M | COMP-015.5 |

---

### COMP-016 — Learn: Fragment Engine

**Implementation Record**: [COMP-016-learn-fragment-engine.md](./components/COMP-016-learn-fragment-engine.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-016.1 | Fragment aggregate (IL1: Problem/Theory/Artifact) | ⬜ Ready | Critical | M | COMP-015 |
| COMP-016.2 | IL1 invariant enforcement | ⬜ Ready | Critical | S | COMP-016.1 |
| COMP-016.3 | Fragment → DIP artifact publication bridge | ⬜ Ready | Critical | S | COMP-016.2, COMP-003 |
| COMP-016.4 | LearnerProgressRecord tracking | ⬜ Ready | High | M | COMP-016.3 |
| COMP-016.5 | Fragment editor API | ⬜ Ready | High | S | COMP-016.4 |
| COMP-016.6 | Fragment event publishing | ⬜ Ready | High | S | COMP-016.5, COMP-009 |
| COMP-016.7 | Fragment version history | ⬜ Ready | Medium | S | COMP-016.6 |
| COMP-016.8 | Fragment tests | ⬜ Ready | High | M | COMP-016.7 |

---

### COMP-017 — Learn: Creator Tools

**Implementation Record**: [COMP-017-learn-creator-tools.md](./components/COMP-017-learn-creator-tools.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-017.1 | CreatorWorkflow 5-phase state machine | ⬜ Ready | High | M | COMP-015 |
| COMP-017.2 | AIGeneratedDraft storage | ⬜ Ready | Medium | S | COMP-017.1, COMP-012 |
| COMP-017.3 | ApprovalRecord (explicit phase advancement) | ⬜ Ready | High | S | COMP-017.2 |
| COMP-017.4 | Creator workflow API | ⬜ Ready | High | S | COMP-017.3 |
| COMP-017.5 | Creator analytics read model | ⬜ Ready | Medium | S | COMP-017.4 |
| COMP-017.6 | Creator tools tests | ⬜ Ready | High | M | COMP-017.5 |

---

### COMP-018 — Learn: Mentorship

**Implementation Record**: [COMP-018-learn-mentorship.md](./components/COMP-018-learn-mentorship.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-018.1 | MentorshipRelationship aggregate | ⬜ Ready | High | M | COMP-015 |
| COMP-018.2 | Mentor capacity management | ⬜ Ready | Medium | S | COMP-018.1 |
| COMP-018.3 | MentorReview record | ⬜ Ready | High | S | COMP-018.2 |
| COMP-018.4 | ArtifactGallery read model | ⬜ Ready | Medium | S | COMP-018.3, COMP-016 |
| COMP-018.5 | Mentorship API endpoints | ⬜ Ready | High | S | COMP-018.4 |

---

### COMP-019 — Hub: Collaboration Layer

**Implementation Record**: [COMP-019-hub-collaboration-layer.md](./components/COMP-019-hub-collaboration-layer.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-019.1 | Hub package setup | ⬜ Ready | High | S | COMP-001 |
| COMP-019.2 | Issue aggregate | ⬜ Ready | High | M | COMP-019.1 |
| COMP-019.3 | Contribution aggregate | ⬜ Ready | High | M | COMP-019.2, COMP-003 |
| COMP-019.4 | ContributionSandbox (IDE session integration) | ⬜ Ready | High | M | COMP-019.3, COMP-030 |
| COMP-019.5 | Contribution → DIP artifact publication | ⬜ Ready | High | S | COMP-019.4 |
| COMP-019.6 | Collaboration API endpoints | ⬜ Ready | High | S | COMP-019.5 |
| COMP-019.7 | Collaboration event publishing | ⬜ Ready | High | S | COMP-019.6, COMP-009 |
| COMP-019.8 | Collaboration tests | ⬜ Ready | High | M | COMP-019.7 |

---

### COMP-020 — Hub: Institution Orchestration

**Implementation Record**: [COMP-020-hub-institution-orchestration.md](./components/COMP-020-hub-institution-orchestration.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-020.1 | ContractTemplate catalogue | ⬜ Ready | High | S | COMP-019.1, COMP-004 |
| COMP-020.2 | InstitutionCreationWorkflow | ⬜ Ready | High | M | COMP-020.1, COMP-007 |
| COMP-020.3 | InstitutionProfile read model | ⬜ Ready | High | S | COMP-020.2 |
| COMP-020.4 | Institution orchestration API | ⬜ Ready | High | S | COMP-020.3 |
| COMP-020.5 | MemberInvitation flow | ⬜ Ready | Medium | S | COMP-020.4 |
| COMP-020.6 | Institution orchestration tests | ⬜ Ready | High | M | COMP-020.5 |

---

### COMP-021 — Hub: Public Square

**Implementation Record**: [COMP-021-hub-public-square.md](./components/COMP-021-hub-public-square.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-021.1 | DiscoveryDocument read model | ⬜ Ready | High | M | COMP-019, COMP-007 |
| COMP-021.2 | ProminenceScorer | ⬜ Ready | High | M | COMP-021.1, COMP-010 |
| COMP-021.3 | PublicSquareIndexer Kafka consumer | ⬜ Ready | High | S | COMP-021.2 |
| COMP-021.4 | Public Square API | ⬜ Ready | High | S | COMP-021.3 |
| COMP-021.5 | Public Square tests | ⬜ Ready | High | M | COMP-021.4 |

---

### COMP-022 — Labs: Scientific Context

**Implementation Record**: [COMP-022-labs-scientific-context.md](./components/COMP-022-labs-scientific-context.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-022.1 | Labs package setup | ⬜ Ready | High | S | COMP-001 |
| COMP-022.2 | SubjectArea taxonomy | ⬜ Ready | Medium | S | COMP-022.1 |
| COMP-022.3 | ResearchMethodology definitions | ⬜ Ready | Medium | S | COMP-022.2 |
| COMP-022.4 | HypothesisRecord tracking | ⬜ Ready | Medium | S | COMP-022.3 |
| COMP-022.5 | Scientific context API | ⬜ Ready | Medium | S | COMP-022.4 |

---

### COMP-023 — Labs: Article Editor

**Implementation Record**: [COMP-023-labs-article-editor.md](./components/COMP-023-labs-article-editor.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-023.1 | ScientificArticle aggregate (MyST Markdown) | ⬜ Ready | High | M | COMP-022 |
| COMP-023.2 | ArticleVersion management | ⬜ Ready | High | S | COMP-023.1 |
| COMP-023.3 | MyST Markdown renderer (ADR-008) | ⬜ Ready | High | M | COMP-023.2 |
| COMP-023.4 | EmbeddedArtifactRef (links to DIP artifacts) | ⬜ Ready | High | S | COMP-023.3, COMP-003 |
| COMP-023.5 | Article → DIP artifact publication | ⬜ Ready | High | S | COMP-023.4 |
| COMP-023.6 | Article API endpoints | ⬜ Ready | High | S | COMP-023.5 |
| COMP-023.7 | Article event publishing | ⬜ Ready | High | S | COMP-023.6, COMP-009 |
| COMP-023.8 | Article editor tests | ⬜ Ready | High | M | COMP-023.7 |

---

### COMP-024 — Labs: Experiment Design

**Implementation Record**: [COMP-024-labs-experiment-design.md](./components/COMP-024-labs-experiment-design.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-024.1 | ExperimentDesign aggregate | ⬜ Ready | High | M | COMP-022 |
| COMP-024.2 | ExperimentResult recording | ⬜ Ready | High | S | COMP-024.1 |
| COMP-024.3 | AnonymizationPolicyEnforcer | ⬜ Ready | Critical | M | COMP-024.2 |
| COMP-024.4 | Results → DIP dataset publication | ⬜ Ready | High | S | COMP-024.3, COMP-003 |
| COMP-024.5 | Experiment API endpoints | ⬜ Ready | High | S | COMP-024.4 |
| COMP-024.6 | Experiment tests | ⬜ Ready | High | M | COMP-024.5 |

---

### COMP-025 — Labs: Open Peer Review

**Implementation Record**: [COMP-025-labs-open-peer-review.md](./components/COMP-025-labs-open-peer-review.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-025.1 | Review aggregate and ReviewPassageLink | ⬜ Ready | High | M | COMP-023 |
| COMP-025.2 | AuthorResponse record | ⬜ Ready | High | S | COMP-025.1 |
| COMP-025.3 | ReviewVisibilityEvaluator (reputation-gated) | ⬜ Ready | High | M | COMP-025.2, COMP-010 |
| COMP-025.4 | Transparent review publication | ⬜ Ready | High | S | COMP-025.3 |
| COMP-025.5 | Peer review API endpoints | ⬜ Ready | High | S | COMP-025.4 |
| COMP-025.6 | Review event publishing | ⬜ Ready | High | S | COMP-025.5, COMP-009 |
| COMP-025.7 | Peer review tests | ⬜ Ready | High | M | COMP-025.6 |

---

### COMP-026 — Labs: DOI Publication

**Implementation Record**: [COMP-026-labs-doi-publication.md](./components/COMP-026-labs-doi-publication.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-026.1 | DOIRecord aggregate | ⬜ Ready | High | S | COMP-023 |
| COMP-026.2 | DataCiteAdapter ACL (ADR: DOI) | ⬜ Ready | High | M | COMP-026.1, COMP-040 |
| COMP-026.3 | DOI minting workflow | ⬜ Ready | High | S | COMP-026.2 |
| COMP-026.4 | ExternalIndexingNotifier | ⬜ Ready | Medium | S | COMP-026.3 |
| COMP-026.5 | DOI publication tests | ⬜ Ready | High | M | COMP-026.4 |

---

### COMP-027 — Sponsorship

**Implementation Record**: [COMP-027-sponsorship.md](./components/COMP-027-sponsorship.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-027.1 | Sponsorship aggregate | ⬜ Ready | High | M | COMP-002 |
| COMP-027.2 | StripePaymentAdapter ACL | ⬜ Ready | High | M | COMP-027.1, COMP-040 |
| COMP-027.3 | Subscription management | ⬜ Ready | High | M | COMP-027.2 |
| COMP-027.4 | ImpactMetric tracking | ⬜ Ready | Medium | S | COMP-027.3 |
| COMP-027.5 | AVU credit to DIP treasury | ⬜ Ready | High | S | COMP-027.4, COMP-008 |
| COMP-027.6 | Sponsorship API endpoints | ⬜ Ready | High | S | COMP-027.5 |
| COMP-027.7 | Sponsorship tests | ⬜ Ready | High | M | COMP-027.6 |

---

### COMP-028 — Communication

**Implementation Record**: [COMP-028-communication.md](./components/COMP-028-communication.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-028.1 | Message and Thread aggregates | ⬜ Ready | High | M | COMP-002 |
| COMP-028.2 | Thread anchoring to entities | ⬜ Ready | High | S | COMP-028.1 |
| COMP-028.3 | Notification aggregate | ⬜ Ready | High | M | COMP-028.2 |
| COMP-028.4 | NotificationEventConsumer | ⬜ Ready | High | M | COMP-028.3, COMP-009 |
| COMP-028.5 | User notification preferences | ⬜ Ready | Medium | S | COMP-028.4 |
| COMP-028.6 | Communication API endpoints | ⬜ Ready | High | S | COMP-028.5 |
| COMP-028.7 | Communication tests | ⬜ Ready | High | M | COMP-028.6 |

---

### COMP-029 — Planning

**Implementation Record**: [COMP-029-planning.md](./components/COMP-029-planning.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-029.1 | Task and Goal aggregates | ⬜ Ready | Medium | M | COMP-002 |
| COMP-029.2 | Sprint management | ⬜ Ready | Medium | S | COMP-029.1 |
| COMP-029.3 | StudyPlan personal roadmap | ⬜ Ready | Medium | M | COMP-029.2, COMP-015 |
| COMP-029.4 | MentorSession scheduling | ⬜ Ready | Medium | S | COMP-029.3, COMP-018 |
| COMP-029.5 | Goal achievement integration | ⬜ Ready | Medium | S | COMP-029.4, COMP-010 |
| COMP-029.6 | Planning API endpoints | ⬜ Ready | Medium | S | COMP-029.5 |

---

### COMP-030 — IDE Domain

**Implementation Record**: [COMP-030-ide-domain.md](./components/COMP-030-ide-domain.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-030.1 | IDE domain package setup | ⬜ Ready | High | S | COMP-001 |
| COMP-030.2 | IDESession aggregate | ⬜ Ready | High | M | COMP-030.1, COMP-002 |
| COMP-030.3 | Container resource allocation (ResourceQuotaEnforcer) | ⬜ Ready | High | M | COMP-030.2 |
| COMP-030.4 | Workspace snapshot management | ⬜ Ready | High | M | COMP-030.3 |
| COMP-030.5 | ArtifactPublishBridge (IDE → DIP) | ⬜ Ready | High | S | COMP-030.4, COMP-003 |
| COMP-030.6 | IDE session API endpoints | ⬜ Ready | High | S | COMP-030.5 |
| COMP-030.7 | Session inactivity detection | ⬜ Ready | Medium | S | COMP-030.6 |
| COMP-030.8 | IDE domain tests | ⬜ Ready | High | M | COMP-030.7 |

---

### COMP-031 — Governance & Moderation

**Implementation Record**: [COMP-031-governance-moderation.md](./components/COMP-031-governance-moderation.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-031.1 | ModerationFlag aggregate | ⬜ Ready | High | M | COMP-002, COMP-009 |
| COMP-031.2 | ModerationAction and appeal workflow | ⬜ Ready | High | M | COMP-031.1 |
| COMP-031.3 | PlatformPolicy versioned records | ⬜ Ready | Medium | S | COMP-031.2 |
| COMP-031.4 | CommunityProposal lifecycle | ⬜ Ready | Medium | M | COMP-031.3 |
| COMP-031.5 | Moderation API endpoints | ⬜ Ready | High | S | COMP-031.4 |
| COMP-031.6 | Moderation tests | ⬜ Ready | High | M | COMP-031.5 |

---

### COMP-032 — Web Application Platform Service

**Implementation Record**: [COMP-032-web-application.md](./components/COMP-032-web-application.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-032.1 | Auth Provider setup and protected route middleware | ⬜ Ready | Critical | S | COMP-002, COMP-001 |
| COMP-032.2 | Design system and layout components | ⬜ Ready | High | M | COMP-001 |
| COMP-032.3 | Learn pillar pages | ⬜ Ready | High | M | COMP-032.2, COMP-015 |
| COMP-032.4 | Hub pillar pages | ⬜ Ready | High | M | COMP-032.2, COMP-019 |
| COMP-032.5 | Labs pillar pages | ⬜ Ready | High | M | COMP-032.2, COMP-022 |
| COMP-032.6 | Admin pillar pages | ⬜ Ready | Medium | M | COMP-032.2, COMP-031 |
| COMP-032.7 | API route handlers (thin proxy) | ⬜ Ready | High | S | COMP-033 |
| COMP-032.8 | Error boundaries, loading states, SEO | ⬜ Ready | Medium | S | COMP-032.3 |

---

### COMP-033 — REST API Gateway

**Implementation Record**: [COMP-033-rest-api.md](./components/COMP-033-rest-api.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-033.1 | Server setup and middleware stack | ⬜ Ready | Critical | S | COMP-001 |
| COMP-033.2 | Auth middleware and token verification | ⬜ Ready | Critical | S | COMP-002 |
| COMP-033.3 | Rate limiting middleware | ⬜ Ready | High | S | COMP-033.1 |
| COMP-033.4 | Route registration for all domain packages | ⬜ Ready | Critical | M | All domains |
| COMP-033.5 | API versioning strategy | ⬜ Ready | High | S | COMP-033.4 |
| COMP-033.6 | OpenAPI spec generation | ⬜ Ready | Medium | S | COMP-033.4 |
| COMP-033.7 | Health check endpoints | ⬜ Ready | High | XS | COMP-033.1 |

---

### COMP-034 — Background Services

**Implementation Record**: [COMP-034-background-services.md](./components/COMP-034-background-services.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-034.1 | Background services process setup | ⬜ Ready | Critical | S | COMP-001 |
| COMP-034.2 | Kafka consumer worker bootstrapping | ⬜ Ready | Critical | M | COMP-034.1, COMP-009 |
| COMP-034.3 | DLQ processor | ⬜ Ready | High | S | COMP-034.1 |
| COMP-034.4 | Scheduled job runner (cron) | ⬜ Ready | High | S | COMP-034.1 |
| COMP-034.5 | Prometheus metrics and health endpoints | ⬜ Ready | High | S | COMP-034.1 |
| COMP-034.6 | IDE session inactivity supervisor | ⬜ Ready | High | S | COMP-034.1, COMP-030 |
| COMP-034.7 | Integration tests for all workers | ⬜ Ready | High | M | COMP-034.6 |

---

### COMP-035 — Embedded IDE Platform Service

**Implementation Record**: [COMP-035-embedded-ide-platform.md](./components/COMP-035-embedded-ide-platform.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-035.1 | Monaco Editor React integration | ⬜ Ready | High | M | COMP-032, COMP-030 |
| COMP-035.2 | WebSocket gateway | ⬜ Ready | Critical | M | COMP-030 |
| COMP-035.3 | Kubernetes/Docker container provisioning adapter | ⬜ Ready | Critical | M | COMP-030.2 |
| COMP-035.4 | Session reconnection and state recovery | ⬜ Ready | High | S | COMP-035.2 |
| COMP-035.5 | Container image configuration | ⬜ Ready | High | S | COMP-035.3 |
| COMP-035.6 | Workspace persistence integration | ⬜ Ready | High | S | COMP-035.2, COMP-030.4 |

---

### COMP-036 — Institutional Site

**Implementation Record**: [COMP-036-institutional-site.md](./components/COMP-036-institutional-site.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-036.1 | Next.js ISR routing and data fetching | ⬜ Ready | High | S | COMP-001, COMP-007 |
| COMP-036.2 | Institution page components | ⬜ Ready | High | S | COMP-036.1 |
| COMP-036.3 | SEO and structured data | ⬜ Ready | Medium | S | COMP-036.2 |
| COMP-036.4 | Performance optimization (LCP < 2.5s) | ⬜ Ready | Medium | S | COMP-036.2 |

---

### COMP-037 — Security (Cross-Cutting)

**Implementation Record**: [COMP-037-security.md](./components/COMP-037-security.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-037.1 | RBAC enforcement library | ⬜ Ready | Critical | S | COMP-002 |
| COMP-037.2 | API security headers and CSP | ⬜ Ready | High | S | COMP-033 |
| COMP-037.3 | Data encryption for classified fields (AES-256) | ⬜ Ready | Critical | S | COMP-001 |
| COMP-037.4 | mTLS configuration for internal services | ⬜ Ready | High | S | COMP-033 |
| COMP-037.5 | SAST and dependency scanning in CI | ⬜ Ready | High | S | COMP-001 |
| COMP-037.6 | Secret management configuration | ⬜ Ready | Critical | S | COMP-001 |

---

### COMP-038 — Observability (Cross-Cutting)

**Implementation Record**: [COMP-038-observability.md](./components/COMP-038-observability.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-038.1 | Structured logger library | ⬜ Ready | Critical | S | COMP-001 |
| COMP-038.2 | Correlation ID propagation middleware | ⬜ Ready | Critical | S | COMP-033, COMP-038.1 |
| COMP-038.3 | OpenTelemetry distributed tracing | ⬜ Ready | High | M | COMP-038.1 |
| COMP-038.4 | Prometheus metrics | ⬜ Ready | High | S | COMP-038.1 |
| COMP-038.5 | Grafana dashboards and alerting rules | ⬜ Ready | Medium | M | COMP-038.4 |
| COMP-038.6 | Log aggregation pipeline configuration | ⬜ Ready | Medium | S | COMP-038.1 |

---

### COMP-039 — Data Integrity (Cross-Cutting)

**Implementation Record**: [COMP-039-data-integrity.md](./components/COMP-039-data-integrity.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-039.1 | NostrAnchor utility library | ⬜ Ready | High | M | COMP-001 |
| COMP-039.2 | AppendOnlyLog abstract base | ⬜ Ready | High | S | COMP-009 |
| COMP-039.3 | SoftDeletable pattern | ⬜ Ready | Medium | S | COMP-001 |
| COMP-039.4 | Temporal record audit columns migration | ⬜ Ready | Medium | S | COMP-001 |
| COMP-039.5 | Data retention policy enforcement | ⬜ Ready | High | S | COMP-034, COMP-039.3 |

---

### COMP-040 — Resilience (Cross-Cutting)

**Implementation Record**: [COMP-040-resilience.md](./components/COMP-040-resilience.md)
**Component Status**: ⬜ Not Started | **Coverage**: 0%

| ID | Title | Status | Priority | Size | Dependencies |
|----|-------|--------|----------|------|--------------|
| COMP-040.1 | Circuit breaker library | ⬜ Ready | High | S | COMP-001 |
| COMP-040.2 | Retry policy with exponential backoff | ⬜ Ready | High | S | COMP-040.1 |
| COMP-040.3 | Timeout wrapper | ⬜ Ready | High | XS | COMP-001 |
| COMP-040.4 | ResilientAdapter base class | ⬜ Ready | High | S | COMP-040.1, COMP-040.2, COMP-040.3 |
| COMP-040.5 | Resilience integration tests | ⬜ Ready | High | S | COMP-040.4 |

---

## Dependency Graph

High-level component dependency graph (components only). For work-item-level dependencies, see each component record.

```
Layer 0 — Foundation (no dependencies)
══════════════════════════════════════
COMP-001 (Monorepo)
    │
    ├──▶ Layer 1 — Core Infrastructure
    │    ════════════════════════════
    │    COMP-038.1 Structured Logger
    │    COMP-040.1 Circuit Breaker / COMP-040.3 Timeout
    │    COMP-037.6 Secret Management
    │    COMP-039.1 NostrAnchor
    │    COMP-039.3 SoftDeletable
    │
    ├──▶ Layer 2 — Domain Bootstrap
    │    ════════════════════════
    │    COMP-002 Identity ─────────────────────────▶ COMP-037.1 RBAC Library
    │    COMP-009 Event Bus & Audit (Platform Core)
    │    COMP-040.4 ResilientAdapter
    │    COMP-038.2 Correlation ID
    │
    ├──▶ Layer 3 — DIP Core + Platform Core
    │    ════════════════════════════════════
    │    COMP-003 DIP Artifact Registry ─────▶ COMP-039.1 NostrAnchor
    │    COMP-004 DIP Smart Contract Engine
    │    COMP-010 Portfolio Aggregation ──────▶ COMP-009
    │    COMP-011 Search & Recommendation ───▶ COMP-009
    │
    ├──▶ Layer 4 — DIP Extensions
    │    ══════════════════════════
    │    COMP-005 IACP ────────────▶ COMP-003 + COMP-004
    │    COMP-006 Project DAG ─────▶ COMP-003
    │    COMP-007 Governance ──────▶ COMP-003 + COMP-004 + COMP-009
    │    COMP-008 Value Distribution ▶ COMP-006 + COMP-007
    │
    ├──▶ Layer 5 — AI Agents + Domain Packages
    │    ════════════════════════════════════════
    │    COMP-012 AI Agents Orchestration ──▶ COMP-002 + COMP-040.4
    │    COMP-013 AI Agents Registry ──────▶ COMP-012
    │    COMP-015 Learn Content Hierarchy ─▶ COMP-006
    │    COMP-019 Hub Collaboration ───────▶ COMP-003 + COMP-019.1
    │    COMP-022 Labs Scientific Context ─▶ COMP-001
    │    COMP-027 Sponsorship ─────────────▶ COMP-002 + COMP-040.4
    │    COMP-028 Communication ───────────▶ COMP-002 + COMP-009
    │    COMP-029 Planning ────────────────▶ COMP-002
    │    COMP-030 IDE Domain ──────────────▶ COMP-002 + COMP-003
    │    COMP-031 Governance/Moderation ──▶ COMP-002 + COMP-009
    │
    ├──▶ Layer 6 — Domain Secondaries
    │    ══════════════════════════════
    │    COMP-014 AI Pillar Tools ─────────▶ COMP-013 + COMP-015 + COMP-019
    │    COMP-016 Learn Fragment Engine ──▶ COMP-015 + COMP-003
    │    COMP-017 Learn Creator Tools ────▶ COMP-015 + COMP-012
    │    COMP-018 Learn Mentorship ───────▶ COMP-015
    │    COMP-020 Hub Institution Orch. ──▶ COMP-019 + COMP-007
    │    COMP-021 Hub Public Square ──────▶ COMP-019 + COMP-007
    │    COMP-023 Labs Article Editor ────▶ COMP-022 + COMP-003
    │    COMP-024 Labs Experiment Design ─▶ COMP-022 + COMP-003
    │    COMP-025 Labs Peer Review ───────▶ COMP-023 + COMP-010
    │    COMP-026 Labs DOI Publication ──▶ COMP-023 + COMP-040.4
    │
    └──▶ Layer 7 — Platform Services + Cross-Cutting
         ══════════════════════════════════════════════
         COMP-033 REST API Gateway ────────▶ COMP-002 + All domains
         COMP-034 Background Services ─────▶ COMP-001 + COMP-009
         COMP-035 Embedded IDE Platform ───▶ COMP-030 + COMP-032
         COMP-036 Institutional Site ──────▶ COMP-001 + COMP-007
         COMP-037 Security ────────────────▶ COMP-002 + COMP-033
         COMP-038 Observability ───────────▶ COMP-001 + COMP-033
         COMP-039 Data Integrity ──────────▶ COMP-009 + COMP-034
         COMP-040 Resilience ──────────────▶ COMP-001 → All adapters
         COMP-032 Web Application ─────────▶ COMP-033 + All domains
```

---

## Priority Matrix

| Priority | Criteria | Key Items |
|----------|----------|-----------|
| **Critical** | Blocks all other work; core platform function | COMP-001.1, COMP-002.1-2.5, COMP-009.1-3, COMP-033.1-2, COMP-037.1, COMP-037.3, COMP-037.6, COMP-038.1-2 |
| **High** | Required for core features; most domain logic | All domain entity/aggregate items (COMP-003 to COMP-031), COMP-040.1-4 |
| **Medium** | Important but not blocking; UX and secondary features | Creator analytics, public square scoring, planning features, Grafana dashboards |
| **Low** | Nice-to-have; can defer | SEO optimizations, performance tuning, log aggregation config |

---

## Implementation Stages

Work items are grouped into implementation stages as defined in [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md).

| Stage | Scope | Components | Items |
|-------|-------|------------|-------|
| S01 | Monorepo Setup | COMP-001 | 5 |
| S02 | Identity + Auth | COMP-002 + COMP-037.6 + COMP-038.1 | 9 |
| S03 | Event Bus Foundation | COMP-009 + COMP-039.2 + COMP-040.1-3 | 13 |
| S04 | DIP Core | COMP-003 + COMP-004 | 14 |
| S05 | DIP Extensions | COMP-005 + COMP-006 + COMP-007 | 23 |
| S06 | DIP Value Distribution | COMP-008 + COMP-039.1 | 9 |
| S07 | Platform Core (Portfolio + Search) | COMP-010 + COMP-011 | 15 |
| S08 | AI Agents | COMP-012 + COMP-013 + COMP-040.4 | 14 |
| S09 | Learn Pillar | COMP-015 + COMP-016 + COMP-017 + COMP-018 | 25 |
| S10 | Hub Pillar | COMP-019 + COMP-020 + COMP-021 | 19 |
| S11 | Labs Pillar | COMP-022 + COMP-023 + COMP-024 + COMP-025 + COMP-026 | 29 |
| S12 | Supporting Domains | COMP-027 + COMP-028 + COMP-029 + COMP-030 + COMP-031 | 31 |
| S13 | AI Pillar Tools | COMP-014 | 6 |
| S14 | Platform Services | COMP-032 + COMP-033 + COMP-034 + COMP-035 + COMP-036 | 32 |
| S15 | Cross-Cutting | COMP-037 + COMP-038 + COMP-039 + COMP-040 | 22 |
| **Total** | | **40 components** | **~270** |

---

## Items Ready to Start (No Blockers)

Items that can be started immediately (Layer 0 and Layer 1 — no unmet dependencies):

- `COMP-001.1` Initialize Turborepo monorepo — **Critical**
- `COMP-037.6` Secret management configuration (after COMP-001)
- `COMP-038.1` Structured logger library (after COMP-001)
- `COMP-040.1` Circuit breaker library (after COMP-001)
- `COMP-040.3` Timeout wrapper (after COMP-001)
- `COMP-039.1` NostrAnchor utility (after COMP-001)
- `COMP-039.3` SoftDeletable pattern (after COMP-001)

---

## Maintenance Notes

### Adding New Items

1. Determine the parent component
2. Assign next available ID (COMP-XXX.N)
3. Fill in all required fields in the component record
4. Add summary row to the appropriate component table above
5. Update total counts at top of this document
6. Review dependency graph for any required updates

### Updating Status

When changing status:
1. Update the Status field in the table above
2. Update the detailed entry in the component record (with `Started`/`Completed` date)
3. Update acceptance criteria checkboxes in the component record
4. Update component record coverage percentage
5. Update counts at top of this document

### Completed Items

Completed items remain in this document for historical reference marked with ✅. Periodically, very old completed items may be moved to an archive file.
