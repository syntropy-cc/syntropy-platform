# {Project Name} — Vision Document

> **Document Type**: Vision Document
> **Author**: {Author Name}
> **Created**: {YYYY-MM-DD}
> **Last Updated**: {YYYY-MM-DD}
> **Status**: Draft | Review | Approved

---

## How to Use This Template

Write freely and in your own words. This document captures **what you want**, not **how to build it**. There are no wrong answers — describe your ideal future without worrying about technical feasibility. An AI assistant will later transform this vision into a technical architecture.

**Tips**:
- Use plain language; avoid technical jargon unless it is part of your domain
- Be specific where you can, but don't force precision — ambiguity is fine and will be resolved during architecture
- Think about *people* and *outcomes*, not screens and databases
- Longer is better than shorter — more detail gives the architecture generation richer material

**Before you start Prompt 01**: use **Prompt 00** (`.cursor/prompts/00-refine-vision.md`) to get a quality assessment of this document and guided suggestions for improvement. Prompt 01 will check that this document meets minimum quality thresholds before generating architecture.

---

## 1. Problem Statement

*What problem exists today? Who is affected? What is the cost of leaving things as they are?*

{Describe the current situation. What pain points exist? Who suffers from them? What happens if nothing changes? Be concrete — use numbers, examples, or anecdotes if you have them.}

### Current Solutions

*How is this problem solved today? What tools, processes, or workarounds exist — and what is wrong with them?*

- **{Existing solution or approach}**: {What it is and specifically why it is inadequate, slow, expensive, or missing key capabilities}
- **{Another current approach}**: {What it is and its shortcomings}

{Describing how things work today helps the architecture agent understand what to replace, complement, or integrate with.}

---

## 2. Ideal Future

*Imagine the system already exists and works perfectly. What does the world look like?*

{Describe the end state with no technical constraints. How do people's lives or work change? What becomes possible that was not possible before? Paint a picture of the ideal outcome.}

---

## 3. Users and Actors

*Who interacts with the system? What do they need?*

> **Minimum completion criteria**: define at least 2 actors. For each actor, fill in all four columns. Add narrative descriptions for actors whose needs are complex or whose context matters.

For each user type or external system, describe:
- **Who they are** (role, context)
- **What they need** from the system
- **How often** they interact with it
- **What success looks like** for them

| Actor | Description | Primary Need | Frequency | Technical Level |
|-------|-------------|--------------|-----------|-----------------|
| {Actor 1} | {Who they are} | {What they need} | {Daily / Weekly / On demand / ...} | {Non-technical / Some technical / Technical / Developer / Admin} |
| {Actor 2} | {Who they are} | {What they need} | {Frequency} | {Technical level} |
| {Actor 3} | {Who they are} | {What they need} | {Frequency} | {Technical level} |

{Add narrative descriptions for each actor if the table is not enough. Describe their goals, frustrations, and expectations.}

---

## 4. Interface and Interaction Preferences

*How do users or systems interact with this system? Through what kind of interface?*

This section is critical — it determines the platform architecture, the UX design phase, and the documentation structure. Be as specific as you can.

### Delivery Interfaces

Check all that apply and describe each:

- [ ] **Web Application** — {Describe who uses it and for what. Desktop-only? Mobile-responsive? Requires login?}
- [ ] **Command-Line Interface (CLI)** — {Describe who runs it and in what context. Interactive or scriptable? Part of a pipeline?}
- [ ] **REST API** — {Describe who calls it. Developer-facing? Machine-to-machine? Public or private?}
- [ ] **Dashboard / Admin Interface** — {Describe who uses it. Operational monitoring? Configuration management?}
- [ ] **Background Service / Worker** — {No direct user interface. Triggered by schedule, event, or queue?}
- [ ] **Mobile Application** — {iOS, Android, or both? Native or web wrapper?}
- [ ] **Embedded / SDK** — {Used by other developers in their own applications?}
- [ ] **Other**: {Describe}

### Interaction Style

*How should interacting with the system feel? Choose what applies and add notes.*

- [ ] **Self-service** — users accomplish tasks independently without human assistance
- [ ] **Guided / Wizard-driven** — step-by-step flows that lead users through complex tasks
- [ ] **Power-user / Expert-first** — depth, composability, and speed over hand-holding
- [ ] **Conversational / Chat** — natural language input, iterative refinement
- [ ] **Automated / Headless** — no human in the loop during normal operation
- [ ] **Collaborative** — multiple users work on shared artifacts simultaneously

Notes: {Any specific expectations about how users interact with the system}

### Accessibility Requirements

*Are there specific accessibility needs for any of the delivery interfaces?*

{Examples: "The web app must comply with WCAG 2.1 AA for use in a public sector context", "The CLI output must be screen-reader compatible", "Color alone cannot convey status — icons or text labels required". Leave blank if no specific requirements are known.}

---

## 5. System Components and Subsystem Visions

*Does your system have multiple distinct parts with different purposes, audiences, or design characters?*

> **When to complete this section**: complete this section if your system has 2 or more distinct components that serve different audiences, have different design characters, or behave in fundamentally different ways. Examples: a web application AND a background processing engine; a user-facing interface AND a developer API; multiple specialized agents in a pipeline. If your system is a single component, write "Single component — not applicable" and move to the next section.

---

### Component 1: {Component Name}

**Type**: {Web App / CLI / REST API / Background Service / Dashboard / Agent / Pipeline Stage / Other}

**Primary users**: {Which actors from Section 3 primarily use or interact with this component?}

**Purpose in one sentence**: {What is the single most important thing this component does?}

**Design character**: {What should using or operating this component feel like? Use adjectives and analogies. Examples: "Feels like git — powerful, composable, and predictable. Assumes expert users." / "Feels like Notion — calm, spacious, non-threatening. Works for non-technical users without training." / "Feels like Stripe's API — every response is predictable, every error is actionable, documentation is first-class."}

**Key design principles for this component**:
- {Principle 1 — e.g., "Speed over completeness: show partial results immediately"}
- {Principle 2 — e.g., "Never block the user: destructive operations are reversible"}
- {Principle 3 — e.g., "Fail loudly: errors must explain what went wrong and what to do"}

**What success looks like for this component**: {How do you know this specific component is working well? What would a satisfied user say about it? What would a dissatisfied user complain about?}

**Unique constraints or priorities** (if different from system-wide priorities in Section 9): {Examples: "Must work offline for field operators." / "Response time under 100ms is non-negotiable — users are blocked if it is slow." / "Must be embeddable in other companies' platforms."}

---

### Component 2: {Component Name}

{Repeat the structure above for each additional component.}

---

## 6. Key Capabilities

*What can the system do? Describe capabilities in business terms, not features or screens.*

> **Minimum completion criteria**: describe at least 5 capabilities. For each, include a priority so the architecture can distinguish MVP scope from future scope.

A capability is something the system enables. Examples: "Manage customer orders from placement to delivery", "Generate brand-aligned marketing content from articles", "Track patient health metrics over time".

| # | Capability | Description | Priority |
|---|------------|-------------|----------|
| 1 | **{Capability 1 Name}** | {Description of what the system can do and why it matters} | MVP / Post-MVP / Future |
| 2 | **{Capability 2 Name}** | {Description} | MVP / Post-MVP / Future |
| 3 | **{Capability 3 Name}** | {Description} | MVP / Post-MVP / Future |
| 4 | **{Capability 4 Name}** | {Description} | MVP / Post-MVP / Future |
| 5 | **{Capability N Name}** | {Description} | MVP / Post-MVP / Future |

{Add as many as needed. Group related capabilities if it helps clarity.}

---

## 7. Information and Concepts

*What "things" does the system manage? Describe them in business language.*

These are the key concepts in your domain — the nouns that people talk about when discussing the system. Examples: "Orders", "Patients", "Articles", "Brands", "Invoices", "Appointments".

For each concept, describe:
- **What it is** in plain language
- **What information** it carries (key attributes, not database columns)
- **How it relates** to other concepts
- **Who owns or creates it**
- **Its lifecycle** (what states does it go through?)

| Concept | Description | Key Information | Related To | Owner/Creator | Lifecycle States |
|---------|-------------|-----------------|------------|---------------|------------------|
| {Concept 1} | {What it is} | {Key attributes} | {Related concepts} | {Who creates it} | {e.g., Draft → Active → Archived} |
| {Concept 2} | {What it is} | {Key attributes} | {Related concepts} | {Who creates it} | {States or "N/A — immutable"} |
| {Concept 3} | {What it is} | {Key attributes} | {Related concepts} | {Who creates it} | {States} |

{Add narrative descriptions for complex concepts. Explain hierarchies, lifecycles, or important rules about how concepts relate to each other.}

---

## 8. Workflows and Journeys

*How do users accomplish their goals? Describe step-by-step narratives.*

> **Minimum completion criteria**: describe at least 2 workflows, covering the most important and most frequent user goals.

For each important workflow, describe what happens from the user's perspective — not as a flowchart, but as a story.

### Workflow 1: {Name}

**Actor**: {Who performs this workflow}
**Goal**: {What they are trying to accomplish}
**Trigger**: {What starts this workflow}
**Frequency**: {How often this workflow occurs — e.g., "Multiple times per day", "Weekly", "On demand"}
**Volume**: {At what scale — e.g., "Single user", "Up to 100 concurrent users", "Batch of 1000 records"}

**Steps**:
1. {What happens first}
2. {What happens next}
3. {What happens after that}
4. {How does it end — what is the result?}

**Variations**: {What can go differently? Alternative paths, error cases, edge cases.}

---

### Workflow 2: {Name}

**Actor**: {Who}
**Goal**: {What}
**Trigger**: {When}
**Frequency**: {How often}
**Volume**: {At what scale}

**Steps**:
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Variations**: {Alternatives}

---

{Add as many workflows as needed. Focus on the most important and most frequent ones.}

---

## 9. Quality Priorities

*What matters most for this system? Rank the following from most to least important.*

Not everything can be optimized at the same time. Ranking these helps make architectural trade-offs.

Rank the following (1 = most important, reorder as needed):

1. {Priority — e.g., Simplicity}
2. {Priority — e.g., Reliability}
3. {Priority — e.g., Speed / Performance}
4. {Priority — e.g., Security}
5. {Priority — e.g., Cost efficiency}
6. {Priority — e.g., Scalability}
7. {Priority — e.g., User experience}
8. {Priority — e.g., Extensibility / Flexibility}
9. {Priority — e.g., Time to market}
10. {Priority — e.g., Maintainability}
11. {Priority — e.g., Observability / Debuggability}
12. {Priority — e.g., Testability}

**Notes on priorities**: {Explain any trade-offs you are aware of or any priorities that are non-negotiable.}

**Non-negotiable floors**: {List any quality attributes that have a hard minimum regardless of their rank. Examples: "Security is ranked 4th but any security vulnerability is a launch blocker regardless." / "Response time above 2 seconds is never acceptable for any operation in the web interface." / "The system must produce a full audit log for every state change — this cannot be traded off."}

---

## 10. Constraints and Non-Goals

*What does the system explicitly NOT do? What boundaries exist?*

### Non-Goals (out of scope)

- {Thing the system will NOT do — e.g., "This system does not handle payment processing directly"}
- {Another non-goal}
- {Another non-goal}

### Known Constraints

- {Constraint — e.g., "Must work with existing customer database", "Budget limited to X", "Team of 2 developers"}
- {Constraint}
- {Constraint}

### Assumptions

- {Assumption — e.g., "Users have reliable internet access", "Data volume will be under 1M records"}
- {Assumption}

### Integration Requirements

*Does the system need to communicate with other existing systems? List them here.*

| External System | What It Is | Integration Purpose | Direction | Criticality |
|-----------------|------------|---------------------|-----------|-------------|
| {System name} | {Brief description of what it is} | {Why the system integrates with it} | {Inbound / Outbound / Both} | {Critical — system cannot function without it / Important / Optional} |
| {System name} | {Description} | {Purpose} | {Direction} | {Criticality} |

{If there are no known external integrations, write "No external integrations required at this time." Undisclosed integrations often cause architecture surprises — be thorough.}

### Data Sensitivity and Compliance

*Does the system store, process, or transmit any sensitive data? Are there regulations that apply?*

**Data types handled** (check all that apply):
- [ ] Personal Identifiable Information (PII) — names, emails, addresses, phone numbers
- [ ] Financial data — payment card numbers, bank account details, transaction records
- [ ] Health / Medical data — diagnoses, prescriptions, health history
- [ ] Authentication credentials — passwords, API keys, tokens
- [ ] Proprietary / confidential business data
- [ ] Children's data (under 13/16 depending on jurisdiction)
- [ ] No sensitive data

**Regulations that apply** (check all that apply):
- [ ] GDPR (EU General Data Protection Regulation)
- [ ] HIPAA (US Health Insurance Portability and Accountability Act)
- [ ] PCI-DSS (Payment Card Industry Data Security Standard)
- [ ] SOC 2
- [ ] CCPA (California Consumer Privacy Act)
- [ ] Other: {Specify}
- [ ] None known

**Data residency requirements**: {Are there requirements about where data is stored geographically? Examples: "Data must remain within the EU", "No restrictions". Leave blank if not known.}

### Scale and Team Context

*Who will build this system, and at what scale will it operate?*

**Team size**: {Solo / 2–3 developers / Small team (4–8) / Larger team (9+)}

**Expected initial scale**: {Examples: "Personal use only", "Under 100 users", "100–10,000 users", "10,000+ users", "Enterprise (single tenant)", "SaaS (multi-tenant)"}

**Growth expectations**: {Examples: "Stable — not expected to grow significantly", "Moderate growth over 1–2 years", "Must be built to scale from day one", "Unknown — start small and evolve"}

**Deployment target**: {Examples: "Local machine only", "Single server", "Cloud (AWS / GCP / Azure)", "Kubernetes", "Edge / CDN", "On-premises only"}

---

## 11. Success Metrics

*How do we know the system is working? Define measurable outcomes.*

### Business Metrics

*Outcomes that matter to the people who use the system or depend on it:*

| Metric | Description | Target | How Measured |
|--------|-------------|--------|--------------|
| {Metric 1} | {What it measures in business terms} | {Target value} | {How we measure it} |
| {Metric 2} | {What it measures} | {Target value} | {How we measure it} |

### Technical Metrics

*Outcomes that reflect system health and quality:*

| Metric | Description | Target | How Measured |
|--------|-------------|--------|--------------|
| {Metric 1} | {What it measures in technical terms} | {Target value} | {How we measure it} |
| {Metric 2} | {What it measures} | {Target value} | {How we measure it} |

{Add qualitative success criteria if quantitative metrics are not enough — e.g., "Users report feeling confident in the content quality".}

### Anti-Metrics

*What outcomes would indicate failure, even if primary metrics look good?*

- {Anti-metric 1 — e.g., "Users frequently abandon workflows halfway through — even if completion rate is good, a high abandonment rate at a specific step signals a UX problem"}
- {Anti-metric 2 — e.g., "Support tickets spike after each release — indicates documentation or error messaging is inadequate"}
- {Anti-metric 3 — e.g., "Developers frequently ask for exceptions to architecture rules — indicates the architecture is too rigid or poorly understood"}

---

## 12. Inspirations and References

*Are there existing systems, products, or approaches that inspire this vision?*

- **{Reference 1}**: {What it is and what aspect inspires you — e.g., "Notion — the simplicity of the interface"}
- **{Reference 2}**: {What and why}
- **{Reference 3}**: {What and why}

**Interface character references** (if applicable): {If you identified delivery interfaces in Section 4, describe any specific product, tool, or style that captures the feel you want for each component. Examples: "The CLI should feel like the Heroku CLI — clean, informative, friendly error messages." / "The web dashboard should feel like Linear — dense information but not cluttered, keyboard shortcuts everywhere."}

{Include links, screenshots, or descriptions of anything that communicates the feeling or functionality you want.}

---

## Next Steps

Once this Vision Document is complete:

1. **Review** it with stakeholders (if applicable)
2. **Assess quality**: open a new Cursor conversation, use **Prompt 00** (`.cursor/prompts/00-refine-vision.md`) to get a quality score and guided improvement suggestions before proceeding
3. **Generate architecture**: open a new Cursor conversation, use **Prompt 01** (`.cursor/prompts/01-generate-architecture-from-vision.md`) — Prompt 01 will automatically check that the document passes minimum quality thresholds
4. **Iterate**: use **Prompt 02** (`.cursor/prompts/02-iterate-architecture.md`) until the architecture reflects your vision

See `.cursor/FRAMEWORK.md` for the complete workflow guide.
