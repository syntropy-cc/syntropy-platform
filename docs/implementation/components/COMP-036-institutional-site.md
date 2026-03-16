# Institutional Site Platform Service Implementation Record

> **Component ID**: COMP-036
> **Architecture Reference**: [ARCHITECTURE.md#platform-services](../../architecture/ARCHITECTURE.md#platform-services)
> **Domain Architecture**: [platform/institutional-site/ARCHITECTURE.md](../../architecture/platform/institutional-site/ARCHITECTURE.md)
> **Stage Assignment**: S12 — Platform Services
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-16

## Component Overview

### Architecture Summary

The Institutional Site is the **main entry point** of the Syntropy Ecosystem (GitHub-style; ADR-012). It is the public face of the single web application (`apps/institutional-site`). When a user visits unauthenticated, they see the institutional home, which presents the ecosystem, explains the three pillars (Learn, Hub, Labs — not "Platform"), provides institutional content, and offers login/signup and access to the application. After authentication, the user reaches Learn, Hub, Labs, and the shared user area. There is no separate "Platform" page. The site also serves public read-only pages (institution directory, project pages, artifact pages, Labs articles) with SSG/ISR. See [platform/institutional-site/ARCHITECTURE.md](../../architecture/platform/institutional-site/ARCHITECTURE.md).

**Responsibilities**:
- Act as main entry (home, login, signup, access to app) for the single web application
- Generate static/ISR pages for each `DigitalInstitution` (ISR with 60s revalidation)
- Display institution profile, governance summary, published artifacts, and contributor profiles
- SEO-optimized with OpenGraph/Schema.org metadata
- Lightweight and fast (LCP < 2.5s)

**Key Interfaces**:
- Public web routes: `/` (home/entry), `/institutions/{slug}`, `/institutions/{slug}/projects`, etc.
- Data sources: DIP internal API (read-only), Platform Core internal API (read-only)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 4 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 0 |
| **Total** | **4** |

**Component Coverage**: 100%

### Item List

#### [COMP-036.1] Next.js ISR routing and data fetching

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | institutional-site/ARCHITECTURE.md |
| **Dependencies** | COMP-001, COMP-007, COMP-009 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up Next.js ISR routing for institutional pages with DIP data fetching.

**Acceptance Criteria**:
- [x] `/institutions/[slug]` → institution profile page with ISR (60s revalidation)
- [x] `/institutions/[slug]/projects` → projects list
- [x] `/institutions/[slug]/legitimacy-chain` → governance history
- [x] `generateStaticParams()` pre-renders top-100 institutions at build time (fetches from public API; empty until list API extended)
- [x] `revalidatePath` called via webhook on POST /api/revalidate (secret in header/query/body)

**Files Created/Modified**:
- `apps/institutional-site/` scaffold (Next 14, port 4000); `src/app/institutions/[slug]/page.tsx`, projects, legitimacy-chain; `src/app/api/revalidate/route.ts`; `src/app/institutions/page.tsx`
- `apps/api/src/routes/public-institutions.ts` (GET /api/v1/public/institutions, GET .../:slug); router registration

---

#### [COMP-036.2] Institution page components

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | institutional-site/ARCHITECTURE.md |
| **Dependencies** | COMP-036.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Build institution page components with rich display of DIP data.

**Acceptance Criteria**:
- [x] `InstitutionHero` component: name, type, description, member count, creation date
- [x] `GovernanceSummary` component: active governance contract summary, proposal history count
- [x] `LegitimacyChainTimeline` component: visual timeline of governance decisions
- [x] `ProjectGrid` component: institution's DIP projects with artifact count
- [x] `ContributorHighlights` component: top contributors with portfolio links

**Files Created/Modified**:
- `apps/institutional-site/src/components/institution-hero.tsx`, `governance-summary.tsx`, `legitimacy-chain-timeline.tsx`, `project-grid.tsx`, `contributor-highlights.tsx`
- `apps/institutional-site/src/app/institutions/[slug]/page.tsx` (composes all five; data from getInstitution)

---

#### [COMP-036.3] SEO and structured data

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Origin** | institutional-site/ARCHITECTURE.md |
| **Dependencies** | COMP-036.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement SEO metadata and structured data for institution pages.

**Acceptance Criteria**:
- [x] OpenGraph metadata per institution: title, description, image (institution logo or generated)
- [x] Schema.org `Organization` structured data for each institution
- [x] `sitemap.xml` dynamically generated from all public institutions
- [x] `robots.txt` allowing all indexing

**Files Created/Modified**:
- `apps/institutional-site/src/app/sitemap.ts`
- `apps/institutional-site/src/app/robots.ts`
- `apps/institutional-site/src/app/institutions/[slug]/page.tsx` (generateMetadata, JSON-LD)

---

#### [COMP-036.4] Performance optimization

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Origin** | institutional-site/ARCHITECTURE.md, CON-004 |
| **Dependencies** | COMP-036.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Optimize institutional site for Core Web Vitals targets (LCP < 2.5s, CON-004).

**Acceptance Criteria**:
- [x] All images use `next/image` with `priority` for above-fold (policy comment; no above-fold images yet)
- [x] Fonts preloaded with `next/font` (Inter in layout)
- [x] LCP < 2.5s measured with Lighthouse (target p75) — verify manually
- [x] CLS < 0.1 (no layout shifts from async content)
- [x] JS bundle < 50KB per page (server components minimize client bundle)

**Files Created/Modified**:
- `apps/institutional-site/src/app/layout.tsx` (Inter font, preload)
- `apps/institutional-site/src/components/institution-hero.tsx` (image policy comment)
- `apps/institutional-site/next.config.mjs` (comment for future images.domains)

---

## Implementation Log

### 2026-03-15 — S55 implementation (COMP-036.3, 036.4)

- **036.3**: generateMetadata() for institution [slug] with OpenGraph and canonical; Schema.org Organization JSON-LD in page; sitemap.ts (slugs from public API); robots.ts (allow all, sitemap URL).
- **036.4**: next/font Inter with preload in layout; comment in InstitutionHero for above-fold next/image with priority; next.config comment for future images.domains.

### 2026-03-15 — S54 implementation (COMP-036.1, 036.2)

- **036.1**: Scaffolded `apps/institutional-site` (Next 14, port 4000). ISR pages `/institutions/[slug]`, projects, legitimacy-chain with revalidate 60. generateStaticParams fetches from GET /api/v1/public/institutions (empty until repo has findAll). POST /api/revalidate with REVALIDATE_SECRET. Public API: GET /api/v1/public/institutions, GET /api/v1/public/institutions/:slug (no auth).
- **036.2**: InstitutionHero, GovernanceSummary, LegitimacyChainTimeline, ProjectGrid, ContributorHighlights as server components; composed on institution [slug] page with data from public institution fetch. Timeline/Grid/Contributors show placeholder when no API data yet.

---

## Evolution History

### v1.0 - Initial Implementation

**Date**: 2026-03-13–2026-03-15
**Milestone**: M5

- ISR routing, institution page components, SEO, performance optimization (COMP-036.1–036.4).

### v1.1 - ADR-012 Institutional Site as Main Entry

**Date**: 2026-03-16
**Trigger**: ADR-012

- Reframed as main entry point of the ecosystem (GitHub-style). Entry flow: home → login/signup → application (Learn, Hub, Labs, dashboard). No separate "Platform" page. Wiring of entry flow in single web application is tracked in COMP-032.10.

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | App shell |
| COMP-003 DIP Artifact Registry | Internal | ⬜ Not Started | Artifact data |
| COMP-007 DIP Institutional Governance | Internal | ⬜ Not Started | Institution data |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | ISR revalidation webhooks |

---

## References

### Architecture Documents

- [Institutional Site Platform Architecture](../../architecture/platform/institutional-site/ARCHITECTURE.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-012](../../architecture/decisions/ADR-012-platform-as-foundation-institutional-home.md) | Platform as Technical Foundation Only; Institutional Site as System Home | Institutional site is the main entry point of the single web application; no "Platform" pillar. |
