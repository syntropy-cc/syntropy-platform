# Architecture Changelog

All notable architectural changes to the Syntropy Ecosystem are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) principles, adapted for architecture documents.

---

## [Unreleased]

*(No unreleased changes at this time — all current decisions are documented below.)*

---

## [1.0.0] — 2026-03-12

### Added — Initial Architecture Generation (Prompt 01-B)

This release represents the initial generation of all architecture documents for the Syntropy Ecosystem, produced from the confirmed Architecture Brief (Quality Score: 55/55, Vision Document v1.0).

#### Root Architecture

- `docs/architecture/ARCHITECTURE.md` — System context diagram, domain overview, context map with 10 integration patterns, entity ownership hierarchy, modular monolith layer structure, technology radar, system-wide principles, navigation guide

#### Domain Architecture Documents (12)

- `domains/platform-core/ARCHITECTURE.md` — Core Domain; event bus, portfolio aggregation, search & recommendation
- `domains/identity/ARCHITECTURE.md` — Generic Subdomain; Supabase Auth ACL + custom RBAC
- `domains/digital-institutions-protocol/ARCHITECTURE.md` — Core Domain; 6 subdomains; DIP as single source of truth for fundamental entities
- `domains/ai-agents/ARCHITECTURE.md` — Core (orchestration) / Supporting (agents); unified UserContextModel
- `domains/learn/ARCHITECTURE.md` — Core Domain; Problem→Theory→Artifact invariant; 4 subdomains
- `domains/hub/ARCHITECTURE.md` — Core Domain; Issue/Contribution/HackinDimension; 3 subdomains
- `domains/labs/ARCHITECTURE.md` — Core Domain; open scientific research; 5 subdomains
- `domains/sponsorship/ARCHITECTURE.md` — Supporting Subdomain; voluntary monetization; Stripe ACL
- `domains/communication/ARCHITECTURE.md` — Supporting Subdomain; anchored forums; Conformist pattern
- `domains/planning/ARCHITECTURE.md` — Supporting Subdomain; cross-pillar planning; vocabulary adaptation
- `domains/ide/ARCHITECTURE.md` — Supporting Subdomain; Monaco/VS Code; container lifecycle; DIP artifact publish bridge
- `domains/governance-moderation/ARCHITECTURE.md` — Supporting Subdomain; platform moderation policies; role policy events

#### Subdomain Architecture Documents (24)

**Platform Core (3)**:
- `domains/platform-core/subdomains/event-bus-audit.md` — EventSchema Registry, AppendOnlyLog, two-level signing hierarchy
- `domains/platform-core/subdomains/portfolio-aggregation.md` — Portfolio, XP, achievements, gamification
- `domains/platform-core/subdomains/search-recommendation.md` — Cross-pillar search and recommendation engine

**Digital Institutions Protocol (6)**:
- `domains/digital-institutions-protocol/subdomains/artifact-registry.md` — Artifact lifecycle, Nostr anchoring
- `domains/digital-institutions-protocol/subdomains/iacp-engine.md` — 4-phase protocol, no-skip invariant
- `domains/digital-institutions-protocol/subdomains/smart-contract-engine.md` — Deterministic contract evaluation
- `domains/digital-institutions-protocol/subdomains/project-manifest-dag.md` — Dependency DAG, acyclicity invariant
- `domains/digital-institutions-protocol/subdomains/institutional-governance.md` — Chamber system, LegitimacyChain, Proposal lifecycle
- `domains/digital-institutions-protocol/subdomains/value-distribution-treasury.md` — AVU computation, oracle liquidation

**AI Agents (3)**:
- `domains/ai-agents/subdomains/orchestration-context-engine.md` — UserContextModel, session routing, memory
- `domains/ai-agents/subdomains/agent-registry-tool-layer.md` — AIAgent definitions, ToolScope, discovery
- `domains/ai-agents/subdomains/pillar-agents.md` — 5 Learn + 3 Hub + 3 Labs + 1 Cross-Pillar agents

**Learn (4)**:
- `domains/learn/subdomains/content-hierarchy-navigation.md` — Career→Track→Course, fog-of-war
- `domains/learn/subdomains/fragment-artifact-engine.md` — Problem→Theory→Artifact, CollectibleDefinition
- `domains/learn/subdomains/creator-tools-copilot.md` — 5-phase AI authoring workflow
- `domains/learn/subdomains/mentorship-community.md` — MentorshipRelationship lifecycle, ArtifactGallery

**Hub (3)**:
- `domains/hub/subdomains/collaboration-layer.md` — Issue/Contribution/HackinDimension lifecycles
- `domains/hub/subdomains/institution-orchestration.md` — ContractTemplates, InstitutionProfile
- `domains/hub/subdomains/public-square.md` — DiscoveryIndex read model

**Labs (5)**:
- `domains/labs/subdomains/scientific-context-extension.md` — ResearchMethodology, HypothesisRecord, SubjectArea
- `domains/labs/subdomains/article-editor.md` — MyST+LaTeX, EmbeddedArtifact, immutable versioning
- `domains/labs/subdomains/experiment-design.md` — ExperimentDesign, IDE delegation, anonymization
- `domains/labs/subdomains/open-peer-review.md` — Review lifecycle, reputation filtering, AuthorResponse
- `domains/labs/subdomains/doi-external-publication.md` — DOIRecord, DataCite/CrossRef integration

#### Cross-Cutting Concern Documents (4)

- `cross-cutting/security/ARCHITECTURE.md` — Data classification, encryption standards, compliance (GDPR/LGPD/CCPA), cryptographic key management
- `cross-cutting/observability/ARCHITECTURE.md` — Structured logging, distributed tracing, causal chain tracking, compliance audit logs
- `cross-cutting/data-integrity/ARCHITECTURE.md` — Three-layer immutability (Nostr, AppendOnlyLog, soft-delete), consistency policies
- `cross-cutting/resilience/ARCHITECTURE.md` — Availability targets, circuit breakers, retry policies, DLQ, graceful degradation

#### Platform Service Documents (5)

- `platform/web-application/ARCHITECTURE.md` — Next.js App Router, routing structure, design system, WCAG 2.1 AA
- `platform/rest-api/ARCHITECTURE.md` — API gateway, versioning, response envelope, rate limiting
- `platform/background-services/ARCHITECTURE.md` — Kafka topic topology, 7 worker types, DLQ handling
- `platform/embedded-ide/ARCHITECTURE.md` — Monaco/VS Code, container lifecycle, resource quotas, artifact publish bridge
- `platform/institutional-site/ARCHITECTURE.md` — Public read layer, SSG/ISR, data read map

#### Infrastructure Documents (2)

- `diagrams/README.md` — Index of all 68 diagrams across architecture documents
- `evolution/CHANGELOG.md` — This file; architecture evolution history

---

### Decisions Pending (Prompt 01-C)

The following ADRs are referenced throughout the architecture documents but will be formally created in Prompt 01-C:

| ADR | Subject |
|-----|---------|
| ADR-001 | Modular monolith; Turborepo + pnpm workspaces; event bus + APIs only for cross-context communication |
| ADR-002 | Message broker selection (Kafka vs alternatives) |
| ADR-003 | Artifact identity anchoring via Nostr relays |
| ADR-004 | Supabase / PostgreSQL as primary data store |
| ADR-005 | Supabase Auth + custom RBAC layer |
| ADR-006 | LLM API integration; agent registry; AI-generated content marking |
| ADR-007 | Monaco Editor / VS Code; container orchestration strategy |
| ADR-008 | MyST Markdown + LaTeX for scientific writing |
| ADR-009 | AVU accounting model; no platform tokens; oracle liquidation |
| ADR-010 | Two-level event signing hierarchy; Event Schema Registry as versioned inter-domain contract |

---

### Architecture Principles Established

1. **Domain Autonomy** — no direct cross-domain database access; event bus or versioned API only
2. **DIP as Single Source of Truth** — all fundamental entities (Artifact, DigitalProject, DigitalInstitution) owned by DIP
3. **Three-Layer Immutability** — Nostr (DIP protocol events), AppendOnlyLog (ecosystem events), soft-delete (domain entities)
4. **ACL at Every Core Domain Boundary** — external model vocabulary never leaks into Core Domains
5. **Event Schema Registry as Inter-Domain Contract** — Published Language for all domain communications
6. **Observability by Default** — structured logs + causal chain IDs + distributed tracing in every domain

---

### Source Documents

- Vision Document: `docs/vision/VISION.md` (Quality Score: 55/55)
- Architecture Brief: `docs/context/architecture-brief.md` (Status: Active)
- Framework: `.cursor/FRAMEWORK.md` (Vision-to-System Framework, Prompt 01-B)
