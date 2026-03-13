# ADR-007: IDE Embedding — Monaco Editor with Docker/Kubernetes Container Orchestration

## Status

Accepted

## Date

2026-03-12

## Context

Vision Section 5 (Capability: Embedded IDE) mandates a code editor embedded directly within the Syntropy platform that serves all three pillars — Learn (learners running Fragment artifacts), Hub (contributors working on project issues), and Labs (researchers executing experiment scripts). The IDE must:

- **Be embeddable in the web application** without redirecting users to an external service
- **Provide container isolation per session**: each user's code execution runs in an isolated container, preventing one user's code from affecting others
- **Support multiple languages**: at minimum JavaScript/TypeScript (for all pillars), Python (for Labs experiments and data analysis), and extensibility to others
- **Publish artifacts to DIP**: when code is ready for publication, the IDE provides a bridge that calls the DIP Artifact Registry via ACL (ARCH-012) to register the artifact
- **Integrate with the AI Agents domain**: the IDE should be accessible to the AI Agents domain's tools, enabling agents to assist with code (completing fragments, suggesting fixes, generating test scaffolds)
- **Enforce resource quotas**: to prevent abuse, each IDE session has CPU, memory, and execution time limits
- **Not re-implement container orchestration**: Labs' Experiment Design domain delegates execution to the IDE domain; the IDE provides this as a shared service

The IDE is classified as a **Supporting Subdomain** (ARCH-011): the embedding technology and container management are solved problems. However, the integration with DIP artifact publishing and AI agents is Syntropy-specific.

Key constraints:
- **Web-native**: the IDE runs in the browser; it cannot require a native application installation
- **TypeScript monorepo**: the IDE domain package must be TypeScript (ADR-001)
- **No external dependency on paid closed-source services** that violate self-hosting requirements
- **Resource efficiency**: IDE containers are expensive; they must be started only when needed and terminated promptly after inactivity

## Decision

We will use **Monaco Editor** (the code editor component underlying VS Code) as the browser-based editor, paired with **Docker containers** (dev/small-scale) and **Kubernetes** (production) for session container orchestration.

Specifically:

1. **Monaco Editor** (`@monaco-editor/react`) for the browser-side editing experience:
   - Rich TypeScript/JavaScript IntelliSense (via the TypeScript language service running in a Web Worker)
   - Syntax highlighting for all supported languages
   - Diff editor view (for code review in Hub contributions)
   - Embedded directly in the Next.js application via the `packages/ide` domain package's presentation components
   - `MonacoEditorAdapter` wraps Monaco-specific APIs to shield the IDE domain from Monaco-specific details

2. **Container lifecycle** (IDE domain, `IDESession` aggregate):
   - `IDESession` is created when a user opens the IDE for a specific context (Fragment, Issue, ExperimentDesign)
   - A Docker/Kubernetes pod is provisioned on session creation with:
     - Language runtime (Node.js, Python, etc.)
     - Workspace files pre-populated from the entity context
     - Resource limits enforced via cgroups/Kubernetes ResourceQuota
   - A WebSocket connection links the browser Monaco instance to the container's language server (LSP protocol)
   - Session terminates (container destroyed) after configurable inactivity timeout (default: 30 minutes)

3. **Resource quotas** per session:
   | Resource | Default Limit |
   |----------|---------------|
   | CPU | 0.5 vCPU |
   | Memory | 512 MB |
   | Execution wall time | 5 minutes per run |
   | Disk (workspace) | 100 MB |
   | Network (outbound) | Blocked (sandboxed) |

4. **DIP Artifact Publish Bridge** (`DIPPublishAdapter` in `packages/ide/infrastructure/`):
   - When the user triggers "Publish to DIP" in the IDE, the `IDESession` application service calls `DIPPublishAdapter`
   - The adapter calls the DIP Artifact Registry's application API (not its database) with the code artifact metadata and storage reference
   - DIP vocabulary never enters the IDE domain model; the IDE knows about `PublishableArtifact`, not `DIP.Artifact`
   - This is the Anti-Corruption Layer required by ARCH-012

5. **Development mode**: Docker Compose with a single container image for local development. No Kubernetes required locally.

6. **Production mode**: Kubernetes cluster (managed — AWS EKS, GCP GKE, or Azure AKS). Container image registry per language runtime. Pod autoscaling based on active session count.

## Alternatives Considered

### Alternative 1: Theia IDE (Eclipse Foundation)

Eclipse Theia is an open-source cloud-based IDE framework built on the same language server protocol (LSP) and extension model as VS Code, but designed specifically for embedding in cloud platforms.

**Pros**:
- Purpose-built for cloud IDE embedding
- Supports VS Code extension compatibility
- Full IDE experience (file tree, terminal, debugger, not just an editor)
- Open source under Eclipse Foundation governance

**Cons**:
- Significantly more complex to embed than Monaco: Theia is a full application, not a component — embedding it requires running a Theia server alongside the container backend
- Heavier resource footprint per session (full Electron-equivalent process vs. Monaco web component)
- Full IDE features (file tree, terminal, multi-tab) are unnecessary for the Fragment/Contribution/Experiment use cases — the IDE domain's use cases require a focused editor, not a full development environment
- Smaller community than Monaco; fewer web integration examples

**Why rejected**: The use cases (Fragment completion, Contribution code review, Experiment script execution) require a focused code editor, not a full IDE. Monaco provides exactly the right level of capability as a lightweight, embeddable component. Theia's full IDE complexity would increase container resource requirements and operational overhead without adding value for the defined use cases.

### Alternative 2: Gitpod Integration (Managed Cloud IDE)

Use Gitpod's API to provision cloud development environments for users when the IDE is needed.

**Pros**:
- Zero container orchestration to manage
- Full VS Code experience in the browser
- Pre-built language runtimes and extensions

**Cons**:
- External dependency on a paid closed-source service — contradicts self-hosting requirements from Vision
- Each Gitpod session is a full development environment; start time is 30–60 seconds — unacceptable for a "click and run" experience in a Learn fragment
- No native integration with Syntropy's DIP publish bridge — would require custom webhooks into a system not designed for this
- Per-session pricing at community scale is prohibitive
- Data privacy: user code runs on Gitpod's infrastructure, not Syntropy's — compliance risk for proprietary research code (Labs)

**Why rejected**: External dependency, startup latency, and data privacy concerns disqualify Gitpod for the Syntropy use case. The IDE must be part of the Syntropy platform, not a redirect to an external service.

### Alternative 3: CodeSandbox API / StackBlitz WebContainers

Use CodeSandbox's embed API or StackBlitz's WebContainers technology (in-browser Node.js execution via WebAssembly).

**Pros**:
- StackBlitz WebContainers run entirely in the browser — no server-side container required for Node.js
- Near-instant startup (no container provisioning)
- Rich ecosystem integration

**Cons**:
- WebContainers are limited to Node.js/WebAssembly environments — Python (required for Labs) is not supported
- CodeSandbox is a managed third-party service — same self-hosting concern as Gitpod
- In-browser execution cannot enforce the CPU/memory resource quotas required to prevent abuse at community scale
- Research code execution (Labs Experiment Design) requires reproducible compute environments — browser-based execution cannot guarantee this

**Why rejected**: Python support is required for Labs experiments. Resource quota enforcement requires server-side containers. Self-hosting requirements exclude managed third-party services.

### Alternative 4: Ace Editor

A lightweight, embeddable code editor (pre-dates Monaco, used in older cloud IDEs).

**Pros**:
- Very small bundle size
- Simple API
- No framework dependencies

**Cons**:
- Significantly less capable than Monaco: no TypeScript IntelliSense, no built-in LSP support, no diff view
- Monaco is the de facto standard for web-based code editing; Ace's development has slowed significantly
- Integration with language servers requires more custom work than Monaco's built-in LSP client

**Why rejected**: Monaco is the superior technology by all relevant metrics. Ace's bundle size advantage does not justify its capability deficit for a developer-focused platform.

## Consequences

### Positive

- Monaco's TypeScript IntelliSense running in a Web Worker provides a near-VS Code quality editing experience without any server round-trips for code completion.
- The container isolation model ensures that user code execution cannot affect the Syntropy platform or other users — mandatory for a multi-tenant platform hosting research experiments.
- The `DIPPublishAdapter` ACL means the IDE domain is completely unaware of DIP's internal model — adding new artifact types to DIP does not require changes to the IDE domain.

### Negative

- Container provisioning latency (5–15 seconds for a cold-start container) may be noticeable for users who open the IDE for the first time.
  - **Mitigation**: Pre-warm containers during track/course loading (speculative provisioning). Show a loading indicator; do not block the editor UI from rendering.
- Kubernetes adds infrastructure complexity (cluster management, pod scheduling, resource quotas).
  - **Mitigation**: Managed Kubernetes (EKS, GKE, AKS) eliminates control plane management. Development uses Docker Compose. A dedicated `platform/embedded-ide/ARCHITECTURE.md` documents the full deployment topology.
- Container sessions that are not properly terminated accumulate running pods.
  - **Mitigation**: Session expiry via inactivity timeout (30 minutes default, configurable). A scheduled cleanup job terminates orphaned sessions. Session state is reconciled on reconnect — if the container is gone, a new one is provisioned.

### Neutral

- The `IDESession` entity maintains a `container_id` and `websocket_endpoint` that are infrastructure details. These are stored in the IDE domain's own schema (`ide.sessions`) and are never exposed to other domains.
- Supporting multiple language runtimes means multiple container images to build and maintain. A base image with common tools (git, curl, standard build tools) plus language-specific layers reduces image count.

## Implementation Notes

### Container Image Tags

```
syntropy/ide-runtime-node:lts
syntropy/ide-runtime-python:3.12
syntropy/ide-runtime-base:latest
```

### IDESession Lifecycle

```
Create Session → Provision Container → Establish WebSocket → [User Works] →
Inactivity Timeout → Terminate Container → Archive Session → Mark Closed
```

### Kubernetes ResourceQuota per Namespace

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: ide-sessions-quota
spec:
  hard:
    requests.cpu: "0.5"
    requests.memory: "512Mi"
    limits.cpu: "1"
    limits.memory: "1Gi"
    pods: "1"
```

## References

- Vision Document: Section 5 (Capability: Embedded IDE); Section 10 (Inviolable: IDE shared across all pillars)
- `docs/architecture/domains/ide/ARCHITECTURE.md` — IDE domain design
- `docs/architecture/platform/embedded-ide/ARCHITECTURE.md` — Platform-level IDE deployment architecture
- `docs/architecture/domains/labs/subdomains/experiment-design.md` — Labs delegates experiment execution to IDE domain
- ADR-001: Modular Monolith — TypeScript constraint; IDE as Supporting Subdomain

## Derived Rules

- `architecture.mdc`: ARCH-012 — `DIPPublishAdapter` is the required ACL between IDE domain and DIP domain
- `architecture.mdc`: ARCH-011 — IDE classified as Supporting Subdomain; Monaco + Docker/K8s are off-the-shelf solutions for the implementation

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2026-03-12 | System Architect | Accepted | Monaco provides best-in-class browser editing; Docker/K8s provides industry-standard container isolation with clear scaling path |
