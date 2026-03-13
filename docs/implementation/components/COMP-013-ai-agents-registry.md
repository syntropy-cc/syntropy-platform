# AI Agents — Agent Registry & Tool Layer Implementation Record

> **Component ID**: COMP-013
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/ai-agents/subdomains/agent-registry-tool-layer.md](../../architecture/domains/ai-agents/subdomains/agent-registry-tool-layer.md)
> **Stage Assignment**: S5 — AI Agents
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

The Agent Registry & Tool Layer is a Supporting subdomain that catalogs all agent definitions (`AIAgentDefinition`) and their available tools (`ToolDefinition`). Agent definitions are versioned and immutable after publication. Tools have `ToolScope` constraints (pillar + permission level). The `ToolPermissionEvaluator` ensures users can only invoke tools within their role permissions.

**Responsibilities**:
- Store and version `AIAgentDefinition` (system prompt, tool set, activation policy)
- Catalog `ToolDefinition` with API endpoint mapping and permission scope
- Enforce `ToolPermissionEvaluator`: user role must satisfy all tool scopes
- Provide `AgentDiscoveryService` — returns available agents by pillar/context/role

**Key Interfaces**:
- Internal: agent definitions catalog used by `InvocationRouter` (COMP-012)
- Internal: tool permission checking during tool call execution

### Implementation Scope

**In Scope**:
- `AIAgentDefinition` and `ToolDefinition` entities
- `ToolScope` value object, `ActivationPolicy` value object
- `AgentDiscoveryService` and `ToolPermissionEvaluator` domain services
- Repository + seed data for all 12 initial agent definitions
- Internal API for agent discovery

**Out of Scope**:
- Session management and LLM invocation (COMP-012)
- Specific tool implementations (each domain owns its tool handlers)
- Pillar agent logic (COMP-014)

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

#### [COMP-013.1] AIAgentDefinition and ToolDefinition entities

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | agent-registry-tool-layer.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `AIAgentDefinition` and `ToolDefinition` entities with versioning and immutability constraints.

**Acceptance Criteria**:
- [ ] `AIAgentDefinition` entity: `id`, `agent_type (unique per version)`, `version`, `pillar`, `system_prompt`, `tool_set (ToolDefinition[])`, `activation_policy (ActivationPolicy)`, `is_active`, `published_at`
- [ ] `ToolDefinition` entity: `tool_name (unique)`, `platform_api_endpoint`, `parameters_schema (JSON Schema)`, `required_scope (ToolScope)`, `pillar`
- [ ] `ToolScope` value object: `pillar`, `required_role`
- [ ] `ActivationPolicy` value object: `auto_offer_conditions`, `context_entity_types[]`
- [ ] Invariant: `system_prompt` and `tool_set` immutable after `is_active = true`
- [ ] Unit tests: immutability, version uniqueness

**Files Created/Modified**:
- `packages/ai-agents/src/domain/registry/ai-agent-definition.ts`
- `packages/ai-agents/src/domain/registry/tool-definition.ts`
- `packages/ai-agents/src/domain/registry/value-objects/tool-scope.ts`
- `packages/ai-agents/src/domain/registry/value-objects/activation-policy.ts`
- `packages/ai-agents/tests/unit/registry/ai-agent-definition.test.ts`

---

#### [COMP-013.2] AgentDiscoveryService and ToolPermissionEvaluator

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | agent-registry-tool-layer.md |
| **Dependencies** | COMP-013.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `AgentDiscoveryService` for querying available agents and `ToolPermissionEvaluator` for role-based tool access validation.

**Acceptance Criteria**:
- [ ] `AgentDiscoveryService.findAvailable(pillar, contextEntityType, userRoles)` returns active `AIAgentDefinition[]` matching criteria
- [ ] `ToolPermissionEvaluator.canInvoke(userId, toolName, userRoles)` validates all `ToolScope` requirements
- [ ] Agent only returned if user roles satisfy all tool scopes in the agent's tool set
- [ ] Unit tests: 10+ role/scope combinations

**Files Created/Modified**:
- `packages/ai-agents/src/domain/registry/services/agent-discovery-service.ts`
- `packages/ai-agents/src/domain/registry/services/tool-permission-evaluator.ts`
- `packages/ai-agents/tests/unit/registry/tool-permission-evaluator.test.ts`

---

#### [COMP-013.3] Repository and seed data for 12 agents

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | pillar-agents.md |
| **Dependencies** | COMP-013.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Repository interface, PostgreSQL implementation, and seed migration for all 12 initial agent definitions and their tool catalogs.

**Acceptance Criteria**:
- [ ] `AgentDefinitionRepository` interface: `findByType`, `findActive`, `findByPillar`, `save`
- [ ] Migration: `agent_definitions`, `tool_definitions` tables
- [ ] Seed data for all 12 agents: Project Scoping, Curriculum Architect, Fragment Author, Pedagogical Validator, Iteration Agent (Learn), Artifact Copilot, Institution Setup, Contribution Reviewer (Hub), Literature Review, Research Structuring, Article Drafting (Labs), Cross-Pillar Navigator
- [ ] All 12 agents have correct `tool_set` referencing existing tool endpoints
- [ ] All tool scopes properly configured per pillar and role

**Files Created/Modified**:
- `packages/ai-agents/src/infrastructure/repositories/postgres-agent-registry-repository.ts`
- `packages/ai-agents/src/infrastructure/migrations/002_agent_registry.sql`
- `packages/ai-agents/src/infrastructure/seeds/agent-definitions-seed.ts`

---

#### [COMP-013.4] Internal API for agent catalog

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | ai-agents/ARCHITECTURE.md |
| **Dependencies** | COMP-013.2, COMP-013.3 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Internal API endpoint for InvocationRouter (COMP-012) to query available agents.

**Acceptance Criteria**:
- [ ] `GET /internal/ai-agents/definitions?pillar=&context_entity_type=&roles=` → returns `AIAgentDefinition[]`
- [ ] `GET /internal/ai-agents/definitions/{agent_type}` → single agent definition
- [ ] `POST /internal/ai-agents/definitions` (admin only) → registers new agent definition

**Files Created/Modified**:
- `packages/ai-agents/src/api/routes/registry.ts`

---

#### [COMP-013.5] Tool catalog and tool handler interface

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | agent-registry-tool-layer.md |
| **Dependencies** | COMP-013.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Define the `ToolHandler` interface that each domain package implements when it exposes tools to agents. Establish the tool invocation routing mechanism.

**Acceptance Criteria**:
- [ ] `ToolHandler` interface exported from `packages/ai-agents`: `invoke(toolName, parameters, userId)` → `ToolResult`
- [ ] `ToolDispatcher` service: resolves tool name to its handler, validates permissions, invokes
- [ ] Each domain package (learn, hub, labs, etc.) implements `ToolHandler` for its tools
- [ ] Tool call is logged as `ToolCall` entity for audit

**Files Created/Modified**:
- `packages/ai-agents/src/domain/registry/tool-handler.ts` (interface)
- `packages/ai-agents/src/domain/registry/tool-call.ts`
- `packages/ai-agents/src/application/tool-dispatcher.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | Package shell |
| COMP-002 Identity | Internal | ⬜ Not Started | Role validation for tool scopes |

### Required By (Dependents)

| Dependent | Relationship | Impact if Delayed |
|-----------|--------------|-------------------|
| COMP-012 AI Agents Orchestration | InvocationRouter queries registry | Blocks agent routing |
| COMP-014 Pillar Agents | Agent definitions seeded here | Blocks pillar agent implementations |

---

## References

### Architecture Documents

- [AI Agents Registry & Tool Layer Subdomain](../../architecture/domains/ai-agents/subdomains/agent-registry-tool-layer.md)
