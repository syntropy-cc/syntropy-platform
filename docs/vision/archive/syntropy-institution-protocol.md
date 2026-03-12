# Syntropy Institution Protocol
**Version 2.0 — Complete Model including Digital Institutions and Governance**

---

## Purpose and Reading Instructions

This document provides complete, authoritative contextual knowledge about the institution protocol layer of the Syntropy ecosystem, optimized for LLM consumption. It is a single reference enabling a language model to understand, explain, and assist in implementing any component of the system.

**How this document is structured:** concepts are presented in dependency order — each section depends only on concepts defined in preceding sections. Invariants and constraints are separated from definitions and collected explicitly so they can be applied actively during reasoning. Design rationale is provided for non-obvious decisions to prevent a model from "correcting" intentional architectural choices.

**Critical framing:** This infrastructure is not the Syntropy Hub. It is the platform-level layer that underlies the entire Syntropy ecosystem — Learn, Hub, and Labs equally. The Hub is the management and collaboration interface built on top of this infrastructure, defined separately. Everything described here belongs to the ecosystem platform, not to any single pillar.

---

## 1. Conceptual Hierarchy

The system is built around five foundational concepts in strict dependency order. Understanding this hierarchy before reading the details is essential.

```
Artifact
  └── Inter-Artifact Communication Protocol (IACP)
        └── Project
              └── Digital Institution
                    └── Value Distribution + Treasury
```

An **artifact** is the atomic unit. The **IACP** defines how artifacts interact. A **project** is a structured composition of artifacts with a dependency graph. A **digital institution** extends the project with expressive governance. **Value distribution and the treasury** are the economic mechanisms that route value through the institutional structure back to individual creators.

---

## 2. The Artifact Model

### 2.1 Core Definition

An artifact is any digital asset expressible as a finite binary sequence **and** encapsulated within a defined logic or protocol. Raw binary data is not an artifact. A structured, authored, and contractually governed digital object is. This definition is intentionally broad: code, images, video, audio, documents, datasets, trained models, scientific articles, research datasets, educational modules, legal templates, spreadsheets, 3D models, and any future form of digital asset are all artifacts under the same model.

Every artifact is a triple: `Artifact = (Substance, Identity, UtilizationInterface)`.

### 2.2 Layer 1 — Substance

The actual binary content: source code, image file, audio recording, document text, model weights, dataset, or any other digital content. Substance is typed by a registered artifact type `τ` from the type system `𝒯`.

### 2.3 The Artifact Type System

The type system `𝒯` is an **open, extensible set**. It has no fixed enumeration. Any new artifact type is introduced by publishing a **type registration event** — a signed record declaring the type name `τ`, its utilization schema `Σ_τ`, and its set of permitted interaction modes `M_τ`. The framework provides a standard type library of pre-registered types as ready-to-use defaults; these examples do not bound what the system can represent.

**Standard type library examples (non-exhaustive, illustrative only):**
- `code` — executable or importable software
- `image` — raster or vector visual content
- `video` — time-based visual media
- `audio` — time-based audio media
- `document` — textual or structured written content
- `dataset` — structured or unstructured data collections
- `model` — trained machine learning or statistical models
- `composite` — artifact whose modes are the union of modes from constituent types

Any domain not covered by these examples — spreadsheets, parametric 3D models, interactive simulations, legal contract templates, musical scores, or types not yet imagined — registers its own type following the same mechanism. The framework is type-agnostic at the core.

### 2.4 Layer 2 — Identity Record

The immutable record of authorship and integrity. It contains:

| Field | Description |
|---|---|
| `id` | Globally unique artifact identifier: `Hash(pk_author ∥ timestamp ∥ type ∥ content_hash)` |
| `pk_author` | Author's secp256k1 public key |
| `t` | Unix creation timestamp |
| `τ` | Artifact type (registered in `𝒯`) |
| `h` | Content hash `Hash(Substance)` — integrity proof |
| `σ` | Author's digital signature over `id` |
| `v` | Version number (0 for initial) |
| `parent` | ID of preceding version, or ⊥ for v=0 |

The identity record is published as a **Nostr event** — a JSON object signed by the author's private key. Any party can verify authorship without trusting a central authority. For critical state transitions (initial publication, contract assignment, contract amendments), the event hash is **anchored to an immutable ledger** for permanent persistence independent of relay availability.

### 2.5 Versioning

Versions are distinct entities sharing a lineage via the `parent` field. **Contracts are bound to the artifact entity, not to individual versions.** A content update (bug fix, improvement) does not trigger contract renegotiation with downstream users. Contract renegotiation is triggered only when the artifact creator explicitly publishes a contract amendment event — a deliberate act, not an automatic consequence of versioning. This prevents the system from becoming operationally prohibitive for actively developed artifacts.

### 2.6 Layer 3 — Utilization Interface

Defines how the artifact can be used. It is a triple `U = (M, C, L)`:

- **M** — the set of interaction modes this artifact instance supports, drawn from `M_τ` of its registered type
- **C** — the smart contract encoding conditions under which each mode may be exercised
- **L** — the usage layer descriptor: a type-specific structured specification conforming to schema `Σ_τ`, defining the technical interface for each mode

The set of interaction modes is open by design. Modes are declared per type at registration time, specific to that type's semantics. For a `code` type, representative modes might include `execute`, `import`, `fork`, `audit`. For an `image` type, modes like `display`, `embed`, `derive` are natural. For a `document` type, `read`, `cite`, `reproduce` apply. Any custom type defines its own semantically appropriate modes. There is no global fixed set of modes — universality lies in the protocol that governs all modes uniformly, not in enumerating them.

**The smart contract** `C` is a deterministic executable function:
```
C : Request × State → {permitted, denied} × State'
```
Contracts can be authored from scratch or instantiated from a template library of pre-audited configurations analogous to open-source licenses (fully open, attribution required, non-commercial, revenue-share, etc.).

---

## 3. The Inter-Artifact Communication Protocol (IACP)

### 3.1 Purpose

The IACP is the uniform protocol through which artifacts of heterogeneous types interact. Its architecture separates a **universal layer** — identical for all types — from a **type-specific layer** — defined by each type's registration. Every interaction, regardless of the artifact types involved, passes through the same four-phase universal flow.

### 3.2 The Four Universal Phases

Every interaction between a requesting agent `R` (user, artifact, or project) and a target artifact `A` follows these phases in order. No phase may be skipped.

**Phase 1 — Identification.** The requesting agent presents its public key. The target artifact responds with its identity record. Both parties verify each other's cryptographic signatures. Neither party proceeds without verified identity.

**Phase 2 — Contract Negotiation.** The agent queries the artifact's utilization interface for the desired interaction mode `m`. The smart contract evaluates the request and returns a decision (permitted or denied). If permitted, both parties sign a **usage agreement event**:
```
e_agree = Sign_sk_R(artifact_id ∥ mode ∥ timestamp)
```
This event is the mechanism by which edges are created in the dependency graph. Usage agreement events are **the only way edges appear in the graph** — they are never declared manually.

**Phase 3 — Utilization.** The authorized interaction proceeds according to the type-specific layer. The artifact delivers the resource or capability defined in its usage layer descriptor.

**Phase 4 — Usage Registration.** A usage event is emitted and propagated via Nostr:
```
e_use = (artifact_id, requester_pk, mode, timestamp, context)
```
This event is the primary input to value distribution. Without Phase 4 events, no value flows to artifact creators for that interaction. The usage event also feeds dynamic weight computation when the monetization protocol uses usage-based weights.

### 3.3 The Type-Specific Layer

The content of the usage layer descriptor `L` is determined entirely by the registered type. For a `code` type, `L` may specify typed function signatures analogous to an API spec. For an `image` type, `L` may specify available resolutions and embedding formats. For any custom type, `L` is defined at registration time following the same structural pattern. The universality of the IACP does not depend on `L`'s content; it depends only on `L` being a well-formed descriptor conforming to the type's schema `Σ_τ`.

### 3.4 Why the IACP Is Architecturally Central

The IACP is not merely a technical detail. It is the mechanism that makes three critical system properties emergent rather than declared:

1. **The dependency graph is automatically maintained** — every usage agreement event creates an edge; the graph cannot be incomplete or falsified because it is derived from actual protocol interactions.
2. **Value distribution is automatically triggered** — usage events in Phase 4 feed the economic layer without any manual action.
3. **Authorship attribution is always current** — because every interaction passes through identity verification, the system always knows who used what and when.

---

## 4. The Project Model

### 4.1 Definition

A project is a four-component entity: `Project = (Γ, 𝓜, Π, 𝒟)`

- **Γ** — Governance Contract
- **𝓜** — Artifact Manifesto
- **Π** — Monetization Protocol
- **𝒟** — Dependency Graph (DAG)

Every artifact in the ecosystem belongs to at least one project, even if that project is a personal single-creator project with no explicit monetization.

### 4.2 Governance Contract

Encodes the foundational rules: founding members with initial participation weights, membership admission rule, quorum and voting thresholds, and dissolution conditions. Signed by all founders and anchored to the immutable ledger at creation — this is the project's founding event.

### 4.3 Artifact Manifesto

The complete declaration of all artifacts belonging to or used by the project. It has two parts:

**Internal artifacts** (`𝓜_int`): artifacts created within the scope of the project. Their utilization contracts must be **specializations** of the governance contract — they may add restrictions but may never relax project-level constraints. If the project contract disallows commercial use, no internal artifact can permit commercial use.

**External artifacts** (`𝓜_ext`): artifacts from other projects used via the IACP, each recorded with its usage agreement event. For a project to use an external artifact, the project's governance contract must satisfy all conditions imposed by that external artifact's smart contract. If incompatible, the project must either renegotiate (if the external creator agrees) or build an equivalent internal artifact under compatible terms.

### 4.4 The Dependency Graph

A weighted directed acyclic graph (DAG) `𝒟 = (V, E, w)` where:
- `V` = all internal artifacts + all external artifacts + the project root
- `E` = directed usage edges, emerging automatically from IACP usage agreement events
- `w : E → [0,1]` = edge weights, with weights from any node summing to 1

**The DAG is never manually declared.** It is a faithful, automatically maintained record of actual inter-artifact interactions. This is a structural guarantee of the system.

**Cycle prevention** is enforced as a hard invariant: before any usage agreement event between artifact A and artifact B is recorded, the system performs a depth-first reachability check to verify A is not reachable from B in the current graph. If reachability holds, the agreement is rejected. This check is `O(|V| + |E|)`. The DAG property is maintained by induction and cannot be violated through normal protocol operation.

### 4.5 Contract Hierarchy Summary

```
Project Governance Contract
  ├── Internal Artifact Contracts (must be ≤ permissive than project contract)
  └── External Artifact Contracts (project contract must satisfy their conditions)
```

This hierarchy ensures the manifesto is always internally consistent and that no internal artifact can create obligations the project hasn't accepted.

---

## 5. The Digital Institution Model

### 5.1 Why Institutions Extend Projects

A project is sufficient for small collaborative efforts. A digital institution is the extension needed to support entities analogous to companies, cooperatives, research laboratories, universities, and other organizational forms — entities with complex internal structure, multiple decision-making bodies, differentiated roles, and constitutive rules that evolve over time.

A digital institution provides, through cryptographic protocols and smart contracts, the same capabilities that traditional institutions provide through centralized legal infrastructure: verified participant identity, enforceable agreements, immutable decision records, and automatic value distribution — without requiring any external legal structure to function internally.

### 5.2 The Governance Neutrality Principle

This is the most important architectural principle of the governance model. **The system provides expressive governance primitives without imposing any governance philosophy.** Institutions configure their governance through smart contracts. The framework enforces exactly three non-negotiable invariants:

1. **Transparency**: any potential contributor may read all governance contracts before participation.
2. **Immutability of the decision record**: the history of governance decisions cannot be altered retroactively.
3. **Deterministic contract execution**: the outcome of any governed process is fully determined by the contract's logic and inputs — no room for arbitrary interpretation.

Additionally, every governance contract must define a **right of exit** — the conditions under which a contributor may withdraw participation. The specific terms are freely configurable; the existence of some definition is mandatory.

**Everything else is a free configuration parameter.** Contribution-weighted voting, capital-weighted voting, equal weighting, power concentration limits, delegation, minority protections — all are available as primitives and template configurations, never imposed. An institution choosing concentrated governance makes a legitimate configuration choice, provided those terms are publicly readable before any contributor joins. The system does not judge the choice; it guarantees the choice is informed.

### 5.3 Formal Structure

A digital institution is a four-component entity: `Institution = (Project, 𝒢, 𝒦, (Ω, δ))`

- **Project** — the underlying artifact management, dependency tracking, and value distribution layer
- **𝒢** — Institutional Governance System
- **𝒦** — Chamber System
- **(Ω, δ)** — Change Classification Function

### 5.4 Institutional Governance System

`𝒢 = (Members, Roles, Φ, Λ)`

**Members** `Members = {(m_i, role_i, join_timestamp_i)}` — the set of institutional members, each identified by public key, assigned role, and join timestamp.

**Roles** `ℛ` — a finite set of named roles, each with a permission set `ρ(role) ⊆ Ops`, where `Ops` is the set of possible institutional operations (create artifact, modify contract, initiate proposal, execute treasury action, etc.). Roles separate the **operational plane** (who can do what in the system) from the **governance plane** (who votes on what), preventing automatic conversion of operational power into voting power.

**Voting Weight Function** `Φ : Members × Scope → [0,1]` — maps each member and deliberation scope to a weight, with `Σ_i Φ(m_i, s) = 1` for every scope `s`. Encoded in the governance contract. Common configurations include equal weighting, contribution-proportional weighting, and founder-declared static weighting. The choice is entirely the institution's.

**Delegation Registry** `Λ : Members × Scope → Members` — a partial function mapping delegating members to delegates within specific scopes. Delegations are revocable at any time by the delegating member and are publicly visible. When active, the effective weight of member `m_i` in scope `s` is:
```
Φ̃(m_i, s) = Φ(m_i, s) + Σ_{m_j : Λ(m_j, s) = m_i} Φ(m_j, s)
```
If the governance contract defines a concentration ceiling `φ_max(s)`, then `Φ̃(m_i, s) ≤ φ_max(s)` for all members, with excess weight redistributed uniformly among non-capped members. The existence and value of `φ_max` is a free governance parameter.

### 5.5 Chamber System

`𝒦 = {K_1, ..., K_p}` — a finite set of chambers. Each chamber `K_l = (Electorate, Scope, Quorum, ApprovalThreshold)`:

- **Electorate** `E_l ⊆ Members` — members eligible to vote in this chamber
- **Scope** `S_l ⊆ DecisionTypes` — the types of decisions this chamber handles
- **Quorum** `Q_l ∈ (0,1]` — minimum fraction of electorate weight required for a vote to be valid
- **Approval threshold** `θ_l ∈ (0.5, 1]` — minimum fraction of participating weight required for approval

Decision types not assigned to any specific chamber default to the general assembly `K_GA` whose electorate is all members. Chamber structure is freely configurable; an institution may have a single chamber (flat governance) or many specialized chambers.

### 5.6 Deliberation Protocol

A proposal `Q = (pid, proposer, decision_type, chamber, T_discussion, T_vote, T_contestation, payload)` passes through a finite state machine:

```
Draft → Discussion → Voting → [Approved | Rejected] → [Contested] → Executed
```

Only proposals in state `Approved` that have passed the contestation deadline without a valid contestation may be executed. A **valid contestation** is one that demonstrates a procedural violation of the governance contract; the resolution mechanism is defined in the governance contract.

**Vote tally** for proposal `Q` in chamber `K_l`:
```
Participation = Σ_{voters} Φ̃(m_i, S_l)
ApprovalRatio = Σ_{yes-voters} Φ̃(m_i, S_l) / Participation
```
Proposal is approved if and only if `Participation ≥ Q_l` AND `ApprovalRatio ≥ θ_l`.

Every proposal, every vote, and every result is a public event within the institution, recorded immutably. There is no private deliberation at the governance level.

### 5.7 Change Classification Function

`(Ω, δ)` where:

**`Ω = {ω_1, ..., ω_p}`** — the institution's **tier set**: a finite ordered set of named governance tiers defined in the governance contract, with ordering `ω_1 ≺ ω_2 ≺ ... ≺ ω_p` reflecting increasing governance requirements. The framework imposes **no fixed tier names and no fixed number of tiers**. Institutions define `Ω` freely. Two tiers, three tiers, five tiers — any configuration is valid.

**`δ : ChangeTypes_Institution → Ω`** — maps each change type recognized by the institution to a tier. `ChangeTypes_Institution` is also institution-defined: institutions declare which operations constitute governed change types and assign each a tier. The function `δ` is encoded in the governance contract and may be amended only by a governance decision satisfying the highest tier in `Ω`.

**Conservative default:** when the governance contract does not specify a tier assignment for a proposed change, the system applies the highest tier `ω_p` with unanimity, preventing unauthorized modifications.

**Non-normative example** (to illustrate the pattern, not prescribe it): an institution might choose `Ω = {Operational, Structural, Fundamental}` and assign adding an artifact as Operational, admitting new members as Structural, and modifying dissolution conditions as Fundamental. Another institution might choose `Ω = {Routine, Constitutional}`. The framework supports any such configuration uniformly.

---

## 6. Institutional Evolution and the Legitimacy Chain

### 6.1 The Core Constraint

Any change to an institution's constitutive contracts must itself be authorized by those contracts as they stand at the time of the proposal. This constraint prevents retroactive self-modification and ensures every institutional state is traceable to a founding event or a legitimately authorized transition.

### 6.2 Institutional State

At any time `t`, the institutional state is `Σ_t = (Institution_t, History_t)`, where `History_t` is the ordered sequence of all executed proposals with their execution events up to `t`.

### 6.3 The Legitimacy Chain

The legitimacy chain is the sequence `Σ_0, Σ_1, ..., Σ_t` satisfying:

1. `Σ_0` is the founding state — created by the governance contract signed by all founding members and anchored to the immutable ledger.
2. Each `Σ_k` is obtained from `Σ_{k-1}` by executing a proposal approved under the governance rules of `Σ_{k-1}`.
3. Each transition is recorded as a signed execution event anchored to the immutable ledger:
```
e_exec = Sign_executor(pid ∥ Hash(Institution_{k-1}) ∥ Hash(Institution_k) ∥ timestamp)
```

**Legitimacy Preservation Theorem:** every institutional state reachable through the protocol is legitimate — it was produced by a sequence of approved proposals, each evaluated under the governance rules in force at the time of their proposal. No state can be reached by bypassing the governance process.

### 6.4 What the Legitimacy Chain Does and Does Not Guarantee

The legitimacy chain does **not** prevent an institution from adopting governance structures that concentrate power. It guarantees that any such concentration is the result of a legitimately authorized decision visible in the public record. Any potential contributor can observe the full legitimacy chain before deciding to participate. This is the operational expression of the Governance Neutrality Principle — the framework does not prescribe governance values; it makes governance history fully transparent and verifiable.

---

## 7. Value Distribution Model

### 7.1 Abstract Value Units (AVUs)

All value computations operate on **Abstract Value Units (AVUs)** — dimensionless real numbers with no intrinsic monetary meaning. AVUs serve as the universal accounting currency of the system. The entire value distribution logic — weights, propagation, allocation — operates in AVUs. Conversion to concrete currencies occurs only at liquidation time via a price oracle. This is the mechanism of currency agnosticism: the system neither imposes nor references any specific monetary system during computation.

### 7.2 Edge Weight Modes

The monetization protocol `Π` of a project specifies how edge weights in the dependency graph are computed. Three modes are available:

**Static mode:** weights `w(Project, A_j) = φ_j` declared at project creation, `Σφ_j = 1`, amended only by governance decision.

**Dynamic mode:** weights computed from usage event statistics:
```
w_t(Project, A_j) = f(usage_count_j(t)) / Σ_{j'} f(usage_count_{j'}(t))
```
where `f` is a monotone increasing function specified in `Π` (linear, logarithmic, or any other). Dynamic mode also supports **per-usage-event distribution**: if individual usage events activate distinct artifact subsets, the distribution for a specific user's payment can be computed based on their specific activation path rather than global averages.

**Hybrid mode:** static base weights multiplied by dynamic usage multipliers, then normalized. Balances predictability with fairness.

### 7.3 Recursive Value Propagation

Value flows through two levels recursively.

**Institution level:** incoming AVUs, after deducting operational costs, are distributed to internal artifacts according to edge weights:
```
AVUs_to_artifact_j = w_t(Project, artifact_j) × (incoming_AVUs - operational_costs)
```

**Artifact level:** each internal artifact receiving AVUs first forwards portions owed to external dependencies (as specified in usage agreement contracts), then distributes the remainder among its creators by contribution weights:
```
AVUs_to_creator_i = λ_i × (received_AVUs × (1 - Σ external_rates))
```

This recursion propagates **across institution boundaries**. When an external artifact receives its forwarded AVUs, those are deposited into that external institution's treasury and distributed through its own dependency graph. A creator in institution B whose artifact is used by institution A automatically receives value from A's revenue without any manual action.

**Value Conservation:** the total AVUs distributed to all creators equals total incoming AVUs minus operational costs minus total AVUs forwarded to external institutions. Nothing is created or destroyed.

### 7.4 Contributor Weight Computation

Within a single artifact, creator weights `λ_i` are computed from the contribution event history. Each contribution event records `(creator, magnitude, timestamp)`. The artifact's smart contract specifies the aggregation function. Common options:

- **Proportional:** `λ_i = total_contribution_i / total_contributions`
- **Time-decayed:** recent contributions weighted more heavily via exponential decay
- **Founder-weighted:** additive bonus for the original creator, then normalized

The choice is encoded in the artifact's contract — a free configuration parameter consistent with governance neutrality.

---

## 8. Treasury and Liquidation

### 8.1 Institution Treasury

Every institution has a treasury — a smart contract-controlled account with three components:

- **Balance** `B ∈ ℝ≥0` — current AVU balance
- **Operational cost schedule** `Ω : time → AVUs` — deterministic function covering infrastructure, platform fees, and any other declared operational costs
- **Liquidation trigger** — the condition initiating settlement: a calendar schedule, a balance threshold, or on-demand by an authorized role

All incoming value, regardless of source currency, is **converted to AVUs at entry time** using the oracle rate at the moment of receipt. This is where currency-agnosticism is established for inbound value.

### 8.2 Oracle-Resolved Settlement

Each member maintains a **currency preference** in their ecosystem identity profile — fiat currency, stablecoin, cryptoasset, or any other supported medium. At settlement time:
```
payment(creator_i) = Oracle(AVUs_allocated_to_i, currency_preference_i, settlement_timestamp)
```

The price oracle is an external trusted service specified in the governance contract. The system does not impose a specific oracle — each institution chooses. Multiple creators with different currency preferences are settled in the same liquidation batch; the treasury holds AVUs and the oracle resolves each creator's preferred currency at settlement time.

### 8.3 Liquidation Sequence

When the liquidation trigger fires, the system executes automatically in order:

1. Deduct operational costs from treasury balance
2. Distribute remaining AVUs to internal artifacts by edge weights
3. Execute external forwarding — portions owed to external institutions are transferred to their treasuries
4. Convert each creator's allocated AVUs to their preferred currency via oracle and execute payment

Every step is recorded as a signed event, making the full liquidation process auditable.

---

## 9. Identity Infrastructure

### 9.1 Nostr for Signed Event Propagation

Every participant (human member or artifact) holds a secp256k1 keypair. Every significant action — artifact creation, contract negotiation, usage event, governance vote, proposal submission, execution event — is published as a **Nostr event**: a JSON object signed by the actor's private key. Signature verification confirms authorship without trusting any central authority. Events propagate through independent relays with no single point of failure or central controller.

### 9.2 Immutable Ledger for Critical State Anchoring

Nostr relays provide no persistence guarantee. For events requiring indefinite verifiability — artifact creation, contract assignments, governance founding events, legitimacy chain execution events — the **event hash is anchored to an immutable ledger**. This provides tamper-proof ordering and proof of existence independent of relay availability. The ledger is used exclusively for hash anchoring. It is not used as a monetary system, a token issuance platform, or a computation environment. Its role is strictly that of a tamper-proof timestamp and hash registry.

### 9.3 Architectural Summary

| Layer | Technology | Role |
|---|---|---|
| Event propagation and signing | Nostr protocol | Signed events, identity, distributed propagation |
| Critical state persistence | Immutable ledger | Hash anchoring, permanent proof of existence |
| Value computation | AVU layer | Currency-agnostic accounting |
| Value settlement | Price oracle | Currency conversion at liquidation time |

No speculative token economy. No platform-specific currency. The cryptographic infrastructure solves identity, integrity, and ordering without financial instruments.

---

## 10. Key Invariants and Constraints

These are structural guarantees of the system. They must be actively applied during reasoning about or implementing any component. Violations indicate a design error.

**I1 — DAG Acyclicity:** the dependency graph is always a DAG. No cycles are permitted. Enforced by a pre-insertion depth-first reachability check on every usage agreement event. Any IACP implementation must include this check before recording Phase 2 events.

**I2 — Contract Compatibility at Manifesto Registration:** a project cannot add an external artifact to its manifesto if the external artifact's contract is incompatible with the project's governance contract. This check is enforced at manifesto update time, not lazily.

**I3 — Internal Contract Specialization:** an internal artifact's utilization contract cannot be more permissive than the project's governance contract. It may add restrictions; it cannot relax project-level constraints.

**I4 — Value Conservation:** total AVUs distributed to creators + total operational costs + total external forwarding = total incoming AVUs. No implementation should allow leakage or double-counting.

**I5 — Versioning/Contract Binding:** contracts are bound to artifact entities, not individual versions. Content updates do not require downstream renegotiation. Only explicit contract amendment events trigger renegotiation.

**I6 — AVU Exclusivity:** no component of the distribution logic operates in concrete currencies. Currency conversion occurs only at treasury entry (inbound) and liquidation (outbound), both via oracle.

**I7 — Legitimacy Chain Completeness:** no institutional state can be reached except through the deliberation protocol. Every state transition is a signed, anchored execution event referencing the preceding state hash.

**I8 — Governance Transparency:** all governance contracts are publicly readable. No institution may deny a potential contributor access to its governance terms before participation.

**I9 — Right of Exit Existence:** every governance contract must define a right of exit. Its specific terms are configurable; its absence is not permitted.

**I10 — Conservative Default for Unclassified Changes:** when a governance contract does not specify tier assignment for a proposed change, the system applies the highest tier with unanimity.

---

## 11. Design Rationale for Non-Obvious Decisions

These explanations prevent a model from "correcting" intentional architectural choices.

**Why AVUs instead of a platform token?** A platform token introduces speculative value, misaligning incentives and concentrating financial risk on creators. AVUs have no intrinsic value — they are accounting units. This eliminates speculation while preserving full currency flexibility at settlement time.

**Why is the type system open rather than enumerated?** A closed enumeration would freeze the model at the moment of its design and require protocol changes to support new artifact types. An open registration mechanism allows the ecosystem to accommodate artifact types not yet imagined without modifying the core framework. The standard type library provides convenience without constraint.

**Why are interaction modes per-type rather than global?** Modes carry semantic meaning specific to artifact types. The mode `stream` means something fundamentally different for audio versus a live data feed. Forcing all types to share a global mode set would either produce meaningless modes for many types or create a combinatorial explosion of edge cases. Per-type modes defined at registration time are semantically precise and operationally clean.

**Why is the dependency graph emergent rather than declared?** Manual dependency declaration is error-prone and maintenance-burdened. Because every inter-artifact interaction passes through the IACP, usage agreement events are a faithful, automatically maintained record of actual dependencies. The graph cannot be incomplete or falsified.

**Why are contracts bound to artifact entities rather than versions?** Requiring renegotiation on every content update would make the system operationally prohibitive for actively developed artifacts. The distinction between substance updates and terms updates is meaningful and should be preserved in the model: a bug fix does not change the economic relationship between an artifact and its dependents.

**Why is governance neutral rather than prescriptive?** Imposing a governance philosophy would replicate, in a new technological form, the same paternalism that centralized legal infrastructure exhibits. The goal is to provide the infrastructure for institutions, not to define what institutions should be. Transparency — making all governance terms readable before participation — is the mechanism that makes freedom responsible without imposing values.

**Why is the change classification function institution-defined?** Different institutions have genuinely different governance needs. A two-person cooperative needs different change tiers than a 500-member research foundation. Fixing tier names and counts would create a mismatch for most institutions. The framework provides the mechanism (an ordered tier set with associated quorums); institutions provide the configuration.

**Why does the legitimacy chain not prevent power concentration?** Because preventing power concentration would violate governance neutrality. The legitimacy chain guarantees that whatever governance structure an institution has is the result of verifiable authorized decisions — not that the structure is "good" by any external standard. Potential contributors observe the chain and decide accordingly.

---

## 12. Relationship to the Syntropy Ecosystem Pillars

### 12.1 Everything Is an Artifact

The artifact model is platform-level, not pillar-specific. Every output produced anywhere in the ecosystem is an artifact under this model:
- A learning module or course fragment created in **Syntropy Learn** → artifact
- A research article or dataset published in **Syntropy Labs** → artifact
- A software module or project in **Syntropy Hub** → artifact
- A research laboratory in Labs → institution under this model
- An educational program in Learn → institution under this model

### 12.2 The Hub Is the Interface, Not the Infrastructure

Syntropy Hub is the **management and collaboration interface** built on top of this infrastructure — the layer through which users create projects and institutions, configure smart contracts, manage artifact manifests, discover collaborators, and navigate the ecosystem. The Hub does not own the artifact model, the IACP, or the value distribution mechanism. It exposes them through a user experience. The analogy is precise: this infrastructure is to the Hub what Git is to GitHub.

### 12.3 Cross-Pillar Value Flow

Because all ecosystem outputs are artifacts under the same model, value flows automatically across pillars. An artifact created as a learning exercise in Learn carries its authorship provenance when deployed in a Hub project. If that artifact is used commercially, the creator receives value regardless of which pillar it originated in. The platform's event bus captures cross-pillar interactions and feeds them into the value distribution mechanism.

---

## 13. Glossary

| Term | Definition |
|---|---|
| **Abstract Value Unit (AVU)** | Dimensionless accounting unit in which all value is computed; converted to concrete currency only at liquidation via oracle |
| **Artifact** | Any digital asset with verifiable identity, typed utilization interface, and an associated smart contract; the atomic unit of the ecosystem |
| **Artifact Manifesto** | Structured declaration of all internal and external artifacts belonging to a project |
| **Chamber** | A subdivision of institutional governance with a defined electorate, scope, quorum, and approval threshold |
| **Change Classification Function** | Institution-defined pair `(Ω, δ)` mapping change types to institution-defined governance tiers |
| **Contribution Event** | Signed record of a contributor's action on an artifact, used to compute creator weights |
| **Dependency Graph (DAG)** | Weighted directed acyclic graph of artifact usage relationships, emergent from IACP interactions |
| **Digital Institution** | Extension of a project with expressive governance: roles, chambers, deliberation protocol, and a legitimacy chain |
| **Digital Project** | Four-component entity: governance contract, artifact manifesto, monetization protocol, dependency graph |
| **Governance Neutrality** | Architectural principle: the framework provides governance primitives without imposing governance values |
| **IACP** | Inter-Artifact Communication Protocol: four-phase universal protocol (identification, negotiation, utilization, registration) |
| **Identity Record** | Immutable authorship record containing author public key, content hash, signature, version, and parent reference |
| **Internal Artifact** | Artifact created within a project; its contract must be ≤ permissive than the project's governance contract |
| **External Artifact** | Artifact from another project used under a recorded usage agreement event |
| **Legitimacy Chain** | Ordered sequence of institutional states where each transition is authorized by the contracts in force at proposal time |
| **Liquidation** | Process of converting allocated AVUs to concrete currencies and executing payments; triggered by treasury liquidation trigger |
| **Monetization Protocol** | Project component defining how incoming value is distributed among artifacts; supports static, dynamic, and hybrid weight modes |
| **Oracle** | External trusted service providing AVU-to-currency exchange rates at liquidation time |
| **Right of Exit** | Mandatory governance contract element defining conditions under which a contributor may withdraw participation |
| **Smart Contract** | Deterministic executable function governing utilization conditions: `Request × State → {permitted, denied} × State'` |
| **Standard Type Library** | Pre-registered artifact types provided as ready-to-use defaults; illustrative, not exhaustive |
| **Tier Set (Ω)** | Institution-defined ordered set of governance tiers with increasing requirements; no fixed names or count |
| **Treasury** | Smart contract-controlled account receiving all incoming value, computing distributions, and executing liquidations |
| **Type Registration** | Signed event declaring a new artifact type: `(τ, Σ_τ, M_τ)` |
| **Usage Agreement Event** | Signed record of an authorized interaction (Phase 2 of IACP); creates an edge in the dependency graph |
| **Usage Event** | Signed record of actual utilization (Phase 4 of IACP); primary input to usage-based weight computation |
| **Utilization Interface** | Third layer of an artifact: permitted interaction modes, smart contract, and type-specific usage layer descriptor |
| **Version Lineage** | Sequence of versioned artifact instances linked by parent references; contracts bind to the entity, not individual versions |