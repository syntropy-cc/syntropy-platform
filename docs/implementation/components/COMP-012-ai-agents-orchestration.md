# AI Agents — Orchestration & Context Engine Implementation Record

> **Component ID**: COMP-012
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/ai-agents/subdomains/orchestration-context-engine.md](../../architecture/domains/ai-agents/subdomains/orchestration-context-engine.md)
> **Stage Assignment**: S5 — AI Agents
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

The Orchestration & Context Engine is the Core subdomain of AI Agents. It owns the `UserContextModel` — a unified, cross-pillar model of the user combining learning progress, contribution history, research activity, and portfolio state. The engine builds and refreshes this model from ecosystem events, creates `UserContextSnapshot` at session activation, routes invocations to the correct agent, and manages session memory (per-user, per-agent-type `MemorySlot`s). Includes AI Agents package setup.

**Responsibilities**:
- Build and maintain `UserContextModel` per user from cross-pillar events
- Create immutable `UserContextSnapshot` at agent session activation
- Route agent invocations to the correct `AIAgentDefinition` via `InvocationRouter`
- Manage `AgentSession` lifecycle (start, streaming messages, end)
- Persist `AgentMemory` (long-term per-user/agent-type memories)
- Wrap LLM API calls behind `LLMAdapter` (ACL)

**Key Interfaces**:
- Public API: `POST /api/v1/ai-agents/sessions`, `POST /sessions/{id}/messages`, `GET /sessions/{id}`, `DELETE /sessions/{id}`
- Internal API: `GET /internal/ai-agents/context/{user_id}` — UserContextModel for RecommendationEngine (COMP-011)
- Streaming: SSE for agent message responses

### Implementation Scope

**In Scope**:
- AI Agents package setup (workspace package scaffolding)
- `UserContextModel`, `AgentSession`, `AgentMemory`, `ToolCall` entities
- `LearningContextSection`, `ContributionContextSection`, `ResearchContextSection`, `PortfolioContextSection`
- `ContextRefreshService`, `ContextSnapshotBuilder`, `InvocationRouter`, `SessionMemoryManager`
- `LLMAdapter` (ACL for Anthropic/OpenAI)
- `UserContextSnapshot` value object
- Repository interface + PostgreSQL implementation
- Event consumers for `ContextRefreshTrigger` events

**Out of Scope**:
- Agent definitions and tool catalog (COMP-013)
- Specific pillar agent implementations (COMP-014)
- Direct LLM API calls without the adapter

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 8 |
| **Total** | **8** |

**Component Coverage**: 0%

### Item List

#### [COMP-012.1] AI Agents package setup and UserContextModel aggregate

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | orchestration-context-engine.md, ADR-006 |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up `packages/ai-agents` workspace package and implement `UserContextModel` aggregate with its four context sections.

**Acceptance Criteria**:
- [ ] `packages/ai-agents` fully scaffolded with 4-layer structure
- [ ] `UserContextModel` aggregate: `user_id`, `learning_context (LearningContextSection)`, `contribution_context (ContributionContextSection)`, `research_context (ResearchContextSection)`, `portfolio_context (PortfolioContextSection)`, `last_refreshed_at`
- [ ] Each section: structured JSONB with relevant signals (e.g., LearningContext: `active_tracks`, `completed_fragments_count`, `skill_gaps`)
- [ ] `UserContextModel.refresh(section, data)` updates specific section
- [ ] `UserContextSnapshot` value object: immutable copy of UserContextModel at a point in time

**Files Created/Modified**:
- `packages/ai-agents/src/domain/orchestration/user-context-model.ts`
- `packages/ai-agents/src/domain/orchestration/user-context-snapshot.ts`
- `packages/ai-agents/src/domain/orchestration/context-sections/`

---

#### [COMP-012.2] AgentSession aggregate and AgentMemory entity

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | orchestration-context-engine.md |
| **Dependencies** | COMP-012.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `AgentSession` aggregate and `AgentMemory` entity with typed `MemorySlot`s.

**Acceptance Criteria**:
- [ ] `AgentSession` aggregate: `id`, `user_id`, `agent_type`, `status (active|completed|expired)`, `context_snapshot (UserContextSnapshot)`, `conversation_history[]`, `started_at`, `ended_at`
- [ ] `AgentMemory` entity: `user_id`, `agent_type`, `memory_slots (JSONB)` — typed slots: `preferred_languages`, `research_focus_areas`, `preferred_contribution_types`
- [ ] `AgentSession.addMessage(role, content)` appends to conversation history
- [ ] Sessions expire after 24h of inactivity
- [ ] `ai_agents.session.started` and `ai_agents.session.completed` events published

**Files Created/Modified**:
- `packages/ai-agents/src/domain/orchestration/agent-session.ts`
- `packages/ai-agents/src/domain/orchestration/agent-memory.ts`
- `packages/ai-agents/tests/unit/orchestration/agent-session.test.ts`

---

#### [COMP-012.3] LLMAdapter (ACL)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | orchestration-context-engine.md, ADR-006 |
| **Dependencies** | COMP-012.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement `LLMAdapter` as the ACL over Anthropic Claude (primary) and OpenAI (fallback) APIs. Supports streaming responses via SSE.

**Acceptance Criteria**:
- [ ] `LLMAdapter` implements `LLMProvider` interface (defined in domain)
- [ ] Primary provider: Anthropic Claude API (`claude-3-5-sonnet`)
- [ ] Fallback provider: OpenAI API (`gpt-4o`)
- [ ] Automatic fallback on primary unavailability (circuit breaker per COMP-040)
- [ ] `LLMAdapter.complete(prompt, systemPrompt, tools, options)` returns `AsyncIterable<string>` (streaming)
- [ ] `LLMAdapter.completeTools(toolCalls)` handles structured tool call responses
- [ ] LLM vocabulary (Anthropic/OpenAI message format) does not leak into domain
- [ ] Integration test with mocked LLM provider

**Files Created/Modified**:
- `packages/ai-agents/src/domain/orchestration/llm-provider.ts` (interface)
- `packages/ai-agents/src/infrastructure/anthropic-llm-adapter.ts`
- `packages/ai-agents/src/infrastructure/openai-llm-adapter.ts`
- `packages/ai-agents/tests/integration/llm-adapter.test.ts`

---

#### [COMP-012.4] ContextRefreshService and event consumers

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | orchestration-context-engine.md |
| **Dependencies** | COMP-012.1, COMP-009.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `ContextRefreshService` that subscribes to ecosystem events and refreshes the relevant section of each user's `UserContextModel`.

**Acceptance Criteria**:
- [ ] Consumer group: `ai-agents-context-refresh`
- [ ] `learn.fragment.artifact_published` → refreshes `LearningContextSection`
- [ ] `hub.contribution.integrated` → refreshes `ContributionContextSection`
- [ ] `labs.article.published` → refreshes `ResearchContextSection`
- [ ] `platform_core.portfolio.updated` → refreshes `PortfolioContextSection`
- [ ] Refresh is debounced: max 1 refresh per user per 5 minutes
- [ ] `PortfolioContextAdapter` (ACL) fetches portfolio data from COMP-010

**Files Created/Modified**:
- `packages/ai-agents/src/domain/orchestration/services/context-refresh-service.ts`
- `packages/ai-agents/src/infrastructure/consumers/context-refresh-consumer.ts`
- `packages/ai-agents/src/infrastructure/portfolio-context-adapter.ts`

---

#### [COMP-012.5] InvocationRouter and ContextSnapshotBuilder

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | orchestration-context-engine.md |
| **Dependencies** | COMP-012.1, COMP-013 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `InvocationRouter` (selects correct agent definition for context) and `ContextSnapshotBuilder` (creates immutable snapshot for session activation).

**Acceptance Criteria**:
- [ ] `InvocationRouter.route(userId, pillar, contextEntityType, userRoles)` returns `AIAgentDefinition` from Agent Registry (COMP-013)
- [ ] Routing considers: pillar, contextEntityType, userRole, and ActivationPolicy
- [ ] `ContextSnapshotBuilder.build(userId)` fetches current `UserContextModel` and creates `UserContextSnapshot`
- [ ] Snapshot is immutable — session uses snapshot for entire lifetime
- [ ] Unit tests: routing for all 12 agent types

**Files Created/Modified**:
- `packages/ai-agents/src/domain/orchestration/services/invocation-router.ts`
- `packages/ai-agents/src/domain/orchestration/services/context-snapshot-builder.ts`
- `packages/ai-agents/tests/unit/orchestration/invocation-router.test.ts`

---

#### [COMP-012.6] SessionMemoryManager

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | orchestration-context-engine.md |
| **Dependencies** | COMP-012.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `SessionMemoryManager` that maintains conversation history within a session and extracts insights to persist in `AgentMemory`.

**Acceptance Criteria**:
- [ ] `SessionMemoryManager.recordMessage(sessionId, role, content)` appends to session history
- [ ] `SessionMemoryManager.extractInsights(session)` identifies memory-worthy patterns (preferred language, focus areas) and updates `AgentMemory`
- [ ] History truncated to last 20 messages in context window (older messages summarized)
- [ ] AgentMemory persisted per `(user_id, agent_type)` key

**Files Created/Modified**:
- `packages/ai-agents/src/domain/orchestration/services/session-memory-manager.ts`
- `packages/ai-agents/tests/unit/orchestration/session-memory-manager.test.ts`

---

#### [COMP-012.7] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | orchestration-context-engine.md, ADR-004 |
| **Dependencies** | COMP-012.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository interfaces and PostgreSQL implementation for UserContextModel, AgentSession, and AgentMemory.

**Acceptance Criteria**:
- [ ] `UserContextModelRepository`: `findByUser`, `save`
- [ ] `AgentSessionRepository`: `findById`, `findActiveByUser`, `save`
- [ ] `AgentMemoryRepository`: `findByUserAndAgentType`, `save`
- [ ] Migration: `user_context_models`, `agent_sessions`, `agent_memory` tables
- [ ] `agent_sessions.conversation_history` stored as JSONB; max 50 entries per session

**Files Created/Modified**:
- `packages/ai-agents/src/infrastructure/repositories/`
- `packages/ai-agents/src/infrastructure/migrations/001_ai_agents.sql`

---

#### [COMP-012.8] Session management API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | ai-agents/ARCHITECTURE.md |
| **Dependencies** | COMP-012.5, COMP-012.7 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement public and internal REST API for agent session management with SSE streaming support.

**Acceptance Criteria**:
- [ ] `POST /api/v1/ai-agents/sessions` → activates session, returns `session_id`
- [ ] `POST /api/v1/ai-agents/sessions/{id}/messages` → sends message, streams SSE response
- [ ] `GET /api/v1/ai-agents/sessions/{id}` → session state
- [ ] `DELETE /api/v1/ai-agents/sessions/{id}` → ends session
- [ ] `GET /api/v1/ai-agents/agents?pillar=&context_entity_type=` → available agents
- [ ] `GET /internal/ai-agents/context/{user_id}` → UserContextModel (for COMP-011)
- [ ] SSE streaming: `Content-Type: text/event-stream`, heartbeat every 15s

**Files Created/Modified**:
- `packages/ai-agents/src/api/routes/sessions.ts`
- `packages/ai-agents/src/api/routes/agents.ts`
- `packages/ai-agents/src/api/routes/internal.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | Event stream for context refresh |
| COMP-010 Portfolio Aggregation | Internal | ⬜ Not Started | Portfolio section of UserContextModel |
| COMP-013 Agent Registry | Internal | ⬜ Not Started | Agent definitions for routing |
| Anthropic Claude API | External | ✅ Available | Primary LLM provider |
| OpenAI API | External | ✅ Available | Fallback LLM provider |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-011 Search & Recommendation | UserContextModel for personalization | Reduces recommendation quality |
| COMP-014 Pillar Agents | Context and routing | Blocks specific agent implementations |
| COMP-017 Learn Creator Tools | Copilot agent sessions | Blocks creator AI assistance |

---

## References

### Architecture Documents

- [AI Agents Orchestration & Context Engine Subdomain](../../architecture/domains/ai-agents/subdomains/orchestration-context-engine.md)
- [AI Agents Domain Architecture](../../architecture/domains/ai-agents/ARCHITECTURE.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-006](../../architecture/decisions/ADR-006-agentic-ai-framework.md) | AI Agent Framework | Orchestration and LLM integration strategy |
