# UX Brief

> **Purpose**: Confirmed UX Brief produced by Prompt 01-D. Governs all work in Prompt 01-E.
> **Created by**: Prompt 01-D — UX Assess and Brief
> **Consumed by**: Prompt 01-E — UX Generate and Validate
> **Status**: Active
> **Last updated**: 2026-03-12

---

## Interface Types in Scope

| Interface | Primary / Secondary | Users (from Section 3) | Justification from Section 4 |
|-----------|--------------------|-----------------------|------------------------------|
| Web Application | Primary | Learner, Builder/Contributor, Researcher, Content Creator, Mentor, Institution Founder, Scientific Reviewer, Sponsor, Administrator/Moderator | "The primary interface for all users across all three pillars and platform services. Desktop-first with mobile-responsive support." |
| Dashboard / Admin | Secondary | Administrator / Moderator | "Used by administrators and moderators for content moderation, role management, governance, and ecosystem health monitoring." |
| REST API | Secondary | Developers, external tooling, indexing (e.g. DOI, bibliographic) | "Developer-facing API exposing platform capabilities for integrations, external tooling, and cross-pillar communication." |
| Embedded IDE | Supporting | All roles when editing code, articles, or experiments | "The integrated development environment (IDE) embedded within the platform serves all three pillars without requiring users to leave the platform." |

*Note*: Background Service / Worker is not a user-facing interface; it is out of scope for UX design.

---

## Design System Decision

| Field | Value |
|-------|-------|
| **DS-001 gate result** | Required |
| **Reason** | Vision Section 4 and the Generation Summary both include Web Application and Dashboard / Admin. Rule DS-001: "Interfaces include Web, Dashboard, or Mobile → Apply all rules in this file." Therefore DESIGN-SYSTEM.md and COMPONENT-LIBRARY.md will be produced in Prompt 01-E. |

---

## Confirmed Execution Path

Web Application (primary) + Dashboard/Admin (secondary) + REST API + Embedded IDE (supporting).

The Web App is the main surface for Learn, Hub, Labs, portfolio, search, and planning. Admin is a protected route cluster on the same Next.js app. REST API supports the Web App and external consumers. The Embedded IDE is used in-context within Learn, Hub, and Labs.

---

## Documents to Generate

> Prompt 01-E will create these files.

- `docs/ux/UX-PRINCIPLES.md`
- `docs/ux/ACCESSIBILITY-REQUIREMENTS.md`
- `docs/ux/INTERACTION-DESIGN.md`
- `docs/design-system/DESIGN-SYSTEM.md` _(only if DS-001 gate is Required)_
- `docs/design-system/COMPONENT-LIBRARY.md` _(only if DS-001 gate is Required)_

---

## Primary User Flows to Design

| Flow Name | Interface | Source (Section 8) | Priority |
|-----------|-----------|-------------------|----------|
| New user onboarding to first contribution | Web | Workflow 2 | Must |
| Cross-pillar learning to contribution | Web | Workflow 1 | Must |
| Learner develops track to complete project | Web | Workflow 3 | Must |
| Contributor discovers and contributes to project | Web | Workflow 6 | Must |
| Creating digital institution and first project | Web | Workflow 5 | Must |
| Complete scientific publication cycle | Web | Workflow 7 | Must |
| Track creator builds track with AI copilot | Web | Workflow 4 | Recommended |
| Scientific beginner discovers and contributes | Web | Workflow 8 | Recommended |
| Researcher translates Labs result to Hub and Learn | Web | Workflow 9 | Recommended |
| Sponsor discovers and supports creator | Web | Workflow 10 | Recommended |

*Minimum set for 01-E*: Onboarding (W2), Learning-to-Contribution (W1), and one high-volume error path (e.g. contribution rejected, or validation error on submit) must be fully designed. Other Must flows should have at least key screens and transitions defined.

---

## Key UX Decisions to Make in 01-E

- **Navigation structure**: Global nav across Learn / Hub / Labs / Platform (portfolio, search, planning); how pillar switching works without losing context; breadcrumbs and back behavior.
- **Unified design language with pillar tokens**: Single component set with Learn / Hub / Labs semantic tokens (Section 4: "Each pillar carries small contextual adjustments… variations of the ecosystem's unified design language").
- **Error messaging strategy**: Map API error codes (VALIDATION_ERROR, DOMAIN_ERROR, CONFLICT, SERVICE_UNAVAILABLE) to user-facing copy; consistent placement (inline vs toast vs modal); no sensitive or technical leakage.
- **Loading and async feedback**: Skeleton states for portfolio and recommendations; optimistic updates where safe; clear status for async operations (e.g. "Anchoring artifact…", "Registering DOI…").
- **Embedded IDE entry/exit**: How users enter the IDE from a fragment, issue, or article; how they return to context and see updated state (e.g. artifact published).
- **Admin/Dashboard scope**: Which admin tasks get first-class flows (moderation, role management, schema registry, health) and how they align with the same design system.
- **Accessibility**: WCAG 2.1 AA implementation plan; status and progress never conveyed by color alone (gamification, governance, notifications) — icons and text always paired.

---

## UX Risks Identified

| Risk | Source | Mitigation |
|------|--------|------------|
| Data latency | Portfolio/recommendations near-real-time (<5s, <30s lag); Quality #9 requires fast cross-pillar navigation | Skeleton loaders and clear loading states; optimistic updates for non-critical writes; avoid blocking primary flows on recommendation load |
| Error propagation | Multiple domains; REST envelope defines DOMAIN_ERROR (422), CONFLICT (409), 503 | Single error-handling pattern in Web App; map codes to actionable, non-technical messages; consistent placement (CONV-017) |
| Cross-domain workflow complexity | Workflows 1, 8, 9 span Learn↔Hub or Labs↔Learn↔Hub; many bounded contexts | Clear information architecture per pillar; cross-pillar recommendations as guided next steps; avoid overwhelming users with all options at once |
| Consistency across pillars | Same concepts (artifact, publish, contribution) with different vocabulary per pillar | Unified design system + component library; pillar-specific copy and tokens only; same interaction patterns for equivalent actions (IXD-006) |
| Async and eventual consistency | Event bus, Nostr anchoring, DOI registration; user action may complete after UI response | Immediate acknowledgment (e.g. "Submitted"); background status indicators; success/notification when async work completes; never imply instant global consistency where it does not hold |
| Accessibility vs. gamification | Vision: "Color alone must never be used to convey status" in gamification, governance, notifications | Design system semantic tokens; all status and progress use icon + text; contrast and focus states per DS-003 |
