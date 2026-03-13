# UX Principles — Syntropy Ecosystem

> **Document Type**: UX Principles  
> **Project**: Syntropy Ecosystem  
> **Interface Types**: Web Application, Dashboard/Admin, REST API, Embedded IDE  
> **Created**: 2026-03-12  
> **Last Updated**: 2026-03-12  
> **UX Architect**: AGT-UXA  
> **Architecture Reference**: `docs/architecture/ARCHITECTURE.md`  
> **Vision Reference**: Section 4 (Interface and Interaction Preferences)

---

## 1. Interface Profile

### 1.1 Delivery Interfaces

> *Derived from Vision Document Section 4. List each interface type and its primary user.*

| Interface | Primary Users | Technical Level | Priority |
|-----------|--------------|-----------------|----------|
| Web Application | Learner, Builder/Contributor, Researcher, Content Creator, Mentor, Institution Founder, Scientific Reviewer, Sponsor, Administrator/Moderator | Non-technical to Expert | Primary |
| Dashboard / Admin | Administrator / Moderator | Admin | Secondary |
| REST API | Developers, external tooling, indexing (DOI, bibliographic) | Technical | Secondary |
| Embedded IDE | All roles when editing code, articles, or experiments | Technical to Expert | Supporting |

### 1.2 Interaction Style

> *What kind of interaction does the system primarily support?*

- [ ] Command-driven (explicit commands and arguments)
- [x] Form-driven (structured data entry and submission)
- [ ] Conversational (dialog-style back-and-forth)
- [x] Visual / exploratory (dashboards, data visualization, navigation)
- [x] Workflow / wizard (step-by-step guided processes)
- [ ] Automation-first (designed for scripting and integration, human interaction secondary)

### 1.3 Primary User Goals

> *List the top 3–5 things users come to this system to accomplish. Source: Vision Document Section 8 (Workflows and Journeys).*

1. **Onboard and make a first verifiable contribution** — New users find the right starting point (career discovery, placement), enter a Learn track, build and publish a first artifact, and receive portfolio/XP and next-step recommendations.
2. **Apply learning to real projects** — Learners who complete fragments receive cross-pillar suggestions (e.g. Hub issues matching their artifact); they contribute and get recognized without leaving the ecosystem.
3. **Complete a track and build a portfolio-ready project** — Learners progress through fragments (Problem → Theory → Artifact), publish artifacts, and finish with a complete project and automatic portfolio record.
4. **Discover and contribute to projects (Hub)** — Contributors find projects, resolve issues, submit artifacts, and have contributions accepted with automatic portfolio and value-distribution updates.
5. **Create a digital institution and first project** — Founders configure governance (templates), create the first project and issue, and make the project discoverable in the public square.
6. **Complete the scientific publication cycle (Labs)** — Researchers create laboratories, research lines, write articles (MyST/LaTeX), publish (DOI), receive and respond to reviews, and conclude the research line.

---

## 2. UX Principles for This Project

> *Derived from the framework's core UX principles (`.cursor/rules/ux/ux-principles.mdc`) applied to this project's specific context.*

### Principle 1: User Goals Over Capabilities (UX-001)

The system is organized around what users want to achieve — learn by building, contribute verifiably, publish research, create institutions — not around internal subsystems. Naming, navigation, and error messages use the user's vocabulary (artifact, track, contribution, institution) and avoid exposing implementation (event bus, DIP, IACP) unless the user is in a technical context.

**Implication for this project**: Top-level navigation is pillar- and goal-oriented (Learn, Hub, Labs, Platform). Error messages map API codes (VALIDATION_ERROR, DOMAIN_ERROR, CONFLICT, SERVICE_UNAVAILABLE) to actionable, non-technical copy. Recommendations are framed as "next steps" (e.g. "Your artifact could resolve this issue") rather than system events.

### Principle 2: Progressive Disclosure (UX-002)

Complexity is hidden by default. Advanced options (governance parameters, placement quiz, advanced institution config) are revealed when the user needs them or opts in. First-time flows are guided; power users can shortcut.

**Implication for this project**: Onboarding uses career discovery and optional placement; institution creation offers templates with "Advanced configuration" for experts. Fragment structure (Problem → Theory → Artifact) is fixed but content depth is progressive. Admin tasks (moderation, role management, schema registry, health) are available without cluttering the primary Web experience.

### Principle 3: Feedback for Every Action (UX-003)

Every user action receives a clear response. Operations longer than ~2 seconds show progress (e.g. "Anchoring artifact…", "Registering DOI…"). Success and failure are communicated with consistent patterns (toast, inline, or modal per routing rules). Async operations are acknowledged immediately and followed by a notification when background work completes.

**Implication for this project**: Submit → immediate acknowledgment; long-running operations → spinner or status text; completion → toast or notification. Portfolio and recommendations use skeleton loaders; we never block primary flows on recommendation load. We never imply instant global consistency where it does not hold (event bus, anchoring, DOI).

### Principle 4: Error Prevention (UX-004)

Destructive or irreversible actions require explicit confirmation (e.g. publish article version, delete). Input is validated early; validation errors are shown inline with clear, actionable messages. Confirmation dialogs state what will be lost or committed.

**Implication for this project**: Publish (article version, artifact) and delete/remove actions use confirmation. Form validation on blur or submit with inline errors. Contribution rejection shows structured feedback so the user can correct and resubmit.

### Principle 5: Consistency (UX-005)

The same concepts use the same terms and the same interaction patterns across Learn, Hub, and Labs. "Artifact," "publish," "contribution" are used consistently; pillar-specific copy is limited to domain jargon where necessary (e.g. "fragment" in Learn, "issue" in Hub). The same design system and component library apply to Web and Admin.

**Implication for this project**: Unified design language with pillar tokens (Learn: readability/progression; Hub: information density; Labs: academic precision). One component set; same patterns for equivalent actions (submit, cancel, confirm destructive). Admin uses the same design system.

### Principle 6: Accessibility as Baseline (UX-006)

WCAG 2.1 AA is the compliance target for the Web Application and Dashboard. Color alone must never convey status in gamification, governance, notifications, or progress — icons and text labels always accompany color-coded indicators. Keyboard navigation, focus indicators, and screen reader support are required.

**Implication for this project**: All status and progress use icon + text. Contrast and focus states follow the design system (DS-003). Forms have proper labels and error identification in text. See `docs/ux/ACCESSIBILITY-REQUIREMENTS.md` for full requirements.

### Principle 7: User Context and Recovery (UX-007)

Users can resume flows (e.g. return to a fragment, issue, or article). Cancel and back are available where appropriate. Where undo is not possible (e.g. published article version), the system makes irreversibility clear before confirmation.

**Implication for this project**: Breadcrumbs and back behavior preserve context when switching pillars. Embedded IDE: enter from fragment/issue/article, return to context with updated state (e.g. artifact published). Drafts and in-progress work are preserved where the architecture allows.

### Principle 8: System-Type Fit (UX-008)

Patterns match the interface: Web uses navigation, forms, and visual feedback; API uses structured request/response and error envelopes; Embedded IDE behaves like an in-context editor with clear entry/exit and state sync.

**Implication for this project**: Web: desktop-first, mobile-responsive; nav ≤7 top-level items; forms with validation and error placement. API: consistent error format (CONV-017), pagination on list endpoints. IDE: contextual to the current fragment, issue, or article; no generic standalone IDE experience.

---

## 3. Accessibility Requirements

> *What level of accessibility compliance is required? Source: Vision Document Section 4.*

### 3.1 Compliance Target

| Interface | Standard | Level | Rationale |
|-----------|----------|-------|-----------|
| Web Application | WCAG 2.1 | AA | Primary interface; educational and professional goals; users may be younger or in underserved communities |
| Dashboard / Admin | WCAG 2.1 | AA | Same as Web; moderators and admins must have full access |
| REST API | Structured errors | Custom | Human-readable messages; machine-readable codes; no sensitive leakage |
| Embedded IDE | WCAG 2.1 | AA | Keyboard, focus, screen reader; part of Web experience |

### 3.2 Specific Requirements

- [x] Keyboard navigation for all interactive elements
- [x] Screen reader support (ARIA labels, semantic HTML)
- [x] Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- [x] No color-only information signals (gamification, governance, notifications: icon + text)
- [x] Focus indicators always visible
- [x] Text scalable to 200% without loss of functionality
- [x] Motion respects `prefers-reduced-motion`

### 3.3 Testing Approach

Automated testing (e.g. axe-core) in CI where applicable; manual keyboard and screen reader checks for primary flows. Accessibility requirements are detailed in `docs/ux/ACCESSIBILITY-REQUIREMENTS.md`.

---

## 4. Information Architecture

### 4.1 Top-Level Navigation Structure

> *Web Application. Maximum 7 primary items per IXD-006.*

| Section | Purpose | Primary User |
|---------|---------|--------------|
| Learn | Tracks, courses, fragments, learning progress, mentor discovery | Learner, Content Creator, Mentor |
| Hub | Institutions, projects, issues, contributions, public square | Builder/Contributor, Institution Founder |
| Labs | Laboratories, research lines, articles, reviews, discovery | Researcher, Scientific Reviewer |
| Platform | Portfolio, search, planning, notifications, profile | All authenticated users |
| (Admin) | Moderation, roles, schema registry, health (protected cluster) | Administrator / Moderator |

Pillar switching (Learn ↔ Hub ↔ Labs) preserves context; breadcrumbs and back navigation are consistent. "Platform" groups portfolio, cross-pillar search, and planning to avoid exceeding seven top-level items.

### 4.2 Content Hierarchy

> *CLI is not in scope. REST API resource naming follows architecture; see INTERACTION-DESIGN for error and pagination conventions.*

### 4.3 User Workflows by Interface

| Workflow | Interface | Entry Point | Exit Point |
|----------|-----------|-------------|------------|
| New user onboarding to first contribution (W2) | Web | Institutional site / Get Started | First artifact published, portfolio updated, recommendations shown |
| Cross-pillar learning to contribution (W1) | Web | Fragment completion, suggestion | Contribution submitted / accepted, portfolio updated |
| Learner develops track to complete project (W3) | Web | Active track, next fragment | Track complete, project in portfolio |
| Contributor discovers and contributes (W6) | Web | Public square or Learn suggestion | Contribution accepted, value distribution updated |
| Creating digital institution and first project (W5) | Web | Institution creation flow | Institution and first issue live |
| Complete scientific publication cycle (W7) | Web | Laboratory, research line | Article published (DOI), reviews addressed |
| Admin: moderation, roles, health | Web (Dashboard) | Admin nav | Task complete |

---

## 5. Error and Edge Case Strategy

### 5.1 Error Categories and Handling

| Error Category | User Message Style | Recovery Action |
|----------------|-------------------|-----------------|
| Validation (VALIDATION_ERROR / 422) | Inline, field-level; specific and actionable | Correct input, resubmit |
| Domain rule (DOMAIN_ERROR / 422) | User-facing explanation (no technical leak) | Adjust action or request permission |
| Conflict (CONFLICT / 409) | Explain what conflicts (e.g. "This artifact was already submitted") | Retry or open updated view |
| Service unavailable (503) | Acknowledge + "Try again in a few minutes" + optional status link | Retry later |
| Not found (404) | "We couldn't find that [resource]" + alternatives | Search, breadcrumb to list |
| Unexpected | Apologize + reference ID for support; no stack traces to user | Try again / contact support |

Placement: inline for form errors; toast for background/async failures; modal for blocking errors (e.g. session expired). No sensitive or technical details in user-facing copy.

### 5.2 Empty States

| View | Empty State Message | Call to Action |
|------|---------------------|----------------|
| Portfolio | "Your portfolio will build as you contribute." | "Go to Learn" / "Explore Hub" |
| Recommendations | "Complete a fragment or contribution to get suggestions." | "Go to Learn" / "Explore Hub" |
| Track progress | "You haven't started any track yet." | "Discover tracks" |
| Open issues (Hub) | "No open issues yet." | "Create first issue" (if maintainer) |
| Admin queue | "No items awaiting review." | — |

### 5.3 Destructive Actions

| Action | Confirmation Required | What Is Lost / Committed |
|--------|------------------------|---------------------------|
| Publish article version (Labs) | Yes — explicit "Publish" with irreversibility note | Version immutable after publish |
| Delete / remove artifact (context-dependent) | Yes — describe scope | Depends on scope (e.g. unlink vs delete) |
| Reject contribution | Yes — optional feedback form | Contributor can resubmit with changes |
| Admin: revoke role / apply sanction | Yes — state impact | Access or standing change |

---

## 6. Non-Negotiable UX Requirements

1. **Status never by color alone** — All status and progress in gamification, governance, and notifications use icon + text; color is supplementary (Vision Section 4).
2. **WCAG 2.1 AA** — Web Application and Dashboard meet WCAG 2.1 AA; see ACCESSIBILITY-REQUIREMENTS.md.
3. **No silent destructive actions** — Destructive or irreversible actions require explicit confirmation stating what will be lost or committed.
4. **Consistent error handling** — Single error-handling pattern in the Web App; API codes mapped to actionable, non-technical messages; consistent placement (inline / toast / modal).
5. **Async honesty** — Immediate acknowledgment for submissions; background status for long-running work; success/notification when done; never imply instant global consistency where it does not hold.
6. **Top-level nav ≤ 7 items** — Primary navigation respects IXD-006.
7. **Unified design system** — One component set and design language for Web and Admin; pillar-specific tokens only for variation.

---

## 7. Traceability

| UX Requirement | Vision Section | Architecture Reference |
|----------------|----------------|------------------------|
| Web primary, Dashboard secondary, API, IDE | Section 4 | platform/web-application, platform/rest-api, platform/embedded-ide |
| WCAG 2.1 AA, no color-only status | Section 4 | cross-cutting/security (accessibility) |
| Frictionless pillar transitions, performance | Section 9 (Quality Priorities 3, 9) | ARCHITECTURE.md, platform-core/search-recommendation |
| Workflows 1–10 | Section 8 | domains/learn, hub, labs, platform-core |
| Event bus, portfolio, async consistency | Section 9, UX Brief risks | platform-core/event-bus-audit, portfolio-aggregation |

---

## 8. Review and Approval

| Reviewer | Role | Date | Status |
|----------|------|------|--------|
| | UX Architect (AGT-UXA) | 2026-03-12 | Approved |
| | System Architect | | Pending |
| | User Representative | | Pending |
