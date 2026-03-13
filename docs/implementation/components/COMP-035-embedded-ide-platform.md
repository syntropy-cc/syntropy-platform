# Embedded IDE Platform Service Implementation Record

> **Component ID**: COMP-035
> **Architecture Reference**: [ARCHITECTURE.md#platform-services](../../architecture/ARCHITECTURE.md#platform-services)
> **Domain Architecture**: [platform/embedded-ide/ARCHITECTURE.md](../../architecture/platform/embedded-ide/ARCHITECTURE.md)
> **Stage Assignment**: S12 — Platform Services
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Embedded IDE Platform handles the **delivery** of the IDE experience: Monaco Editor integration, WebSocket gateway for bidirectional container communication, and Kubernetes container provisioning adapter. This complements the IDE Domain (COMP-030) which owns the business logic. The platform service bridges browser ↔ WebSocket ↔ container shell/LSP (ADR-007).

**Responsibilities**:
- Monaco Editor integration in the Hub app (within `apps/hub`)
- WebSocket gateway: multiplexes terminal, file system, and LSP streams
- Kubernetes/Docker container provisioning adapter
- Session reconnection handling

**Key Interfaces**:
- WebSocket: `wss://api.syntropy.cc/api/v1/ide/sessions/{id}/ws`
- Calls IDE Domain API (COMP-030) for session management

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

#### [COMP-035.1] Monaco Editor React integration

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | embedded-ide/ARCHITECTURE.md, ADR-007 |
| **Dependencies** | COMP-032, COMP-030 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Integrate Monaco Editor as a React component within the Hub contribution flow and Labs article editor. Configure language support, themes, and keybindings.

**Acceptance Criteria**:
- [ ] `MonacoEditor` React component wrapping `@monaco-editor/react`
- [ ] Language support: TypeScript, JavaScript, Python, Markdown (MyST), JSON, YAML
- [ ] Dark/light theme following app theme
- [ ] Keyboard shortcuts: Cmd+S → save, Ctrl+Space → autocomplete
- [ ] LSP integration: TypeScript Language Server via WebSocket
- [ ] Used in: `apps/hub` contribution editor, `apps/labs` article editor (MyST mode)

**Files Created/Modified**:
- `packages/ui/src/components/monaco-editor.tsx`
- `apps/hub/src/app/(main)/contribute/[id]/editor.tsx`
- `apps/labs/src/app/(main)/articles/[id]/edit/editor.tsx`

---

#### [COMP-035.2] WebSocket gateway

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | embedded-ide/ARCHITECTURE.md, ADR-007 |
| **Dependencies** | COMP-030 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement WebSocket gateway that multiplexes terminal streams, file system operations, and LSP protocol over a single WebSocket connection.

**Acceptance Criteria**:
- [ ] `GET /api/v1/ide/sessions/{id}/ws` → WebSocket upgrade endpoint
- [ ] Protocol: JSON-framed messages with `type` field: `terminal`, `filesystem`, `lsp`, `heartbeat`
- [ ] Terminal: bidirectional stream to container `bash` via pseudo-TTY
- [ ] Filesystem: `list`, `read`, `write`, `delete` operations on container filesystem
- [ ] LSP: bidirectional JSON-RPC for TypeScript Language Server
- [ ] Auth: token validated on WebSocket handshake
- [ ] Reconnection: client can reconnect to existing session within 5 minutes

**Files Created/Modified**:
- `apps/api/src/websocket/ide-gateway.ts`

---

#### [COMP-035.3] Kubernetes container provisioning adapter

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | embedded-ide/ARCHITECTURE.md, ADR-007 |
| **Dependencies** | COMP-030.2 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement the Kubernetes/Docker container provisioning adapter that creates and manages container pods for IDE sessions.

**Acceptance Criteria**:
- [ ] `KubernetesContainerAdapter` implements `ContainerOrchestrator` interface (defined in IDE domain)
- [ ] `provision(sessionId, image, cpu, memory)` creates K8s Pod with resource limits
- [ ] `stop(containerId)` terminates pod gracefully
- [ ] `getStatus(containerId)` returns pod status
- [ ] Development fallback: Docker Compose (no K8s in local dev)
- [ ] `CONTAINER_ORCHESTRATOR=k8s|docker` env variable switches adapter
- [ ] Integration test with Docker provider

**Files Created/Modified**:
- `packages/ide/src/infrastructure/kubernetes-container-adapter.ts`
- `packages/ide/src/infrastructure/docker-container-adapter.ts`

---

#### [COMP-035.4] Session reconnection and state recovery

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | embedded-ide/ARCHITECTURE.md |
| **Dependencies** | COMP-035.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement session reconnection protocol for WebSocket disconnections.

**Acceptance Criteria**:
- [ ] Client receives `session_id` on WebSocket handshake
- [ ] Reconnection within 5 minutes: resumes existing container session
- [ ] Reconnection after 5 minutes: requires new session provisioning
- [ ] Container state preserved during temporary disconnection (files not deleted)
- [ ] `Reconnecting...` UI indicator shown to user during reconnection attempt

**Files Created/Modified**:
- `apps/api/src/websocket/reconnection-handler.ts`
- `packages/ui/src/components/ide-reconnection-indicator.tsx`

---

#### [COMP-035.5] Container image configuration

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | embedded-ide/ARCHITECTURE.md, ADR-007 |
| **Dependencies** | COMP-035.3 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Build and configure base container images for different context types.

**Acceptance Criteria**:
- [ ] `syntropy/ide-base`: Node.js 20, Python 3.11, common CLI tools
- [ ] `syntropy/ide-labs`: extends base with R, Jupyter, scientific Python libraries
- [ ] `syntropy/ide-hub`: extends base with common build tools
- [ ] Images pushed to container registry in CI
- [ ] Security scan: no high/critical CVEs in base image

**Files Created/Modified**:
- `docker/ide-base/Dockerfile`
- `docker/ide-labs/Dockerfile`
- `docker/ide-hub/Dockerfile`

---

#### [COMP-035.6] Workspace persistence integration

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | embedded-ide/ARCHITECTURE.md |
| **Dependencies** | COMP-035.2, COMP-030.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Integrate workspace snapshot save/restore with the WebSocket session lifecycle.

**Acceptance Criteria**:
- [ ] Auto-save: every 2 minutes while session is active
- [ ] On session suspension: full workspace snapshot triggered
- [ ] On session resume: workspace restored to container before WebSocket connection accepted
- [ ] Progress indicator shown in Monaco during restore

**Files Created/Modified**:
- `apps/api/src/websocket/workspace-sync.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-030 IDE Domain | Internal | ⬜ Not Started | Domain logic for session management |
| COMP-032 Web Application | Internal | ⬜ Not Started | Monaco integration in pillar apps |
| Kubernetes/Docker | External | ✅ Available | Container orchestration |

---

## References

### Architecture Documents

- [Embedded IDE Platform Architecture](../../architecture/platform/embedded-ide/ARCHITECTURE.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-007](../../architecture/decisions/ADR-007-ide-platform.md) | Embedded IDE Platform | Monaco + K8s + WebSocket design |
