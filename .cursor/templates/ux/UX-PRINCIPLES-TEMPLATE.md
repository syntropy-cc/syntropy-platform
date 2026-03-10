# UX Principles — {Project Name}

> **Document Type**: UX Principles  
> **Project**: {Project Name}  
> **Interface Types**: {List all: Web / CLI / API / Mobile / etc.}  
> **Created**: {YYYY-MM-DD}  
> **Last Updated**: {YYYY-MM-DD}  
> **UX Architect**: (AGT-UXA if AI-generated)  
> **Architecture Reference**: `docs/architecture/ARCHITECTURE.md`  
> **Vision Reference**: Section 4 (Interface and Interaction Preferences)

---

## 1. Interface Profile

### 1.1 Delivery Interfaces

> *Derived from Vision Document Section 4. List each interface type and its primary user.*

| Interface | Primary Users | Technical Level | Priority |
|-----------|--------------|----------------|---------|
| {e.g., Web Dashboard} | {e.g., Administrators} | {e.g., Non-technical} | Primary / Secondary |
| {e.g., REST API} | {e.g., Developers} | {Technical} | Primary / Secondary |
| {e.g., CLI} | {e.g., DevOps} | {Technical} | Primary / Secondary |

### 1.2 Interaction Style

> *What kind of interaction does the system primarily support?*

- [ ] Command-driven (explicit commands and arguments)
- [ ] Form-driven (structured data entry and submission)
- [ ] Conversational (dialog-style back-and-forth)
- [ ] Visual / exploratory (dashboards, data visualization, navigation)
- [ ] Workflow / wizard (step-by-step guided processes)
- [ ] Automation-first (designed for scripting and integration, human interaction secondary)

### 1.3 Primary User Goals

> *List the top 3–5 things users come to this system to accomplish. Source: Vision Document Section 8 (Workflows and Journeys).*

1. {User goal 1}
2. {User goal 2}
3. {User goal 3}

---

## 2. UX Principles for This Project

> *Derive these from the framework's core UX principles (`.cursor/rules/ux/ux-principles.mdc`) applied to this project's specific context. If a principle applies differently here, explain why.*

### Principle 1: {Name}

{One or two sentences. Example: "Every operation that modifies data requires explicit confirmation. Our users manage production infrastructure — mistakes have real consequences."}

**Implication for this project**: {Concrete examples of how this principle manifests in our system}

### Principle 2: {Name}

{One or two sentences.}

**Implication for this project**: {Concrete examples}

### Principle 3: {Name}

{One or two sentences.}

**Implication for this project**: {Concrete examples}

*(Add more principles as needed. Minimum 3, maximum 7.)*

---

## 3. Accessibility Requirements

> *What level of accessibility compliance is required? Source: Vision Document Section 4.*

### 3.1 Compliance Target

| Interface | Standard | Level | Rationale |
|-----------|---------|-------|-----------|
| {Web Dashboard} | WCAG 2.1 | AA | {e.g., Public-facing, regulatory requirement} |
| {CLI} | Output clarity | Custom | {e.g., Color-blind safe output, screen reader compatible} |

### 3.2 Specific Requirements

- [ ] Keyboard navigation for all interactive elements
- [ ] Screen reader support (ARIA labels, semantic HTML)
- [ ] Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- [ ] No color-only information signals
- [ ] Focus indicators always visible
- [ ] Text scalable to 200% without loss of functionality
- [ ] {Project-specific requirement}

### 3.3 Testing Approach

{How will accessibility be tested? Tools, manual testing, user testing?}

---

## 4. Information Architecture

> *How is information organized across the system?*

### 4.1 Top-Level Navigation Structure

*(For web systems only. List primary navigation sections and their purpose.)*

| Section | Purpose | Primary User |
|---------|---------|-------------|
| {Dashboard} | {Overview and quick access to key metrics} | {All users} |
| {Settings} | {Configure system behavior} | {Administrators} |

### 4.2 Content Hierarchy

*(For CLI systems. List command groups and their purpose.)*

| Command Group | Purpose | Example Commands |
|--------------|---------|-----------------|
| `{noun}` | {Purpose} | `create`, `list`, `delete` |

### 4.3 User Workflows by Interface

*(Map Vision Document Section 8 workflows to interface touchpoints.)*

| Workflow | Interface | Entry Point | Exit Point |
|---------|-----------|------------|-----------|
| {Workflow 1} | {CLI / Web / API} | {Starting point} | {Completion} |

---

## 5. Error and Edge Case Strategy

> *How does the system handle and communicate errors, edge cases, and exceptional states?*

### 5.1 Error Categories and Handling

| Error Category | User Message Style | Recovery Action |
|---------------|-------------------|----------------|
| User input error | {Friendly + specific + actionable} | {Inline correction} |
| System unavailability | {Acknowledge + estimate + alternative} | {Retry / status link} |
| Permission denied | {Acknowledge + explain what's needed} | {Contact / request} |
| Not found | {Confirm what was searched + alternatives} | {Search / return to list} |
| Unexpected error | {Apologize + report + reference ID} | {Try again / contact support} |

### 5.2 Empty States

*(For web systems. List all views that can be empty.)*

| View | Empty State Message | Call to Action |
|------|-------------------|----------------|
| {Pipeline list} | {"You don't have any pipelines yet."} | {"Create your first pipeline"} |

### 5.3 Destructive Actions

*(List all actions that are destructive or irreversible.)*

| Action | Confirmation Required | What Is Lost |
|--------|--------------------|-------------|
| {Delete workspace} | Yes — type name | {All workspace data, configs, history} |

---

## 6. Non-Negotiable UX Requirements

> *Hard requirements that must be met. These are pass/fail, not suggestions.*

1. {e.g., All commands must return within 500ms for read operations, or show a progress indicator}
2. {e.g., No action destroys data without a confirmation step showing what will be lost}
3. {e.g., The CLI must work in non-interactive (piped) environments}
4. {e.g., All API errors return a machine-readable error code, not just an HTTP status}

---

## 7. Traceability

| UX Requirement | Vision Section | Architecture Reference |
|---------------|---------------|----------------------|
| {UX requirement} | {Section 4 / 8} | {Architecture component or ADR} |

---

## 8. Review and Approval

| Reviewer | Role | Date | Status |
|---------|------|------|--------|
| | UX Architect (AGT-UXA) | | Approved / Needs Revision |
| | System Architect | | Approved / Needs Revision |
| | User Representative | | Approved / Needs Revision |
