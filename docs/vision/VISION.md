# Syntropy Ecosystem — Vision Document

> **Document Type**: Vision Document (Consolidated — Ecosystem)
> **Author**: José Eugênio
> **Created**: 2026-03-12
> **Last Updated**: 2026-03-12
> **Status**: Draft
> **Source documents**: `syntropy-platform-vision.md`, `syntropy-institution-protocol.md`, `syntropy-learn-vision.md`, `syntropy-hub-vision.md`, `syntropy-labs-vision.md`

---

## How to Read This Document

This document consolidates the complete vision of the Syntropy ecosystem into the standard 12-section format required for architecture generation. It covers the Platform (cross-cutting foundation layer) and the three pillars (Learn, Hub, Labs) as a unified whole.

The ecosystem has three pillars:
- **Syntropy Learn** — project-first education
- **Syntropy Hub** — digital institution creation, collaboration, and project management
- **Syntropy Labs** — open, decentralized scientific research

And one shared foundation layer:
- **Syntropy Platform** — the shared platform that unifies the three pillars (authentication, portfolio, event bus, IDE, gamification, AI agents, search, and the Digital Institutions Protocol)

> **Note on the Cooperative Grid**: The Cooperative Grid is a future computational infrastructure layer for the ecosystem — a cooperative network of decentralized nodes that will eventually power IDE sessions, experiments, and platform workloads. It is **out of scope for this repository**. It will be built as a separate project with its own repository, vision document, and architecture. For now, and for all current implementation decisions, the platform runs on conventional cloud infrastructure (own server, AWS, GCP, or equivalent).

The five source documents are preserved in `docs/vision/` as authoritative references for domain depth. This consolidated document is the architectural briefing optimized for architecture generation.

---

## 1. Problem Statement

### The Ecosystem-Wide Problem

Learning, building, and researching are deeply interconnected activities — yet the tools that support them are fragmented. A developer who just learned a technique must leave their learning platform to apply it. A researcher who validates a hypothesis has no natural path to turn it into an educational resource or an open source project. A student who completes a course has no frictionless way to contribute that knowledge to a real project.

This fragmentation has concrete costs. Knowledge sits idle because there is no bridge between learning and application. Open source maintainers receive contributions from people who lack the context to contribute effectively. Researchers publish findings that never reach practitioners. Students learn in isolation and carry the social cost of online learning — disengagement, lack of accountability, and absence of community.

The cost of leaving things as they are is compounding: each isolated tool deepens the silos, and people who could be building together instead build alone, learn alone, and research alone.

Beyond the fragmentation, there is a deeper problem: creators have no native way to own what they produce or to be recognized for it over time. A developer who writes a library used by thousands receives no attribution when that library is embedded in a commercial product. A teacher whose curriculum structures an entire learning path earns nothing after the initial publication. The current ecosystem treats creation as a one-time transaction — create, publish, and let go — rather than as a continuous relationship between a creator and their work.

### The Education Problem (Learn)

Traditional education produces people who have studied a subject — not people who have built something with it. A computer science graduate spends four years studying algorithms and software engineering, then exits without a single project of real-world consequence in their portfolio. The gap between academic knowledge and demonstrable capability is left for the individual to bridge on their own.

That gap is now closing — in the wrong direction. The rise of AI-assisted development has made senior professionals dramatically more productive, compressing work that previously required a team of junior developers. The consequence is structural: junior positions are disappearing. Traditional education cannot adapt because its fundamental design has not changed: attend classes, complete assessments, receive a credential, find a job. The credential was always a proxy for capability. Now the market is calling that proxy's bluff.

The problem is not that people lack access to information. Tutorials, courses, and documentation are abundant. The problem is that none of these formats are designed to produce someone who can build something. They are designed to produce someone who has been taught something.

### The Collaboration Problem (Hub)

Collaboration in digital projects is fundamentally broken. Not for lack of tools — for lack of structure. A developer who wants to collaborate with an open source project faces a sequence of non-technical obstacles: they do not know who makes decisions, do not understand how the project is funded, have no clarity about what happens to the value they generate for others, and there is no mechanism that recognizes their contribution in a verifiable, lasting way.

On the other side, whoever creates a project or digital organization faces a different fragmentation: GitHub for code, Notion for documentation, Slack for communication, Figma for design, Stripe for payments, ad hoc tools for governance — and none of these systems communicate coherently. The organization exists in practice but does not exist anywhere as a unified entity with identity, contracts, decision history, and value distribution mechanisms.

The deepest problem is that there is no place today where a digital institution can exist as a complete entity: with its artifacts, governance contracts, contributor structure, decision history, projects, and value distribution mechanisms — all in one place, all verifiable, all executable without depending on external legal infrastructure.

### The Science Problem (Labs)

Contemporary science faces a set of structural problems that reinforce each other. The result is a scientific system that, despite producing knowledge of enormous value, does so in an opaque, centralized, and inaccessible way.

**Centralization of scientific publishing.** The validation and dissemination of scientific knowledge depends almost entirely on academic journals controlled by a few private publishers. Publishing requires submission to closed processes, high publication fees (APCs can exceed USD 10,000 per article), and acceptance of licenses that transfer copyright from researchers to publishers.

**Lack of transparency and reproducibility.** The vast majority of scientific articles publish only results — the code that generated the analyses, complete datasets, simulation scripts, and experiment parameters rarely accompany the text. Studies estimate that more than 50% of published results in areas like psychology, medicine, and social sciences are not reproducible.

**Limited and opaque peer review.** The current system is conducted by two or three anonymous reviewers without any public visibility into the process. There is no way to know if a reviewer has a conflict of interest, what their real expertise is, or if their criticism was considered by the authors.

**Barriers for new researchers.** Starting a scientific career requires institutional affiliation. Without it, there is no access to bibliographic databases, no way to submit articles to relevant journals, and no way to formally participate in scientific collaborations.

### Current Solutions and Their Inadequacies

| Solution | Problem Addressed | Inadequacy |
|---|---|---|
| Learning platforms (Coursera, Udemy) | Access to structured courses | Disconnected from real projects; certificates measure completion, not capability |
| Code collaboration (GitHub, GitLab) | Project collaboration | No educational layer; no guided pathways; no governance or value distribution |
| Academic publishing (ArXiv, journals) | Research dissemination | Disconnected from engineering practice; closed or expensive; no interactive artifacts |
| Portfolio platforms (LinkedIn) | Career visibility | Require manual curation; rely on self-reporting; cannot verify claims |
| DAOs and governance platforms | Decentralized governance | Not designed for knowledge creation context; separated from the work itself |
| Bootcamps | Practice-oriented learning | Narrow specialists; not sustainable for most; do not scale to other domains |
| Open Journal Systems | Open publication | No executable artifacts; no sophisticated reputation system; no cross-pillar connection |

---

## 2. Ideal Future

### The Unified Ecosystem

The Syntropy Platform is a unified ecosystem where learning, building, and researching are not three separate activities but one continuous journey. A student completes a learning fragment and immediately sees open issues in real projects that their new artifact can solve. A contributor hits a wall on a complex problem and is shown exactly which fragment contains the knowledge needed to resolve it. A researcher validates a technique in Labs and can translate it into a Hub project and a Learn track within the same ecosystem.

Every action leaves a verifiable trace. A user's portfolio builds itself — not from what they claim to have done, but from what the ecosystem recorded. Reputation is earned through genuine contribution to others, not through consumption. The more a person helps others learn, build, and research, the more the ecosystem recognizes and rewards them.

### Creators Own What They Produce

Creators own what they produce. A teacher who writes a learning module retains authorship of that module as a verifiable artifact — not as a claim, but as a cryptographic record. A developer whose library is used by projects across the ecosystem receives attribution and, if they so choose, ongoing value based on that usage. Institutions — research groups, educational programs, open source projects — can be governed transparently, with their governance terms publicly readable and their decision histories auditable by anyone.

### Learning by Building (Learn)

Someone with zero professional experience joins Syntropy Learn and is immediately building something — not planning to build something after they finish learning, but actually building, from the first fragment. They follow a track organized not as a curriculum of subjects but as a construction plan for a real project. Every fragment they complete adds a piece to that project. By the end of the track, they have something that exists in the world: a software product, a research document, a business model, a designed artifact — whatever the domain requires.

The proof of competence is the project — not the certificate, not the course completion badge. The record is automatic and verifiable, built by the ecosystem as the learner participates, not assembled retrospectively by the learner themselves. The transition from learning to contributing is invisible.

### Institutions That Really Exist (Hub)

Someone who wants to create an organization to develop a project — whether software, a research laboratory, an educational program, or a collaborative product — goes to the Hub and creates an institution. They define founding members, how decisions are made, how value generated by projects is distributed among contributors, and what conditions allow new members to participate. All of this is encoded in contracts that execute automatically, are public for anyone who needs to read them before contributing, and create a permanent, verifiable record of every decision the institution made.

When a research result validated in Labs becomes a project in the Hub, the connection between the two is automatic and traceable. When an artifact created in Learn is contributed to a Hub project, the original creator's authorship is preserved and recognized.

### Science That Is More Rigorous and Accessible (Labs)

Any person with genuine scientific curiosity — whether a researcher at a renowned university, a professional with a relevant hypothesis, or a student without formal affiliation — can participate in the scientific process in a structured, transparent, and recognized way.

A researcher opens Labs and creates a laboratory. In minutes, they have a functional scientific institution: with identity, research area, governance defined by smart contract, and the capacity to receive collaborators. They start a research line, formulate hypotheses, run experiments (which can be executable artifacts running in browser-based containers), collect data (stored as datasets, also artifacts), write the article in MyST or LaTeX directly on the platform, and see the rendering in real time.

When the article is ready for review, they publish it. From that moment, anyone in the ecosystem can read and review it. Reviews are linked to specific passages, are public, and carry the reviewer's reputation profile. The result is science that is simultaneously more rigorous, more accessible, more collaborative, and more connected to the world.

### Intelligent Assistance Throughout

Intelligent assistants are embedded throughout the journey. A student struggling with a specific artifact gets guidance calibrated to exactly what they have already built and learned. A teacher designing a new track has an AI collaborator who understands the pedagogical structure. A researcher conducting a literature review has an agent that searches not only external publications but the ecosystem's own body of knowledge — connecting scientific results in Labs to implementations in Hub and learning materials in Learn. These assistants are useful precisely because they share a unified model of the user and the ecosystem.

### Cooperative Infrastructure (Future Vision)

The ecosystem is designed to eventually run on a cooperative computational grid — a network of nodes contributed by community members who exchange credits: hosting someone else's application earns credits; running your own application spends them. This grid will reduce infrastructure costs, make the ecosystem self-sustaining, and turn participation into infrastructure ownership.

The Cooperative Grid is a separate project with its own repository and its own implementation timeline. It is not part of the Syntropy Platform repository. In the current phase, all workloads — IDE sessions, experiment execution, platform services — run on conventional cloud infrastructure. The Platform architecture is designed to be grid-agnostic: when the Grid matures, the migration path exists, but no current decision depends on it.

---

## 3. Users and Actors

Syntropy is a single integrated ecosystem. Its users are not categorically different people using separate products — they are participants in the same environment who naturally gravitate toward different activities at different moments. A person who today is primarily learning may tomorrow be building a project and the day after contributing to a research hypothesis. The roles below describe activity patterns, not distinct user types. A single user will often hold several of these roles simultaneously.

### Core Roles Table

| Role | Description | Primary Need | Frequency | Technical Level |
|------|-------------|--------------|-----------|-----------------|
| Learner | A user primarily engaged in following tracks, building artifacts, and developing a project in Learn | Follow a track, build their own project, apply artifacts immediately to real work | Daily | Non-technical to Technical |
| Builder / Contributor | A user primarily engaged in creating or contributing to projects through Hub | Collaborate on projects, resolve issues, contribute artifacts, get recognized verifiably | Daily | Technical |
| Researcher | A user primarily engaged in scientific investigation through Labs | Publish hypotheses and results, share datasets, conduct reproducible experiments, collaborate with peers | Daily to Weekly | Technical to Expert |
| Content Creator / Track Creator | A curated educator or practitioner who designs tracks, courses, and fragments for others | Build pedagogically sound content around a real reference project; reach learners; monetize or share freely | Weekly | Technical to Expert |
| Mentor | An experienced user who guides others through their trajectory in the ecosystem | Support mentees' project development, unblock difficulties, provide direction; rewards scale with mentee outcomes | Weekly | Technical |
| Institution Founder | A user who creates and configures a digital institution with its contracts, governance, and project structure | Create an institution with governance that reflects their vision, define contracts, structure initial projects | Occasional (creation) / Daily (management) | Technical to Expert |
| Scientific Reviewer | Any ecosystem member who reads and reviews published articles in Labs | Find articles relevant to their area, make structured reviews, have contributions recognized in the reputation system | On demand | Varied |
| Sponsor / Patron | A user who financially supports creators, maintainers, or researchers | Discover impactful contributors and direct financial support to those generating real value | On demand | Non-technical |
| Administrator / Moderator | A user responsible for platform health, content quality, and governance | Moderate content, manage roles, enforce policies transparently, curate quality standards | Daily | Admin |

### Role Narratives

**Learner**: The primary goal is to learn by doing. Users in this role need a clear starting point (career and track selection, aided by an onboarding assistant), a structured path that continuously produces something real, and a community that creates accountability without pressure. A learner who does not have a project idea yet must still find an immediate path to action — the platform must eliminate the paralysis of the blank page. Success means the learner has a project they are proud of, a portfolio that reflects their work, and a natural next step: continuing to learn, contributing to Hub projects, or mentoring someone else.

**Builder / Contributor**: The user already has skills and wants to apply them in meaningful projects. Common frustrations in typical open source — unclear contribution paths, lack of context, no recognition — are addressed by the ecosystem's integrated learn-to-contribute pathway. Success means getting contributions accepted, resolving meaningful issues, and being part of a project community that feeds back into learning and research. If the project defines value distribution, the contributor participates in it proportional to their contribution.

**Researcher**: The researcher's main frustration with the current system is fragmentation: LaTeX in one editor, data on Google Drive, code on GitHub, review by email, and publication in a separate system from all others. In Labs, all of this lives in a single integrated place. Success means completing the full research cycle — from hypothesis to published, peer-reviewed article — with all artifacts verifiable, all versions public, and the results connected to the rest of the ecosystem.

**Content Creator / Track Creator**: Track creators are not lecturers who record videos. They are practitioners who design a learning journey organized entirely around project construction. Their primary output is a reference project — a complete, real example of what the track produces — and the sequence of fragments that teaches a learner to build something equivalent. Success means learners completing their tracks with projects of real consequence and receiving ongoing value from the community that uses their content.

**Institution Founder**: The founder takes constitutive decisions — what type of governance the institution will have, how contributors will be remunerated, which projects will be public, which will be private. The Hub makes these decisions accessible without trivializing them. Templates reduce friction for common cases, but the founder must understand what they are creating. Success means an institution with contracts that reflect their vision, projects that attract contributors, and a record that grows automatically with each ecosystem action.

**Scientific Reviewer**: Particularly important for the Labs mission: this actor represents anyone who has genuine scientific interest but may not have access to the traditional academic system. Labs must be welcoming to them — they should be able to read articles, understand basic concepts (with support from Learn tracks suggested by the system), make reviews that are taken seriously as they build reputation, and eventually be recognized as a legitimate collaborator.

---

## 4. Interface and Interaction Preferences

### Delivery Interfaces

- [x] **Web Application** — The primary interface for all users across all three pillars and platform services. Desktop-first with mobile-responsive support. Used for all three pillars (Learn, Hub, Labs), the portfolio, planning, communication, and sponsorship. Requires login for contributions; public-facing content (institutional site, published articles, public projects) is accessible without login. The scientific writing interface (Labs) is optimized for desktop.
- [x] **REST API** — Developer-facing API exposing platform capabilities for integrations, external tooling, and cross-pillar communication. Also used for external indexing (DOIs, bibliographic databases for Labs).
- [x] **Dashboard / Admin Interface** — Used by administrators and moderators for content moderation, role management, governance, and ecosystem health monitoring.
- [x] **Background Service / Worker** — The event bus operates as a background service capturing all user actions across all pillars and feeding the dynamic portfolio, gamification engine, recommendation engine, and notification system. Also handles: article rendering (MyST/LaTeX), experiment execution, DOI generation, reputation metric computation.
- [x] **Embedded / SDK** — The integrated development environment (IDE) embedded within the platform serves all three pillars without requiring users to leave the platform. Used for: writing and running code artifacts (Learn, Hub), writing scientific articles (Labs), running experiments (Labs). Published experiments are embeddable via public link in external contexts.

### Interaction Style

- [x] **Self-service** — Users accomplish tasks independently: following tracks, contributing to projects, publishing research, managing their planning board, creating institutions.
- [x] **Guided / Wizard-driven** — Onboarding flows (career discovery assistant, placement quiz, mentor matching), institution creation with template selection, first-time article submission, governance configuration.
- [x] **Power-user / Expert-first** — The Hub and Labs are designed for experienced contributors. The development environment and project management tools offer depth and composability. Researchers using MyST/LaTeX expect expert-level tooling.
- [x] **Collaborative** — Multiple users contribute to shared projects, research lines, and educational content simultaneously. The social layer is built around shared artifacts and projects.
- [x] **Automated / Headless** — The event bus, portfolio aggregation, gamification, recommendation engine, and value distribution operate without human intervention during normal use.

### Accessibility Requirements

The web application must follow WCAG 2.1 AA standards. As a platform with educational and professional goals — including users who may be younger or in underserved communities — accessibility is a baseline requirement. Color alone must never be used to convey status in gamification elements, progress indicators, governance state, or notifications. Icons and text labels must accompany all color-coded indicators.

The visual design system is unified across the entire ecosystem. All three pillars share a common design language — the same base palette, typography, component library, and interaction patterns. Each pillar carries small contextual adjustments:
- **Learn**: emphasizes readability, progression clarity, and the spatial exploration metaphor
- **Hub**: emphasizes information density and developer familiarity
- **Labs**: emphasizes structured documentation and academic precision

These are variations of the ecosystem's unified design language, not separate design systems. A user navigating across pillars should experience one coherent product.

---

## 5. System Components and Subsystem Visions

### Component 0: Syntropy Platform (Cross-Cutting Foundation)

**Type**: Background Service + Web App + Protocol Layer

**Primary users**: All authenticated users (transparent for most); visible as portfolio, gamification, search, IDE, and institutional site

**Purpose in one sentence**: Provide the shared platform services and foundational protocols that make the three pillars a coherent ecosystem rather than three disconnected products — including authentication, event bus, dynamic portfolio, gamification, IDE, search, AI agents, and the Digital Institutions Protocol.

**Design character**: Operates transparently for most users — the student who publishes an artifact should not need to understand the event bus to benefit from it. Platform components that are user-visible (portfolio, institutional site, gamification) should feel like a living ecosystem — not a dashboard. The platform layer should feel invisible until you need it, and then be exactly what you need.

**Key design principles**:
- Automatic over manual: the portfolio builds itself; no user should ever need to manually curate their contributions
- One login, full access: authentication grants access to all pillars without friction
- Everything is an artifact: all outputs from all pillars are artifacts under the same model, enabling automatic cross-pillar attribution and value flow
- Platform owns cross-cutting concerns: gamification, reputation, portfolio, search — pillars emit events, Platform transforms them

**What success looks like**: Users share their Syntropy portfolio instead of a LinkedIn profile. A viewer understands what someone has built, taught, researched, and contributed — and trusts that it is accurate. The three pillars feel like one product, not three separate applications with a login system.

#### Sub-component 0.1: Institutional Site

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Ecosystem Overview | Explain the three pillars and how they integrate | Pillar, Journey, Integration | Language must be accessible to non-technical visitors |
| Live Metrics Dashboard | Show real-time ecosystem activity | Active projects, students enrolled, artifacts published, contributors | Metrics auto-refreshed from event bus; read-only |
| Visitor Routing | Guide each visitor type to the right entry point | Visitor profile, Recommended entry point | Routing based on self-identified role, not gating |

#### Sub-component 0.2: Dynamic Portfolio

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Activity Record | Capture and display every meaningful action across pillars | Event, Contribution, Artifact, Pillar source | Events are immutable once recorded; no manual editing allowed |
| Gamification Layer | Express progression and identity through contribution-driven game mechanics | XP, Level, Virtual currency, Achievement, Title, Collectible, Avatar | Advancement is driven exclusively by contribution, never by consumption |
| Skill Graph | Display demonstrated competencies derived from actual artifacts | Skill, Proficiency signal, Artifact evidence | Skills are inferred from artifacts produced, not from self-declaration |
| Reputation System | Reflect how the community values a user's contributions | Reputation score, Peer recognition, Mentor history, Scientific expertise (by area) | Reputation is a function of community impact, not platform seniority |

#### Sub-component 0.3: Development Environment (IDE)

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Code Editor | Full-featured editing for all pillar contexts | Session, Workspace, Language server | Context-aware defaults per pillar; not a generic editor |
| Container Orchestration | Provision and manage isolated execution environments | Container, Session, Resource quota | Each session is isolated; resources sourced from cloud infrastructure (Docker / Kubernetes) |
| Artifact Publisher | Publish completed artifacts from within the environment | Artifact, Publication event, Community gallery | Publication triggers an event bus event; artifact enters the protocol layer upon publication |

#### Sub-component 0.4: Sponsorship and Monetization System

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Voluntary Sponsorship | Enable community members to financially support creators | Sponsorship, Patron, Recurring contribution | Sponsorship never gates content access — it is purely voluntary |
| Creator Monetization | Allow creators to offer paid or restricted access to their work | Paid access, Access policy, Price, Audience restriction | Creator autonomy: the platform enforces the access policy but does not set or recommend pricing |
| Impact Discovery | Surface creators based on verified contribution metrics | Impact metrics, Contributor profile, Verification | Metrics derived from event bus data, never from self-reporting |

#### Sub-component 0.5: Authentication System

No sub-components — this component is a single cohesive area. Its scope is authentication, session management, and RBAC enforcement. Identity claims about artifacts and authorship (cryptographic provenance) are handled by the Digital Institutions Protocol (Component 0.10), not here.

One login grants access to all pillars. Multi-method support: email/password and OAuth (GitHub, Google). RBAC enforced consistently across the entire ecosystem. Role transitions (e.g., becoming a mentor) are reflected immediately across the platform.

#### Sub-component 0.6: Communication System

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Contextualized Forums | Anchor discussions to specific artifacts, projects, or experiments | Thread, Reply, Helpful mark, Context anchor | Every thread has a parent context; orphan threads (no anchor) are not permitted |
| Direct Messaging | Enable private communication between users | Message, Conversation, Read receipt | Mentor-mentee conversations surfaced in the planning component |
| Activity Feed | Show community progress in real time | Event, Contribution signal, Feed filter | Populated by event bus; no algorithmic amplification — chronological by default |
| Notification System | Alert users to relevant events | Notification, Type, Channel (in-app / email), Preference | Opt-out for high-signal events; opt-in for lower-signal ones |

#### Sub-component 0.7: Unified Search and Recommendation

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Search Index | Index all pillar content retrievable from a single query | Index, Query, Result, Pillar filter | Updated in near-real-time from event bus; cross-pillar by default |
| Recommendation Engine | Proactively surface relevant opportunities based on recent activity | Recommendation, Signal, Context match | Triggered by events (fragment completion, PR merged, article published), not by periodic batch |

#### Sub-component 0.8: Governance and Administration

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Content Moderation | Review and act on flagged content across all pillars | Flag, Review, Moderation action, Policy | Policies are versioned and publicly readable; actions reference the policy version that authorized them |
| Role Management | Assign, revoke, and audit roles across the ecosystem | Role, Permission set, Audit log | Role transitions are events on the event bus; revocations take effect immediately |
| Community Governance | Enable community participation in platform policy decisions | Proposal, Discussion, Voting, Policy amendment | Platform-level governance is distinct from institutional governance (Component 0.10) |

#### Sub-component 0.9: Planning and Management

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Personal Planning Board | Manage tasks and goals across all pillars in a single view | Task, Goal, Kanban column, Sprint, Study plan | Vocabulary adapts per pillar context (Task = Fragment in Learn / Issue in Hub / Research step in Labs) |
| Mentor Coordination | Support the mentorship relationship with shared visibility into mentee progress | Mentee, Progress snapshot, Session note | Mentors see only what mentees explicitly share; no automatic visibility into private planning |

#### Sub-component 0.10: Digital Institutions Protocol

**Design character**: Operates transparently for most users — the student who publishes an artifact does not need to understand the protocol to benefit from authorship attribution. For maintainers and advanced creators, the contract configuration and governance layer must be accessible, unambiguous, and well-documented. This protocol is to the Hub what Git is to GitHub — the substrate that makes ownership and collaboration possible, without requiring every user to understand its internals.

**Key design principles**:
- Real ownership: authorship is cryptographically bound to the creator and verifiable without a central authority
- Configurable, not prescribed governance: the protocol provides primitives; each institution defines its own rules
- Usage-based attribution: distributed value reflects actual artifact usage
- Separation of content and contract: updating an artifact does not force renegotiation of contracts with all dependents
- Open type system: the artifact type registry is extensible; no fixed enumeration limits what the ecosystem can represent

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Artifact Registry | Manage the lifecycle of artifacts: publication, versioning, identity anchoring | Artifact, Identity Record (pk_author, content hash, signature, version lineage), Nostr event | Identity records are immutable once anchored; contracts bind to the artifact entity, not individual versions |
| IACP (Inter-Artifact Communication Protocol) | Govern all interactions between artifacts through a four-phase protocol | Phase 1 (Identification), Phase 2 (Contract Negotiation + Usage Agreement Event), Phase 3 (Utilization), Phase 4 (Usage Registration) | Every authorized interaction generates a signed Usage Agreement Event that feeds the dependency graph; the graph is emergent, not declared; no phase may be skipped |
| Smart Contract Engine | Execute and enforce utilization conditions associated with each artifact | Smart contract `C: Request × State → {permitted, denied} × State'`, Utilization mode, State transition | Contracts are deterministic functions; no probabilistic or human-mediated enforcement |
| Project Manifest | Declare and manage the composition of internal and external artifacts within a project | Internal artifact (contract ≤ permissive than project contract), External artifact (must have Usage Agreement Event), Dependency Graph (DAG) | DAG is always acyclic; cycle prevention enforced by depth-first reachability check on every IACP Phase 2 event |
| Institutional Governance | Manage the expressive governance of digital institutions: roles, chambers, deliberation, legitimacy chain | Role, Chamber (Electorate, Scope, Quorum, Approval threshold), Deliberation Protocol (Draft→Discussion→Voting→Approved/Rejected→Contested→Executed), Tier set (Ω), Change Classification Function (δ), Legitimacy Chain | Every state transition is authorized by contracts in force at proposal time; legitimacy chain is publicly auditable; right of exit is mandatory in every governance contract |
| Value Distribution and Treasury | Receive incoming value, compute AVU-based distributions, execute liquidations | Abstract Value Unit (AVU, dimensionless, no speculative value), Treasury, Monetization Protocol (static/dynamic/hybrid weights), Liquidation Trigger, Oracle | AVUs have no intrinsic speculative value; currency conversion occurs only at liquidation via oracle; all value computation operates in AVUs; nothing is created or destroyed (I4) |

**Key Invariants of the Digital Institutions Protocol** (must be preserved in all architecture decisions):

| Invariant | Description |
|---|---|
| I1 — DAG Acyclicity | The dependency graph is always a DAG; enforced by pre-insertion depth-first reachability check on every IACP Phase 2 event |
| I2 — Contract Compatibility | A project cannot add an external artifact to its manifesto if the external artifact's contract is incompatible with the project's governance contract |
| I3 — Internal Contract Specialization | An internal artifact's contract cannot be more permissive than the project's governance contract; it may add restrictions but cannot relax project-level constraints |
| I4 — Value Conservation | Total AVUs distributed to creators + operational costs + external forwarding = total incoming AVUs |
| I5 — Versioning/Contract Binding | Contracts are bound to artifact entities, not individual versions; content updates do not require downstream renegotiation |
| I6 — AVU Exclusivity | No component of distribution logic operates in concrete currencies; conversion occurs only at treasury entry (inbound) and liquidation (outbound) via oracle |
| I7 — Legitimacy Chain Completeness | No institutional state can be reached except through the deliberation protocol; every state transition is a signed, anchored execution event |
| I8 — Governance Transparency | All governance contracts are publicly readable; no institution may deny a potential contributor access to its governance terms before participation |
| I9 — Right of Exit | Every governance contract must define a right of exit; its specific terms are configurable but its absence is not permitted |
| I10 — Conservative Default | When a governance contract does not specify tier assignment for a proposed change, the system applies the highest tier with unanimity |

#### Sub-component 0.11: AI Agent System

**Key design principles**:
- Unified context over siloed assistants: agents derive their value from the shared user model — portfolio, event history, skill graph, cross-pillar activity — not from domain knowledge alone
- Assistance, not authorship: every artifact, track, article, or institution produced has human authorship; the agent is a collaborator, never the author of record
- Transparency of AI involvement: interactions and outputs influenced by AI assistance are visibly marked
- Progressive disclosure: basic assistance is immediately available; more powerful agentic capabilities are surfaced progressively
- Open and extensible: the agent registry is open; community contributors can propose and register new specialized agents

**Unique constraints**:
- Agents must never make irreversible actions without explicit human confirmation
- The context model fed to agents must respect privacy and access controls
- AI-generated content suggestions must be distinguishable from human-authored content in the platform's data model

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Orchestration and User Context Engine | Maintain the unified cross-pillar context model for each user and route agent invocations | User context model, Long-term memory, Session context, Agent routing | Built continuously from event bus and portfolio; belongs to Platform, not to any pillar |
| Agent Registry | Register, version, and discover available agents and their tool sets | Agent definition, System prompt, Tool set, Activation policy, Agent version | Open registration mechanism; each agent declares required tools and activation contexts |
| Tool Layer (Platform APIs) | Expose ecosystem data and actions as callable tools for agents | Tool, API endpoint, Permission scope, Pillar context | Tools scoped by pillar and permission level |
| Learn Agents | Specialized agents for the educational pillar | Track Creator Agent, Student Q&A Agent, Pedagogical Validator Agent, Curriculum Architect Agent, Iteration Agent | See Component 1 (Learn); authorship of all educational content remains human |
| Hub Agents | Specialized agents for the creation and collaboration pillar | Artifact Copilot Agent, Institution Setup Agent, Contribution Reviewer Agent | Institution Setup Agent translates natural language governance intent into formal protocol configuration for human review and approval |
| Labs Agents | Specialized agents for scientific research | Literature Review Agent, Research Structuring Agent, Article Drafting Agent, Artifact Research Agent | Literature Review Agent searches both external publications and ecosystem-internal artifacts |
| Cross-Pillar Navigation Agent | Proactively surface cross-pillar opportunities | Cross-pillar signal, Opportunity recommendation, Context trigger | Activated by orchestration engine when event bus emits signals indicating cross-pillar connections; operates in background, surfaces suggestions non-intrusively |

---

### Component 1: Syntropy Learn (Education Pillar)

**Type**: Web App + Embedded IDE + Background Service

**Primary users**: Learners, Track Creators, Mentors, Community Members

**Purpose in one sentence**: Enable project-first learning where every fragment ends in something the learner builds, and by the end of every track the learner has a complete, real project in their portfolio.

**Design character**: Feels like navigating a universe of knowledge — territories to explore, artifacts to collect, a project always under construction. The spatial metaphor runs through the visual design: completed territories illuminated, new areas visible on the horizon. The learning experience feels like a well-structured workshop manual that opens with a real problem, explains the principle behind the solution, and hands you the tools to build it yourself.

**Key design principles**:
- Project precedes curriculum: a Track Creator first defines the reference project, then designs the fragments that teach a learner to build something equivalent
- Fixed fragment structure, variable content: every fragment follows Problem → Theory → Artifact regardless of domain; the structure is the pedagogical guarantee
- Automatic portfolio: the ecosystem records; the learner participates; the portfolio builds itself
- Contribution over consumption: XP and progression come from artifacts that others find useful, not from watching content

**What success looks like**: A learner who arrives without a project idea leaves the first session having started one. The median time from account creation to first artifact published is under two hours. Learners report feeling less alone than on any platform they have previously used.

**Domain invariant**: The Fragment structure Problem → Theory → Artifact is fixed and non-negotiable. Any content that bypasses this structure is not a Fragment.

#### Sub-components of Syntropy Learn

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Content Hierarchy and Navigation | Organize educational content in four nested levels and provide a navigable map | Career, Track (construction plan around reference project), Course (produces collectible on completion), Fragment (atomic unit; always ends in artifact) | Hierarchy serves project construction, not subject organization; fog of war over undiscovered content |
| Fragment Structure and Artifact Engine | Define and deliver the atomic pedagogical unit — fixed three-part structure always ending in something built | Problem Presentation (sets up real project need), Theoretical Discussion (depth calibrated to artifact), Artifact (Reference + Learner's Own) | The reference artifact demonstrates; the learner's artifact is the actual output; the platform encourages divergence, not copying |
| Project Layer | Make the project — not the curriculum — the central object of the learning experience | Reference Project (complete, hosted on Hub), Learner Project (built in parallel), Project Bank (curated proposals for learners without a project idea) | Track Creator defines reference project before writing fragments; project is the blueprint, fragments are the instructions |
| Social and Community Layer | Create conditions for community-driven learning without making participation mandatory | Fragment Forums (anchored to specific fragment, permanent), Artifact Gallery (per-track gallery of published learner artifacts), Mentorship Relationship (persistent, tracked) | Context-anchored discussion only; contribution-driven recognition; opt-in community visibility |
| Onboarding and Orientation | Eliminate the paralysis of the blank page for new learners | Career Discovery Assistant (conversational), Placement Mechanism (optional, identifies knowledge to skip), First-session experience (must produce at least one artifact) | First session is complete only when the learner has built something, even if minimal |
| Gamification and Progression | Create long-term incentives for contribution and project development | XP (skewed toward contribution, not consumption), Virtual Currency, Collectible System (fragments of collectible assemble with course completion), Avatar and Personal Space, Spatial Navigation Layer | Contribution over consumption; collectibles reflect real achievement; the MMORPG spatial metaphor |
| Creator Tools and AI Copilot | Structured authoring environment augmented by specialized AI agents for Track Creators | Phase 1 (Project Scoping Agent), Phase 2 (Curriculum Architect Agent), Phase 3 (Fragment Author Agent + Pedagogical Consistency Validator), Post-publication (Iteration Agent) | Project-first authoring: reference project must be defined before any fragment is written; creator retains full authorship; AI generates drafts, creator approves |
| Mentor Tools and Experience | Dedicated workspace for mentors to track mentee project activity and give structured artifact feedback | Mentee Project Feed, Artifact Review Workspace (inline comments), Session Notes, Mentorship Incentive Structure (rewards scale with mentee outcomes) | Mentor role is earned (by contribution level), not applied for; mentors have configurable maximum active mentees; mentor rewards align with mentee outcomes |

---

### Component 2: Syntropy Hub (Creation and Collaboration Pillar)

**Type**: Web App + Embedded IDE + Protocol Interface

**Primary users**: Institution Founders, Contributors, Project Maintainers, Institution Members, Visitors

**Purpose in one sentence**: The place where digital institutions exist as complete entities — with artifacts, governance contracts, contributor structure, decision history, and value distribution mechanisms — all in one place, all verifiable, all executable.

**Design character**: Feels like a well-planned city — with distinct neighborhoods, projects of different scales, and a sense of real activity happening. The governance interface feels like a cooperative's boardroom that is also a technical control panel — serious without being intimidating, precise without being bureaucratic. Project management feels like Linear — fast, opinionated, built for people who want to work, not manage a tool.

**Key design principles**:
- Consequences visible before confirmation: any change in governance contracts must show practical effects before being applied
- Templates as starting point, not destination: institution templates reduce friction but do not prevent customization
- Legitimacy chain always visible: the history of all institutional decisions is accessible as reference, not hidden in a log
- Artifact authorship always preserved: an artifact created in Learn and contributed to a Hub project retains its original authorship traceably

**What success looks like**: A contributor external to a project can understand what needs to be done, choose an issue, work on it using the integrated IDE, and submit a contribution without manual onboarding from a maintainer. An institution founder can create an institution with appropriate governance without needing legal or technical consultancy to understand what they are creating.

**Domain invariant**: Every project must belong to an institution; projects without institutions do not exist in the Hub. Every project has two dimensions: main (formal, with contracts) and Hackin (sandbox for experimentation).

#### Sub-components of Syntropy Hub

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Public Square | The space where institutions and projects exist publicly — discoverable, navigable, deep enough for anyone to decide whether to participate | Institution Directory, Public Institution Profile (identity, mission, public projects, public governance contracts, public decision history), Project Directory, Artifact Exploration | Visibility is an institution decision, not a platform decision; activity (not payment) determines prominence |
| Institution Management | All tools to define, configure, and evolve institutional structure — governance, members, contracts, projects | Institution Creation (guided, requires at least one founder and a governance contract), Governance Configuration (members, roles, chambers, voting weights, delegation, tiers), Deliberation and Proposals (Draft→Discussion→Voting→Approved/Rejected→Contested→Executed), Member Management, Visibility Configuration | Changes to governance follow the institution's own deliberative process; the system does not permit bypasses |
| Project Management | Complete project management environment — issues, roadmap, contribution review, artifact management | Project Creation (belongs to institution; contract must be ≤ permissive than institution's governance contract), Issue Management, Contribution Review (artifact submitted → reviewed → accepted/rejected → integrated), Artifact Manifest Management, Roadmap and Planning, Hackin Dimension | Issues that are public are visible to any Hub user if the project is public; Hackin artifacts do not have the same formal contracts as main dimension until deliberately promoted |
| Contracts and Value Distribution | Configure artifact contracts, monetization protocols, and value distribution — accessible to any founder | Template Library (pre-audited parametrizable contracts analogous to open source licenses), Artifact Contract Configuration, Monetization Protocol Configuration (static/dynamic/hybrid weights), Treasury and Liquidation (AVU balance, liquidation triggers, oracle, distribution history) | Contract templates create a shared vocabulary; simulation before confirmation; bidirectional transparency for all parties |
| Cross-Pillar Integration | Ensure Hub is where work created in any pillar converges — with authorship traceability and automatic value propagation | Zero-friction cross-pillar: Learn artifact → Hub contribution happens automatically; Labs publication → Hub project link; bidirectional traceability (Hub artifact ↔ Learn/Labs origin) | Authorship always preserved; cross-pillar actions reflect in portfolio without additional user action |

---

### Component 3: Syntropy Labs (Scientific Research Pillar)

**Type**: Web App + Background Service + Embedded Editor

**Primary users**: Principal Researchers, Scientific Collaborators, Reviewers, Scientific Beginners, Lab Directors, External Readers

**Purpose in one sentence**: Enable any person with genuine scientific curiosity — regardless of institutional affiliation — to conduct the full research cycle from hypothesis to published, peer-reviewed article, with all artifacts verifiable and all results connected to the rest of the ecosystem.

**Design character**: Has two distinct modes — a work mode (dense, efficient, expert-oriented: article writing, experiment management, review analysis) and a discovery mode (accessible, navigable, welcoming: exploring articles, finding labs, reading research). The article editor aspires to Overleaf's rendering quality with Notion's editing fluidity. The review interface has the precision of GitHub's code review system.

**Key design principles**:
- Publish is explicit and irreversible for that version: once published, a version exists permanently with its DOI
- Peer review is post-publication, continuous, and open: anyone can review any public article at any time
- The reputation system is the filter, not censorship: low-reputation reviews are not removed, only less visible; the author always sees everything
- A laboratory is a Digital Institution: all governance primitives from the Digital Institutions Protocol apply to laboratories without modification
- Labs requires no prior academic credential — it requires verifiable contribution

**What success looks like**: A researcher can create a functional laboratory, start a research line, add collaborators, and record the first hypotheses in under 20 minutes. Researchers with Overleaf + email workflow experience report that the Labs editor is at least as good, with the advantage of integrated review and interactive artifacts.

**Domain invariants**: Imutability of published versions is absolute — no published version can be edited or removed. Experiment data with human participants must be anonymized per GDPR/LGPD before any access or export.

#### Sub-components of Syntropy Labs

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---|---|---|---|
| Laboratory Management | Lifecycle of the laboratory institution: creation, configuration, members, governance | Laboratory (Institution with type `laboratory`), Director, Member, Smart Contract of Laboratory, Research Area | A laboratory is an Institution with typing `laboratory`; its governance is defined in the smart contract at creation; can be public or private |
| Research Line Management | Planning and tracking of research lines: hypotheses, methodology, progress, co-authorship | Research Line (Project with type `research-line`), Hypothesis, Methodology, Status, Co-author, Research Cycle Stage | A research line is a Project with typing `research-line`; structures the complete cycle — from D0 (problem) to publication; every artifact produced is associated with the line |
| Scientific Artifact Management | Creation, versioning, and association of all artifacts produced in a research line | Scientific Article (Artifact with type `scientific-article`), Dataset (type `dataset`), Research Code, Notebook, Version | Artifacts follow the three-layer model (Identification, Content, Utilization); the utilization layer defines permissions for access, review, and reuse |
| Interactive Experiments | Creation and execution of reproducible experiments running in the browser, hosted on cloud containers | Experiment (Artifact with type `experiment`; inspired by oTree), Participant, Experimental Condition, Round, Resulting Dataset | Experiment is an artifact with smart contract defining who can participate, for how long, and how data is handled; data collected generates a dataset automatically associated with the research line; can be accessed via public link without an ecosystem account |
| Scientific Article Editor | Writing interface with MyST and LaTeX support, real-time rendering, and artifact referencing | Article, Section, Reference, Embedded Artifact, Dynamic Parameter, Version | Article is an Artifact with type `scientific-article`; can contain executable components (interactive graphs, embedded experiments) rendered via cloud containers |
| Open Peer Review | Interface for reading, annotating, and public reviewing of articles; management of discussion threads linked to specific passages | Review, Passage-linked Comment, Thread, Author Response, Reviewer Reputation | Reviews are linked to the specific version reviewed; any ecosystem user can review; reviews are public and carry the reviewer's reputation profile; low-reputation reviews are filtered by default but visible if requested |
| DOI and External Publication | Control the publication cycle: from internal draft to public version with DOI; interoperability with external academic ecosystem | Published Version, DOI, Changelog, Preprint, External Indexing | Publishing is irreversible for that version; each published version receives a unique DOI via DataCite/CrossRef; publishing activates the peer review flow |
| Versioned Evolution and Response | Authors respond to reviews, incorporate suggestions, and publish new versions; complete history permanently public | New Version, Addressed Review, Incorporated Review, Rejected Review, Full Public History | Each new version must reference the reviews that motivated changes; complete history of all versions and their reviews is permanent and immutable |
| Discovery and Social Layer | Serves as the social and discovery layer for Labs — where anyone finds relevant science and receives bridges to the rest of the ecosystem | Article Discovery (full-text search), Activity Feed (subscriptions by area and laboratory), Cross-Pillar Integration (Learn track suggestions, Hub project links) | Articles are accessible without login; only contributing requires identity; the Labs is a gateway to the ecosystem for scientific beginners |

---

## 5a. Domain Priorities — Core, Supporting, and Generic

### Classification Table

| Business Area | Type | Justification | Strategy |
|---|---|---|---|
| Dynamic Portfolio and Event Bus | Core | The automatic, verifiable portfolio is the primary differentiator — nothing like it exists across the combination of education, collaboration, and research | Build carefully with rich domain model |
| Cross-Pillar Recommendation Engine | Core | Proactively connecting learners to projects, contributors to knowledge gaps, and researchers to practitioners creates value no single-pillar tool can replicate | Build carefully; invest in signal quality |
| Digital Institutions Protocol (Artifact model, IACP, Governance, Value Distribution) | Core | The ownership and governance protocol is unique to this ecosystem and cannot be approximated by off-the-shelf solutions; requires deep design before implementation | Build carefully; formal invariants must be preserved |
| Gamification and Contribution-Driven Progression | Core | Contribution-driven progression that rewards community value rather than passive consumption is a key behavioral design choice that differentiates the ecosystem | Build with care; metrics and incentives must be well-calibrated |
| AI Agent System — Orchestration and Context Engine | Core | The value of AI assistance is inseparable from the unified user context model; a generic AI assistant provides generic value; an assistant that knows the user's complete cross-pillar history provides compounding, personalized value | Build carefully; context model and agent registry are differentiating |
| Project-First Learning Pedagogy (Learn) | Core | The fixed Fragment structure (Problem → Theory → Artifact) and Track-as-construction-plan are unique pedagogical designs not replicable by generic LMS | Build with rich domain model; fragment structure is a domain invariant |
| Open Peer Review with Reputation-Based Filtering (Labs) | Core | The combination of continuous, passage-linked, reputation-filtered public peer review is the central differentiator of Labs from arXiv and traditional journals | High investment in UX and domain logic |
| Interactive Executable Experiments (Labs) | Core | No scientific platform integrates executable experiments as first-class artifacts within the publication and research cycle | Start simple (surveys, decision tasks); evolve toward multiplayer and agents |
| Full Research Cycle Integration (Labs) | Core | No platform integrates hypothesis management, experiment execution, data collection, and article writing in a single coherent cycle | Build with rich domain model; research cycle is the central axis of Labs |
| Digital Institution Governance and Contract Layer (Hub) | Core | The combination of configurable governance, artifact contracts, and value distribution is what differentiates Hub from any existing collaboration platform | Build with formal guarantees; distribution models must be verifiable |
| Integrated Development Environment | Supporting | Necessary for zero-setup contribution, but not architecturally unique; value is in ecosystem integration | Build on proven open source editors (VS Code / Monaco); invest in integration layer |
| Planning and Management | Supporting | Necessary for cross-pillar coordination; core Kanban/backlog model is well understood; value comes from unified view | Build simply; do not over-engineer |
| Communication System (Forums, DMs, Feed) | Supporting | Necessary for community cohesion; value is in context anchoring, not messaging mechanics | Build simply; context anchoring is the differentiator |
| AI Agent System — Specialized Agents | Supporting | Individual agents are high-value features built on top of the Core orchestration layer; domain logic is specific but not architecturally novel on its own | Build progressively; start with highest-impact agents |
| Public Square and Discovery (Hub) | Supporting | Necessary for ecosystem growth; discovery logic is not the differentiator | Build simply and effectively; optimize as ecosystem grows |
| Project and Issue Management (Hub) | Supporting | Necessary to organize work; equivalent tools exist; differentiator is integration with contracts and artifacts | Build with clarity; don't reinvent what Linear and GitHub already proved |
| Laboratory and Research Line Management (Labs) | Supporting | Laboratory is an Institution, research line is a Project — Labs uses Platform primitives with specific typing; management logic already exists | Reuse Institution and Project primitives; add only scientific context fields |
| Authentication and RBAC | Generic | Well-understood problem with strong existing solutions | Use off-the-shelf (Supabase Auth + custom RBAC layer) |
| Payment Processing | Generic | Solved problem; delegated entirely to a compliant third party | Use Stripe or equivalent |
| Email / Notification Delivery | Generic | Solved problem; many reliable services exist | Use off-the-shelf (SendGrid, Resend, or equivalent) |
| MyST/LaTeX Rendering | Generic | MyST has a mature open source renderer; LaTeX has a consolidated ecosystem | Use existing libraries; contribute upstream if necessary |
| DOI Generation and Registration | Generic | Standard APIs from DataCite and CrossRef are widely adopted | Integrate via API with established DOI provider |

### Core Domain Statement

The irreplaceable core of the Syntropy ecosystem is the combination of four capabilities that reinforce each other: a **verifiable, automatic portfolio** that faithfully records every contribution across all pillars without manual curation; a **cross-pillar recommendation engine** that turns those records into bidirectional opportunities; an **AI Agent System** whose value derives from that unified context; and the **Digital Institutions Protocol** that makes the ownership layer of those contributions real — cryptographically anchoring what the portfolio records. Together with the **project-first learning pedagogy** (Learn), **institutional governance with verifiable artifact contracts** (Hub), and **integrated executable research** (Labs), these form a system of capabilities that no combination of existing tools can replicate.

---

## 6. Key Capabilities

### Platform Capabilities (Cross-Cutting)

| # | Capability | Description | Priority |
|---|---|---|---|
| 1 | **Unified Authentication and Identity** | A single login grants access to all pillars and platform components. Users accumulate multiple roles under one identity. | MVP |
| 2 | **Dynamic Portfolio Generation** | Every meaningful action across all pillars is automatically captured via the event bus and registered in the user's portfolio. No manual curation required. | MVP |
| 3 | **Cross-Pillar Search and Recommendation** | A unified search surfaces resources from Learn, Hub, and Labs simultaneously. The recommendation engine proactively connects artifacts to issues and fragments to problems. | MVP |
| 4 | **Voluntary Sponsorship and Creator Monetization** | Users can support teachers, maintainers, and researchers through recurring or one-time contributions. Creators can offer paid or restricted access to their work. Content access is never conditioned on involuntary payment. | MVP |
| 5 | **Integrated Development Environment** | A full development and writing environment embedded in the platform allows real work — coding, writing, running experiments — without leaving the ecosystem. | MVP |
| 6 | **Cross-Pillar Planning and Management** | A unified planning layer supports study planning (Learn), project sprint management (Hub), and research pipeline tracking (Labs) from a single dashboard. | MVP |
| 7 | **Contribution-Driven Gamification** | XP, virtual currency, avatar customization, collectible items, achievements, and titles reward genuine community value, not passive consumption. | MVP |
| 8 | **Contextualized Communication** | Forums anchored to specific fragments, projects, and experiments; direct messaging; activity feeds; configurable notifications. | MVP |
| 9 | **Role-Based Access Control** | Roles are managed centrally and enforced consistently across all pillars. | MVP |
| 10 | **Institutional Site with Live Metrics** | A public-facing site communicates the ecosystem vision, shows live metrics, and routes visitors to the appropriate entry points. | MVP |
| 11 | **Governance and Moderation** | Transparent, auditable moderation with policy-as-code automation. Community participation in governance decisions. | Post-MVP |
| 12 | **Cooperative Grid Integration** | Future: the platform is designed to eventually migrate its computational workloads (IDE sessions, experiment execution) to the Cooperative Grid — a separate project built in its own repository. No current implementation decision depends on the Grid. | Future (separate project) |

### Digital Institutions Protocol Capabilities

| # | Capability | Description | Priority |
|---|---|---|---|
| 13 | **Artifact Authorship with Cryptographic Identity** | Creators publish artifacts with verifiable authorship via cryptographically signed identity records anchored to an immutable ledger. | MVP (basic publication); Post-MVP (full protocol) |
| 14 | **Digital Institution Creation and Configuration** | Any user can create a digital institution with configurable governance using pre-audited templates; advanced configuration supports chambers, weighted voting, delegation, and tier-based change classification. | MVP (templates); Post-MVP (advanced) |
| 15 | **Executable Governance Contracts** | Institutions define governance rules in contracts that execute automatically — quorum, approval thresholds, delegation, tier sets — without depending on personal trust. | MVP |
| 16 | **Inter-Artifact Communication Protocol (IACP)** | Each artifact has a contract defining usage terms; interactions between artifacts follow the IACP in four mandatory phases with automatic dependency graph construction. | Post-MVP |
| 17 | **Automatic Value Distribution** | Value entering a project is distributed automatically among contributing artifacts and their creators according to weights defined in the monetization protocol, without manual intervention. | Post-MVP |
| 18 | **Emergent Dependency Graph** | The dependency graph between artifacts emerges automatically from IACP interactions — no manual dependency declaration is needed or permitted. | Post-MVP |

### Learn Capabilities

| # | Capability | Description | Priority |
|---|---|---|---|
| 19 | **Project-Centered Track Structure** | Tracks organized around reference projects, not subject curricula. Every fragment contributes a building block to a real, completable project. | MVP |
| 20 | **Fixed Fragment Pedagogy (Problem → Theory → Artifact)** | Every fragment follows a three-part structure that always ends in something the learner builds. Consistent across all domains and all creators. | MVP |
| 21 | **Learner Project Development with Reference** | Each learner builds their own project in parallel with the track's reference project. | MVP |
| 22 | **Integrated IDE and Artifact Publishing** | Learners build and publish artifacts without leaving the fragment context. | MVP |
| 23 | **Onboarding: Career Discovery and Placement** | A career discovery assistant recommends starting points. An optional placement mechanism identifies knowledge that can be skipped. | MVP |
| 24 | **Community Artifact Gallery** | Published artifacts from all learners visible in a per-track gallery with peer feedback. | MVP |
| 25 | **Creator Authoring Environment with AI Copilot** | Structured authoring workspace with five specialized AI agents (Project Scoping, Curriculum Architect, Fragment Author, Pedagogical Consistency Validator, Iteration Agent) assisting Track Creators at every phase. | MVP |
| 26 | **Voluntary Mentorship System with Mentor Workspace** | Advanced learners mentor others in a persistent, tracked relationship with aligned incentives. Mentor rewards scale with mentee outcomes. | Post-MVP |

### Hub Capabilities

| # | Capability | Description | Priority |
|---|---|---|---|
| 27 | **Digital Institution Creation from Templates** | Any user can create a digital institution with configurable governance from pre-audited templates. | MVP |
| 28 | **Full Deliberative Process** | Institutional change proposals follow a complete cycle of creation, discussion, voting, contestation, and execution with an immutable legitimacy chain. | MVP |
| 29 | **Issue and Contribution Management** | Maintainers create issues with sufficient context for external contributors; contributors submit artifacts as responses; maintainers review with structured feedback. | MVP |
| 30 | **Hackin Dimension per Project** | Every project has a sandbox dimension (Hackin) for free experimentation, parallel to the main dimension with its formal contracts. | MVP |
| 31 | **Treasury and Liquidation with Oracle** | The treasury accumulates AVUs, deducts operational costs, and liquidates to members' preferred currencies via a configurable oracle. | MVP |
| 32 | **Cross-Institution Value Propagation** | When a project uses artifacts from other institutions, value propagates automatically to those institutions and their creators per usage contract terms. | Post-MVP |

### Labs Capabilities

| # | Capability | Description | Priority |
|---|---|---|---|
| 33 | **Create and Operate Research Laboratories** | Any user can create a laboratory (Institution type `laboratory`), configure governance, define research areas, and admit members. | MVP |
| 34 | **Manage Research Lines** | Researchers create and manage research lines (Project type `research-line`), associating hypotheses, methodology, artifacts, and progress status. | MVP |
| 35 | **Scientific Article Writing in MyST/LaTeX** | Writing interface with real-time rendering, artifact referencing, and immutable versioning of each publication. | MVP |
| 36 | **Publish Articles and Activate Peer Review** | Explicit publication of an article version makes it public and opens the peer review flow; each version receives a DOI. | MVP |
| 37 | **Open Peer Review with Reputation Filtering** | Any ecosystem user can review published articles, linking comments to specific passages; reviews filtered by reviewer expertise in the article's subject area. | MVP |
| 38 | **Respond to Reviews and Publish New Versions** | Authors respond to reviews, incorporate suggestions, and publish new versions; complete history permanently public. | MVP |
| 39 | **Create and Publish Interactive Experiments** | Researchers create executable experiments (oTree-inspired) that run in the browser via cloud containers and can be accessed via public link. | Post-MVP |
| 40 | **Cross-Pillar Translation of Research Results** | Mechanism for researchers to formally initiate the creation of a Hub project or Learn track from completed research line results. | Future |

---

## 7. Information and Concepts

### Platform-Level and Protocol Concepts

| Concept | Description | Key Information | Related To | Owner/Creator | Lifecycle States |
|---|---|---|---|---|---|
| Artifact | Any digital asset expressible as a finite binary sequence and encapsulated within a defined logic or protocol; the atomic unit of the ecosystem; a triple (Substance, Identity, UtilizationInterface) | Substance (actual content), Identity Record (artifact ID = Hash(pk_author ∥ timestamp ∥ type ∥ content_hash), pk_author, timestamp, type τ, content hash, signature σ, version, parent reference), Utilization Interface (interaction modes M, smart contract C, usage layer descriptor L) | All pillars, Portfolio, Digital Project, Event Bus | Creator (self-published) | Draft → Published → Versioned → Deprecated |
| Artifact Type System (𝒯) | An open, extensible set of artifact types; any new type is introduced by publishing a type registration event (τ, schema Σ_τ, interaction modes M_τ); no fixed enumeration | Type name τ, Utilization schema Σ_τ, Permitted interaction modes M_τ, Standard type library (code, image, video, audio, document, dataset, model, composite) | Artifact, IACP | Any ecosystem participant | Registered → Active → Deprecated |
| Identity Record | The immutable record of authorship and integrity for an artifact; published as a Nostr event; critical state transitions anchored to an immutable ledger | id, pk_author, timestamp t, type τ, content hash h, signature σ, version v, parent reference | Artifact, Nostr, Immutable Ledger | System (auto-generated at publication) | Immutable once anchored |
| IACP (Inter-Artifact Communication Protocol) | The uniform four-phase protocol governing all interactions between artifacts | Phase 1 (Identification: mutual key verification), Phase 2 (Contract Negotiation: smart contract evaluation + Usage Agreement Event), Phase 3 (Utilization: type-specific interaction), Phase 4 (Usage Registration: Usage Event emitted) | Artifact, Dependency Graph, Value Distribution, Portfolio | System | Stateless (per interaction) |
| Usage Agreement Event (e_agree) | A signed record of an authorized inter-artifact interaction (IACP Phase 2); the only mechanism by which edges appear in the dependency graph | Interacting artifact IDs, Agreed terms, Author signatures, Timestamp; e_agree = Sign_sk_R(artifact_id ∥ mode ∥ timestamp) | IACP, Dependency Graph, Portfolio, Value Distribution | System (auto-emitted upon Phase 2 negotiation) | Emitted → Anchored → Archived |
| Usage Event (e_use) | A signed record of actual utilization (IACP Phase 4); primary input to value distribution and dynamic weight computation | artifact_id, requester_pk, mode, timestamp, context | IACP, Value Distribution, Dynamic Weights | System (auto-emitted upon Phase 4 utilization) | Emitted → Processed → Archived |
| Digital Project | A four-component entity: Governance Contract (Γ), Artifact Manifesto (𝓜), Monetization Protocol (Π), Dependency Graph (𝒟 — DAG) | Internal artifacts (𝓜_int: contracts ≤ permissive than project contract), External artifacts (𝓜_ext: each with Usage Agreement Event), DAG (edges from IACP Phase 2 events only, never manually declared), Governance Contract (founding members, weights, membership, quorum, dissolution) | Hub, Digital Institution, Artifact, Treasury | Project maintainer | Active → Archived |
| Digital Institution | Extension of a Digital Project with expressive governance: Institution = (Project, 𝒢, 𝒦, (Ω, δ)) | Governance System 𝒢 = (Members, Roles ℛ, Voting Weight Function Φ, Delegation Registry Λ), Chamber System 𝒦 = {K_l = (Electorate, Scope, Quorum Q_l, Approval threshold θ_l)}, Tier Set Ω (institution-defined ordered set), Change Classification Function δ: ChangeTypes → Ω | Hub, Labs (laboratories), Learn (educational programs), Digital Project | Institution founders | Active → Dissolved |
| Legitimacy Chain | The ordered sequence Σ_0, Σ_1, …, Σ_t of institutional states where each transition is authorized by contracts in force at proposal time; every state transition is a signed, anchored execution event | e_exec = Sign_executor(pid ∥ Hash(Institution_{k-1}) ∥ Hash(Institution_k) ∥ timestamp); founding state Σ_0 signed by all founders and anchored to immutable ledger | Digital Institution, Proposal | System (auto-maintained) | Cumulative and immutable |
| Abstract Value Unit (AVU) | Dimensionless accounting unit with no intrinsic monetary value; all value distribution logic operates in AVUs; conversion to concrete currencies occurs only at liquidation via oracle | No speculative value; computed from usage events and creator weights; converted via oracle at settlement time | Treasury, Value Distribution, Artifact | System | Allocated → Liquidated |
| Treasury | Smart-contract-controlled account with Balance B, Operational cost schedule Ω, and Liquidation Trigger; every incoming value converted to AVUs at entry time via oracle | Liquidation sequence: (1) deduct operational costs, (2) distribute to internal artifacts by edge weights, (3) execute external forwarding, (4) convert AVUs to preferred currency via oracle and execute payment | Digital Project, Artifact, AVU | System (per project) | Active → Closed |
| Portfolio | The unified, automatically generated record of a user's entire trajectory across all pillars | XP level, skills, certifications, achievements, titles, collectibles, activity history | User, Event Bus, all pillars | System (auto-generated) | Persistent / continuously updated |
| Event | A system-level record of a meaningful user action across any pillar | Event type, actor, timestamp, source pillar, associated artifact or entity | Event Bus, Portfolio, Gamification | System (auto-emitted) | Emitted → Processed → Archived |
| AI Agent | A registered, versioned assistant definition composed of a system prompt, declared tool set, and activation policy; instantiated by the orchestration engine in response to user context signals | Agent definition, System prompt, Tool set, Activation policy, User context model, Long-term memory | AI Agent System, Event Bus, Portfolio, all pillar content | Platform (built-in) / Community (registered) | Registered → Active → Deprecated |

### Learn Concepts

| Concept | Description | Key Information | Related To | Owner/Creator | Lifecycle States |
|---|---|---|---|---|---|
| Career | The broadest orientation layer; groups related Tracks around a professional or creative domain | Name, domain description, associated tracks, visual territory representation | Track | Platform (curated) | Active → Deprecated |
| Track | A project-centered learning journey organized around a reference project; the central unit of Learn | Name, reference project, ordered course sequence, prerequisites, track collectible | Career, Course, Reference Project | Track Creator | Draft → In Review → Published → Deprecated |
| Course | A named, thematically coherent sequence of Fragments within a Track; completion produces a collectible item | Name, fragment sequence, associated collectible item, domain theme | Track, Fragment | Track Creator | Draft → Published → Deprecated |
| Fragment | The atomic learning unit; fixed three-part structure (Problem → Theory → Artifact) ending in something the learner builds | Problem Presentation, Theoretical Discussion (depth calibrated to artifact), Reference Artifact, Learner's Artifact context, embedded IDE/editor | Course, Artifact | Track Creator | Draft → Published → Deprecated |
| Reference Project | The complete project a Track teaches a learner to build; hosted on Syntropy Hub; grows with the track | Project goal, final form, domain, Hub repository link, fragment contributions | Track, Hub Project | Track Creator | Draft → Published → Active |
| Learner Project | The project a learner builds independently while following a Track | Project goal, domain, linked artifacts, visibility setting, Hub repository (optional) | Track, Learner, Hub Project | Learner | Ideation → In Progress → Complete → Published |
| Collectible | A visual item assembled from fragment completions within a Course | Visual design, fragment pieces (partial items), complete form, associated Course | Course, Portfolio | System (auto-generated) | Incomplete → Complete |
| Mentorship Relationship | A persistent, tracked relationship between a mentor and a mentee | Mentor, mentee, start date, active track, session notes, artifact reviews, outcome milestones | Mentor, Learner, Portfolio | Matching system / Mentor acceptance | Proposed → Active → Concluded |
| AI Copilot Session | A record of AI agent assistance during a content creation session | Creator, track in progress, agent types used, drafts generated, creator edits, final accepted content | Track Creator, Track, Fragment | System (auto-generated) | Active → Archived |

### Hub Concepts

| Concept | Description | Key Information | Related To | Owner/Creator | Lifecycle States |
|---|---|---|---|---|---|
| Institution | The primary organizational entity in the Hub; contains projects and defines governance contracts, members, and value distribution | Name, mission, type, governance contracts, members, projects, treasury, visibility | Project, Member, Governance Contract, Treasury | Founder | Draft → Active → Suspended → Dissolved |
| Project (Hub) | Entity grouping related artifacts within an institution; defines the collaboration context and artifact manifesto | Name, artifact manifesto, monetization protocol, open issues, visibility, Hackin dimension | Institution, Artifact, Issue, Contribution | Member with permission | Draft → Active → Archived |
| Governance Contract | The set of executable rules defining how the institution makes decisions | Founding members, roles, chambers, voting weights, delegation registry, tier set, right of exit | Institution, Proposal, Member | Founder (via template or manual configuration) | Active → In Amendment → Amended |
| Proposal | A formally proposed institutional change that passes through the deliberative cycle | Change type, proposer, responsible chamber, discussion period, vote result, contestation period | Governance Contract, Member, Legitimacy Chain | Member with permission | Draft → Discussion → Voting → Approved/Rejected → Contested → Executed |
| Issue | An open problem or task in a project that can be resolved by a contribution | Description, expected contribution type, acceptance criteria, assignee, priority, state | Project, Contribution, Artifact | Maintainer | Open → In Progress → In Review → Closed |
| Contribution | The act of submitting an artifact in response to an issue; the complete cycle from proposal to acceptance | Submitted artifact, answered issue, author, state, reviewer feedback | Issue, Artifact, Contributor, Project | Contributor | Submitted → In Review → Accepted/Rejected → Integrated |
| Artifact Manifesto | The complete record of all artifacts belonging to a project — internal and external — with their associated contracts | Internal artifacts (with contracts), external artifacts (with usage agreement events), resulting dependency graph | Project, Artifact, IACP, Dependency Graph | System (emergent) + Maintainer | Continuously updated |
| Hackin Dimension | The sandbox parallel dimension of a project, for exploration and prototyping without the formal constraints of the main dimension | Experiments, prototypes, draft artifacts, absence of formal contracts until promotion | Project | Any member with project access | Active (always parallel to main project) |
| Contract Template | A pre-audited, parametrizable governance contract configuration for common use cases | Name, use case type, configurable parameters, pre-defined contracts | Institution, Governance Contract | Ecosystem (curated) | Active → Deprecated |

### Labs Concepts

| Concept | Description | Key Information | Related To | Owner/Creator | Lifecycle States |
|---|---|---|---|---|---|
| Laboratory | Ecosystem Institution with type `laboratory`, organizing research lines and defining scientific governance | Name, research area(s), members, smart contract, visibility | Institution (Platform), Research Line, Scientific Artifacts | Any ecosystem user | Active → Inactive → Archived |
| Research Line | Ecosystem Project with type `research-line`, organizing scientific work around a hypothesis or research question | Hypothesis, methodology, status, members/co-authors, associated artifacts, subject area | Project (Platform), Laboratory, Article, Dataset, Experiment | Lab members with permission | Draft → Active → Concluded → Archived |
| Scientific Article | Ecosystem Artifact with type `scientific-article`, written in MyST or LaTeX, versionable and publishable with DOI | Title, authors, abstract, body (MyST/LaTeX), references, embedded artifacts, versions, DOI per version, subject area | Artifact (Platform), Research Line, Review, Dataset, Experiment | Members of the research line | Draft → Under Internal Review → Published (v1, v2, …) |
| Review | Public contribution of an ecosystem member on a specific published article version, linked to text passages | Reviewer, reviewed version, passage-linked comments, date, status (open/answered), relevance assessment | Scientific Article, Reviewer, Reputation System | Any ecosystem user | Published → Answered → Incorporated / Not Incorporated |
| Dataset | Ecosystem Artifact with type `dataset`, storing collected data in a research line | Format, size, metadata, provenance (linked to research line or experiment), version, usage license | Artifact (Platform), Research Line, Article, Experiment | Members of the research line | Draft → Published → Versioned |
| Experiment | Ecosystem Artifact with type `experiment`, implementing an executable experiment running in the browser via cloud containers | Type (behavioral, survey, simulation), parameters, participants, collected data (→ Dataset), public link | Artifact (Platform), Research Line, Article, Dataset | Members of the research line | Draft → Active (accepting participants) → Closed |
| Subject Area | Scientific category used to classify research lines, articles, and reviewer expertise in the reputation system | Name, hierarchy (general area → sub-area), associated articles and labs | Research Line, Article, Reputation System (Platform), Laboratory | Created by users / Community-curated | Active → Merged / Deprecated |

---

## 8. Workflows and Journeys

### Workflow 1: Cross-Pillar Learning to Contribution (Platform)

**Actor**: Student / Learner who is also a Hub contributor
**Goal**: Apply knowledge from a completed learning fragment to a real open source project
**Trigger**: Student completes a fragment and publishes their artifact
**Frequency**: Multiple times per week per active learner
**Volume**: Individual action; recommendation engine operates at ecosystem scale

**Steps**:
1. Student completes a Learn fragment, builds their artifact using the integrated IDE, and publishes it to the community gallery.
2. The event bus captures the completion event and emits it to the recommendation engine.
3. The recommendation engine identifies open Hub issues that match the skills and artifact type just produced.
4. The student receives a non-intrusive suggestion showing 2–3 Hub issues they could contribute to right now.
5. The student opens one of the suggested issues directly in the platform, uses the embedded development environment to work on a fix, and submits a contribution.
6. The event bus captures the submission. The portfolio is updated. XP and virtual currency are awarded.
7. When the contribution is accepted, further XP is awarded and the achievement is recorded in the portfolio.

**Variations**: If no matching issues are found, the system suggests the student open their own project artifact for community contribution. If the student is not yet a Hub contributor, the recommendation flow doubles as onboarding into the Hub.

---

### Workflow 2: New User Onboarding to First Contribution (Platform / Learn)

**Actor**: Student (new user, no prior experience)
**Goal**: Find the right starting point and make a first verifiable contribution
**Trigger**: User signs up for the first time
**Frequency**: Once per user; high concurrency during growth periods
**Volume**: Individual, but must support high concurrency

**Steps**:
1. User lands on the institutional site and clicks "Get Started."
2. User creates an account (email/OAuth). Single authentication grants access to all pillars.
3. The career discovery assistant asks about the user's interests, background, and goals. Recommends a career track with explanation.
4. An optional placement quiz tests existing knowledge and suggests which courses or tracks can be skipped.
5. The user enters their first Learn track. They read the first fragment, study the theory, and build their first artifact in the embedded IDE.
6. The artifact is published to the community gallery. The event bus captures the action; the portfolio records it. A small XP reward and first achievement are granted.
7. The recommendation engine suggests a forum thread or mentor with expertise in the same area.

**Variations**: A user who already knows what they want skips the career assistant. A user arriving via a specific Hub project or Labs publication can start in Hub or Labs and connect to Learn retroactively.

---

### Workflow 3: Learner Develops a Track from Start to Complete Project (Learn)

**Actor**: An active learner midway through a Track
**Goal**: Complete the Track and have a finished, portfolio-ready project
**Trigger**: Regular learning sessions over days or weeks
**Frequency**: Daily to several times per week

**Steps**:
1. The learner opens their active Track. The navigation map shows their position — completed courses behind them, current course in focus, upcoming courses visible ahead.
2. The learner opens the next Fragment. They encounter a new problem within the project context they have been building — they can see how this fragment's artifact will fit into what they have already assembled.
3. They study the theory and build their own artifact in the embedded environment. They consult the reference artifact if stuck; they diverge from it deliberately where their project's needs differ.
4. They publish the artifact. It appears in the gallery. If it matches any open Hub issue, the platform surfaces this opportunity.
5. Fragment completion registers on the event bus. Portfolio records, XP, collectible fragment, and skill points are all updated automatically.
6. Over successive sessions, the learner completes all fragments in a Course. The full Course collectible assembles. Over successive weeks, they complete all Courses in the Track. Their learner project is now a complete artifact in its domain.

**Variations**: The learner hits a block on a specific Fragment and posts a question in the fragment forum. A mentor or community member helps resolve it.

---

### Workflow 4: Track Creator Builds a Track with AI Copilot (Learn)

**Actor**: A vetted Track Creator with domain expertise
**Goal**: Publish a pedagogically consistent Track faster than would be possible without AI assistance
**Trigger**: Track Creator is onboarded and begins authoring
**Frequency**: Occasional per creator; determines the platform's content supply rate

**Steps**:
1. Phase 1 (Project Definition): Creator describes the reference project. The AI Project Scoping Agent analyzes, surfaces similar projects for reference, flags scope issues. Creator finalizes project definition.
2. Phase 2 (Track Architecture): AI Curriculum Architect Agent proposes a course and fragment decomposition working backward from the finished project. Creator reviews, reorders, merges, splits, or removes items.
3. Phase 3 (Fragment Authoring): For each fragment, AI Fragment Author Agent generates drafts for Problem Presentation, Theoretical Discussion, and Reference Artifact. Pedagogical Consistency Validator monitors coherence continuously. Creator reviews and approves each draft.
4. Track is submitted for curation review. Human reviewer focuses on domain accuracy and depth (what the validator cannot judge). Creator receives feedback and revises.
5. Track is published. Reference project goes live on Syntropy Hub. Creator's portfolio begins accumulating impact metrics.
6. Iteration Agent analyzes learner behavior and generates improvement suggestions. Creator accepts, modifies, or dismisses; all changes are creator-approved before going live.

---

### Workflow 5: Creating a Digital Institution and First Project (Hub)

**Actor**: User who wants to create a digital institution for a collaborative project
**Goal**: Have an institution with configured governance, a created project, and a first issue open for contribution
**Trigger**: User decides to create an institution — may come from Learn after completing a track, from Labs after publishing research, or directly from Hub
**Frequency**: Occasional per user; aggregate is the Hub's creation-of-supply flow

**Steps**:
1. User opens the institution creation flow. Presented with template selection: Personal Institution, Technical Cooperative, Research Laboratory, Collaborative Product, or Advanced Configuration.
2. User selects a template. Interface shows what the template defines in plain language (not contract jargon). User accepts or modifies any parameter.
3. User confirms the configuration. Governance contract is generated, signed by the founder, and anchored to the ecosystem's immutable record. The institution exists.
4. User creates the first project within the institution, defines the artifact manifesto, monetization protocol, and visibility.
5. User creates the first issue — a problem or task that an external contributor can resolve. Defines description, expected artifact type, and acceptance criteria.
6. If the project is public, it immediately appears in the Hub's public square. The event bus captures creation; the founder's portfolio is updated.

---

### Workflow 6: Contributor Discovers and Contributes to a Project (Hub)

**Actor**: Contributor who wants to apply their skills to an existing project
**Goal**: Find a relevant project, resolve an issue, submit an artifact, and have the contribution accepted
**Trigger**: Contributor navigates the public square directly, or arrives via Learn suggestion after publishing an artifact
**Frequency**: Daily for active contributors; this is the highest-volume flow in a mature Hub

**Steps**:
1. Contributor navigates the project directory, filtering by domain and contribution type. Or arrives via automatic Learn suggestion: "your artifact can resolve this issue."
2. Contributor opens the project's public page. Sees project description, existing artifacts, roadmap, open issues, and public governance contracts.
3. Contributor selects an issue. Reads the problem description, acceptance criteria, and expected artifact type.
4. Contributor opens the integrated IDE within the issue context. Builds the artifact. Can consult existing project artifacts as reference.
5. Contributor submits the artifact as a contribution. Event bus captures the submission.
6. Maintainer receives notification, reviews the artifact in context, leaves inline comments if needed, and accepts or rejects with structured feedback.
7. If accepted: contribution is integrated into the project's manifest. Event bus records acceptance. Contributor's portfolio is updated automatically. If the project defines value distribution, the contributor begins participating in it proportionally.

---

### Workflow 7: Complete Scientific Publication Cycle (Labs)

**Actor**: Principal Researcher (with Scientific Collaborators)
**Goal**: Conduct a research line from start to publication of a peer-reviewed article
**Trigger**: Researcher has a hypothesis or research question
**Frequency**: On demand (the complete cycle takes weeks to months)

**Steps**:
1. Researcher creates a laboratory (if they don't have one), configuring the smart contract with co-authorship rules, visibility, and review permissions.
2. Within the laboratory, researcher creates a research line, describing the central hypothesis, planned methodology, and subject area.
3. Researcher adds collaborators. Over the course of the research, artifacts are created and associated with the line: datasets, experiments (if applicable), analysis code.
4. Researcher writes the article in MyST or LaTeX in the integrated editor, seeing real-time rendering. Artifacts are embedded in the text where relevant.
5. When the article is ready, researcher publishes it (irreversible for that version). System generates DOI; article becomes public.
6. Reviewers submit reviews linked to specific passages. Researcher filters reviews by reputation and analyzes contributions.
7. Researcher responds to relevant reviews, incorporates improvements, and publishes v2. System automatically links addressed reviews to the new version.
8. The research line is marked as concluded when the group considers the work mature.

**Variations**: Research line can be private throughout the process, with the article published only when ready. Researcher can publish a preprint before a more complete version.

---

### Workflow 8: Scientific Beginner Discovers and Contributes to Research (Labs)

**Actor**: Scientific Beginner (no formal academic affiliation)
**Goal**: Find relevant research, understand the context, and make a first contribution
**Trigger**: User arrives at Labs through genuine interest in a topic
**Frequency**: Weekly for users actively engaging with the scientific community

**Steps**:
1. User accesses the Labs discovery interface and searches for a topic of interest.
2. System returns published articles, active laboratories, and ongoing research lines related to the theme.
3. User clicks on an article and begins reading. System, perceiving they have no reputation in the area, suggests Learn tracks covering the article's foundational concepts.
4. User completes one or more Learn tracks preparing them to better understand the article. This is recorded in the Dynamic Portfolio.
5. Back in Labs, user re-reads the article with more confidence and identifies a methodological inconsistency or relevant suggestion.
6. User submits their first review, linked to the specific article passage. Review is published with their current reputation profile (still low in the area, but visible).
7. The article's author sees the review — even if it appears lower in the default reputation filter — and recognizes the observation is valid. They mark the review as relevant.
8. User gains reputation points in the article's subject area. Their contribution appears in the Dynamic Portfolio as "Relevant Review in [Area]."

---

### Workflow 9: Researcher Translates a Labs Result to Hub and Learn (Cross-Pillar)

**Actor**: Researcher
**Goal**: Turn a validated experimental result into an open source project and an educational track
**Trigger**: Researcher publishes a Labs article confirming a technique
**Frequency**: Occasional; represents the full ecosystem integration loop

**Steps**:
1. Researcher publishes an experiment result in Labs. The event bus captures the publication. The unified search indexes the result and identifies adjacent Hub projects and Learn tracks.
2. Researcher receives recommendations: Hub projects that could implement the technique and Learn tracks that could teach it.
3. Researcher creates a new Hub project from the Labs result, linking the original publication as the research foundation.
4. Researcher (or any teacher) creates a new Learn track based on the Labs publication, using the project as the practical component students will contribute to.
5. All three actions are recorded in the researcher's portfolio. The Labs publication, Hub project, and Learn track are all linked as a coherent body of work.

---

### Workflow 10: Sponsor Discovers and Supports a Content Creator (Platform)

**Actor**: Sponsor (experienced professional, platform alumni, or external supporter)
**Goal**: Direct financial support to a teacher whose impact is verifiable
**Trigger**: User completes a Learn track and is presented with the teacher's profile
**Frequency**: On demand; typically triggered by track completion or portfolio discovery

**Steps**:
1. User completes a Learn track. At the completion screen, the platform presents the teacher's profile with impact metrics: students who completed the track, artifacts produced, projects derived from the track content.
2. The user reviews the metrics. No content is gated; this is purely a discovery moment.
3. The user clicks "Support this creator." They choose between a one-time contribution and a recurring monthly sponsorship. A frictionless payment flow processes the contribution.
4. The event bus captures the sponsorship event. The teacher receives a notification; the sponsorship appears in both portfolios.
5. The platform does not change any content access for either party. The teacher's content remains fully available to all users.

---

## 9. Quality Priorities

The following priorities apply to the entire Syntropy ecosystem. Pillar-specific variations are noted where they differ.

1. **Reliability** — The event bus, portfolio, authentication, and legitimacy chain must be highly available. A missed event means a missing portfolio record. A missed governance event is an irrecoverable trust failure. Non-negotiable. (Hub's cadeia de legitimidade and Labs' article version immutability are absolute — no performance or convenience trade-off justifies a gap in these records.)
2. **Security** — User identity, sponsorship payments, artifact ownership records, cryptographic keys, governance contracts, and private artifacts require robust protection. Any security vulnerability is a launch blocker regardless of rank.
3. **User Experience** — The platform's core promise — that learning, building, and researching feel like one continuous activity — lives or dies by frictionless transitions between pillars. Any unnecessary friction defeats the ecosystem's core purpose. (Labs: the article editor and peer review flow must be pleasurable to use for researchers; a researcher who prefers to stay with Overleaf + email represents an adoption failure.)
4. **Extensibility / Flexibility** — The platform is designed to evolve. New pillars, new gamification mechanics, new governance structures, new artifact types, new agent capabilities must be addable without rewriting core components. The open artifact type system (𝒯) is a structural expression of this principle.
5. **Maintainability** — A small open source team will maintain this system. Architecture complexity must be justified by actual requirements. The Labs principle: Labs reuses Platform primitives at maximum; additional complexity must be proportional to what is genuinely specific to the scientific context.
6. **Data Integrity and Immutability** — Published artifact versions, governance decision records, and scientific article versions are immutable once anchored. No component may allow retroactive modification of these records.
7. **Scalability** — Start at community scale; design to grow. The event bus and recommendation engine must scale gracefully. Hub must support tens of thousands of institutions without redesign. Labs must function well with few laboratories initially and with thousands of articles and simultaneous reviewers later.
8. **Observability / Debuggability** — The event bus, portfolio aggregation, recommendation engine, governance contract execution, and value distribution are complex asynchronous systems. Full traceability of events from emission to processing is required. Labs requires auditable logs of all relevant actions (publication, review, versioning) to support scientific integrity.
9. **Performance** — Cross-pillar navigation and search must be fast. Slow transitions between pillars break the integration experience. Fragment loading and IDE responsiveness must not break learning flow. Article rendering in MyST/LaTeX and experiment execution must be fast enough not to interrupt the research workflow.
10. **Testability** — Policy-as-code governance, automated moderation, governance contract logic, and value distribution logic must be testable in a deterministic way before deployment. Bugs in these systems have direct economic consequences.
11. **Cost Efficiency** — The embedded IDE runs isolated containers per session; infrastructure cost scales with learner activity. The architecture must be efficient at both low and high activity volumes. Container orchestration choices should minimize per-session cost. The Cooperative Grid (a future separate project) is designed to reduce these costs further when it matures; architecture decisions must not block that future migration, but must not depend on it either.
12. **Time to Market** — The first usable version must reach real users quickly enough to validate assumptions. For Learn: the first track published and the first learner who builds a project is the earliest meaningful validation. For Hub: the first institution created with a real project and a real contributor. For Labs: the first article published and the first peer review submitted.

**Non-negotiable floors**:
- The event bus must produce a complete, auditable record of every significant user action across all pillars. This cannot be traded off.
- The Syntropy platform itself is permanently free and open. Creator-defined access controls (paid content, private projects, closed research) are distinct from platform-level gatekeeping and must be clearly separated in architecture.
- Open source identity: no proprietary dependencies in the core platform that would prevent community contributors from understanding or modifying the system.
- RBAC must be consistently enforced across all pillars. A permission failure is a launch blocker.
- Every Fragment must follow Problem → Theory → Artifact. No exceptions.
- Published article versions are immutable. No version can be edited or removed after anchoring.
- Experiment data with human participants must be anonymized per GDPR/LGPD before any access or export.

---

## 10. Constraints and Non-Goals

### Non-Goals (Out of Scope)

- The platform does not provide its own video hosting or streaming. Embedded video links to external services.
- The platform does not build its own payment processor. It integrates with an existing provider for sponsorships and paid creator content.
- The platform does not issue industry-recognized certifications or academic credentials. The proof of learning is the project; the proof of research is the published article. Completion badges and portfolio records exist within the platform and carry ecosystem value.
- The platform does not replicate the full feature set of GitHub for code review. The Hub IDE and contribution flow are functional but not intended to replace GitHub for teams requiring advanced Git workflows.
- The platform does not generate educational content through AI. AI assistance supports users, but content is created by human contributors.
- The platform does not operate as a job board or recruitment marketplace, though portfolio verifiability makes it useful in those contexts.
- The Labs does not act as a formal academic journal and does not issue "formal acceptance" as traditional journals do. Validation is done by the reviewer community and the reputation system.
- The Hub does not substitute external legal infrastructure. It facilitates the generation of documents for legal formalization, but legal execution in specific physical jurisdictions is the institution's responsibility.
- The Hub is not a social network. Activity feeds, followers, and likes live in the dynamic portfolio, not in the Hub.

### Inviolable Decisions (Must Not Be Changed Without Architecture Review)

These are intentional decisions that may appear non-conventional. The rationale is documented in `docs/vision/syntropy-institution-protocol.md` and `docs/vision/VISION.md` (ecosystem overview).

| Decision | Rationale |
|---|---|
| AVUs instead of a platform token | A platform token introduces speculative value, misaligning incentives and concentrating financial risk on creators; AVUs are accounting units with no intrinsic value |
| Open, extensible artifact type system (not a closed enum) | A closed enumeration would freeze the model at design time; open registration allows artifact types not yet imagined without modifying the core framework |
| Dependency graph emergent from IACP (not manually declared) | Manual declaration is error-prone and maintenance-burdened; IACP usage agreement events provide a faithful, automatically maintained record |
| Contracts bound to artifact entity, not to versions | Requiring renegotiation on every content update would make the system operationally prohibitive for actively developed artifacts |
| Fragment structure is fixed (Problem → Theory → Artifact) | This is a domain invariant of Learn, not an optional convention; it is the pedagogical guarantee of the platform |
| Gamification and reputation on Platform, not in pillars | Pillars emit domain events; Platform transforms them into portfolio, XP, and reputation; this separation must be preserved in bounded context mapping |
| Monorepo (Turborepo + pnpm workspaces) | Architectural constraint, not a tooling preference; apps do not import each other directly; shared logic lives in `packages/` |
| Pillar communication via event bus and APIs only | No direct imports between pillar `apps/`; cross-pillar communication passes through the Platform's event bus and well-defined APIs |

### Known Constraints

- The project is open source and the team is small (2–5 developers initially). Architecture must prioritize what a small team can build and maintain sustainably.
- The Cooperative Grid is a **separate future project** with its own repository and documentation. The platform must run entirely on conventional cloud infrastructure (own server, AWS, GCP, or equivalent) in all current and near-term phases. No architecture decision should create a dependency on the Grid being available. When the Grid matures, the platform is designed to migrate toward it — but this migration is a separate engineering effort, not part of this repository.
- The Digital Institutions Protocol requires extended research and design before full implementation. The MVP delivers basic artifact publication and authorship attribution; the complete protocol — IACP, institutional governance, value distribution — is a post-MVP deliverable.
- The AI Agent System must be designed from the start to never store or expose user context across sessions in ways that violate user privacy or access control boundaries.
- Labs launches after Learn and Hub are established. The architecture must accommodate Labs from the start, but Labs is introduced in a subsequent phase.
- Track Creators are curated and vetted. The platform does not support open publishing for educational content, limiting content supply growth but protecting pedagogical quality.

### Integration Requirements

| External System | What It Is | Integration Purpose | Direction | Criticality |
|---|---|---|---|---|
| GitHub / GitLab OAuth | Identity provider | Allow users to authenticate with existing developer accounts | Inbound | Important |
| Google OAuth | Identity provider | Allow users to authenticate with Google accounts | Inbound | Important |
| Payment processor (Stripe or equivalent) | Payment infrastructure | Process sponsorship contributions and paid creator content | Outbound | Critical for sponsorship |
| Kafka / RabbitMQ | Message broker | Power the event bus that captures all user actions across all pillars | Internal | Critical |
| Supabase | Hosted Postgres + Auth | Current database and authentication backend | Both | Critical (current phase) |
| Exchange rate oracle | Currency conversion service | Convert AVUs to concrete currencies at liquidation time | Inbound | Critical for value distribution (Post-MVP) |
| Immutable ledger (TBD) | Anchoring infrastructure | Anchor critical artifact identity events, governance founding events, and legitimacy chain execution events for permanent persistence | Outbound | Critical for protocol (Post-MVP) |
| LLM API provider (Anthropic, OpenAI, or equivalent) | AI inference service | Power the AI Agent System's language model calls | Outbound | Critical for AI Agent System |
| Container orchestration (Cloud) | Isolated execution environments | Power the embedded IDE sessions and experiment execution; Docker / Kubernetes on own server or cloud provider (AWS, GCP, or equivalent); no dependency on the Cooperative Grid | Inbound | Critical |
| DataCite / CrossRef | DOI providers | Register and resolve DOIs for published scientific articles | Outbound | Important (Labs, Post-MVP) |
| OpenAlex / Google Scholar | Bibliographic databases | Index published articles for external discovery | Outbound | Post-MVP |
| MyST-Parser (open source) | MyST renderer | Render articles written in MyST format | Inbound | Critical for Labs |
| Nostr relays | Event propagation | Propagate signed artifact identity events across independent relays | Outbound | Critical for protocol (Post-MVP) |

### Data Sensitivity and Compliance

**Data types handled** (across all pillars):
- [x] Personal Identifiable Information (PII) — names, emails, usernames, learning history, authorship records
- [x] Financial data — sponsorship transaction records, AVU distribution records (not full card data, handled by the payment processor)
- [x] Authentication credentials — managed via OAuth providers and Supabase Auth; passwords hashed and never stored in plain text
- [x] Proprietary / confidential data — user-created artifacts, project code, research data, private governance contracts, private research lines

**Regulations that apply**:
- [x] GDPR — applicable from launch (EU users expected from day one)
- [x] LGPD (Lei Geral de Proteção de Dados — Brazil) — applicable given project context
- [x] CCPA — applicable for users from California

Special requirement for Labs: data collected in experiments with human participants must be anonymized per GDPR/LGPD before any analysis or export.

**Data residency**: No hard requirements at initial launch; GDPR compliance requires EU user data handling meets EU standards regardless of storage location.

### Scale and Team Context

**Team size**: Small team (2–5 developers) initially; designed to grow with open source contributions

**Expected initial scale**: Community scale — hundreds to a few thousand users in the first phase (Learn + Hub); Labs introduced in a subsequent phase with a smaller initial cohort

**Growth expectations**: Moderate-to-significant growth as each pillar matures. Built to scale from the event bus and portfolio layers outward, but premature optimization for millions of users is not appropriate.

**Deployment target**: Cloud infrastructure — own server, AWS, GCP, or equivalent (Docker / Kubernetes). The Cooperative Grid is a separate future project; no deployment dependency on it in this phase.

---

## 11. Success Metrics

### Platform Business Metrics

| Metric | Description | Target | How Measured |
|---|---|---|---|
| Cross-pillar transition rate | Percentage of users who participate in more than one pillar within 30 days of joining | > 40% | Portfolio event data |
| Artifact application rate | Percentage of artifacts produced in Learn that are applied to at least one Hub issue | > 20% | Recommendation engine and event bus |
| Sponsorship conversion | Percentage of users who sponsor at least one creator after completing a track | > 5% | Sponsorship system logs |
| Active contributor retention | Percentage of contributors active in month 3 who were active in month 1 | > 50% | Event bus activity data |
| Mentor-mentee cycle rate | Percentage of users who were mentored and later became mentors | > 15% (at 12 months) | Portfolio role transitions |

### Platform Technical Metrics

| Metric | Description | Target | How Measured |
|---|---|---|---|
| Event bus reliability | Percentage of user actions that result in a correct, processed portfolio event | > 99.9% | Event bus monitoring and portfolio reconciliation |
| Cross-pillar search latency | P95 response time for a unified search query across all pillars | < 500ms | Application performance monitoring |
| Portfolio update latency | Time from a user action to its reflection in the portfolio | < 10 seconds (P95) | Event bus processing metrics |
| Authentication uptime | Availability of the authentication system | > 99.9% | Uptime monitoring |
| IDE session reliability | Percentage of development sessions that complete without environment failure | > 99% | Container orchestration metrics |

### Learn Business Metrics

| Metric | Description | Target | How Measured |
|---|---|---|---|
| First artifact publication rate | Percentage of new learners who publish at least one artifact within their first session | > 60% | Event bus (artifact publication events within first 24h) |
| Track completion with project | Percentage of learners who complete a Track with a learner project in their portfolio | > 30% | Event bus (Track completion + learner project creation) |
| Cross-pillar transition Learn → Hub | Percentage of learners who make at least one Hub contribution within 30 days of first Track completion | > 25% | Event bus (cross-pillar contribution events) |
| Artifact gallery engagement | Ratio of learners who comment on at least one other learner's artifact per Track cohort | > 50% | Community interaction events |

### Hub Business Metrics

| Metric | Description | Target | How Measured |
|---|---|---|---|
| Institutions with active project | Percentage of created institutions with at least one project with an open issue and an accepted contribution within 30 days | > 60% | Event bus |
| Cross-pillar contribution rate | Percentage of Learn artifacts that are contributed to a Hub project within 30 days | > 20% | Event bus (cross-pillar Learn → Hub events) |
| Contributor retention | Percentage of contributors with accepted contribution in month 1 who have a new accepted contribution in month 3 | > 40% | Event bus |
| Liquidation success rate | Percentage of liquidation triggers that result in successful distribution without error | > 99.9% | Treasury logs |
| Legitimacy chain integrity | Percentage of institutional state transitions with signed, anchored execution event | 100% | Automated chain audit |

### Labs Business Metrics

| Metric | Description | Target (12 months post-launch) | How Measured |
|---|---|---|---|
| Articles published | Number of articles with at least one published version | 500 articles | Database count |
| Review rate | Percentage of published articles that received at least one review within 30 days | > 60% | Review count per article |
| Active laboratories | Labs with at least one active research line in the last 90 days | 100 laboratories | Activity count per lab |
| Unique reviewers | Number of distinct users who made at least one review | 1,000 reviewers | Unique reviewer count |
| Non-academic contributors | Users without formal academic affiliation who made at least one contribution (review or collaboration) | 20% of total reviewers | User profile + contribution count |
| Labs-to-Hub translations | Concluded research lines that generated Hub projects or Learn tracks | 50 translations | Translation event count |

### Anti-Metrics (Failure Indicators)

- **High content consumption, low artifact production (Learn)**: users completing many fragments but publishing few artifacts indicates the learning philosophy is not working. Artifact production is the true signal, not completion rate.
- **Low learner project diversity (Learn)**: if most learners build nearly identical projects, the reference project is functioning as an answer key rather than an example.
- **Low cross-pillar navigation (Platform)**: users who stay entirely within one pillar indicate the recommendation engine and search are failing to deliver the ecosystem's core integration value.
- **Sponsorship concentrated in few creators (Platform)**: if the top 5% of creators receive 95% of sponsorships, discovery mechanisms are not surfacing the long tail of impactful contributors.
- **High institution creation, low contribution activity (Hub)**: institutions being created but without issues or accepted contributions indicate the Hub is being used as an identity registry, not a collaboration platform.
- **Contributors who never receive value (Hub)**: contributors with accepted contributions who never participated in any liquidation indicates the core promise of the Hub is broken for them.
- **Legitimacy chain gaps (Hub)**: any institution with state transitions not recorded in the legitimacy chain is a system reliability failure, not merely a poor metric.
- **Articles published with no reviews after 90 days (Labs)**: failure in the discovery mechanism or reviewer community, even if publication count is high.
- **Researchers preferring to export and publish externally (Labs)**: indicates the integrated publication value proposition is not materializing.
- **AI assistance replacing human authorship signals (Platform)**: if artifact production drops when AI assistance is unavailable, the system is creating dependency rather than augmenting capability.
- **Portfolio inaccuracy reports (Platform)**: if users report their portfolio does not reflect their actual contributions, event bus reliability has failed.

---

## 12. Inspirations and References

### Platform and Ecosystem

- **GitHub**: The contribution graph, pull request workflow, and issue tracking model are foundational references for the Hub. The contribution culture and "show your work" philosophy are references for the learner community. The immutable version history is the inspiration for the Labs article versioning model.
- **Patreon**: The voluntary sponsorship model draws on Patreon's creator-supporter relationship — community-funded, impact-motivated. The key difference is that Syntropy surfaces objective contribution metrics rather than creator self-promotion.
- **Notion / Craft**: The planning and management component and the fragment authoring experience should feel as flexible and calm as Notion — structured but not rigid.
- **Linear**: The Hub project management (issues, sprints, Kanban) and the project tracking within a Learn track should feel like Linear — fast, opinionated, built for people who want to get work done.
- **World of Warcraft / Final Fantasy XIV / No Man's Sky (MMORPG design)**: The gamification layer — character classes, skill trees, spatial exploration, collectibles, achievement systems — draws on MMORPG design patterns proven effective at creating long-term engagement around progression and community.
- **BOINC**: The Cooperative Grid (a separate future project) draws inspiration from BOINC's model of voluntary distributed computing, adapted for a context where trust comes from open source verification rather than centralized coordination.
- **Stripe**: The API layer and developer-facing components should aspire to Stripe's documentation quality and response predictability — every response is structured, every error is actionable.
- **Nostr**: The artifact identity record uses Nostr's event model — JSON objects signed by author private keys, propagated through relays — as the publication and verification layer for artifact identity records.

### Digital Institutions Protocol

- **DAOs and Ethereum governance patterns (Aragon, Gitcoin, Uniswap DAO, MakerDAO)**: The Digital Institutions Protocol draws on DAO concepts — decentralized governance, verifiable membership, on-chain state transitions — adapted to the specific context of knowledge and software creation rather than financial coordination. Key learnings from DAO failures: separate voting weight from financial holdings; connect governance directly to the work being produced.
- **Creative Commons**: The idea that artifact usage contracts can be standardized in recognizable templates — so a creator does not need to be a lawyer to choose the right terms — is the reference for the contract template library in the Hub.
- **Open Collective**: The model of total financial transparency — where anyone can see how much comes in, how much goes out, and to whom — is a direct reference for the Hub treasury. The difference: Open Collective is manual and trust-based; the Hub is automatic and contract-based.

### Learn

- **Buildspace (now Nights and Weekends)**: The closest existing reference for project-first learning in tech. Its core insight — that people learn by building real things with a community around them — directly inspired the Learn philosophy.
- **Khan Academy (early form)**: The original model of small, focused, mastery-oriented units is a reference for Fragment length and focus. The critical divergence: where Khan Academy ends with an exercise, every Syntropy Learn fragment ends with something the learner made.
- **Duolingo (selectively)**: The collectible and habit mechanics create useful precedent for engagement, but Duolingo optimizes for daily engagement at the cost of depth. Syntropy Learn inverts this: depth and real project output are the primary metric.

### Labs

- **arXiv**: The model of open preprints and free access is the most important reference for Labs' openness principle. Labs adds the interactive layer, structured review system, and ecosystem integration.
- **Overleaf**: The experience of collaborative LaTeX writing with real-time rendering is the benchmark of usability for the Labs article editor. Labs aspires to be at least as good as Overleaf for writing, with much more functionality around it.
- **PubPeer**: The idea of post-publication review linked to specific passages comes from PubPeer. Labs generalizes this model and integrates it into the native publication flow.
- **oTree**: Framework for behavioral experiments online — the direct inspiration for the Labs interactive experiment component. Labs aspires to be a platform where oTree-type experiments are first-class citizens, created and published alongside the article.
- **MyST Markdown (Executable Books Project)**: The scientific writing format Labs adopts as the modern standard. Allows combining narrative, executable code, interactive figures, and references in a single document.
- **Stack Overflow (reputation system by area)**: The granularity of Stack Overflow's reputation per tag is the inspiration for the Labs scientific reputation system by subject area.
- **Semantic Scholar / OpenAlex**: Open bibliographic databases indexing scientific articles with rich metadata — the external indexing model with which Labs must be interoperable.

### Interface Character References

- The web application should feel like **Linear** (Hub management) and **Notion** (planning) combined, with **GitHub's** contribution culture and **Duolingo's** accessibility for learners (without its infantile tone).
- The institutional site should feel like a well-maintained open source project documentation site — **Vercel's** or **Stripe's** public presence, honest about what is shipped and what is coming.
- The portfolio should feel like a **game character profile** crossed with a **professional portfolio** — impressive to both a recruiter and a fellow contributor.
- The Labs article editor should feel like **Overleaf** for rendering quality with **Notion** for editing fluidity.
- The Labs discovery interface should have the seriousness of an academic bibliographic database with the navigability of a curated content feed.
- The Learn navigation map should feel like **No Man's Sky's** universe map — explorable, spatial, rewarding discovery — rendered in a web-native aesthetic.
- The Hub governance interface should feel like a **cooperative boardroom** — serious, with a record of everything, but not intimidating or excessively technical.
- The Hub contract configuration should feel like choosing a **Creative Commons license** — clear options, explained consequences, recognizable templates that do not require legal expertise to use.

---

## Next Steps

Once this Vision Document is complete and assessed:

1. **Assess quality**: Use Prompt 00 (`.cursor/commands/00-refine-vision.md`) to get a quality score and guided improvement suggestions.
2. **Generate architecture**: Use Prompt 01 to transform this vision into technical architecture — with attention to the mapping of Laboratory → Institution, Research Line → Project, and Scientific Artifacts → Artifacts with specific typing, as well as the bounded context map across the three pillars and the Platform.
3. **Iterate**: Use Prompt 02 until the architecture reflects the vision.

See `.cursor/FRAMEWORK.md` for the complete workflow guide.
