# Architecture Diagrams Index

> **Document Type**: Diagram Index
> **Parent**: [System Architecture](../ARCHITECTURE.md)
> **Last Updated**: 2026-03-12

This index catalogs all Mermaid diagrams embedded in the architecture documents. Diagrams are grouped by category and reference their source document with the diagram name and type.

---

## System Context Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| System Context | `graph TB` | [Root Architecture](../ARCHITECTURE.md#system-context-diagram) | All actors, pillar apps, and external systems |

---

## Domain Relationship Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| Domain Relationships | `graph TB` | [Root Architecture](../ARCHITECTURE.md#domain-relationships) | All 12 domains with integration pattern labels |
| Entity Ownership Hierarchy | `graph TD` | [Root Architecture](../ARCHITECTURE.md#ecosystem-entity-ownership-hierarchy) | DIP as single source of truth; pillar entity ownership |
| Modular Monolith Layer Structure | `graph TB` | [Root Architecture](../ARCHITECTURE.md#modular-monolith-layer-structure) | 4-layer clean architecture within Turborepo |
| Context Map | Table | [Root Architecture](../ARCHITECTURE.md#context-map) | All 10 integration patterns |

---

## Platform Core Domain Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| Platform Core Domain Boundaries | `graph TB` | [Platform Core Architecture](../domains/platform-core/ARCHITECTURE.md#domain-boundaries) | 3 subdomains and event flow |
| Platform Core Subdomain Boundaries | `graph TB` | [Platform Core Architecture](../domains/platform-core/ARCHITECTURE.md#subdomain-boundaries-diagram) | Internal component structure |
| Event Flow Sequence | `sequenceDiagram` | [Platform Core Architecture](../domains/platform-core/ARCHITECTURE.md#event-flow-sequence) | Event emission to portfolio update |
| Platform Core ERD | `erDiagram` | [Platform Core Architecture](../domains/platform-core/ARCHITECTURE.md#entity-relationship-diagram) | EcosystemEvent, EventSchema, Portfolio, Achievement |

---

## Platform Core Subdomain Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| AppendOnlyLog ERD | `erDiagram` | [Event Bus & Audit](../domains/platform-core/subdomains/event-bus-audit.md) | EventSchemaVersion, LogEntry |
| Portfolio Aggregation ERD | `erDiagram` | [Portfolio Aggregation](../domains/platform-core/subdomains/portfolio-aggregation.md) | Portfolio, Achievement, CollectibleInstance, SkillRecord |
| Search & Recommendation ERD | `erDiagram` | [Search & Recommendation](../domains/platform-core/subdomains/search-recommendation.md) | SearchDocument, Recommendation |

---

## Identity Domain Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| Identity Context Map | `graph LR` | [Identity Architecture](../domains/identity/ARCHITECTURE.md#context-map-position) | SupabaseAuthAdapter, Open Host Service, Customer-Supplier |
| Identity Component Architecture | `graph TB` | [Identity Architecture](../domains/identity/ARCHITECTURE.md#component-architecture) | AuthAdapter, SessionMgr, RBAC Engine, Event Publisher |
| Identity ERD | `erDiagram` | [Identity Architecture](../domains/identity/ARCHITECTURE.md#entity-relationship-diagram) | User, Session, Role, Permission |

---

## DIP Domain Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| DIP Context Map | `graph LR` | [DIP Architecture](../domains/digital-institutions-protocol/ARCHITECTURE.md#context-map-position) | ACL consumers, Open Host Service, Nostr |
| DIP Subdomain Boundaries | `graph TB` | [DIP Architecture](../domains/digital-institutions-protocol/ARCHITECTURE.md#subdomain-boundaries-diagram) | 6 subdomains and internal dependencies |
| DIP Core ERD | `erDiagram` | [DIP Architecture](../domains/digital-institutions-protocol/ARCHITECTURE.md#core-entity-relationship-diagram) | Artifact, IdentityRecord, DigitalProject, DigitalInstitution |
| IACP State Machine | `stateDiagram-v2` | [IACP Engine](../domains/digital-institutions-protocol/subdomains/iacp-engine.md) | 4-phase protocol state transitions |
| IACP ERD | `erDiagram` | [IACP Engine](../domains/digital-institutions-protocol/subdomains/iacp-engine.md) | IACPInstance, UsageAgreementEvent, UsageEvent |
| Artifact Registry ERD | `erDiagram` | [Artifact Registry](../domains/digital-institutions-protocol/subdomains/artifact-registry.md) | Artifact, ArtifactVersion, IdentityRecord |
| DAG Diagram | `graph LR` | [Project Manifest & DAG](../domains/digital-institutions-protocol/subdomains/project-manifest-dag.md) | Example DAG showing acyclicity |
| Project Manifest ERD | `erDiagram` | [Project Manifest & DAG](../domains/digital-institutions-protocol/subdomains/project-manifest-dag.md) | DigitalProjectManifest, DependencyEdge |
| Governance Contract ERD | `erDiagram` | [Smart Contract Engine](../domains/digital-institutions-protocol/subdomains/smart-contract-engine.md) | GovernanceContract, ContractEvaluation |
| Proposal State Machine | `stateDiagram-v2` | [Institutional Governance](../domains/digital-institutions-protocol/subdomains/institutional-governance.md) | Draft→Discussion→Voting→Approved/Rejected→Executed |
| Institutional Governance ERD | `erDiagram` | [Institutional Governance](../domains/digital-institutions-protocol/subdomains/institutional-governance.md) | DigitalInstitution, Chamber, Proposal, LegitimacyChainEntry |
| Treasury ERD | `erDiagram` | [Value Distribution & Treasury](../domains/digital-institutions-protocol/subdomains/value-distribution-treasury.md) | Treasury, AVUTransaction, LiquidationRecord |

---

## AI Agents Domain Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| AI Agents Context Map | `graph LR` | [AI Agents Architecture](../domains/ai-agents/ARCHITECTURE.md#context-map-position) | Open Host Service consumers, LLM ACL |
| AI Agents Subdomain Boundaries | `graph TB` | [AI Agents Architecture](../domains/ai-agents/ARCHITECTURE.md#subdomain-boundaries-diagram) | Orchestration, Registry, Pillar Agents |
| Agent Invocation Sequence | `sequenceDiagram` | [AI Agents Architecture](../domains/ai-agents/ARCHITECTURE.md#agent-invocation-sequence) | Activation → Context Build → LLM → Response |
| AI Agents ERD | `erDiagram` | [AI Agents Architecture](../domains/ai-agents/ARCHITECTURE.md#entity-relationship-diagram) | AIAgent, AgentSession, UserContextModel, AgentMemory |
| UserContextModel ERD | `erDiagram` | [Orchestration & Context Engine](../domains/ai-agents/subdomains/orchestration-context-engine.md) | UserContextModel, AgentMemory |

---

## Learn Domain Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| Learn Context Map | `graph LR` | [Learn Architecture](../domains/learn/ARCHITECTURE.md#context-map-position) | ACL→DIP, Customer-Supplier→Hub |
| Learn Subdomain Boundaries | `graph TB` | [Learn Architecture](../domains/learn/ARCHITECTURE.md#subdomain-boundaries-diagram) | 4 subdomains |
| Fragment Lifecycle Sequence | `sequenceDiagram` | [Learn Architecture](../domains/learn/ARCHITECTURE.md#fragment-lifecycle-sequence) | Fragment publication → DIP anchoring → Portfolio |
| Learn ERD | `erDiagram` | [Learn Architecture](../domains/learn/ARCHITECTURE.md#entity-relationship-diagram) | Career, Track, Course, Fragment, CollectibleDefinition |
| Fragment State Machine | `stateDiagram-v2` | [Fragment & Artifact Engine](../domains/learn/subdomains/fragment-artifact-engine.md) | Draft→InReview→Published |
| Fragment Engine ERD | `erDiagram` | [Fragment & Artifact Engine](../domains/learn/subdomains/fragment-artifact-engine.md) | Fragment, LearnerProgressRecord, CollectibleDefinition |
| Creator Workflow ERD | `erDiagram` | [Creator Tools & AI Copilot](../domains/learn/subdomains/creator-tools-copilot.md) | CreatorWorkflow, AIGeneratedDraft, ApprovalRecord |
| 5-Phase Authoring Workflow | `graph LR` | [Creator Tools & AI Copilot](../domains/learn/subdomains/creator-tools-copilot.md) | Phase 1–5 with approval gates |
| MentorshipRelationship State Machine | `stateDiagram-v2` | [Mentorship & Community](../domains/learn/subdomains/mentorship-community.md) | Proposed→Active→Concluded |

---

## Hub Domain Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| Hub Context Map | `graph LR` | [Hub Architecture](../domains/hub/ARCHITECTURE.md#context-map-position) | ACL→DIP, Customer-Supplier→Learn |
| Hub Subdomain Boundaries | `graph TB` | [Hub Architecture](../domains/hub/ARCHITECTURE.md#subdomain-boundaries-diagram) | 3 subdomains |
| Contribution Review Sequence | `sequenceDiagram` | [Hub Architecture](../domains/hub/ARCHITECTURE.md#contribution-review-sequence) | Submission → Review → DIP publication → Integration |
| Hub ERD | `erDiagram` | [Hub Architecture](../domains/hub/ARCHITECTURE.md#entity-relationship-diagram) | Issue, Contribution, HackinDimension, ContractTemplate |
| Issue State Machine | `stateDiagram-v2` | [Collaboration Layer](../domains/hub/subdomains/collaboration-layer.md) | Open→InProgress→InReview→Closed |
| Contribution State Machine | `stateDiagram-v2` | [Collaboration Layer](../domains/hub/subdomains/collaboration-layer.md) | Submitted→InReview→Accepted/Rejected→Integrated |
| Collaboration Layer ERD | `erDiagram` | [Collaboration Layer](../domains/hub/subdomains/collaboration-layer.md) | Issue, Contribution, HackinDimension |
| ContractTemplate ERD | `erDiagram` | [Institution Orchestration](../domains/hub/subdomains/institution-orchestration.md) | ContractTemplate, InstitutionCreationWorkflow |
| Public Square Read Model | Table | [Public Square](../domains/hub/subdomains/public-square.md) | DiscoveryDocument structure |

---

## Labs Domain Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| Labs Context Map | `graph LR` | [Labs Architecture](../domains/labs/ARCHITECTURE.md#context-map-position) | ACL→DIP, IDE delegation, DataCite |
| Labs Subdomain Boundaries | `graph TB` | [Labs Architecture](../domains/labs/ARCHITECTURE.md#subdomain-boundaries-diagram) | 5 subdomains |
| Article Publication Sequence | `sequenceDiagram` | [Labs Architecture](../domains/labs/ARCHITECTURE.md#article-publication-cycle-sequence) | Review cycle → DIP publication → DOI registration |
| Labs ERD | `erDiagram` | [Labs Architecture](../domains/labs/ARCHITECTURE.md#entity-relationship-diagram) | ScientificArticle, Review, ReviewPassageLink, DOIRecord |
| Scientific Context ERD | `erDiagram` | [Scientific Context Extension](../domains/labs/subdomains/scientific-context-extension.md) | ResearchMethodology, HypothesisRecord, SubjectArea |
| Article Editor ERD | `erDiagram` | [Article Editor](../domains/labs/subdomains/article-editor.md) | ScientificArticle, ArticleVersion, EmbeddedArtifactRef |
| Experiment Design ERD | `erDiagram` | [Experiment Design](../domains/labs/subdomains/experiment-design.md) | ExperimentDesign, ExperimentResult |
| Open Peer Review ERD | `erDiagram` | [Open Peer Review](../domains/labs/subdomains/open-peer-review.md) | Review, ReviewPassageLink, AuthorResponse |
| DOI Record ERD | `erDiagram` | [DOI & External Publication](../domains/labs/subdomains/doi-external-publication.md) | DOIRecord |

---

## Cross-Cutting Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| Authentication Flow | `sequenceDiagram` | [Security Architecture](../cross-cutting/security/ARCHITECTURE.md#authentication-flow) | API gateway → Identity → Domain service |
| Causal Chain Tracking | `graph LR` | [Observability Architecture](../cross-cutting/observability/ARCHITECTURE.md#causal-chain-tracking) | Event causation_id / correlation_id linkage |
| Nostr Anchoring Resilience | `sequenceDiagram` | [Resilience Architecture](../cross-cutting/resilience/ARCHITECTURE.md#nostr-anchoring-resilience) | Async anchoring with retry queue |

---

## Platform Diagrams

| Diagram Name | Type | Location | Description |
|-------------|------|----------|-------------|
| Web Application Routing | `graph TB` | [Web Application Architecture](../platform/web-application/ARCHITECTURE.md#high-level-diagram) | Route prefixes, pillar apps, auth provider |
| REST API Gateway | `graph TB` | [REST API Architecture](../platform/rest-api/ARCHITECTURE.md#high-level-diagram) | Middleware layers, domain routing |
| Background Services Topology | `graph TB` | [Background Services Architecture](../platform/background-services/ARCHITECTURE.md#high-level-diagram) | Kafka topics → consumer workers |
| Embedded IDE Architecture | `graph TB` | [Embedded IDE Architecture](../platform/embedded-ide/ARCHITECTURE.md#high-level-diagram) | Monaco, session manager, container provisioner |
| Container Lifecycle | `stateDiagram-v2` | [Embedded IDE Architecture](../platform/embedded-ide/ARCHITECTURE.md#container-lifecycle) | Creating→Active→Suspended→Terminated |
| Institutional Site Data Flow | `graph TB` | [Institutional Site Architecture](../platform/institutional-site/ARCHITECTURE.md#high-level-diagram) | Read-only data flow from DIP, Platform Core, Labs |

---

## Diagram Count Summary

| Category | Count |
|----------|-------|
| System Context & Relationships | 4 |
| Platform Core | 8 |
| Identity | 3 |
| DIP | 11 |
| AI Agents | 5 |
| Learn | 9 |
| Hub | 9 |
| Labs | 9 |
| Cross-Cutting | 3 |
| Platform | 7 |
| **Total** | **68** |
