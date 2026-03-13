# Learn — Creator Tools & AI Copilot Implementation Record

> **Component ID**: COMP-017
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/learn/subdomains/creator-tools-copilot.md](../../architecture/domains/learn/subdomains/creator-tools-copilot.md)
> **Stage Assignment**: S7 — Learn Creator Experience
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

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
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 6 |
| **Total** | **6** |

**Component Coverage**: 0%

### Item List

#### [COMP-017.1] CreatorWorkflow aggregate

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | creator-tools-copilot.md |
| **Dependencies** | COMP-016, COMP-015 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `CreatorWorkflow` aggregate managing the 5-phase creation process.

**Acceptance Criteria**:
- [ ] `CreatorWorkflow` aggregate: `id`, `track_id`, `creator_id`, `current_phase`, `phases_completed[]`, `started_at`
- [ ] Phases: `ProjectScoping | CurriculumArchitecture | FragmentDrafting | PedagogicalValidation | Iteration`
- [ ] `CreatorWorkflow.advancePhase(approvalRecord)` validates `ApprovalRecord` exists before advancing
- [ ] Invariant: cannot advance without explicit `ApprovalRecord` from creator — throws `PhaseAdvanceWithoutApprovalError`
- [ ] Unit tests: all advance-without-approval attempts throw

**Files Created/Modified**:
- `packages/learn/src/domain/creator-tools/creator-workflow.ts`
- `packages/learn/tests/unit/creator-tools/creator-workflow.test.ts`

---

#### [COMP-017.2] AIGeneratedDraft and ApprovalRecord entities

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | creator-tools-copilot.md |
| **Dependencies** | COMP-017.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `AIGeneratedDraft` and `ApprovalRecord` entities.

**Acceptance Criteria**:
- [ ] `AIGeneratedDraft` entity: `id`, `workflow_id`, `phase`, `draft_type`, `content (JSONB)`, `ai_generated: true (always)`, `agent_session_id`, `created_at`
- [ ] `ApprovalRecord` entity: `id`, `workflow_id`, `phase`, `draft_id`, `creator_id`, `decision (approve|reject)`, `notes`, `decided_at`
- [ ] `AIGeneratedDraft.ai_generated` is always `true` — cannot be set to false
- [ ] Draft rejection creates new AI agent session for iteration
- [ ] Unit tests: ai_generated immutability

**Files Created/Modified**:
- `packages/learn/src/domain/creator-tools/ai-generated-draft.ts`
- `packages/learn/src/domain/creator-tools/approval-record.ts`

---

#### [COMP-017.3] CreatorWorkflow phase use cases

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | creator-tools-copilot.md |
| **Dependencies** | COMP-017.2, COMP-012 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement application use cases for each phase: activating the appropriate AI agent and processing the creator's approval/rejection.

**Acceptance Criteria**:
- [ ] `StartPhaseUseCase.execute(workflowId, phase)` activates the correct AI agent session via AI Agents adapter
- [ ] `ApprovePhaseUseCase.execute(workflowId, draftId, notes)` creates ApprovalRecord, advances phase
- [ ] `RejectPhaseUseCase.execute(workflowId, draftId, notes)` creates rejection ApprovalRecord, activates Iteration Agent
- [ ] Agent mapping: Phase 1→ProjectScopingAgent, Phase 2→CurriculumArchitectAgent, Phase 3→FragmentAuthorAgent, Phase 4→PedagogicalValidatorAgent, Phase 5→IterationAgent
- [ ] `AIAgentsAdapter` (ACL) wraps AI Agents session API

**Files Created/Modified**:
- `packages/learn/src/application/creator-workflow-use-cases.ts`
- `packages/learn/src/infrastructure/ai-agents-adapter.ts`

---

#### [COMP-017.4] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | creator-tools-copilot.md, ADR-004 |
| **Dependencies** | COMP-017.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository and migration for creator workflows, drafts, and approvals.

**Acceptance Criteria**:
- [ ] `CreatorWorkflowRepository` interface: `findByTrack`, `findById`, `save`
- [ ] Migration: `creator_workflows`, `ai_generated_drafts`, `approval_records` tables
- [ ] Integration tests

**Files Created/Modified**:
- `packages/learn/src/infrastructure/repositories/postgres-creator-workflow-repository.ts`
- `packages/learn/src/infrastructure/migrations/003_creator_tools.sql`

---

#### [COMP-017.5] Internal API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | learn/ARCHITECTURE.md |
| **Dependencies** | COMP-017.3, COMP-017.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Internal API for creator workflow management.

**Acceptance Criteria**:
- [ ] `POST /internal/learn/creator-workflows` → starts new workflow for a Track
- [ ] `GET /internal/learn/creator-workflows/{id}` → current workflow state
- [ ] `POST /internal/learn/creator-workflows/{id}/phases/{phase}/start` → activates AI agent for phase
- [ ] `POST /internal/learn/creator-workflows/{id}/phases/{phase}/approve` → approves draft, advances
- [ ] `POST /internal/learn/creator-workflows/{id}/phases/{phase}/reject` → rejects, requests iteration

**Files Created/Modified**:
- `packages/learn/src/api/routes/creator-workflows.ts`

---

#### [COMP-017.6] Creator tools test suite

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | CON-010 |
| **Dependencies** | COMP-017.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Test suite focusing on the approval invariant and phase transitions.

**Acceptance Criteria**:
- [ ] ≥85% branch coverage on CreatorWorkflow aggregate
- [ ] All advance-without-approval scenarios tested
- [ ] `ai_generated: true` invariant tested (cannot set to false)
- [ ] Integration test: full 5-phase workflow with mocked AI agents

**Files Created/Modified**:
- `packages/learn/tests/unit/creator-tools/*.test.ts`
- `packages/learn/tests/integration/creator-tools/*.test.ts`

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
