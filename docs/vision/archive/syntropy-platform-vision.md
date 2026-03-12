# Syntropy Platform — Vision Document

> **Document Type**: Vision Document
> **Author**: José Eugênio
> **Created**: 2025-01-01
> **Last Updated**: 2026-03-12
> **Status**: Review

---

## Nota para LLMs e Agentes de Desenvolvimento

Este documento descreve a visão da **Syntropy Platform** — a camada transversal que unifica os três pilares do ecossistema (Learn, Hub e Labs). Ele deve ser lido em conjunto com os seguintes documentos de referência:

- `syntropy-ecosystem-llm-context.md` — especificação técnica completa do protocolo de instituições digitais, incluindo o modelo de artefatos, o IACP, o sistema de governança e o mecanismo de distribuição de valor. Este documento é a autoridade técnica sobre esses conceitos e deve ser consultado antes de qualquer decisão de implementação que os envolva.
- `syntropy-learn-vision.md` — visão do pilar educacional (Learn)
- `syntropy-hub-vision.md` — visão do pilar de colaboração e criação (Hub)
- `syntropy-labs-vision.md` — visão do pilar de pesquisa científica (Labs)

Decisões arquiteturais que cruzam pilares — autenticação, event bus, portfólio, gamificação, busca, sistema de agentes de IA — são responsabilidade da Platform e estão descritas aqui. Decisões de domínio específicas de cada pilar estão nos documentos respectivos. O sistema de agentes de IA (Component 11) é transversal a todo o ecossistema: a infraestrutura central, o contexto unificado do usuário e o registro de agentes residem na Platform; os casos de uso específicos de cada pilar referenciam esse componente nos seus próprios documentos de visão.

---

## 1. Problem Statement

Learning, building, and researching are deeply interconnected activities — yet the tools that support them are fragmented. A developer who just learned a technique must leave their learning platform to apply it. A researcher who validates a hypothesis has no natural path to turn it into an educational resource or an open source project. A student who completes a course has no frictionless way to contribute that knowledge to a real project.

This fragmentation has concrete costs. Knowledge sits idle because there is no bridge between learning and application. Open source maintainers receive contributions from people who lack the context to contribute effectively. Researchers publish findings that never reach practitioners. Students learn in isolation and carry the social cost of online learning — disengagement, lack of accountability, and absence of community.

The cost of leaving things as they are is compounding: each isolated tool deepens the silos, and people who could be building together instead build alone, learn alone, and research alone.

Beyond the fragmentation, there is a deeper problem: creators have no native way to own what they produce or to be recognized for it over time. A developer who writes a library used by thousands receives no attribution when that library is embedded in a commercial product. A teacher whose curriculum structures an entire learning path for a hundred students earns nothing after the initial publication. The current ecosystem of tools treats creation as a one-time transaction — create, publish, and let go — rather than as a continuous relationship between a creator and their work.

### Current Solutions

- **Learning platforms (Coursera, Udemy, etc.)**: Provide structured courses but are disconnected from real projects and communities. Completion rarely produces verifiable artifacts. Knowledge is consumed, not applied.
- **Code collaboration platforms (GitHub, GitLab)**: Enable project collaboration but have no educational layer. New contributors lack guided pathways into projects, and the gap between "learning to code" and "contributing to real software" is left entirely to the individual.
- **Academic publishing platforms (ArXiv, ResearchGate)**: Support open research but are disconnected from engineering practice. Results rarely translate into usable software or educational content without enormous individual effort.
- **Portfolio platforms (LinkedIn, personal websites)**: Require manual curation and rely on self-reporting. There is no mechanism to verify claims, and portfolios do not reflect activity — they reflect whatever the person chose to highlight.
- **DAOs and decentralized governance platforms**: Provide primitives for decentralized organization but are not designed for the specific context of knowledge creation, education, and software development. The governance and ownership layer is separated from the production environment.

---

## 2. Ideal Future

The Syntropy Platform is a unified ecosystem where learning, building, and researching are not three separate activities but one continuous journey. A student completes a learning fragment and immediately sees open issues in real projects that their new artifact can solve. A contributor hits a wall on a complex problem and is shown exactly which fragment contains the knowledge needed to unsolve it. A researcher validates a technique in Labs and can translate it into a Hub project and a Learn track within the same ecosystem.

Every action leaves a verifiable trace. A user's portfolio builds itself — not from what they claim to have done, but from what the ecosystem recorded. Reputation is earned through genuine contribution to others, not through consumption. The more a person helps others learn, build, and research, the more the ecosystem recognizes and rewards them.

Creators own what they produce. A teacher who writes a learning module retains authorship of that module as a verifiable artifact — not as a claim, but as a cryptographic record. A developer whose library is used by projects across the ecosystem receives attribution and, if they so choose, ongoing value based on that usage. Institutions — research groups, educational programs, open source projects — can be governed transparently, with their governance terms publicly readable and their decision histories auditable by anyone.

Intelligent assistants are embedded throughout the journey. A student struggling with a specific artifact gets guidance calibrated to exactly what they have already built and learned — not generic advice. A teacher designing a new track has an AI collaborator who understands the pedagogical structure of the ecosystem and can help validate coherence and progression. A researcher conducting a literature review has an agent that searches not only external publications but the ecosystem's own body of knowledge — connecting scientific results in Labs to implementations in Hub and learning materials in Learn. A maintainer configuring a new digital institution can describe its governance in plain language and have an agent translate that intent into formal protocol configuration. These assistants are useful precisely because they share a unified model of the user and the ecosystem — the same portfolio, the same event history, the same cross-pillar context that makes the rest of the platform coherent.

Infrastructure is cooperative. People contribute computational resources to a shared grid, and those resources power the development environments, experiment runners, and services of the entire community. The system is self-sustaining because participation is meaningful and the community is the infrastructure.

Creators — educators, maintainers, researchers — can be financially supported by the community they impact. The platform itself is free and open, but creators retain full autonomy over their work: a teacher can offer a paid course or a private track, a mentor can charge for their time, a developer can keep a project closed until they are ready to share it, a researcher can embargo a dataset while work is in progress. Participation in Syntropy does not require any particular stance on openness or monetization — the ecosystem provides the infrastructure, and creators decide how to use it. Everything verifiable. Everyone can participate.

### 2.5 Protocolo de Instituições Digitais

Uma das capacidades distintivas da plataforma é permitir que criadores *possuam* o que produzem e que grupos possam se organizar em **instituições digitais** com governança própria, verificável e descentralizada. Isso é viabilizado por um protocolo específico da plataforma — distinto dos demais componentes — que opera de forma análoga a uma extensão do conceito de DAO aplicada ao contexto de criação de conhecimento e software.

Neste protocolo, toda produção intelectual ou técnica — um módulo educacional, um pacote de software, um dataset de pesquisa — é representada como um **artefato**: um ativo digital com identidade verificável, autoria criptograficamente assinada e uma interface de utilização governada por contrato. Artefatos se organizam em **projetos digitais** (composições estruturadas com manifesto, governança e protocolo de monetização), que por sua vez podem ser estendidos em **instituições digitais** — estruturas com papéis, câmaras deliberativas, protocolos formais de decisão e uma cadeia auditável de todos os estados institucionais anteriores.

A hierarquia interna do protocolo reflete esta composição em dependência estrita:

```
Artefato
  └── IACP (Protocolo de Comunicação Inter-Artefato)
        └── Projeto Digital
              └── Instituição Digital
                    └── Distribuição de Valor + Tesouro
```

O **IACP** registra automaticamente toda interação entre artefatos, construindo um grafo de dependências emergente — sem declaração manual e sem possibilidade de falsificação. O **Tesouro** de cada projeto distribui valor entrante entre os artefatos contribuintes usando Unidades de Valor Abstratas (AVUs) — unidades contábeis sem valor especulativo, convertidas em moeda concreta apenas no momento do pagamento via oráculo de câmbio. O resultado é um sistema em que criadores recebem atribuição de valor baseada em uso real, de forma contínua e verificável, independentemente de qual pilar do ecossistema originou o artefato.

Este protocolo não define o que a plataforma é — ele é um de seus componentes essenciais. A IDE integrada, o portfólio dinâmico, a camada social, a busca unificada e os demais sistemas coexistem com ele como partes complementares de um ecossistema integrado. Nenhum componente é mais central que os outros; cada um serve a uma dimensão diferente do que torna o ecossistema coeso.

> A especificação técnica completa deste protocolo — sistema de tipos extensível, invariantes formais, estrutura do registro de identidade, lógica de deliberação institucional e rationale de design — está documentada em `syntropy-ecosystem-llm-context.md`.

---

## 3. Users and Actors

Syntropy is a single integrated ecosystem. Its users are not categorically different people using separate products — they are participants in the same environment who naturally gravitate toward different activities at different moments. A person who today is primarily learning may tomorrow be building a project and the day after contributing to a research hypothesis. The table below describes activity roles, not distinct user types. A single user will often hold several of these roles simultaneously, and the ecosystem is designed to support and reflect that fluidity.

| Role | Description | Primary Need | Frequency | Technical Level |
|------|-------------|--------------|-----------|-----------------|
| Learner | A user primarily engaged in following tracks and building artifacts through Learn | Follow learning paths, build artifacts, apply knowledge to real projects | Daily | Non-technical to Technical |
| Builder / Contributor | A user primarily engaged in creating or contributing to projects through Hub | Collaborate on projects, resolve issues, contribute code, get recognized | Daily | Technical |
| Researcher | A user primarily engaged in scientific investigation through Labs | Publish hypotheses and results, share datasets, collaborate with peers | Weekly to Daily | Technical to Expert |
| Content Creator | A user creating educational tracks, courses, and fragments for others | Build structured educational content, reach learners, monetize or share freely | Weekly | Technical |
| Mentor | An experienced user who guides others through their trajectory in the ecosystem | Support mentees, track their progress, receive recognition | Weekly | Technical |
| Sponsor / Patron | A user who financially supports creators, maintainers, or researchers | Discover impactful contributors and direct financial support | On demand | Non-technical |
| Grid Node Operator | A user who contributes computational resources to the Cooperative Grid | Contribute infrastructure capacity with controlled policies | On demand | Technical to Developer |
| Administrator / Moderator | A user responsible for platform health, content quality, and governance | Moderate content, manage roles, enforce policies transparently | Daily | Admin |

**Learner role**: The primary goal is to learn by doing. Users in this role need a structured path from zero to professional competence, with each step producing something real. They are often starting without knowing where to begin, and the platform must reduce onboarding friction. Success means completing tracks, building artifacts that others find useful, and seeing the portfolio grow organically — and, when ready, transitioning naturally into contributing or creating.

**Builder / Contributor role**: The user already has skills and wants to apply them in meaningful projects. Common frustrations in typical open source — unclear contribution paths, lack of context, no recognition — are addressed by the ecosystem's integrated learn-to-contribute pathway. Success means getting contributions accepted, resolving meaningful issues, and being part of a project community that also feeds back into learning and research.

**Content Creator role**: The user has domain expertise and wants to share it at scale. They choose their own terms: content can be open and free, offered at a price, or restricted to a specific audience. Success means learners completing their tracks, impact reflected in the portfolio, and sustainable conditions to keep creating.

---

## 4. Interface and Interaction Preferences

### Delivery Interfaces

- [x] **Web Application** — The primary interface for all users. Used for all three pillars (Learn, Hub, Labs), the portfolio, planning, communication, and sponsorship. Desktop-first with mobile-responsive support. Requires login. The institutional site is a public-facing web app accessible without login.
- [x] **REST API** — Developer-facing API exposing platform capabilities for integrations, external tooling, and the Cooperative Grid management layer.
- [x] **Dashboard / Admin Interface** — Used by administrators and moderators for content moderation, role management, governance, and ecosystem health monitoring.
- [x] **Background Service / Worker** — The event bus operates as a background service capturing all user actions and feeding the dynamic portfolio, gamification engine, recommendation engine, and notification system. Triggered by events from all pillars.
- [x] **Embedded / SDK** — The integrated development environment (IDE) embedded within the platform serves all three pillars without requiring users to leave the platform. Grid node operators use a CLI/API for bootstrap and management.

### Interaction Style

- [x] **Self-service** — Users accomplish tasks independently: following tracks, contributing to projects, publishing research, managing their planning board.
- [x] **Guided / Wizard-driven** — Onboarding flows: career discovery assistant, placement quiz, mentor matching. New users are guided through complex decisions.
- [x] **Power-user / Expert-first** — The Hub and Labs are designed for experienced contributors. The development environment and project management tools offer depth and composability.
- [x] **Collaborative** — Multiple users contribute to shared projects, research, and educational content simultaneously. The social layer (forums, artifact gallery, activity feed) is built around shared artifacts.
- [x] **Automated / Headless** — The event bus, portfolio aggregation, gamification, and recommendation engine operate without human intervention during normal use.

### Accessibility Requirements

The web application must follow WCAG 2.1 AA standards to ensure access for users with disabilities. As a platform with educational and professional goals — including users who may be younger or in underserved communities — accessibility is not optional. Color alone must not be used to convey status in gamification elements, progress indicators, or notifications.

The visual design system is unified across the entire ecosystem. All three pillars share a common design language — the same base palette, typography, component library, and interaction patterns. Each pillar may carry small contextual adjustments (Learn emphasizes readability and progression; Hub emphasizes information density and developer familiarity; Labs emphasizes structured documentation) but these are variations of the same foundation, not separate design systems. A user navigating across pillars should experience one coherent product, not three loosely connected applications.

---

## 5. System Components and Subsystem Visions

### Component 1: Institutional Site

**Type**: Web App

**Primary users**: Prospective users (all actor types), visitors discovering the ecosystem

**Purpose in one sentence**: Communicate the Syntropy vision, explain the three pillars, and route each visitor to the right entry point in the ecosystem.

**Design character**: Feels like a well-crafted open source project homepage — honest, transparent about what is built and what is not yet built, energizing without being hypey. Closer to the tone of Stripe's documentation than a SaaS marketing page. It should feel like an invitation to build something together, not a product pitch.

**Key design principles for this component**:
- Radical transparency: show the project as it is, including what is still in construction
- Clear routing: every visitor profile (student, developer, researcher, sponsor) has an obvious next step
- Live ecosystem metrics: show real numbers (active projects, students, contributors) to demonstrate the ecosystem is alive

**What success looks like for this component**: A first-time visitor understands what Syntropy is and what it is not within 60 seconds. Each visitor type finds a clear path into the ecosystem. The site reflects the open source identity of the project without pretending it is a finished product.

#### Sub-components of the Institutional Site

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---------------|---------|--------------|------------------------------|
| Ecosystem Overview | Explain the three pillars and how they integrate | Pillar, Journey, Integration | Language must be accessible to non-technical visitors; no jargon |
| Live Metrics Dashboard | Show real-time ecosystem activity to signal vitality | Active projects, students enrolled, artifacts published, contributors | Metrics are read-only and auto-refreshed from the event bus |
| Visitor Routing | Guide each visitor type to the right entry point | Visitor profile, Recommended entry point | Routing is based on self-identified role, not gating |

---

### Component 2: Dynamic Portfolio

**Type**: Web App (cross-pillar profile system)

**Primary users**: All authenticated users; viewed by potential employers, collaborators, sponsors, and community members

**Purpose in one sentence**: Automatically record every meaningful action across all pillars into a unified, verifiable profile that builds itself as the user participates.

**Design character**: Feels like a living resume crossed with an MMORPG character sheet. Dense with meaningful information, but organized so that the most important signals are immediately visible. The gamification layer adds personality without infantilizing the professional record.

**Key design principles for this component**:
- Automatic over manual: the portfolio builds itself; users should never need to curate it
- Contribution-first progression: advancement comes from helping others, not from consuming content
- Verification over self-reporting: every displayed achievement is something the ecosystem witnessed

**What success looks like for this component**: Users share their Syntropy portfolio link instead of a LinkedIn profile for professional contexts. A viewer can immediately understand what a user has built, taught, researched, and contributed — and trust that it is accurate. Mentors and sponsors use it to evaluate who to support.

#### Sub-components of the Dynamic Portfolio

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---------------|---------|--------------|------------------------------|
| Activity Record | Capture and display every meaningful action across pillars | Event, Contribution, Artifact, Pillar source | Events are immutable once recorded; no manual editing allowed |
| Gamification Layer | Express progression and identity through game mechanics | XP, Level, Virtual currency, Achievement, Title, Collectible, Avatar | Advancement is driven exclusively by contribution, never by consumption |
| Skill Graph | Display the user's demonstrated competencies derived from actual artifacts | Skill, Proficiency signal, Artifact evidence | Skills are inferred from artifacts produced, not from self-declaration |
| Reputation System | Reflect how the community values a user's contributions | Reputation score, Peer recognition, Mentor history | Reputation is a function of community impact, not platform seniority |

---

### Component 3: Development Environment

**Type**: Embedded Web IDE + Background Service

**Primary users**: Students (Learn), contributors (Hub), researchers (Labs)

**Purpose in one sentence**: Provide an integrated development and writing environment that eliminates the need to leave the platform to do real work.

**Design character**: Feels like VS Code embedded in a collaborative platform — familiar to developers, accessible to students. Not a toy sandbox; capable of real development work. The environment should disappear and let the work be the focus.

**Key design principles for this component**:
- Zero setup: new contributors start contributing without cloning, configuring, or installing anything
- Isolation by default: each session runs in an isolated container; experiments cannot affect others
- Context-aware: the environment knows whether the user is in Learn, Hub, or Labs and adapts accordingly

**What success looks like for this component**: A contributor resolves a Hub issue entirely within the platform. A student completes a fragment, builds an artifact, and publishes it — all in one session without switching tools. A researcher writes an analysis, runs it, and publishes results without leaving the platform.

#### Sub-components of the Development Environment

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---------------|---------|--------------|------------------------------|
| Code Editor | Provide a full-featured editing experience for all pillar contexts | Session, Workspace, Language server, Extension | Context-aware defaults per pillar (Learn, Hub, Labs); not a generic editor |
| Container Orchestration | Provision and manage isolated execution environments per session | Container, Session, Resource quota, Cooperative Grid node | Each session is isolated; resources are sourced from the Cooperative Grid when available, from cloud otherwise |
| Artifact Publisher | Allow users to publish completed artifacts from within the environment | Artifact, Publication event, Community gallery | Publication triggers an event bus event; the artifact enters the protocol layer upon publication |

---

### Component 4: Sponsorship and Monetization System

**Type**: Web App (cross-pillar payment and access management layer)

**Primary users**: Sponsors (sending), Content Creators / Maintainers / Researchers / Mentors (receiving or managing access)

**Purpose in one sentence**: Give creators full control over how they share and monetize their work — from fully open to paid or private — while enabling the community to financially support those whose contributions they value.

**Design character**: Feels like a creator tools platform with a transparent impact dashboard. Clean, purposeful, and built on trust. Flexible enough to serve both a researcher who shares everything freely and a mentor who charges for their time.

**Key design principles for this component**:
- Creator autonomy is primary: the platform does not prescribe how creators share or price their work; each creator decides independently
- Impact-driven discovery: sponsors and buyers find recipients through verified contribution metrics, not self-promotion
- Simplicity: voluntary sponsorship (recurring or one-time) and paid access are distinct modes; both should be straightforward to configure and use

**What success looks like for this component**: Creators who choose open sharing can receive voluntary sponsorship from a community that values their work. Creators who choose paid models can reach their audience and manage access without friction. Sponsors report confidence that their support is directed at people generating real value. The system requires minimal active management from creators regardless of their chosen model.

#### Sub-components of the Sponsorship and Monetization System

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---------------|---------|--------------|------------------------------|
| Voluntary Sponsorship | Enable community members to financially support creators they value | Sponsorship, Patron, Recurring contribution, One-time contribution | Sponsorship never gates content access — it is purely voluntary and separate from access control |
| Creator Monetization | Allow creators to offer paid or restricted access to their work | Paid access, Access policy, Price, Audience restriction | Creator autonomy: the platform enforces the access policy but does not set or recommend pricing |
| Impact Discovery | Surface creators based on verified contribution metrics for potential sponsors | Impact metrics, Contributor profile, Verification | Metrics are derived from event bus data, never from self-reporting |

---

### Component 5: Authentication System

**Type**: Background Service + Web App (login/session layer)

**Primary users**: All users (transparent interaction)

**Purpose in one sentence**: Provide a single, unified identity that follows the user seamlessly across all three pillars and all platform components.

**Design character**: Invisible. Authentication should be the fastest part of any session — users should not think about it.

**Key design principles for this component**:
- One login, full access: a single session grants access to Learn, Hub, Labs, portfolio, and all platform components
- Multi-method support: email/password and OAuth (GitHub, Google) from day one
- RBAC at the core: roles and permissions are enforced consistently across the entire ecosystem

**What success looks like for this component**: Users never encounter permission errors when they should have access. Role transitions (e.g., becoming a mentor) are reflected immediately across the platform. There are no separate login flows per pillar.

#### Sub-components of the Authentication System

No sub-components — this component is a single cohesive area. Its scope is authentication, session management, and RBAC enforcement. Identity claims about artifacts and authorship (cryptographic provenance) are handled by the Digital Institutions Protocol (Component 10), not here.

---

### Component 6: Communication System

**Type**: Web App (social layer)

**Primary users**: All authenticated users

**Purpose in one sentence**: Enable meaningful interaction between users through contextualized forums, direct messaging, activity feeds, and notifications.

**Design character**: Feels like GitHub Discussions meets a lightweight social feed — structured enough to keep conversations findable, lightweight enough not to feel like a second inbox.

**Key design principles for this component**:
- Context-first: every forum is anchored to a specific artifact (fragment, project, experiment), not a generic category
- Signal over noise: notifications are configurable and default to the minimum needed to stay informed
- Social without social media: the activity feed emphasizes work and progress, not likes and virality

**What success looks like for this component**: Users resolve doubts in fragment forums without leaving the learning flow. Mentor-mentee coordination happens naturally over DMs. The activity feed creates a sense of community progress without becoming a distraction.

#### Sub-components of the Communication System

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---------------|---------|--------------|------------------------------|
| Contextualized Forums | Anchor discussions to specific artifacts, projects, or experiments | Thread, Reply, Helpful mark, Context anchor | Every thread has a parent context; orphan threads (no anchor) are not permitted |
| Direct Messaging | Enable private communication between users | Message, Conversation, Read receipt | Mentor-mentee conversations are surfaced in the planning component for coordination |
| Activity Feed | Show community progress in real time | Event, Contribution signal, Feed filter | Feed is populated by the event bus; no algorithmic amplification — chronological by default |
| Notification System | Alert users to relevant events without becoming a distraction | Notification, Type, Channel (in-app / email), Preference | Notifications are opt-out for high-signal events (e.g., PR merged) and opt-in for lower-signal ones |

---

### Component 7: Unified Search and Recommendation

**Type**: Web App + Background Service (recommendation engine)

**Primary users**: All authenticated users

**Purpose in one sentence**: Let users find any resource across all pillars from a single entry point, and proactively surface opportunities they did not know to search for.

**Design character**: Feels like a command palette with intelligence built in — fast, cross-pillar, context-aware. The recommendation layer should feel like serendipity, not surveillance.

**Key design principles for this component**:
- Bidirectional recommendations: not only "find what you need" but "be found when you're needed"
- Profile-aware ranking: results are personalized to the user's skills, history, and current context
- Cross-pillar by default: a single search surfaces content from Learn, Hub, and Labs simultaneously

**What success looks like for this component**: A student finishing a fragment immediately sees relevant Hub issues to apply their new knowledge. A contributor stuck on a problem is shown the exact Learn fragment that teaches the needed concept. No manual bridging between pillars.

#### Sub-components of Unified Search and Recommendation

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---------------|---------|--------------|------------------------------|
| Search Index | Index all pillar content and make it retrievable from a single query | Index, Query, Result, Pillar filter | Index is updated in near-real-time from the event bus; cross-pillar by default |
| Recommendation Engine | Proactively surface relevant opportunities based on recent activity | Recommendation, Signal, Context match | Recommendations are triggered by events (fragment completion, PR merged, article published), not by periodic batch |

---

### Component 8: Governance and Administration

**Type**: Dashboard / Admin Interface + Background Service

**Primary users**: Administrators, moderators, community governance participants

**Purpose in one sentence**: Ensure the ecosystem operates fairly, safely, and transparently through documented, auditable, and increasingly community-driven governance.

**Design character**: Feels like an open governance platform — every decision is visible, every policy is documented, every action is auditable. Not a hidden admin panel; a transparent governance layer.

**Key design principles for this component**:
- Policy-as-code: rules that can be automated are automated and version-controlled
- Open governance: moderation policies are public and subject to community input
- Consistency across pillars: the same rules apply whether content is in Learn, Hub, or Labs

**What success looks like for this component**: Content moderation decisions are consistent and explainable. Community members can propose and discuss governance changes. Administrators can audit any state change in the platform.

#### Sub-components of Governance and Administration

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---------------|---------|--------------|------------------------------|
| Content Moderation | Review and act on flagged content across all pillars | Flag, Review, Moderation action, Policy | Policies are versioned and publicly readable; actions reference the policy version that authorized them |
| Role Management | Assign, revoke, and audit roles across the ecosystem | Role, Permission set, Audit log | Role transitions are events on the event bus; revocations take effect immediately |
| Community Governance | Enable community participation in platform policy decisions | Proposal, Discussion, Voting, Policy amendment | Platform-level governance is distinct from institutional governance (which belongs to Component 10) |

---

### Component 9: Planning and Management

**Type**: Web App

**Primary users**: Students (Learn planning), contributors (Hub project management), researchers (Labs research management)

**Purpose in one sentence**: Give every user a unified view of their tasks, goals, and progress across all three pillars in one place.

**Design character**: Feels like Linear meets a personal dashboard — clean, structured, and built for people who care about doing things deliberately. Adapts its vocabulary to the context (study plan vs. sprint vs. research cycle) without changing its fundamental structure.

**Key design principles for this component**:
- Unified view: one dashboard shows learning tasks, open issues, and research stages simultaneously
- Context-appropriate vocabulary: the same Kanban/backlog model adapts to study plans, project sprints, and research pipelines
- Planning feeds the portfolio: completed tasks, milestones, and organized sprints contribute to the portfolio record

**What success looks like for this component**: A user can manage their entire week — studying, contributing, researching — from a single planning view without switching contexts. Planning consistency is reflected in their portfolio, demonstrating organizational capability alongside technical skills.

#### Sub-components of Planning and Management

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---------------|---------|--------------|------------------------------|
| Personal Planning Board | Manage tasks and goals across all pillars in a single view | Task, Goal, Kanban column, Sprint, Study plan | Vocabulary adapts per pillar context (Task = Fragment in Learn / Issue in Hub / Research step in Labs) |
| Mentor Coordination | Support the mentorship relationship with shared visibility into mentee progress | Mentee, Progress snapshot, Session note | Mentors see only what mentees explicitly share; no automatic visibility into private planning |

---

### Component 10: Digital Institutions Protocol

**Type**: Protocol Layer / Background Service

**Primary users**: Creators publishing artifacts; maintainers organizing projects and institutions; the platform internally for value attribution and portfolio construction

**Purpose in one sentence**: Enable creators to own what they produce and groups to organize into digital institutions with configurable, decentralized, and verifiable governance.

**Design character**: Operates transparently for most users — the student who publishes an artifact does not need to understand the protocol to benefit from authorship attribution. For maintainers and advanced creators, the contract configuration and governance layer must be accessible, unambiguous, and well-documented. The analogy is precise: this protocol is to the Hub what Git is to GitHub — the substrate that makes ownership and collaboration possible, without requiring that every user understand its internals.

**Key design principles for this component**:
- Real ownership: authorship is cryptographically bound to the creator and verifiable without a central authority
- Configurable, not prescribed governance: the protocol provides primitives; each institution defines its own rules within the protocol's guarantees
- Usage-based attribution: distributed value reflects actual artifact usage, not arbitrarily declared weights
- Separation of content and contract: updating an artifact does not force renegotiation of contracts with all dependents
- Open type system: the artifact type registry is extensible; no fixed enumeration limits what the ecosystem can represent

**What success looks like for this component**: A creator receives continuous attribution for an artifact published years before, without manual action. An institution with dozens of members conducts formal decisions with verifiable quorum without depending on proprietary infrastructure. An external collaborator reads an institution's governance terms before joining and makes an informed decision. The dependency graph across the ecosystem is maintained automatically and faithfully, without manual declaration.

> Para a especificação técnica completa deste protocolo — incluindo a definição formal de artefato, o sistema de tipos extensível, o IACP fase a fase, o modelo de câmaras e deliberação das instituições digitais, os invariantes do sistema e o rationale de cada decisão de design — consulte `syntropy-ecosystem-llm-context.md`. Nenhuma decisão de implementação sobre este componente deve ser tomada sem a leitura desse documento.

#### Sub-components of the Digital Institutions Protocol

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---------------|---------|--------------|------------------------------|
| Artifact Registry | Manage the lifecycle of artifacts: publication, versioning, identity anchoring | Artifact, Identity Record, Content hash, Author public key, Version lineage | Identity records are immutable once anchored; contracts bind to the artifact entity, not to individual versions |
| IACP (Inter-Artifact Communication Protocol) | Govern all interactions between artifacts through a four-phase protocol | Identification, Negotiation, Utilization, Registration, Usage Agreement Event | Every authorized interaction generates a signed Usage Agreement Event that feeds the dependency graph; the graph is emergent, not declared |
| Smart Contract Engine | Execute and enforce the utilization conditions associated with each artifact | Smart contract, Utilization mode, Permitted / Denied response, State transition | Contracts are deterministic functions; no probabilistic or human-mediated enforcement |
| Project Manifest | Declare and manage the composition of internal and external artifacts within a project | Internal artifact, External artifact, Artifact Manifesto, Dependency graph | External artifacts must have a recorded Usage Agreement Event; the dependency graph is the authoritative record of what a project depends on |
| Institutional Governance | Manage the expressive governance layer of digital institutions: roles, chambers, deliberation, and the legitimacy chain | Role, Chamber, Quorum, Tier set, Change classification function, Legitimacy chain, Right of exit | Every state transition is authorized by the contracts in force at proposal time; the legitimacy chain is publicly auditable |
| Value Distribution and Treasury | Receive incoming value, compute AVU-based distributions, and execute liquidations | Abstract Value Unit (AVU), Treasury, Monetization protocol, Creator weight, Liquidation, Oracle | AVUs have no intrinsic speculative value; currency conversion occurs only at liquidation via oracle; no component of the distribution logic operates in concrete currencies |

---

### Component 11: AI Agent System

**Type**: Background Service + Web App (embedded assistant layer)

**Primary users**: All authenticated users across all pillars; each pillar surfaces specific agents in context

**Purpose in one sentence**: Provide a unified, context-aware AI assistant infrastructure that embeds intelligent agents throughout the ecosystem — calibrated to each user's actual history, competencies, and current activity — without fragmenting context across pillar boundaries.

**Design character**: Feels like a knowledgeable collaborator who has been watching your work across the entire ecosystem — not a chatbot that resets with every session. Assistance should feel earned and precise: an agent that knows what you built last week, what you are struggling with today, and what exists in the ecosystem that could help. Interactions should be unobtrusive by default and available on demand, never intrusive.

**Key design principles for this component**:
- Unified context over siloed assistants: agents derive their value from the shared user model — portfolio, event history, skill graph, cross-pillar activity — not from domain knowledge alone; a per-pillar architecture without a shared context layer would forfeit the ecosystem's primary advantage
- Assistance, not authorship: the system assists, accelerates, and validates; every artifact, track, article, or institution produced in the ecosystem has human authorship; the agent is a collaborator, never the author of record
- Transparency of AI involvement: interactions and outputs influenced by AI assistance are visibly marked; users always know what was suggested by an agent and what was deliberately approved or modified by them
- Progressive disclosure: basic assistance (Q&A, suggestions, navigation) is immediately available; more powerful agentic capabilities (multi-step workflows, autonomous research) are surfaced progressively as users demonstrate readiness
- Open and extensible: the agent registry is open; community contributors can propose and register new specialized agents following the same registration mechanism used throughout the ecosystem

**What success looks like for this component**: A student who is stuck receives guidance that directly addresses their specific artifact, not a generic explanation of the concept. A teacher completing a new track receives a pedagogical coherence review that identifies gaps before learners encounter them. A researcher reviewing literature receives a synthesis of external publications *and* relevant ecosystem artifacts, bridging Labs, Hub, and Learn without manual navigation. A maintainer configuring a new institution describes their governance intent in plain language and receives a correctly parameterized protocol configuration to review and approve.

**Unique constraints**:
- Agents must never make irreversible actions on behalf of users without explicit confirmation; all consequential actions (publishing an artifact, creating an institution, submitting a contribution) require deliberate human approval
- The context model fed to agents must respect privacy and access controls; an agent assisting a user in Learn must not expose artifacts from a private Hub project the user has no access to
- AI-generated content suggestions must be clearly distinguishable from human-authored content in the platform's data model, both for display and for event bus recording purposes

#### Sub-components of the AI Agent System

| Sub-component | Purpose | Key Concepts | Distinct Vocabulary or Rules |
|---------------|---------|--------------|------------------------------|
| Orchestration and User Context Engine | Maintain the unified cross-pillar context model for each user and route agent invocations | User context model, Long-term memory, Session context, Agent routing | The context model is built continuously from the event bus and portfolio; it is the substrate that makes all agents useful; it belongs to the platform, not to any pillar |
| Agent Registry | Register, version, and discover available agents and their tool sets | Agent definition, System prompt, Tool set, Activation policy, Agent version | New agents are registered following an open registration mechanism; each agent declares its required tools and the contexts in which it should be activated |
| Tool Layer (Platform APIs) | Expose ecosystem data and actions as callable tools for agents | Tool, API endpoint, Permission scope, Pillar context | Tools are scoped by pillar and permission level; an agent can only call tools its definition declares and the user's session permits |
| Learn Agents | Specialized agents for the educational pillar | Track Creator Agent, Student Q&A Agent, Pedagogical Validator Agent, Curriculum Architect Agent | See `syntropy-learn-vision.md` for the complete specification of Learn-specific agents; authorship of all educational content remains human |
| Hub Agents | Specialized agents for the creation and collaboration pillar | Artifact Copilot Agent, Institution Setup Agent, Contribution Reviewer Agent | See `syntropy-hub-vision.md`; the Institution Setup Agent translates natural language governance intent into formal Digital Institutions Protocol configuration for human review and approval |
| Labs Agents | Specialized agents for the scientific research pillar | Literature Review Agent, Research Structuring Agent, Article Drafting Agent, Artifact Research Agent | See `syntropy-labs-vision.md`; the Literature Review Agent searches both external publications and ecosystem-internal artifacts, connecting research results to Hub implementations and Learn tracks |
| Cross-Pillar Navigation Agent | Proactively surface cross-pillar opportunities while the user is active in any single pillar | Cross-pillar signal, Opportunity recommendation, Context trigger | Activated by the orchestration engine when the event bus emits signals that indicate a cross-pillar connection exists; operates transparently in the background and surfaces suggestions non-intrusively |

---

## 5a. Domain Priorities — Core, Supporting, and Generic

| Business Area | Type | Justification | Strategy |
|---------------|------|---------------|----------|
| Dynamic Portfolio and Event Bus | Core | The automatic, verifiable portfolio is the primary differentiator of the ecosystem — nothing like it exists across the combination of education, collaboration, and research. The event bus is what makes it possible. | Build carefully with rich domain model |
| Cross-Pillar Recommendation Engine | Core | Proactively connecting learners to projects, contributors to knowledge gaps, and researchers to practitioners is the mechanism by which the ecosystem creates value that no single-pillar tool can replicate. | Build carefully; invest in signal quality |
| Digital Institutions Protocol | Core | The ownership and governance protocol — artifact identity, IACP, institutional governance, value distribution — is unique to this ecosystem and cannot be approximated by off-the-shelf solutions. See `syntropy-ecosystem-llm-context.md`. | Build carefully; requires deep design before implementation |
| Gamification and Progression System | Core | Contribution-driven progression (XP, achievements, titles) that rewards community value rather than passive consumption is a key behavioral design choice that differentiates the ecosystem from conventional platforms. | Build with care; metrics and incentives must be well-calibrated |
| Integrated Development Environment | Supporting | Necessary for zero-setup contribution, but not architecturally unique. The value is in the integration with the ecosystem, not in the IDE itself. | Build on top of proven open source editors (e.g., VS Code / Monaco); invest in the integration layer |
| Planning and Management | Supporting | Necessary for cross-pillar coordination, but the core Kanban/backlog model is well understood. Value comes from the unified view and portfolio integration. | Build simply; do not over-engineer |
| Communication System (Forums, DMs, Feed) | Supporting | Necessary for community cohesion, but not architecturally unique. The value is in context anchoring, not in the messaging mechanics. | Build simply; context anchoring is the differentiator |
| AI Agent System — Orchestration and Context Engine | Core | The value of AI assistance in the ecosystem is inseparable from the unified user context model. A generic AI assistant provides generic value; an assistant that knows the user's complete cross-pillar history provides compounding, personalized value. This orchestration layer is not replicable by off-the-shelf AI products. | Build carefully; the context model and agent registry are differentiating; individual agents can use commodity LLM APIs |
| AI Agent System — Specialized Agents | Supporting | Individual agents — Learn Q&A, Hub copilot, Labs literature review — are high-value features built on top of the Core orchestration layer. Their domain logic is specific to Syntropy's pedagogical and protocol structures but not architecturally novel on their own. | Build progressively; start with highest-impact agents (student Q&A, track creator assistant) and expand |
| Authentication and RBAC | Generic | Well-understood problem with strong existing solutions. The challenge is integration with the ecosystem, not the auth logic itself. | Use off-the-shelf (Supabase Auth + custom RBAC layer) |
| Payment Processing | Generic | Solved problem; delegated entirely to a compliant third party. | Use Stripe or equivalent |
| Email / Notification Delivery | Generic | Solved problem; many reliable services exist. | Use off-the-shelf (SendGrid, Resend, or equivalent) |
| Institutional Site | Supporting | Important for discovery and first impressions, but not a source of competitive advantage. | Build cleanly; optimize for clarity and honesty |

### Core Domain Statement

The irreplaceable core of the Syntropy Platform is the combination of three capabilities that reinforce each other: a **verifiable, automatic portfolio** that faithfully records every contribution across all pillars without manual curation; a **cross-pillar recommendation engine** that turns those records into bidirectional opportunities — connecting learners to projects, contributors to knowledge gaps, and researchers to practitioners; and an **AI Agent System** whose value derives precisely from that unified context — agents that know the user's complete cross-pillar history and can calibrate assistance in ways that per-pillar or generic AI tools cannot. The **Digital Institutions Protocol** makes the ownership layer of those contributions real: what the portfolio records, the protocol anchors.

---

## 6. Key Capabilities

| # | Capability | Description | Priority |
|---|------------|-------------|----------|
| 1 | **Unified Authentication and Identity** | A single login grants access to all pillars and platform components. Users accumulate multiple roles (learner, contributor, researcher, mentor) under one identity. | MVP |
| 2 | **Dynamic Portfolio Generation** | Every meaningful action across all pillars is automatically captured via the event bus and registered in the user's portfolio. No manual curation required. | MVP |
| 3 | **Cross-Pillar Search and Recommendation** | A unified search surfaces resources from Learn, Hub, and Labs simultaneously. The recommendation engine proactively connects artifacts to issues and fragments to problems. | MVP |
| 4 | **Voluntary Sponsorship** | Users can support teachers, maintainers, and researchers through recurring or one-time contributions. Content access is never conditioned on payment. | MVP |
| 5 | **Integrated Development Environment** | A full development and writing environment embedded in the platform allows real work — coding, writing, running experiments — without leaving the ecosystem. | MVP |
| 6 | **Cross-Pillar Planning and Management** | A unified planning layer supports study planning (Learn), project sprint management (Hub), and research pipeline tracking (Labs) from a single dashboard. | MVP |
| 7 | **Gamified Progression System** | Contribution-driven XP, virtual currency, avatar customization, collectible items, achievements, and titles reward genuine community value, not passive consumption. | MVP |
| 8 | **Contextualized Communication** | Forums anchored to specific fragments, projects, and experiments, combined with direct messaging, activity feeds, and configurable notifications. | MVP |
| 9 | **Role-Based Access Control** | Roles (learner, teacher, contributor, researcher, mentor, moderator, admin) are managed centrally and enforced consistently across all pillars. | MVP |
| 10 | **Governance and Moderation** | Transparent, auditable moderation with policy-as-code automation. Community participation in governance decisions. | Post-MVP |
| 11 | **Cooperative Grid Integration** | Node operators contribute computational resources to the shared infrastructure. The development environment and experiment runners are powered by the grid. | Post-MVP |
| 12 | **Institutional Site with Live Metrics** | A public-facing site communicates the ecosystem vision, shows live metrics, and routes visitors to the appropriate entry points. | MVP |
| 13 | **Artifact Ownership and Digital Institutions** | Creators publish artifacts with verifiable authorship. Projects and institutions are governed via the Digital Institutions Protocol, with configurable governance, decentralized deliberation, and usage-based value distribution. | Post-MVP (protocol); MVP (basic artifact publication) |
| 14 | **AI Agent System — Core Infrastructure** | A unified orchestration layer maintains a cross-pillar user context model and routes requests to specialized agents. The agent registry enables new agents to be added without modifying core infrastructure. | MVP (orchestration layer + first agents) |
| 15 | **AI-Assisted Learning** | Agents assist students with artifact-specific Q&A and adaptive guidance, and assist content creators with track structuring, pedagogical validation, and curriculum coherence. Human authorship of all content is preserved. | MVP (student Q&A); Post-MVP (creator assistants) |
| 16 | **AI-Assisted Building and Collaboration** | A development copilot assists contributors with artifact creation in Hub. An institution setup agent translates natural language governance intent into formal protocol configuration for human review and approval. | Post-MVP |
| 17 | **AI-Assisted Research** | Agents support the full research workflow in Labs: literature review (across external publications and ecosystem-internal artifacts), hypothesis structuring, methodology review, and article drafting assistance. | Post-MVP |

---

## 7. Information and Concepts

| Concept | Description | Key Information | Related To | Owner/Creator | Lifecycle States |
|---------|-------------|-----------------|------------|---------------|------------------|
| User | An authenticated individual participating in any part of the ecosystem | Name, email, roles, avatar, skill profile, reputation score, XP level | Portfolio, all pillar content | Self-registered | Active → Suspended → Deactivated |
| Portfolio | The unified, automatically generated record of a user's entire trajectory | XP level, skills, certifications, achievements, titles, collectibles, activity history | User, Event Bus, all pillars | System (auto-generated) | Persistent / continuously updated |
| Role | A permission set a user can hold, granting access and capabilities | Role name, associated permissions, source (earned vs. assigned) | User, Governance | System / Admin / Gamification engine | Active → Revoked |
| Sponsorship | A voluntary financial contribution from one user to another | Amount, frequency (recurring / one-time), sender, recipient, date | User, Payment processor | Sponsor | Pending → Active → Cancelled |
| Event | A system-level record of a meaningful user action across any pillar | Event type, actor, timestamp, source pillar, associated artifact or entity | Event Bus, Portfolio, Gamification | System (auto-emitted) | Emitted → Processed → Archived |
| Achievement | A permanent recognition for a specific milestone reached in the ecosystem | Title, description, unlock condition, rarity, visual representation | User, Portfolio, Gamification | System | Locked → Unlocked |
| Forum Thread | A discussion anchored to a specific fragment, project, or experiment | Parent context, author, messages, helpful marks, date | Fragment (Learn) / Project (Hub) / Experiment (Labs) | Any user | Open → Resolved → Archived |
| Notification | An alert sent to a user about a relevant event in the ecosystem | Type, content, source event, read status, timestamp | Communication System, Event Bus | System | Unread → Read → Dismissed |
| Node | A machine contributing resources to the Cooperative Grid | Operator, capacity (compute/storage/network), policies, status | Cooperative Grid, Development Environment | Node operator | Registered → Active → Offline → Decommissioned |
| Artifact | Any digital asset with verifiable authorship, a criptographically anchored identity record, and a utilization interface governed by smart contract; the atomic unit of the Digital Institutions Protocol | Substance (content), Identity Record (author public key, content hash, signature, version), Utilization Interface (interaction modes, contract, usage descriptor) | All pillars, Portfolio, Digital Project, Event Bus | Creator (self-published) | Draft → Published → Versioned → Deprecated |
| Digital Project | A structured composition of artifacts with governance, an artifact manifesto, a monetization protocol, and an emergent dependency graph | Governance contract, Artifact Manifesto (internal and external artifacts), Value distribution weights, Dependency graph (DAG) | Hub, Digital Institution, Artifact, Treasury | Project maintainer | Active → Archived |
| Digital Institution | An extension of a Digital Project with expressive governance: roles, deliberative chambers, a formal decision protocol, and a publicly auditable legitimacy chain | Chamber set, Quorum rules, Tier set, Change classification function, Legitimacy chain, Right of exit | Hub, Labs, Learn, Digital Project | Institution founders | Active → Dissolved |
| AVU (Abstract Value Unit) | A dimensionless accounting unit in which all value within the protocol is computed; converted to concrete currency only at liquidation via an exchange rate oracle | No intrinsic speculative value; computed from usage events and creator weights; converted via oracle at payment time | Treasury, Value Distribution, Artifact | System | Allocated → Liquidated |
| Treasury | A smart-contract-controlled account that receives all incoming value for a project, computes AVU-based distributions among contributing artifacts, and executes liquidations | Liquidation trigger, Oracle integration, Distribution log (immutable) | Digital Project, Artifact, AVU | System (per project) | Active → Closed |
| Usage Agreement Event | A signed record of an authorized inter-artifact interaction (Phase 2 of the IACP); creates an edge in the project dependency graph and feeds the value distribution engine | Interacting artifact IDs, Agreed terms, Author signatures, Timestamp | IACP, Dependency Graph, Portfolio, Value Distribution | System (auto-emitted upon negotiation) | Emitted → Anchored → Archived |
| AI Agent | A registered, versioned assistant definition composed of a system prompt, a declared tool set, and an activation policy; instantiated by the orchestration engine in response to user context signals | Agent definition, System prompt, Tool set, Activation policy, User context model, Long-term memory | AI Agent System, Event Bus, Portfolio, all pillar content | Platform (built-in agents) / Community (registered agents) | Registered → Active → Deprecated |

For the complete formal definitions of Artifact, Digital Project, Digital Institution, AVU, Treasury, and IACP — including their mathematical formulations, type system, and behavioral invariants — see `syntropy-ecosystem-llm-context.md`.

---

## 8. Workflows and Journeys

### Workflow 1: Cross-Pillar Learning to Contribution

**Actor**: Student / Learner (who is also a Hub contributor)
**Goal**: Apply knowledge from a completed learning fragment to a real open source project
**Trigger**: Student completes a fragment and publishes their artifact
**Frequency**: Multiple times per week
**Volume**: Individual user action; recommendation engine operates at ecosystem scale

**Steps**:
1. Student completes a Learn fragment, builds their artifact using the integrated IDE, and publishes it to the community gallery.
2. The event bus captures the completion event and emits it to the recommendation engine.
3. The recommendation engine identifies open Hub issues that match the skills and artifact type just produced.
4. The student receives a notification and an in-platform suggestion showing 2–3 Hub issues they could contribute to right now.
5. The student opens one of the suggested issues directly in the platform, uses the embedded development environment to work on a fix, and submits a pull request.
6. The event bus captures the pull request submission. The portfolio is updated with the new contribution. XP and virtual currency are awarded.
7. When the pull request is merged, further XP is awarded and the achievement is recorded in the portfolio.

**Variations**: If no matching issues are found, the system suggests the student open their own project artifact for community contribution. If the student is not yet a Hub contributor, the recommendation flow doubles as onboarding into the Hub.

---

### Workflow 2: New User Onboarding to First Contribution

**Actor**: Student (new user, no prior experience)
**Goal**: Find the right starting point and make a first verifiable contribution to the ecosystem
**Trigger**: User signs up for the first time
**Frequency**: Once per user; aggregated it is the most frequent new-user journey
**Volume**: Individual, but must support high concurrency during growth periods

**Steps**:
1. User lands on the institutional site, reads the ecosystem overview, and clicks "Get Started."
2. User creates an account (email/OAuth). Single authentication grants access to all pillars.
3. The career discovery assistant (conversational interface) asks about the user's interests, background, and goals. It recommends a career track and explains why.
4. An optional placement quiz tests existing knowledge and suggests which courses or tracks can be skipped.
5. The user enters their first Learn track. They read the first fragment, study the theory, and build their first artifact in the embedded IDE.
6. The artifact is published to the community gallery. The event bus captures the action; the portfolio records it. A small XP reward and first achievement are granted.
7. The recommendation engine suggests a forum thread or mentor with expertise in the same area, reducing isolation and offering a next social step.

**Variations**: A user who already knows what they want skips the career assistant and navigates directly to a track. A user arriving via a specific Hub project or Labs publication can start in Hub or Labs and connect to Learn retroactively.

---

### Workflow 3: Sponsor Discovers and Supports a Content Creator

**Actor**: Sponsor (experienced professional, alumni of the platform, or external supporter)
**Goal**: Direct financial support to a teacher whose content helped them or whose impact is verifiable
**Trigger**: User completes a Learn track and is presented with the teacher's profile
**Frequency**: On demand; typically triggered by track completion or direct portfolio discovery
**Volume**: Low frequency per user; aggregated into meaningful creator income at ecosystem scale

**Steps**:
1. User completes a Learn track. At the completion screen, the platform presents the teacher's profile with impact metrics: number of students who completed the track, artifacts produced, projects derived from the track content.
2. The user reviews the metrics and the teacher's portfolio. No content is gated; this is purely a discovery moment.
3. The user clicks "Support this creator." They choose between a one-time contribution and a recurring monthly sponsorship. A simple, frictionless payment flow processes the contribution.
4. The event bus captures the sponsorship event. The teacher receives a notification and the sponsorship appears in both portfolios.
5. The platform does not change any content access for either party. The teacher's content remains fully available to all users.

**Variations**: A sponsor can also discover recipients through the unified search (searching for researchers, maintainers, or educators by impact metrics) rather than through track completion. Group/team sponsorships follow the same flow directed at a collective entity.

---

### Workflow 4: Researcher Translates a Labs Result to Hub and Learn

**Actor**: Researcher
**Goal**: Turn a validated experimental result into an open source project and an educational track
**Trigger**: Researcher publishes a Labs article confirming a technique
**Frequency**: Occasional; represents the full ecosystem integration loop
**Volume**: Individual action, but the recommendation effects ripple across the ecosystem

**Steps**:
1. Researcher publishes an experiment result in Labs. The article is peer-reviewed within the platform.
2. The event bus captures the publication. The unified search indexes the result and identifies existing Hub projects and Learn tracks that are adjacent to the validated technique.
3. The researcher receives recommendations: Hub projects that could implement the technique and Learn tracks that could teach it.
4. The researcher creates a new Hub project from the Labs result, linking the original publication as the research foundation. The project is immediately visible to Hub contributors.
5. The researcher (or any teacher) creates a new Learn track based on the Labs publication, using the project as the practical component students will contribute to.
6. All three actions are recorded in the researcher's portfolio. The Labs publication, the Hub project, and the Learn track are all linked as a coherent body of work.

**Variations**: Another researcher or teacher can independently pick up a Labs publication and create the Hub project or Learn track without the original author's direct involvement.

---

## 9. Quality Priorities

1. **Reliability** — The event bus, portfolio, and authentication must be highly available. A missed event means a missing portfolio record; a missed authentication means a user is locked out of the ecosystem.
2. **Security** — User identity, sponsorship payments, and contribution records must be protected. RBAC must be consistently enforced. Any security vulnerability is a launch blocker regardless of its rank.
3. **User experience** — The platform must feel frictionless for the transition between pillars. Any unnecessary friction between learning, contributing, and researching defeats the ecosystem's core purpose.
4. **Extensibility / Flexibility** — The platform is intentionally designed to evolve. New pillars, new gamification mechanics, and new governance structures must be addable without rewriting core components.
5. **Maintainability** — A small open source team will maintain this system. Architecture complexity must be justified by actual requirements, not anticipated ones.
6. **Scalability** — Start at community scale; design to grow. The event bus and recommendation engine must scale gracefully as the ecosystem grows.
7. **Observability / Debuggability** — The event bus, portfolio aggregation, and recommendation engine are complex asynchronous systems. Full traceability of events from emission to processing is required.
8. **Simplicity** — Prefer fewer, composable components over many specialized ones. The platform should be the simplest thing that fully realizes the vision.
9. **Performance** — Cross-pillar navigation and search must be fast. Slow transitions between pillars break the integration experience.
10. **Testability** — Policy-as-code governance and automated moderation must be testable before deployment.
11. **Cost efficiency** — The Cooperative Grid must reduce infrastructure costs over time. Architecture choices that depend entirely on commercial cloud are acceptable initially but must have a migration path.
12. **Time to market** — The first usable version must reach real users quickly enough to validate assumptions before over-engineering.

**Non-negotiable floors**:
- The event bus must produce a complete, auditable record of every significant user action. This cannot be traded off.
- The Syntropy platform itself — including its core infrastructure, tools, and community features — is permanently free and open. Creator-defined access controls (paid content, private projects, closed research) are distinct from platform-level gatekeeping and must be clearly separated in architecture.
- Open source identity: no proprietary dependencies in the core platform that would prevent community contributors from understanding or modifying the system.
- RBAC must be consistently enforced across all pillars. A permission failure is a launch blocker.

---

## 10. Constraints and Non-Goals

### Non-Goals (out of scope)

- The platform does not provide its own video hosting or streaming. Embedded video content links to external services.
- The platform does not build its own payment processor. It integrates with an existing payment provider for sponsorships and paid creator content.
- The platform does not replicate the full feature set of GitHub for code review. The Hub IDE and PR flow are functional but not intended to replace GitHub for teams that require advanced Git workflows.
- The platform does not generate educational content through AI. AI assistance may support users, but content is created by human contributors.
- The platform does not operate as a job board or recruitment marketplace, though portfolio verifiability makes it useful in those contexts.

### Known Constraints

- The project is open source and the team is small. Architecture must prioritize what a small team can build and maintain sustainably.
- The Cooperative Grid is a dependent infrastructure component; the platform must function with cloud infrastructure during Grid bootstrapping.
- The monorepo core + independent pillar repositories architecture is already defined and must be respected in platform component design.
- Supabase is the current database solution. The authentication system must integrate with or replace Supabase Auth as the platform matures.
- The Digital Institutions Protocol (Component 10) requires extended research before its full implementation. The MVP delivers basic artifact publication and authorship attribution; the complete protocol — IACP, institutional governance, value distribution — is a post-MVP deliverable that requires design decisions grounded in `syntropy-ecosystem-llm-context.md`.
- The AI Agent System (Component 11) must be designed from the start to never store or expose user context across sessions in ways that violate user privacy or access control boundaries. The context model fed to agents is derived from the same permission layer that governs the rest of the platform — an agent cannot surface information the user would not be able to access directly.

### Assumptions

- Users have reliable internet access. The platform is not designed for offline use.
- The ecosystem starts with the Learn and Hub pillars; Labs is introduced in a subsequent phase.
- Initial scale is community-sized (hundreds to low thousands of users). The architecture must support this cleanly before optimizing for millions.
- Contributors to the Cooperative Grid are motivated by community participation and reputation, not financial incentives.

### Integration Requirements

| External System | What It Is | Integration Purpose | Direction | Criticality |
|-----------------|------------|---------------------|-----------|-------------|
| GitHub / GitLab OAuth | Identity provider | Allow users to authenticate with existing developer accounts | Inbound | Important |
| Google OAuth | Identity provider | Allow users to authenticate with Google accounts | Inbound | Important |
| Payment processor (Stripe or equivalent) | Payment infrastructure | Process sponsorship contributions (one-time and recurring) | Outbound | Critical for sponsorship feature |
| Kafka / RabbitMQ | Message broker | Power the event bus that captures all user actions and feeds the portfolio and recommendation engine | Internal | Critical |
| Supabase | Hosted Postgres + Auth | Current database and authentication backend | Both | Critical (current phase) |
| Exchange rate oracle | Currency conversion service | Convert AVUs to concrete currencies at liquidation time for the Digital Institutions Protocol | Inbound | Critical for value distribution (Post-MVP) |
| Immutable ledger (TBD) | Anchoring infrastructure | Anchor critical artifact identity events for permanent, relay-independent persistence | Outbound | Critical for protocol (Post-MVP) |
| LLM API provider (e.g. Anthropic, OpenAI) | AI inference service | Power the AI Agent System's language model calls for all specialized agents | Outbound | Critical for AI Agent System (Post-MVP for full system; MVP for initial agents) |

### Data Sensitivity and Compliance

**Data types handled**:
- [x] Personal Identifiable Information (PII) — names, emails, usernames, profile information
- [x] Financial data — sponsorship transaction records (not full card data, which is handled by the payment processor)
- [x] Authentication credentials — managed via OAuth providers and Supabase Auth; passwords are hashed and never stored in plain text
- [x] Proprietary / confidential business data — user-created artifacts, project code, and research data that users may consider sensitive

**Regulations that apply**:
- [x] GDPR — the platform expects users from the EU from launch
- [x] CCPA — applicable if users from California are served
- [ ] HIPAA — not applicable; no health data
- [ ] PCI-DSS — not directly applicable; payment processing is delegated to a compliant third-party processor

**Data residency requirements**: No hard requirements at initial launch. GDPR compliance requires that EU user data handling meets EU standards regardless of where data is stored.

### Scale and Team Context

**Team size**: Small team (2–5 developers) initially; designed to grow with open source contributions

**Expected initial scale**: Community scale — hundreds to a few thousand users in the first phase

**Growth expectations**: Moderate-to-significant growth expected as each pillar matures. Must be built to scale from the event bus and portfolio layers outward, but premature optimization for millions of users is not appropriate.

**Deployment target**: Cloud (initial phase), with a migration path toward Cooperative Grid infrastructure as it matures. Containerized architecture (Docker / Kubernetes) is required.

---

## 11. Success Metrics

### Business Metrics

| Metric | Description | Target | How Measured |
|--------|-------------|--------|--------------|
| Cross-pillar transition rate | Percentage of users who participate in more than one pillar within 30 days of joining | > 40% | Portfolio event data |
| Artifact application rate | Percentage of artifacts produced in Learn that are applied to at least one Hub issue | > 20% | Recommendation engine and event bus |
| Sponsorship conversion | Percentage of users who sponsor at least one creator after completing a track | > 5% | Sponsorship system logs |
| Active contributor retention | Percentage of contributors active in month 3 who were active in month 1 | > 50% | Event bus activity data |
| Mentor-mentee cycle rate | Percentage of users who were mentored and later became mentors | > 15% (at 12 months) | Portfolio role transitions |

### Technical Metrics

| Metric | Description | Target | How Measured |
|--------|-------------|--------|--------------|
| Event bus reliability | Percentage of user actions that result in a correct, processed portfolio event | > 99.9% | Event bus monitoring and portfolio reconciliation |
| Cross-pillar search latency | P95 response time for a unified search query across all pillars | < 500ms | Application performance monitoring |
| Portfolio update latency | Time from a user action to its reflection in the portfolio | < 10 seconds (P95) | Event bus processing metrics |
| Authentication uptime | Availability of the authentication system | > 99.9% | Uptime monitoring |
| IDE session reliability | Percentage of development sessions that complete without environment failure | > 99% | Container orchestration metrics |

### Anti-Metrics

- **High content consumption, low artifact production**: users completing many fragments but publishing few artifacts indicates the "make learning" philosophy is not working. Even if completion rates are high, artifact production is the true signal.
- **Low cross-pillar navigation**: users who stay entirely within one pillar and never discover content in another indicate the recommendation engine and search are failing to deliver the ecosystem's core integration value.
- **Sponsorship concentrated in few creators**: if the top 5% of creators receive 95% of sponsorships, discovery and transparency mechanisms are not surfacing the long tail of impactful contributors.
- **Portfolio inaccuracy reports**: if users report that their portfolio does not reflect their actual contributions, event bus reliability has failed, and the platform's core value proposition (verifiable activity) is broken.
- **Mentor burnout signals**: mentors who become inactive after a high-volume period indicate the matching or incentive system is not sustaining the mentorship cycle.
- **AI assistance replacing human authorship signals**: if artifact production volume drops when AI assistance is unavailable, or if artifacts produced with AI assistance show markedly lower peer engagement, the system is creating dependency rather than augmenting capability. AI assistance should accelerate and improve human creation, not substitute for it.

---

## 12. Inspirations and References

- **GitHub**: The contribution graph, pull request workflow, and issue tracking model are foundational references for the Hub. The platform must eventually feel as natural to developers as GitHub, but with an educational and research layer.
- **Patreon**: The voluntary sponsorship model draws on Patreon's creator-supporter relationship — community-funded, impact-motivated, and built around direct support for people who generate value. The key difference is that Syntropy surfaces objective contribution metrics rather than relying on creator self-promotion, and the platform supports both voluntary patronage and direct creator monetization as complementary models.
- **Notion**: The planning and management component should feel as flexible and calm as Notion for organizing cross-context work — without Notion's blank-canvas friction.
- **Linear**: The Hub project management layer (issues, sprints, Kanban) should feel like Linear — fast, opinionated, and built for people who want to get work done, not manage a tool.
- **World of Warcraft / Final Fantasy XIV (MMORPG design)**: The gamification layer — character classes, skill trees, collectibles, the player "home," achievement systems — draws on MMORPG design patterns that have proven effective at creating long-term engagement around progression and community.
- **BOINC**: The Cooperative Grid's model of voluntary distributed computing for verified, community-benefiting workloads is inspired by BOINC's architecture, adapted for a context where trust comes from open source verification rather than institutional affiliation.
- **Stripe**: The API layer and developer-facing components should aspire to Stripe's documentation quality and response predictability — every response is structured, every error is actionable.
- **ArXiv**: The Labs publication model draws on ArXiv's open preprint philosophy — accessible, fast, community-reviewed — adapted for a platform that integrates scientific results with engineering practice.
- **DAOs and Ethereum governance patterns**: The Digital Institutions Protocol draws on DAO concepts — decentralized governance, verifiable membership, on-chain state transitions — adapted to the specific context of knowledge and software creation rather than financial coordination. See `syntropy-ecosystem-llm-context.md` for the complete treatment.
- **Nostr**: The artifact identity record uses Nostr's event model — JSON objects signed by author private keys, propagated through relays — as the publication and verification layer for artifact identity records.
- **GitHub Copilot / Cursor**: The Hub's AI development copilot draws on the interaction model of inline code assistance tools — suggestions that augment the developer's intent rather than replacing it, always with the human in control of what is committed.
- **Perplexity / Elicit**: The Labs literature review agent draws on research-oriented AI tools that synthesize external sources into structured summaries, adapted to also query the ecosystem's internal artifact graph.

**Interface character references**:
- The web application should feel like **Linear** (Hub management) and **Notion** (planning) combined, with **GitHub's** contribution culture and **Duolingo's** accessibility for learners (but not its infantile tone).
- The institutional site should feel like a well-maintained open source project documentation site — **Vercel's** or **Stripe's** public presence, honest about what is shipped and what is coming.
- The portfolio should feel like a **game character profile** crossed with a **professional portfolio** — impressive to both a recruiter and a fellow contributor.

---

## Next Steps

Once this Vision Document is complete:

1. **Review** it with stakeholders (if applicable)
2. **Assess quality**: open a new Cursor conversation, use **Prompt 00** (`.cursor/prompts/00-refine-vision.md`) to get a quality score and guided improvement suggestions before proceeding
3. **Generate architecture**: open a new Cursor conversation, use **Prompt 01** (`.cursor/prompts/01-generate-architecture-from-vision.md`) — Prompt 01 will automatically check that the document passes minimum quality thresholds
4. **Iterate**: use **Prompt 02** (`.cursor/prompts/02-iterate-architecture.md`) until the architecture reflects your vision

See `.cursor/FRAMEWORK.md` for the complete workflow guide.