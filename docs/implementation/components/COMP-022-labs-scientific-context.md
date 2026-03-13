# Labs — Scientific Context Extension Implementation Record

> **Component ID**: COMP-022
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/labs/subdomains/scientific-context-extension.md](../../architecture/domains/labs/subdomains/scientific-context-extension.md)
> **Stage Assignment**: S9 — Labs Domain
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Scientific Context Extension provides the foundational research metadata layer for the Labs pillar. It owns `ResearchMethodology` definitions, `HypothesisRecord` tracking, and the `SubjectArea` taxonomy that classifies all scientific content. Includes **Labs package setup**. All Labs entities reference these context structures.

**Responsibilities**:
- Manage `SubjectArea` taxonomy (hierarchical classification tree)
- Manage `ResearchMethodology` definitions (experimental, observational, simulation, meta-analysis, etc.)
- Track `HypothesisRecord` per project — structured hypothesis with testability criteria
- Provide context data consumed by Article Editor, Experiment Design, and AI agents

**Key Interfaces**:
- Internal API: taxonomy lookup, methodology catalog, hypothesis tracking

### Implementation Scope

**In Scope**:
- Labs package setup
- `SubjectArea` entity (hierarchical taxonomy)
- `ResearchMethodology` entity
- `HypothesisRecord` entity with testability validation
- Repository + API

**Out of Scope**:
- Article authoring (COMP-023)
- Experiment design (COMP-024)
- Peer review (COMP-025)

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

#### [COMP-022.1] Labs package setup

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | labs/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Set up `packages/labs` workspace package with 4-layer structure and Labs-specific branded IDs.

**Acceptance Criteria**:
- [ ] `packages/labs` fully scaffolded
- [ ] Labs branded IDs added to `packages/types`: `ArticleId`, `ExperimentId`, `ReviewId`
- [ ] `LabsDomainError` exception class defined

**Files Created/Modified**:
- `packages/labs/src/domain/index.ts`
- `packages/types/src/ids.ts` (updated)

---

#### [COMP-022.2] SubjectArea taxonomy

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | scientific-context-extension.md |
| **Dependencies** | COMP-022.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `SubjectArea` entity with hierarchical taxonomy and initial seed data.

**Acceptance Criteria**:
- [ ] `SubjectArea` entity: `id`, `name`, `parent_id (nullable)`, `level (1-4)`, `scope_note`, `is_active`
- [ ] Supports 3-level hierarchy: Field → Discipline → Specialty (e.g., Natural Sciences → Biology → Molecular Biology)
- [ ] Seed data: 50+ initial subject areas based on international classifications
- [ ] `SubjectAreaTaxonomyService.getTree()` returns hierarchical structure
- [ ] `SubjectAreaTaxonomyService.findByName(query)` text search

**Files Created/Modified**:
- `packages/labs/src/domain/scientific-context/subject-area.ts`
- `packages/labs/src/infrastructure/migrations/001_scientific_context.sql`
- `packages/labs/src/infrastructure/seeds/subject-areas.ts`

---

#### [COMP-022.3] ResearchMethodology entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | scientific-context-extension.md |
| **Dependencies** | COMP-022.1 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement `ResearchMethodology` entity with catalog and seed data.

**Acceptance Criteria**:
- [ ] `ResearchMethodology` entity: `id`, `name`, `description`, `methodology_type (experimental|observational|simulation|meta_analysis|case_study|mixed_methods)`, `required_fields (JSONB)`
- [ ] Seed: one entry per `methodology_type`
- [ ] Used by Experiment Design (COMP-024) for methodology-specific field templates

**Files Created/Modified**:
- `packages/labs/src/domain/scientific-context/research-methodology.ts`
- `packages/labs/src/infrastructure/seeds/methodologies.ts`

---

#### [COMP-022.4] HypothesisRecord entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | scientific-context-extension.md |
| **Dependencies** | COMP-022.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `HypothesisRecord` entity capturing structured hypothesis with testability criteria.

**Acceptance Criteria**:
- [ ] `HypothesisRecord` entity: `id`, `project_id`, `statement`, `variables (independent[], dependent[], control[])`, `testability_criteria`, `falsifiability_note`, `status (draft|registered|tested|confirmed|refuted)`, `created_by`
- [ ] `HypothesisRecord.register()` transitions Draft → Registered (pre-registration lock)
- [ ] Once Registered: `statement`, `variables`, `testability_criteria` become immutable
- [ ] Unit tests: immutability after registration

**Files Created/Modified**:
- `packages/labs/src/domain/scientific-context/hypothesis-record.ts`
- `packages/labs/tests/unit/scientific-context/hypothesis-record.test.ts`

---

#### [COMP-022.5] Repository and internal API

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | scientific-context-extension.md |
| **Dependencies** | COMP-022.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and API for scientific context data.

**Acceptance Criteria**:
- [ ] `SubjectAreaRepository`, `MethodologyRepository`, `HypothesisRepository` interfaces and PostgreSQL implementations
- [ ] `GET /internal/labs/subject-areas` → taxonomy tree
- [ ] `GET /internal/labs/methodologies` → methodology catalog
- [ ] `POST /internal/labs/hypotheses` → create hypothesis record
- [ ] `POST /internal/labs/hypotheses/{id}/register` → pre-registers hypothesis

**Files Created/Modified**:
- `packages/labs/src/infrastructure/repositories/`
- `packages/labs/src/api/routes/scientific-context.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | Labs package shell |
| COMP-002 Identity | Internal | ⬜ Not Started | Researcher attribution |
| COMP-003 DIP Artifact Registry | Internal | ⬜ Not Started | Article publication via DIP |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-023 Labs Article Editor | Article requires subject areas | Blocks article creation |
| COMP-024 Labs Experiment Design | Experiment requires methodology | Blocks experiment creation |

---

## References

### Architecture Documents

- [Labs Scientific Context Extension Subdomain](../../architecture/domains/labs/subdomains/scientific-context-extension.md)
- [Labs Domain Architecture](../../architecture/domains/labs/ARCHITECTURE.md)
