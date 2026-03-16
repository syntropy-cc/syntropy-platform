# Evolution Impact Plan — ADR-012

> **Change Request**: Platform as technical foundation only; institutional site as system home; single web application without a "Platform" pillar route.
> **ADR**: [ADR-012: Platform as Technical Foundation Only; Institutional Site as System Home](../decisions/ADR-012-platform-as-foundation-institutional-home.md)
> **Classification**: L3 (Significant)
> **Coordinator**: Evolution Coordinator Agent (AGT-EC)
> **Date**: 2026-03-16

---

## Phase 9b — Implementation Documentation Updates Required

| Component | Action | Priority |
|-----------|--------|----------|
| COMP-032 (Web Application) | Update component record: remove `/platform` route; document shared user area (e.g. `/dashboard`). Align with [platform/web-application/ARCHITECTURE.md](../platform/web-application/ARCHITECTURE.md). | High |
| COMP-036 (Institutional Site) | Update component record: reframe as main entry point (GitHub-style); entry flow (home → login/signup → app). Align with [platform/institutional-site/ARCHITECTURE.md](../platform/institutional-site/ARCHITECTURE.md). | High |
| Implementation Plan (IMPLEMENTATION-PLAN.md) | Add work items (or update existing): (1) Remove or redirect `/platform` route in web app; (2) Adopt shared user area prefix (e.g. `/dashboard` or `/me`) for portfolio, search, recommendations, planning, settings; (3) Ensure institutional site is the landing/entry of the single web application. Update Section 5 (stages) and Section 7 (status) as needed. | High |
| BACKLOG.md / CURRENT-WORK.md | Add or reprioritize work items for routing and institutional-home entry flow per Evolution Impact Plan. | Medium |
| PACKAGE-TO-COMP-MAPPING.md | If `apps/platform` is referenced as "Platform app", clarify that it is the single web application (institutional + Learn, Hub, Labs, dashboard, admin); no separate "Platform" pillar. | Low |

---

## Phase 9c — User Documentation Updates Required

| Documentation File / Area | Action | Priority |
|----------------------------|--------|----------|
| User-facing navigation / IA docs | Update to describe entry flow: institutional home → login/signup → application (Learn, Hub, Labs, dashboard). Remove references to a "Platform" page or section. | High |
| Getting started / onboarding | Present the ecosystem and three pillars (Learn, Hub, Labs); do not describe "Platform" as a place users go. | High |
| API or product docs that mention "Platform" as a product surface | Change to "technical foundation" or "shared services"; avoid "Platform" as a user-facing area. | Medium |
| docs/user/ (if any) | Audit for "Platform" pillar, "/platform" route, or "four pillars"; align with ADR-012. | Medium |

---

## Rollback Strategy

This evolution is a documentation and conceptual correction. No data migration or breaking API change was introduced. Rollback:

1. Revert ADR-012 (mark status as Superseded, reference a rollback ADR if needed).
2. Revert changes to root ARCHITECTURE.md, platform/web-application/ARCHITECTURE.md, platform/institutional-site/ARCHITECTURE.md, diagrams/README.md.
3. Revert ARCH-013 from `.cursor/rules/architecture/architecture.mdc`.
4. Revert CHANGELOG.md entry under [Unreleased].

Implementation and user documentation updates (Phase 9b and 9c) can be reverted independently if they were applied.

---

## New Work Items for Implementation Plan (Suggested)

| New Work Item | Component | Type | Estimated Size | Depends On |
|---------------|-----------|------|-----------------|------------|
| Remove `/platform` route; add or rename shared user area (e.g. `/dashboard`) for portfolio, search, recommendations, planning, settings | COMP-032 | Architecture Evolution | M | — |
| Ensure institutional site is the main entry (landing, login, signup, access to app) in the single web application | COMP-032, COMP-036 | Architecture Evolution | M | — |
| Update navigation and IA to reflect three pillar areas + shared user area (no "Platform" section) | COMP-032 | Architecture Evolution | S | Above |

---

## References

- [ADR-012](../decisions/ADR-012-platform-as-foundation-institutional-home.md)
- [Root ARCHITECTURE](../ARCHITECTURE.md)
- [Web Application ARCHITECTURE](../platform/web-application/ARCHITECTURE.md)
- [Institutional Site ARCHITECTURE](../platform/institutional-site/ARCHITECTURE.md)
