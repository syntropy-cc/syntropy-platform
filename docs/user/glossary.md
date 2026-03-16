# Glossary

Definitions of terms used in the Syntropy Platform. For deeper explanations, see [Concepts](concepts/index.md).

**A**

- **Artifact** — A versioned digital output (code, document, dataset, article, etc.) owned under the Digital Institutions Protocol. Has a unique ID, author, lifecycle (draft → submitted → published), and (when published) a cryptographic identity record.
- **AVU (Abstract Value Unit)** — A dimensionless accounting unit used inside the platform for value distribution. All distribution logic uses AVUs; conversion to real currency happens only at treasury entry and liquidation via an oracle.

**C**

- **Career** — In Learn, the broadest grouping of content (e.g. “Software development”). Careers contain tracks.
- **Chamber** — In governance, a body with an electorate, scope, quorum, and approval threshold. Proposals are assigned to a chamber for discussion and voting.
- **Collectible** — In Learn, a visual item (e.g. badge) assembled from fragment completions within a course. Completing a course can award a collectible.
- **Contribution** — In the Hub, an artifact submitted in response to an issue. Has a lifecycle: submitted → in review → accepted/rejected → integrated.
- **Course** — In Learn, a named sequence of fragments within a track. Completing a course can award a collectible.

**D**

- **Digital Institution** — An organization on the platform with identity, a governance contract, a legitimacy chain, and (optionally) projects and a treasury. Types include `institution` (Hub) and `laboratory` (Labs).
- **Digital Institutions Protocol (DIP)** — The protocol that defines artifacts, identity anchoring, projects, institutions, governance contracts, IACP, and value distribution. DIP is the single source of truth for these entities.
- **Dependency graph (DAG)** — In DIP, the directed acyclic graph of artifact dependencies. Edges come from IACP usage agreements only; the graph is emergent, not manually declared.

**E**

- **Event** — A record of a meaningful user or system action (e.g. artifact published, contribution accepted). Events are emitted to the event bus and drive the portfolio, search index, and recommendations.
- **Event bus** — The messaging backbone (e.g. Kafka). Domains publish events; subscribers (portfolio, search, notifications) consume them asynchronously.
- **Enrollment** — In Learn, the record that a user is following a track. Required to unlock fragments (when fog-of-war is used).

**F**

- **Fragment** — In Learn, the smallest learning unit. Every fragment has three parts: Problem, Theory, and Artifact. Completing the artifact and publishing it completes the fragment.
- **Fog of war** — In Learn, the UI pattern that reveals only the next steps (current course and fragments) until you complete them.

**G**

- **Governance contract** — The set of executable rules for an institution: roles, chambers, voting weights, delegation, tier set, and right of exit. Proposals are evaluated against this contract.
- **Governance template** — A pre-audited, parametrizable contract configuration (e.g. Technical Cooperative, Research Laboratory). Used when creating an institution.

**I**

- **IACP (Inter-Artifact Communication Protocol)** — The four-phase protocol governing interactions between artifacts: Identification, Contract Negotiation (+ usage agreement event), Utilization, Phase 4 Usage Registration. Ensures the dependency graph stays a DAG and usage is authorized.
- **Identity record** — The immutable cryptographic record of an artifact’s authorship and content hash, anchored to an external ledger (e.g. Nostr). Created when an artifact is published.
- **Institution** — See Digital Institution.
- **Issue** — In the Hub, an open task or problem in a project. Contributors submit artifacts as contributions to resolve issues.

**L**

- **Laboratory** — A digital institution with type `laboratory`. Used in Labs for research groups; has research areas, members, and research lines.
- **Learner project** — In Learn, the project you build while following a track. Parallel to the track’s reference project.
- **Legitimacy chain** — The ordered, immutable list of execution events that changed an institution’s state. Every change goes through a proposal and execution; no bypass.
- **Learn** — The education pillar: tracks, courses, fragments, project-first learning, collectibles, and portfolio.

**M**

- **Monetization protocol** — In DIP, the rules for how value entering a project is distributed among artifacts and creators (e.g. static or dynamic weights). All accounting is in AVUs until liquidation.

**P**

- **Portfolio** — The platform’s automatic record of your activity: XP, skills, achievements, collectibles, and history. Derived from the event bus; not manually edited.
- **Proposal** — A proposed change to an institution (e.g. add member, amend contract). Lifecycle: draft → discussion → voting → approved/rejected → (optionally) contested → executed.
- **Publish (artifact)** — Transition an artifact from submitted to published and create an identity record (anchoring). Irreversible for that version.
- **Publish (article)** — In Labs, make an article version public and (optionally) register a DOI. That version is immutable.

**R**

- **Reference project** — In Learn, the complete project that a track teaches you to build. Hosted on the Hub; the track’s fragments build toward it.
- **Research line** — In Labs, a project of type `research-line`. Groups hypothesis, methodology, and artifacts (articles, datasets, experiments) for one research effort.
- **Review** — In Labs, a peer review of a published article. Public, often passage-linked; visibility may be filtered by reviewer reputation in the article’s subject area.
- **Right of exit** — A mandatory clause in every governance contract: how a member can leave. The platform does not allow contracts without it.

**S**

- **Sponsorship** — Voluntary financial support for a creator (teacher, maintainer, researcher). Does not gate content access.
- **Submit (artifact)** — Transition an artifact from draft to submitted (ready for publish).
- **Subject area** — In Labs, a category for research (e.g. “Machine learning”). Used for discovery and for reviewer reputation filtering.

**T**

- **Track** — In Learn, a learning journey built around a reference project. Contains courses; each course contains fragments.
- **Treasury** — In DIP, the account that holds value (in AVUs) for a project or institution. Receives incoming value, deducts operational costs, distributes to artifacts per monetization protocol, and liquidates to members via an oracle.

**U**

- **Usage agreement event** — In IACP, the signed record of an authorized inter-artifact interaction (Phase 2). The only way edges are added to the dependency graph.

**V**

- **Verifiable** — Refers to data that can be checked without trusting the platform alone. For example, artifact identity records are anchored so authorship and content hash can be verified externally.

**X**

- **XP** — Experience points in the portfolio. Awarded for actions like publishing artifacts, having contributions accepted, and completing fragments. Used for level and progression.

## See Also

- [Concepts](concepts/index.md)
- [API Overview](reference/api/overview.md)
- [FAQ](faq.md)
