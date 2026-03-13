# Architecture Brief

> **Purpose**: Confirmed Architecture Brief produced by Prompt 01-A. Governs all work in Prompts 01-B and 01-C.
> **Created by**: Prompt 01-A — Assess and Brief
> **Consumed by**: Prompt 01-B (Generate Architecture), Prompt 01-C (Decisions and Validation)
> **Status**: Active
> **Last updated**: 2026-03-12

---

## Vision Quality

| Field | Value |
|-------|-------|
| **Verdict** | Ready |
| **Score** | 55/55 |
| **Gaps carried as assumptions** | None — document is exceptional quality |

---

## Delivery Interfaces

| Interface | Primary / Secondary | Impact on layer structure |
|-----------|--------------------|-----------------------------|
| Web Application | Primary | Drives SPA/SSR Presentation layer; session management and RBAC enforcement at the edge; unified design language with pillar-specific variations; WCAG 2.1 AA required |
| REST API | Primary | Drives explicit API versioning strategy and platform/rest-api document; used for cross-pillar communication and external integrations (DOI providers, bibliographic databases) |
| Dashboard / Admin Interface | Secondary | Co-located with web app as a protected route cluster; serves Governance & Moderation domain actors |
| Background Service / Worker | Primary | Drives async processing architecture and message broker selection (event bus); handles article rendering, experiment execution, DOI generation, reputation computation |
| Embedded / SDK | Supporting | Requires container orchestration per session (Docker/Kubernetes); IDE embedded within platform serving all three pillars without context switch |

---

## Layer Structure

| Field | Value |
|-------|-------|
| **Chosen style** | Modular Monolith — 4-layer clean architecture (Presentation → Application → Domain → Infrastructure), with bounded contexts as workspace packages communicating exclusively via the event bus and versioned APIs |
| **Rationale** | Section 10 "Inviolable Decisions": monorepo (Turborepo + pnpm workspaces); no direct imports between pillar apps; shared logic in packages/. Section 10 "Known Constraints": small team (2–5 developers). Section 9 priority 5 (Maintainability): complexity must be justified. Section 9 priority 4 (Extensibility): new pillars and artifact types addable without rewriting core. Architecture designed for future extraction toward microservices without blocking it now. |

---

## Entity Ownership Principle

**DIP is the single source of truth for all fundamental ecosystem entities.** Pillars reference DIP entities by ID and extend them with pillar-specific state — they never duplicate or re-own them. This is the non-negotiable constraint that prevents redundancy across domains.

| Entity | Owner | How Pillars Interact |
|--------|-------|----------------------|
| Artifact (and all typed subtypes: scientific-article, dataset, experiment, code…) | DIP | Pillars trigger publication; DIP registers. Pre-publication drafts are transient within each pillar. |
| DigitalProject (and typed subtypes incl. research-line) | DIP | Hub adds Issue/Contribution on top. Labs adds scientific fields via extension. Learn references by ID only. |
| DigitalInstitution (and typed subtypes incl. laboratory) | DIP | Hub orchestrates creation workflow. Labs adds scientific context. Neither owna the entity. |
| GovernanceContract, Proposal, LegitimacyChain | DIP | Hub presents and initiates via ACL. Never owns. |
| AVU, Treasury, ArtifactManifesto, DependencyGraph | DIP | Hub presents treasury state as read model. Never owns. |
| CollectibleDefinition (template) | Learn | Platform Core owns CollectibleInstance (earned item in portfolio) |
| XP, Achievement, CollectibleInstance, Skill, Reputation | Platform Core | Pillars emit events; Platform Core transforms into portfolio state |
| Issue, Contribution, ContributionSandbox, ContractTemplate | Hub | Hub-exclusive collaboration concepts with no DIP equivalent |
| Review, SubjectArea, DOIRecord, ExperimentDesign | Labs | Labs-exclusive scientific concepts with no DIP equivalent |
| Career, Track, Course, Fragment, CollectibleDefinition | Learn | Learn-exclusive pedagogical concepts with no DIP equivalent |
| EcosystemEvent, AppendOnlyLog, EventSchema | Platform Core | All domains emit events conforming to registered schemas; Platform Core owns the log |

---

## Domains

| Domain | Responsibility | Type | Owned Entities | Vision Capabilities |
|--------|---------------|------|----------------|---------------------|
| Platform Core | Event bus audit log and schema registry, dynamic portfolio aggregation, gamification engine, cross-pillar recommendation, unified search | Core | EcosystemEvent, EventSchema, AppendOnlyLog, Portfolio, XP, Achievement, CollectibleInstance, Skill, Reputation, Recommendation | 2, 3, 7 |
| Identity | Authentication, session management, RBAC enforcement | Generic | User, Session, Role, Permission | 1, 9 |
| Digital Institutions Protocol (DIP) | Artifact registry and identity anchoring, IACP four-phase protocol, smart contract execution, institutional governance, value distribution and treasury, legitimacy chain | Core | Artifact, IdentityRecord, IACP, UsageAgreementEvent, UsageEvent, DigitalProject, DigitalInstitution, GovernanceContract, Proposal, LegitimacyChain, AVU, Treasury, ArtifactManifesto, DependencyGraph | 13–18 |
| AI Agents | Agent orchestration, unified user context model, agent registry and tool layer, specialized pillar agents | Core (orchestration) / Supporting (agents) | AIAgent, UserContextModel, AgentSession, ToolCall, AgentMemory | Embedded across pillars |
| Learn | Tracks, courses, fragments (fixed Problem→Theory→Artifact invariant), creator tools, mentorship, collectible definitions | Core | Career, Track, Course, Fragment, CollectibleDefinition, TrackProjectLink, LearnerProgressRecord, MentorshipRelationship, AICopilotSession | 19–26 |
| Hub | Collaboration layer (issues, contributions, contribution sandbox), institution orchestration UI, public square discovery | Core | Issue, Contribution, ContributionSandbox, ContractTemplate, InstitutionProfile | 27–32 |
| Labs | Scientific context extension on DIP entities, article editor, experiment design, open peer review, DOI publication | Core | Review, ReviewPassageLink, AuthorResponse, SubjectArea, ResearchMethodology, HypothesisRecord, ExperimentDesign, DOIRecord | 33–40 |
| Sponsorship | Voluntary sponsorship, creator monetization, impact discovery | Supporting | Sponsorship, CreatorMonetization, ImpactMetric, AccessPolicy | 4 |
| Communication | Contextualized forums (anchor-required), direct messaging, activity feed, notifications | Supporting | Thread, Reply, ContextAnchor, Message, Notification | 8 |
| Planning | Cross-pillar planning board (vocabulary adapts per pillar), mentor coordination | Supporting | Task, Goal, Sprint, StudyPlan, MentorSession | 6 |
| IDE | Embedded code editor, container lifecycle per session, artifact publish bridge to DIP | Supporting | IDESession, Container, Workspace | 5 |
| Governance & Moderation | Platform-level content moderation policies, role policy management, community governance (distinct from DIP institutional governance) | Supporting | ModerationFlag, ModerationAction, PlatformPolicy, CommunityProposal | 11 |

> **Note**: Institutional Site is NOT a domain — it has no owned business data or domain logic. It is a platform delivery document (`platform/institutional-site/`) serving as a public-facing read layer over Platform Core metrics and public DIP entities.

---

## Internal Subdomains

### Platform Core — 3 subdomains

| Subdomain | Type | Responsibility |
|-----------|------|---------------|
| **Event Bus & Audit** | Core | Event Schema Registry (versioned contracts per event type, binding inter-domain contract); two-level event signing hierarchy (actor-signed DIP protocol events + service-signed ecosystem events); append-only event log with hash chaining (tamper-evident); causal chain tracking and correlation IDs |
| **Portfolio Aggregation** | Core | Subscribes to audit log; builds and maintains Portfolio, XP, Achievement, CollectibleInstance, Skill, Reputation; gamification engine processing; no writes to event log |
| **Search & Recommendation** | Core | Cross-pillar search index (near-real-time from event log); recommendation engine triggered by events; proactive cross-pillar opportunity surfacing |

### Digital Institutions Protocol (DIP) — 6 subdomains

| Subdomain | Type | Responsibility |
|-----------|------|---------------|
| **Artifact Registry** | Core | Artifact lifecycle (publication, versioning); identity anchoring via Nostr relays; IdentityRecord immutability enforcement. *Invariant: records immutable once anchored.* |
| **IACP Engine** | Core | Four-phase protocol execution (Identification → ContractNegotiation → Utilization → UsageRegistration); emits UsageAgreementEvent and UsageEvent. *Invariant: no phase may be skipped.* |
| **Smart Contract Engine** | Core | Deterministic contract evaluation `C: Request × State → {permitted, denied} × State′`; state transition management. |
| **Project Manifest & DAG** | Core | Dependency graph management; InternalArtifact and ExternalArtifact tracking; DAG acyclicity enforcement. *Invariant I1: DAG always acyclic — enforced by depth-first reachability check on every IACP Phase 2 event.* |
| **Institutional Governance** | Core | Chamber system, deliberation protocol (Draft→Discussion→Voting→Approved/Rejected→Contested→Executed), legitimacy chain maintenance. `e_exec = Sign_executor(pid ∥ Hash(Inst_{k-1}) ∥ Hash(Inst_k) ∥ timestamp)`. *Invariant I7: every state transition is a signed, anchored execution event.* |
| **Value Distribution & Treasury** | Core | AVU computation from usage events; treasury balance management; oracle-based liquidation to concrete currencies. *Invariants I4 (value conservation) and I6 (AVU exclusivity — no concrete currencies in distribution logic).* |

### AI Agents — 3 subdomains

| Subdomain | Type | Responsibility |
|-----------|------|---------------|
| **Orchestration & Context Engine** | Core | Maintains unified cross-pillar UserContextModel; routes agent invocations; long-term and session memory management |
| **Agent Registry & Tool Layer** | Supporting | Agent definitions (SystemPrompt, ToolSet, ActivationPolicy); versioning and discovery; platform API tools scoped by pillar and permission level |
| **Pillar Agents** | Supporting | Learn Agents (5 specialized: Project Scoping, Curriculum Architect, Fragment Author, Pedagogical Validator, Iteration); Hub Agents (3: Artifact Copilot, Institution Setup, Contribution Reviewer); Labs Agents (3: Literature Review, Research Structuring, Article Drafting); Cross-Pillar Navigation Agent |

### Learn — 4 subdomains

| Subdomain | Type | Responsibility |
|-----------|------|---------------|
| **Content Hierarchy & Navigation** | Core | Career → Track → Course organizational structure; fog-of-war spatial navigation; Track references a DIP DigitalProject as its ReferenceProject by ID — Learn does not own the Project |
| **Fragment & Artifact Engine** | Core | Fixed Problem→Theory→Artifact structure (domain invariant — no exceptions); CollectibleDefinition templates; TrackProjectLink (reference to Hub/DIP project by ID); LearnerProgressRecord |
| **Creator Tools & AI Copilot** | Supporting | Five-phase AI-assisted authoring workflow (Project Scoping → Curriculum Architect → Fragment Author → Pedagogical Validator → Iteration Agent); creator retains full authorship; AI generates drafts, creator approves |
| **Mentorship & Community** | Supporting | MentorshipRelationship lifecycle (Proposed→Active→Concluded); ArtifactGallery (per-track gallery of published learner artifacts anchored to Platform Core Portfolio) |

### Hub — 3 subdomains

| Subdomain | Type | Responsibility |
|-----------|------|---------------|
| **Collaboration Layer** | Core | Issue lifecycle (Open→InProgress→InReview→Closed), Contribution review cycle (Submitted→InReview→Accepted/Rejected→Integrated), ContributionSandbox management — Hub's exclusively-owned collaboration concepts |
| **Institution Orchestration** | Supporting | Institution creation workflow via ContractTemplates (pre-audited DIP GovernanceContract shortcuts); InstitutionProfile (read/presentation model over DIP entities); configuration UI for DIP governance parameters — Hub orchestrates, DIP executes |
| **Public Square** | Supporting | Read model for institution and project discovery; renders public DIP entities; prominence based on activity signals from Platform Core event log |

### Labs — 5 subdomains

| Subdomain | Type | Responsibility |
|-----------|------|---------------|
| **Scientific Context Extension** | Supporting | Extends DIP entities with scientific fields via references: ResearchMethodology, HypothesisRecord, SubjectArea taxonomy — Labs does not own Laboratory (DIP Institution) or Research Line (DIP Project) |
| **Article Editor** | Core | MyST + LaTeX writing interface with real-time rendering; EmbeddedArtifact referencing (DIP Artifacts by ID); immutable versioning — each published version is permanent |
| **Experiment Design** | Core | ExperimentDesign model (type, conditions, participant config, data collection rules, anonymization policy); execution delegated to IDE domain via service call — Labs does not re-implement container orchestration |
| **Open Peer Review** | Core | Review lifecycle with ReviewPassageLink; reputation-based visibility filtering (low-reputation reviews filtered by default, not removed); AuthorResponse cycle; permanent public history of all review activity |
| **DOI & External Publication** | Supporting | DOIRecord (link between DIP Artifact version and external DOI); publication cycle management; DataCite/CrossRef integration; external indexing via OpenAlex/Google Scholar |

---

## Documents to Generate

> Prompt 01-B will create these files.

**Root (1):**
- `docs/architecture/ARCHITECTURE.md`

**Domain documents (12):**
- `docs/architecture/domains/platform-core/ARCHITECTURE.md`
- `docs/architecture/domains/identity/ARCHITECTURE.md`
- `docs/architecture/domains/digital-institutions-protocol/ARCHITECTURE.md`
- `docs/architecture/domains/ai-agents/ARCHITECTURE.md`
- `docs/architecture/domains/learn/ARCHITECTURE.md`
- `docs/architecture/domains/hub/ARCHITECTURE.md`
- `docs/architecture/domains/labs/ARCHITECTURE.md`
- `docs/architecture/domains/sponsorship/ARCHITECTURE.md`
- `docs/architecture/domains/communication/ARCHITECTURE.md`
- `docs/architecture/domains/planning/ARCHITECTURE.md`
- `docs/architecture/domains/ide/ARCHITECTURE.md`
- `docs/architecture/domains/governance-moderation/ARCHITECTURE.md`

**Subdomain documents (24):**
- `docs/architecture/domains/platform-core/subdomains/event-bus-audit.md`
- `docs/architecture/domains/platform-core/subdomains/portfolio-aggregation.md`
- `docs/architecture/domains/platform-core/subdomains/search-recommendation.md`
- `docs/architecture/domains/digital-institutions-protocol/subdomains/artifact-registry.md`
- `docs/architecture/domains/digital-institutions-protocol/subdomains/iacp-engine.md`
- `docs/architecture/domains/digital-institutions-protocol/subdomains/smart-contract-engine.md`
- `docs/architecture/domains/digital-institutions-protocol/subdomains/project-manifest-dag.md`
- `docs/architecture/domains/digital-institutions-protocol/subdomains/institutional-governance.md`
- `docs/architecture/domains/digital-institutions-protocol/subdomains/value-distribution-treasury.md`
- `docs/architecture/domains/ai-agents/subdomains/orchestration-context-engine.md`
- `docs/architecture/domains/ai-agents/subdomains/agent-registry-tool-layer.md`
- `docs/architecture/domains/ai-agents/subdomains/pillar-agents.md`
- `docs/architecture/domains/learn/subdomains/content-hierarchy-navigation.md`
- `docs/architecture/domains/learn/subdomains/fragment-artifact-engine.md`
- `docs/architecture/domains/learn/subdomains/creator-tools-copilot.md`
- `docs/architecture/domains/learn/subdomains/mentorship-community.md`
- `docs/architecture/domains/hub/subdomains/collaboration-layer.md`
- `docs/architecture/domains/hub/subdomains/institution-orchestration.md`
- `docs/architecture/domains/hub/subdomains/public-square.md`
- `docs/architecture/domains/labs/subdomains/scientific-context-extension.md`
- `docs/architecture/domains/labs/subdomains/article-editor.md`
- `docs/architecture/domains/labs/subdomains/experiment-design.md`
- `docs/architecture/domains/labs/subdomains/open-peer-review.md`
- `docs/architecture/domains/labs/subdomains/doi-external-publication.md`

**Cross-cutting documents (4):**
- `docs/architecture/cross-cutting/security/ARCHITECTURE.md`
- `docs/architecture/cross-cutting/observability/ARCHITECTURE.md`
- `docs/architecture/cross-cutting/data-integrity/ARCHITECTURE.md`
- `docs/architecture/cross-cutting/resilience/ARCHITECTURE.md`

**Platform documents (5):**
- `docs/architecture/platform/web-application/ARCHITECTURE.md`
- `docs/architecture/platform/rest-api/ARCHITECTURE.md`
- `docs/architecture/platform/background-services/ARCHITECTURE.md`
- `docs/architecture/platform/embedded-ide/ARCHITECTURE.md`
- `docs/architecture/platform/institutional-site/ARCHITECTURE.md`

**Infrastructure (2):**
- `docs/architecture/diagrams/README.md`
- `docs/architecture/evolution/CHANGELOG.md`

---

## Diagrams to Generate

| Location | Diagrams |
|----------|----------|
| Root document | System context diagram (C4 Level 1), layer/component overview, domain relationships (Context Map with integration patterns), ecosystem entity ownership hierarchy |
| Platform Core | Component diagram (3 subdomains), event flow sequence (emission → signing → append-only log → portfolio aggregation), two-level event signing hierarchy diagram |
| DIP | IACP four-phase protocol sequence, artifact identity ERD (Artifact/IdentityRecord/IACP/UsageEvent), governance state machine (Proposal lifecycle + LegitimacyChain), dependency DAG activity diagram |
| Learn | ERD (Career/Track/Course/Fragment + TrackProjectLink→DIP), fragment lifecycle sequence, creator authoring workflow activity diagram |
| Hub | Collaboration ERD (Issue/Contribution/ContributionSandbox + references to DIP entities by ID), institution orchestration flow, contribution review sequence |
| Labs | Scientific ERD (Review/SubjectArea/DOIRecord + references to DIP entities), article publication cycle sequence, peer review flow |
| AI Agents | Orchestration component diagram, UserContextModel ERD, agent invocation sequence |

---

## ADRs to Create

> Prompt 01-C will create these files.

| Working Title | Decision Subject |
|---------------|-----------------|
| ADR-001-modular-monolith | Architecture style — modular monolith with Turborepo + pnpm workspaces; bounded context communication via event bus and APIs only; no direct cross-context database access |
| ADR-002-event-bus-technology | Message broker selection for event bus (Kafka vs RabbitMQ vs in-process for initial phase); guaranteed delivery and durability requirements |
| ADR-003-artifact-identity-anchoring | Artifact identity record anchoring via Nostr relays as immutable ledger implementation; ACL adapter isolating ledger from core domain; migration path if Nostr is replaced |
| ADR-004-database-strategy | Supabase / PostgreSQL as primary data store for current phase; per-domain schema isolation; migration path defined |
| ADR-005-authentication-approach | Supabase Auth + custom RBAC layer as Generic Subdomain; Anti-Corruption Layer wrapping Supabase Auth; role transition events on event bus |
| ADR-006-agentic-ai-framework | LLM API integration approach (Anthropic/OpenAI); agent registry and orchestration architecture; AI-generated content marking in data model |
| ADR-007-ide-embedding | Monaco Editor / VS Code as IDE foundation; container orchestration strategy (Docker/Kubernetes); IDE as shared service used by Learn, Hub, and Labs; resource quota enforcement |
| ADR-008-scientific-writing-format | MyST Markdown + LaTeX adoption; rendering via MyST-Parser open source library; executable components rendering via cloud containers |
| ADR-009-value-distribution-model | AVU accounting model; prohibition on platform tokens; oracle-based liquidation; AVU-to-currency conversion only at treasury entry and liquidation |
| ADR-010-event-signing-and-immutability | Two-level event signing hierarchy: actor-signed DIP protocol events (Nostr-anchored, externally verifiable) + service-signed ecosystem events (append-only hash-chained log, internally auditable); Event Schema Registry as versioned inter-domain contract; append-only log durability requirements |

---

## Cross-Cutting Concerns

| Concern | Justification |
|---------|--------------|
| Security | Section 10 Data Sensitivity: PII, financial data, auth credentials, proprietary content; GDPR + LGPD + CCPA from launch; experiment data anonymization mandatory for Labs (Section 10); cryptographic key management for DIP actor signing |
| Observability | Section 9 priority 8: full traceability of events from emission to processing; causal chain correlation IDs; distributed tracing headers propagated across all domains; audit logs for governance contract execution and value distribution |
| Data Integrity / Immutability | Section 9 priority 6: three distinct immutability guarantees — (1) DIP artifact identity records via Nostr, (2) DIP legitimacy chain execution events via Nostr, (3) ecosystem events via append-only hash-chained log; no retroactive modification permitted in any layer |
| Resilience | Section 9 priority 1 (Reliability > 99.9%): event bus durability across partial failures; circuit breakers for all external dependencies (Kafka/RabbitMQ, Supabase, LLM APIs, Stripe, container orchestration, Nostr relays); DIP event signing must not be skippable under failure conditions |

---

## Platform Documents

| Platform document | Delivery interface covered |
|-------------------|---------------------------|
| `platform/web-application/ARCHITECTURE.md` | Web Application — SPA/SSR architecture, routing, auth integration, design system, WCAG 2.1 AA |
| `platform/rest-api/ARCHITECTURE.md` | REST API — API gateway, versioning strategy, cross-pillar endpoints, error envelope format |
| `platform/background-services/ARCHITECTURE.md` | Background Service / Worker — event bus topology, worker architecture, event schema registry enforcement, retry/DLQ, article rendering and experiment execution pipelines |
| `platform/embedded-ide/ARCHITECTURE.md` | Embedded / SDK — Monaco/VS Code embedding, container lifecycle, artifact publish flow (IDE→DIP via ACL), resource quota |
| `platform/institutional-site/ARCHITECTURE.md` | Institutional Site — public-facing read layer over Platform Core metrics and public DIP entities; no business logic |

---

## Context Map — Integration Patterns

| Domain Pair | Pattern | Direction | Notes |
|------------|---------|-----------|-------|
| Hub → DIP | Anti-Corruption Layer | Hub consumes DIP | Hub translates management UI actions into DIP protocol calls; DIP vocabulary must not leak into Hub's ubiquitous language |
| Labs → DIP | Anti-Corruption Layer | Labs consumes DIP | Labs extends DIP entities with scientific fields; never duplicates DIP-owned concepts |
| Learn → DIP | Anti-Corruption Layer | Learn consumes DIP | Learn triggers DIP Artifact publication; references DIP Projects by ID only |
| Learn → Hub | Customer-Supplier | Learn references Hub | Learn references Hub Projects for ReferenceProject and LearnerProject; Hub is supplier |
| All pillars → Platform Core | Published Language | Pillars emit, Platform Core consumes | Versioned Event Schema Registry is the Published Language all domains must conform to when emitting events |
| Identity → All | Open Host Service | Identity serves all | Authentication and RBAC provided as well-defined service; every domain is a consumer |
| AI Agents → All | Open Host Service | AI Agents serves all | Orchestration engine provides context-aware agents to all pillars via declared tool layer |
| Communication → All | Conformist | Communication anchors to all | Thread ContextAnchors reference entity IDs from any domain; Communication conforms to their ID contracts without translation |
| IDE → DIP | Anti-Corruption Layer | IDE triggers DIP | Artifact publication from IDE calls DIP Artifact Registry via ACL; IDE vocabulary does not enter DIP |
| Sponsorship → Identity | Customer-Supplier | Sponsorship consumes Identity | User identity (supplier) provides actor attribution; Sponsorship wraps Stripe behind its own ACL |

---

## Ambiguities and Resolutions

| Ambiguity | Severity | Resolution |
|-----------|----------|------------|
| DIP vs Hub boundary: DIP includes both technical protocol (IACP, artifact identity) and governance logic deeply used by Hub. Single or separate bounded context? | Significant | Assumed: DIP is a separate Core bounded context; Hub consumes DIP via ACL (mandatory per ARCH-012). DIP owns contracts and protocol; Hub owns management UI and collaboration-specific concepts (Issue, Contribution, ContributionSandbox). |
| AI Agents: Orchestration Engine (Core) and Specialized Agents (Supporting) — one domain or two? | Significant | Assumed: Single bounded context with 3 internal subdomains (Orchestration Core, Registry/Tool Layer, Pillar Agents). Vocabulary is shared; scaling needs are similar at current team size. |
| Labs architecture-first, launch-later: Labs is architectured from day 1 but launches after Learn and Hub. | Significant | Assumed: Labs domain fully defined with all entities, contracts, and integrations. Feature flags and deployment phases control user-facing availability. No conditional architecture. |
| Governance & Moderation role management vs Identity enforcement | Minor | Assumed: Identity defines and enforces roles/permissions; Governance & Moderation defines platform policies and initiates role transitions via event bus events. Policy definition vs enforcement separation. |
| Immutable Ledger technology: Section 10 lists as TBD; Nostr relays mentioned for artifact identity anchoring | Minor | Assumed: Nostr relays anchor DIP protocol events (artifact identity records, legitimacy chain execution events). Ecosystem events use internal append-only hash-chained log. Both isolated behind ACL adapters. ADR-003 and ADR-010 document these decisions. |
| Event signing for ecosystem events (Level 2): full actor cryptographic signing vs service signing + hash chaining | Significant | Assumed: Ecosystem events (Fragment completed, Contribution accepted, etc.) are signed by the emitting platform service and stored in append-only hash-chained log (tamper-evident, internally auditable). Full actor key signing reserved for DIP protocol events (required for external verifiability without depending on the platform). ADR-010 documents this hierarchy explicitly. |

---

## Estimated Output

| Metric | Count |
|--------|-------|
| Domain documents | 12 |
| Subdomain documents | 24 |
| Cross-cutting documents | 4 |
| Platform documents | 5 |
| Root + infrastructure | 3 |
| **Total documents** | **48** |
| Diagrams | ~30–35 (inline in domain docs + shared diagram files) |
| ADRs | 10 |
