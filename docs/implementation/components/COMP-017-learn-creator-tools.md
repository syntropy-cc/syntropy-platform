# Learn — Creator Tools & AI Copilot Implementation Record

> **Component ID**: COMP-017
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/learn/subdomains/creator-tools-copilot.md](../../architecture/domains/learn/subdomains/creator-tools-copilot.md)
> **Stage Assignment**: S29 — Learn Creator Tools
> **Status**: ✅ Complete
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14

## Component Overview

### Architecture Summary

Creator Tools & AI Copilot is a Supporting subdomain within Learn. It manages the `CreatorWorkflow` — a 5-phase process (ProjectScoping → CurriculumArchitecture → FragmentDrafting → PedagogicalValidation → Iteration) that guides creators in building a Track with AI assistance. Critical invariant: no phase advances without an explicit `ApprovalRecord` from the creator. `AIGeneratedDraft` entities are always marked `ai_generated: true` and cannot be published without creator approval.

**Responsibilities**:
- Manage `CreatorWorkflow` aggregate lifecycle across 5 phases
- Enforce explicit creator approval before any phase advances
- Coordinate with AI Agents (COMP-012/014) to activate relevant agents per phase
- Store `AIGeneratedDraft` and `ApprovalRecord` entities

**Key Interfaces**:
- Internal API: workflow state management, draft approval

### Implementation Scope

**In Scope**:
- `CreatorWorkflow` aggregate, `AIGeneratedDraft`, `ApprovalRecord` entities
- Phase transition enforcement
- Integration with AI Agents for agent activation per phase
- Internal API for creator workflow management

**Out of Scope**:
- AI agent logic (COMP-012, COMP-014)
- Fragment publication (COMP-016)
- Content hierarchy creation (COMP-015)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 6 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 0 |
| **Total** | **6** |

**Component Coverage**: 100%

### Item List

#### [COMP-017.1] CreatorWorkflow aggregate

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | creator-tools-copilot.md, IMPLEMENTATION-PLAN Section 7 |
| **Dependencies** | COMP-016, COMP-012 |
| **Size** | M |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-14 |

**Description**: Implement `CreatorWorkflow` aggregate managing the 5-phase creation process. Phase names per Implementation Plan: `ideation`, `drafting`, `review`, `refinement`, `publication`.

**Acceptance Criteria**:
- [x] `CreatorWorkflow` aggregate: `id`, `trackId`, `creatorId`, `currentPhase`, `phasesCompleted[]`, `startedAt`, `completedAt`
- [x] Phases: `ideation` → `drafting` → `review` → `refinement` → `publication` (sequential only)
- [x] `CreatorWorkflow.transition(nextPhase)` enforces immediate next phase; throws `InvalidPhaseTransitionError` otherwise
- [x] Domain event `CreatorWorkflowPhaseEntered` returned from `transition()` for application layer to publish
- [x] Unit tests: create, transition in order, reject same phase, skip phase, backwards transition

**Files Created/Modified**:
- `packages/learn/src/domain/creator-tools/creator-workflow-phase.ts` (phase enum and ordering)
- `packages/learn/src/domain/creator-tools/creator-workflow.ts`
- `packages/learn/src/domain/creator-tools/events.ts` (CreatorWorkflowPhaseEntered)
- `packages/learn/src/domain/creator-tools/index.ts`
- `packages/learn/src/domain/errors.ts` (InvalidPhaseTransitionError)
- `packages/learn/src/domain/index.ts` (exports)
- `packages/learn/tests/unit/creator-tools/creator-workflow.test.ts`
- `packages/types/src/ids.ts`, `packages/types/src/index.ts` (CreatorWorkflowId)

---

#### [COMP-017.2] AIGeneratedDraft (done in prior session)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Completed** | 2026-03-14 |

---

#### [COMP-017.3] ApprovalRecord and review workflow

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Completed** | 2026-03-14 |

**Description**: ApprovalRecord entity; ApprovalService (approve/reject) with ReviewerApprovalPort; role check via port; unit tests.

**Files Created/Modified**:
- `packages/types`: ApprovalRecordId
- `packages/learn`: approval-record.ts, approval-ports.ts, approval-service.ts, approval-record.test.ts, approval-service.test.ts

---

#### [COMP-017.4] CreatorRepository (Postgres)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Completed** | 2026-03-14 |

**Description**: Migration learn.creator_workflows, learn.approval_records; PostgresCreatorWorkflowRepository (findById, save); PostgresApprovalRecordRepository (save); CreatorWorkflow.fromStorage; integration test.

**Files Created/Modified**:
- `supabase/migrations/20260317000000_learn_creator_tools.sql`
- `packages/learn`: postgres-creator-workflow-repository.ts, postgres-approval-record-repository.ts
- `packages/learn/tests/integration/creator-tools-repositories.integration.test.ts`

---

#### [COMP-017.5] Creator Tools REST API

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Completed** | 2026-03-14 |

**Description**: POST/GET /api/v1/learn/creator/workflows, generate-draft, approve, reject; LearnContext extended with optional creator services; routes in learn.ts.

**Files Created/Modified**:
- `apps/api`: types/learn-context.ts, routes/learn.ts
- `packages/learn`: index.ts (exports ApprovalService, CreatorCopilotService, CreatorWorkflow, ports)

---

#### [COMP-017.6] Creator Tools integration tests

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Completed** | 2026-03-14 |

**Description**: Full workflow E2E: create → generate draft (stub AI) → approve → assert phase transitions; multi-phase approve sequence test.

**Files Created/Modified**:
- `packages/learn/tests/integration/creator-workflow-e2e.integration.test.ts`

---

## Implementation Log

### 2026-03-14 — COMP-017.3 through COMP-017.6 complete (S29)

- **COMP-017.3**: ApprovalRecord entity (id, workflowId, phase, reviewerId, decision, notes, decidedAt). ApprovalService with approve/reject; ports: CreatorWorkflowLoaderPort, CreatorWorkflowSavePort, ApprovalRecordRepositoryPort, ReviewerApprovalPort. Approve transitions workflow to next phase; reject records only. NotReviewerError when canApprove returns false. ApprovalRecordId in @syntropy/types. Unit tests for ApprovalRecord and ApprovalService.
- **COMP-017.4**: Migration 20260317000000_learn_creator_tools.sql (creator_workflows, approval_records). PostgresCreatorWorkflowRepository (findById, save), PostgresApprovalRecordRepository (save). CreatorWorkflow.fromStorage() for hydration. Integration test with Testcontainers (creator-tools-repositories.integration.test.ts).
- **COMP-017.5**: LearnContext extended with optional creatorWorkflowLoader, creatorWorkflowSave, approvalService, creatorCopilotService. Creator routes in learn.ts when all four present: POST/GET /api/v1/learn/creator/workflows, generate-draft, approve, reject. Learn package exports ApprovalService, CreatorCopilotService, CreatorWorkflow, approval ports.
- **COMP-017.6**: creator-workflow-e2e.integration.test.ts: full flow create → generate draft (StubLearnCopilotAdapter) → approve → assert phase; multi-phase approve sequence (ideation → publication). Skipped unless LEARN_INTEGRATION=true.

### 2026-03-14 — COMP-017.2 complete (per IMPLEMENTATION-PLAN Section 7)

- Implemented `AIGeneratedDraft` value object (domain): immutable, `workflowId`, `phase`, `content`, `agentSessionId`, `createdAt`, `ai_generated: true` always.
- Added `LearnCopilotAgentPort` (application) and `CreatorCopilotService.generateDraft(workflow, prompt)` that calls the port and returns an `AIGeneratedDraft` linked to the workflow.
- Added `StubLearnCopilotAdapter` (infrastructure) implementing the port for tests and placeholder use.
- Unit tests: `ai-generated-draft.test.ts` (create, immutability, ai_generated always true, validation); `creator-copilot-service.test.ts` (generateDraft calls port, returns linked draft).

### 2026-03-14 — COMP-017.1 complete

- Added `CreatorWorkflowId` to `@syntropy/types`.
- Implemented `CreatorWorkflow` aggregate with 5 phases (ideation → drafting → review → refinement → publication), `transition(nextPhase)` with strict ordering, and `CreatorWorkflowPhaseEntered` domain event returned from transition for application-layer publishing.
- Phase ordering in `creator-workflow-phase.ts`; `InvalidPhaseTransitionError` in domain errors. Unit tests cover create, full transition chain, same-phase rejection, skip-phase rejection, and backwards rejection.

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-016 Learn Fragment Engine | Internal | ⬜ Not Started | Fragments created during workflow |
| COMP-015 Learn Content Hierarchy | Internal | ⬜ Not Started | Tracks and courses managed |
| COMP-012 AI Agents Orchestration | Internal | ⬜ Not Started | Agent sessions per phase |
| COMP-014 AI Agents Pillar | Internal | ⬜ Not Started | 5 Learn agent definitions |

---

## References

### Architecture Documents

- [Learn Creator Tools & AI Copilot Subdomain](../../architecture/domains/learn/subdomains/creator-tools-copilot.md)
