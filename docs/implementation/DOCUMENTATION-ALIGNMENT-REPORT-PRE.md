# Documentation-Architecture Alignment Report (Pre-Generation)

> **Skill**: Documentation-Architecture Alignment (SKL-DOCAL)
> **Report Date**: 2026-03-16
> **Mode**: Pre-generation
> **Architecture Source**: docs/architecture/ARCHITECTURE.md
> **Documentation Source**: Not yet generated (docs/user/ absent)

---

## Executive Summary

| Category | Count |
|----------|-------|
| Architecture items requiring documentation | 58 |
| Undocumented items (coverage gap) | 58 |
| Phantom documentation files | 0 |
| Stale documentation conflicts | 0 |
| Terminology mismatches | N/A |
| Diataxis structure violations | N/A |

**Overall Alignment**: N/A (pre-generation; no docs to compare).

---

## 1. Architecture Content Inventory

Items from architecture and vision that require documentation coverage.

| Item ID | Item Name | Type | Source Doc | Documentation Need | Current Doc File |
|---------|-----------|------|------------|---------------------|------------------|
| A01 | Syntropy Ecosystem | Domain | ARCHITECTURE.md | Landing + Overview | (none) |
| A02 | Installation / Setup | Workflow | IMPLEMENTATION-PLAN, tech stack | Tutorial: installation.md | (none) |
| A03 | Quick Start | Workflow | Vision §8 Workflow 2 | Tutorial: quick-start.md | (none) |
| A04 | Onboarding to First Artifact | Workflow | Vision §8 Workflow 2 | Tutorial | (none) |
| A05 | Complete Learn Track | Workflow | Vision §8 Workflow 3 | Tutorial | (none) |
| A06 | Create Institution and Project | Workflow | Vision §8 Workflow 5 | Tutorial | (none) |
| A07 | Contribute to Hub Project | Workflow | Vision §8 Workflow 6 | Tutorial | (none) |
| A08 | Publish Labs Article | Workflow | Vision §8 Workflow 7 | Tutorial | (none) |
| A09 | REST API Overview | Component | platform/rest-api | Reference: api/overview.md | (none) |
| A10 | Auth endpoints | API | auth.ts | Reference: identity.md | (none) |
| A11 | Artifacts API | API | artifacts.ts, DIP | Reference: artifacts.md | (none) |
| A12 | Contracts API | API | contracts.ts | Reference: contracts.md | (none) |
| A13 | Projects API | API | projects.ts | Reference: projects.md | (none) |
| A14 | IACP API | API | iacp.ts | Reference: iacp.md | (none) |
| A15 | Governance / Institutions | API | governance, hub-institutions | Reference: institutions-governance.md | (none) |
| A16 | Portfolios, Search, Recommendations | API | portfolios, search, recommendations | Reference: portfolios-search.md | (none) |
| A17 | Learn API | API | learn.ts | Reference: learn.md | (none) |
| A18 | Hub API | API | hub, hub-discover | Reference: hub.md | (none) |
| A19 | Labs API | API | labs-* routes | Reference: labs.md | (none) |
| A20 | AI Agents API | API | ai-agents, agents | Reference: ai-agents.md | (none) |
| A21 | Sponsorships API | API | sponsorships.ts | Reference: sponsorships.md | (none) |
| A22 | Communication, Planning, IDE | API | communication, planning, ide | Reference: communication-planning-ide.md | (none) |
| A23 | Moderation API | API | moderation, community-proposals | Reference: moderation.md | (none) |
| A24 | Configuration | Config | .env.example, apps/api | Reference: configuration.md | (none) |
| A25 | Artifacts and DIP | Concept | Vision §7, DIP arch | Explanation: artifacts-and-dip.md | (none) |
| A26 | Portfolio and Events | Concept | Platform Core | Explanation: portfolio-and-events.md | (none) |
| A27 | Learn Track/Fragment | Concept | Vision §7 Learn | Explanation: learn-track-fragment.md | (none) |
| A28 | Institutions and Governance | Concept | Vision §7 Hub, DIP | Explanation: institutions-and-governance.md | (none) |
| A29 | Labs Research and Review | Concept | Vision §7 Labs | Explanation: labs-research-and-review.md | (none) |
| A30 | AI Agents | Concept | AI Agents domain | Explanation: ai-agents.md | (none) |
| A31 | Authenticate API | Task | REST API auth | How-to: authenticate-api.md | (none) |
| A32 | Create Artifact | Task | DIP lifecycle | How-to: create-artifact.md | (none) |
| A33 | Create Institution | Task | Hub | How-to: create-institution.md | (none) |
| A34 | Submit Contribution | Task | Hub | How-to: submit-contribution.md | (none) |
| A35 | Submit Review (Labs) | Task | Labs reviews | How-to: submit-review-labs.md | (none) |
| A36 | Use IDE Session | Task | IDE routes | How-to: use-ide-session.md | (none) |
| A37 | Sponsor Creator | Task | Vision Workflow 10 | How-to: sponsor-creator.md | (none) |
| A38 | FAQ | Supporting | Common issues | faq.md | (none) |
| A39 | Glossary | Supporting | Vision §7, arch terms | glossary.md | (none) |
| A40 | Changelog | Supporting | Implementation Plan | changelog.md | (none) |

**Summary**: 40+ inventory items; 0 have documentation coverage (0%). All require creation.

---

## 2. Recommended Actions (Pre-Generation)

Ordered list of documentation to create:

1. **Landing** — index.md — Diataxis: Landing
2. **Installation** — getting-started/installation.md — Tutorial
3. **Quick Start** — getting-started/quick-start.md — Tutorial
4. **Tutorials** — 01–05 per plan — Tutorial
5. **How-to guides** — authenticate-api, create-artifact, create-institution, submit-contribution, submit-review-labs, use-ide-session, sponsor-creator — How-to
6. **API Overview** — reference/api/overview.md — Reference
7. **API per resource** — artifacts, contracts, projects, iacp, institutions-governance, portfolios-search, learn, hub, labs, ai-agents, identity, sponsorships, communication-planning-ide, moderation — Reference
8. **Configuration** — reference/configuration.md — Reference
9. **Concepts** — artifacts-and-dip, portfolio-and-events, learn-track-fragment, institutions-and-governance, labs-research-and-review, ai-agents — Explanation
10. **FAQ, Glossary, Changelog** — faq.md, glossary.md, changelog.md — How-to / Reference

---

## 8. Documentation Coverage Summary

| Domain / Component | Items | Documented | Coverage |
|-------------------|-------|-----------|---------|
| Landing / Getting Started | 3 | 0 | 0% |
| Tutorials | 5 | 0 | 0% |
| How-to | 7 | 0 | 0% |
| API Reference | 15 | 0 | 0% |
| Configuration | 1 | 0 | 0% |
| Concepts | 6 | 0 | 0% |
| Supporting | 3 | 0 | 0% |
| **Total** | **40** | **0** | **0%** |
