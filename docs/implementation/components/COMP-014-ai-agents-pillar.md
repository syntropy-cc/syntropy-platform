# AI Agents — Pillar Agents Implementation Record

> **Component ID**: COMP-014
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/ai-agents/subdomains/pillar-agents.md](../../architecture/domains/ai-agents/subdomains/pillar-agents.md)
> **Stage Assignment**: S5 — AI Agents
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Pillar Agents implements the 12 specialized AI agents across Learn (5), Hub (3), Labs (3), and Cross-Pillar (1). Each agent is defined by its system prompt, tool set, and activation policy — all stored in the Agent Registry (COMP-013). This component implements the **tool handlers** that each agent uses, integrating with the domain packages' APIs. The actual agent orchestration and session management lives in COMP-012.

**Responsibilities**:
- Implement tool handlers for all 12 agents across Learn, Hub, Labs, and Cross-Pillar
- Each handler calls the relevant domain API and transforms the response for the agent
- Register all tool endpoints with the registry

**Catalog (12 agents)**:
- **Learn**: Project Scoping, Curriculum Architect, Fragment Author, Pedagogical Validator, Iteration
- **Hub**: Artifact Copilot, Institution Setup, Contribution Reviewer
- **Labs**: Literature Review, Research Structuring, Article Drafting
- **Cross-Pillar**: Cross-Pillar Navigation

### Implementation Scope

**In Scope**:
- Tool handler implementations for all 12 agents
- Integration with Learn, Hub, Labs, IDE API endpoints
- System prompts for all 12 agents (stored in seed data via COMP-013.3)
- Tool routing integration with `ToolDispatcher` (COMP-013)

**Out of Scope**:
- Agent session management (COMP-012)
- Agent definition storage (COMP-013)
- Domain logic in the tools (each domain owns its logic)

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

#### [COMP-014.1] Learn agent tool handlers (5 agents)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | pillar-agents.md |
| **Dependencies** | COMP-012, COMP-013, COMP-015, COMP-016 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement tool handlers for the 5 Learn agents: `learn.get_track_context`, `learn.create_course_structure`, `learn.get_fragment_context`, `learn.save_fragment_draft`, `learn.get_fragment_content`, `learn.submit_validation_report`, `learn.get_validation_feedback`, `dip.search_projects`.

**Acceptance Criteria**:
- [ ] `LearnToolHandler` implements `ToolHandler` interface
- [ ] `learn.get_track_context(trackId)` → returns Track metadata and Fragment structure
- [ ] `learn.create_course_structure(trackId, outline)` → creates Course drafts
- [ ] `learn.save_fragment_draft(fragmentId, sections)` → saves draft via Fragment Engine
- [ ] `learn.get_fragment_content(fragmentId)` → returns current fragment content
- [ ] `learn.submit_validation_report(fragmentId, report)` → records pedagogical validation
- [ ] `dip.search_projects(query)` → searches DIP projects for Track linking
- [ ] All tool calls logged as `ToolCall` entity
- [ ] Unit tests for each tool handler (mocked domain APIs)

**Files Created/Modified**:
- `packages/ai-agents/src/infrastructure/tool-handlers/learn-tool-handler.ts`
- `packages/ai-agents/tests/unit/tool-handlers/learn-tool-handler.test.ts`

---

#### [COMP-014.2] Hub agent tool handlers (3 agents)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | pillar-agents.md |
| **Dependencies** | COMP-012, COMP-013, COMP-019, COMP-020 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement tool handlers for the 3 Hub agents: `hub.get_issue_context`, `hub.get_contribution_draft`, `hub.list_contract_templates`, `hub.get_dip_governance_preview`, `hub.get_contribution_content`, `hub.get_issue_acceptance_criteria`.

**Acceptance Criteria**:
- [ ] `HubToolHandler` implements `ToolHandler` interface
- [ ] `hub.get_issue_context(issueId)` → returns Issue metadata and acceptance criteria
- [ ] `hub.get_contribution_draft(contributionId)` → returns current contribution content
- [ ] `hub.list_contract_templates()` → returns available ContractTemplates
- [ ] `hub.get_dip_governance_preview(templateId)` → returns governance structure preview
- [ ] `hub.get_contribution_content(contributionId)` → full contribution for review
- [ ] Unit tests for each handler

**Files Created/Modified**:
- `packages/ai-agents/src/infrastructure/tool-handlers/hub-tool-handler.ts`
- `packages/ai-agents/tests/unit/tool-handlers/hub-tool-handler.test.ts`

---

#### [COMP-014.3] Labs agent tool handlers (3 agents)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | pillar-agents.md |
| **Dependencies** | COMP-012, COMP-013, COMP-022, COMP-023 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement tool handlers for the 3 Labs agents: `labs.search_articles`, `labs.search_external_databases`, `labs.create_article_outline`, `labs.create_hypothesis_record`, `labs.get_article_section`, `labs.save_article_draft`, `labs.list_embedded_artifacts`.

**Acceptance Criteria**:
- [ ] `LabsToolHandler` implements `ToolHandler` interface
- [ ] `labs.search_articles(query, subjectArea)` → searches internal article index
- [ ] `labs.search_external_databases(query)` → calls external academic database API
- [ ] `labs.create_article_outline(projectId, sections)` → creates article structure
- [ ] `labs.save_article_draft(articleId, sectionContent)` → saves MyST content
- [ ] Unit tests

**Files Created/Modified**:
- `packages/ai-agents/src/infrastructure/tool-handlers/labs-tool-handler.ts`
- `packages/ai-agents/tests/unit/tool-handlers/labs-tool-handler.test.ts`

---

#### [COMP-014.4] Cross-Pillar Navigation agent tool handlers

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | pillar-agents.md |
| **Dependencies** | COMP-012, COMP-011 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement tool handlers for the Cross-Pillar Navigator agent: `platform_core.get_recommendations`, `platform_core.search`, `learn.get_relevant_tracks`, `hub.get_open_issues`, `labs.get_relevant_articles`.

**Acceptance Criteria**:
- [ ] `CrossPillarToolHandler` implements `ToolHandler` interface
- [ ] `platform_core.get_recommendations(userId)` → calls COMP-011 recommendations API
- [ ] `platform_core.search(query, pillar)` → calls COMP-011 search API
- [ ] `learn.get_relevant_tracks(skillGaps)` → returns tracks addressing skill gaps
- [ ] `hub.get_open_issues(skillProfile)` → returns open issues matching skills
- [ ] `labs.get_relevant_articles(researchFocus)` → returns relevant articles

**Files Created/Modified**:
- `packages/ai-agents/src/infrastructure/tool-handlers/ports/cross-pillar-ports.ts`
- `packages/ai-agents/src/infrastructure/tool-handlers/cross-pillar-tool-handler.ts`
- `packages/ai-agents/tests/unit/tool-handlers/cross-pillar-tool-handler.test.ts`

---

#### [COMP-014.5] System prompts for all 12 agents

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | pillar-agents.md |
| **Dependencies** | COMP-013.3 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Write and register system prompts for all 12 agents in the seed data. Each prompt must establish the agent's role, constraints (never act without creator approval), and output format expectations.

**Acceptance Criteria**:
- [ ] System prompts for all 12 agents written and reviewed
- [ ] All prompts include: role description, constraints (e.g., "always require explicit creator approval"), output format
- [ ] Fragment Author prompt enforces Problem+Theory+Artifact structure
- [ ] Prompts updated in `COMP-013.3` seed migration
- [ ] Prompts tested: each prompt activates correctly in session tests

**Files Created/Modified**:
- `packages/ai-agents/src/infrastructure/seeds/system-prompts/` (12 prompt files)

---

#### [COMP-014.6] IDE tool handler for experiment execution delegation

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Origin** | pillar-agents.md |
| **Dependencies** | COMP-012, COMP-030 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ide.get_workspace_context` tool handler used by the Artifact Copilot agent to provide IDE workspace context for contribution assistance.

**Acceptance Criteria**:
- [x] `IDEToolHandler` implements `ToolHandler`
- [x] `list_files(sessionId)`, `read_file(sessionId, path)`, `write_file(sessionId, path, content)`, `run_command(sessionId, cmd)` with session ownership via `getCurrentUserId()`
- [x] Requires session ownership enforced by port implementation
- [x] Unit tests

**Files Created/Modified**:
- `packages/ai-agents/src/infrastructure/tool-handlers/ports/ide-ports.ts`
- `packages/ai-agents/src/infrastructure/tool-handlers/ide-tool-handler.ts`
- `packages/ai-agents/tests/unit/tool-handlers/ide-tool-handler.test.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-012 AI Agents Orchestration | Internal | ⬜ Not Started | Session management and tool dispatch |
| COMP-013 Agent Registry | Internal | ⬜ Not Started | Tool definitions and agent catalog |
| COMP-015-COMP-026 (pillar domains) | Internal | ⬜ Not Started | Domain APIs called by tools |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-017 Learn Creator Tools | Fragment Author and Creator agents | Blocks AI-assisted creation |
| COMP-019 Hub Collaboration Layer | Artifact Copilot and Reviewer agents | Delays contribution AI features |
| COMP-023 Labs Article Editor | Article Drafting and Literature agents | Delays Labs AI assistance |

---

## References

### Architecture Documents

- [AI Agents Pillar Agents Subdomain](../../architecture/domains/ai-agents/subdomains/pillar-agents.md)
