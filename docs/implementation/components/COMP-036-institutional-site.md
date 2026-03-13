# Institutional Site Platform Service Implementation Record

> **Component ID**: COMP-036
> **Architecture Reference**: [ARCHITECTURE.md#platform-services](../../architecture/ARCHITECTURE.md#platform-services)
> **Domain Architecture**: [platform/institutional-site/ARCHITECTURE.md](../../architecture/platform/institutional-site/ARCHITECTURE.md)
> **Stage Assignment**: S12 — Platform Services
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

The Institutional Site is a Next.js 14 static/ISR site (`apps/institutional-site`) serving as the public-facing website for each Digital Institution's permanent identity page. Built with SSG/ISR to ensure fast page loads and SEO-friendly URLs. Content sourced from DIP (institution metadata, LegitimacyChain summary) and Platform Core (portfolio highlights). The site is read-only — no interactive features except external links.

**Responsibilities**:
- Generate static pages for each `DigitalInstitution` (ISR with 60s revalidation)
- Display institution profile, governance summary, published artifacts, and contributor profiles
- SEO-optimized with OpenGraph/Schema.org metadata
- Lightweight and fast (LCP < 2.5s)

**Key Interfaces**:
- Public web routes: `https://syntropy.cc/institutions/{slug}`, `/institutions/{slug}/projects`, etc.
- Data sources: DIP internal API (read-only), Platform Core internal API (read-only)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 4 |
| **Total** | **4** |

**Component Coverage**: 0%

### Item List

#### [COMP-036.1] Next.js ISR routing and data fetching

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | institutional-site/ARCHITECTURE.md |
| **Dependencies** | COMP-001, COMP-007, COMP-009 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up Next.js ISR routing for institutional pages with DIP data fetching.

**Acceptance Criteria**:
- [ ] `/institutions/[slug]` → institution profile page with ISR (60s revalidation)
- [ ] `/institutions/[slug]/projects` → projects list
- [ ] `/institutions/[slug]/legitimacy-chain` → governance history
- [ ] `generateStaticParams()` pre-renders top-100 institutions at build time
- [ ] `revalidatePath` called via webhook on `dip.governance.proposal_executed` event

**Files Created/Modified**:
- `apps/institutional-site/src/app/institutions/[slug]/page.tsx`
- `apps/institutional-site/src/app/institutions/[slug]/projects/page.tsx`
- `apps/institutional-site/src/app/api/revalidate/route.ts`

---

#### [COMP-036.2] Institution page components

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | institutional-site/ARCHITECTURE.md |
| **Dependencies** | COMP-036.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Build institution page components with rich display of DIP data.

**Acceptance Criteria**:
- [ ] `InstitutionHero` component: name, type, description, member count, creation date
- [ ] `GovernanceSummary` component: active governance contract summary, proposal history count
- [ ] `LegitimacyChainTimeline` component: visual timeline of governance decisions
- [ ] `ProjectGrid` component: institution's DIP projects with artifact count
- [ ] `ContributorHighlights` component: top contributors with portfolio links

**Files Created/Modified**:
- `apps/institutional-site/src/components/`

---

#### [COMP-036.3] SEO and structured data

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | institutional-site/ARCHITECTURE.md |
| **Dependencies** | COMP-036.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement SEO metadata and structured data for institution pages.

**Acceptance Criteria**:
- [ ] OpenGraph metadata per institution: title, description, image (institution logo or generated)
- [ ] Schema.org `Organization` structured data for each institution
- [ ] `sitemap.xml` dynamically generated from all public institutions
- [ ] `robots.txt` allowing all indexing

**Files Created/Modified**:
- `apps/institutional-site/src/app/sitemap.ts`
- `apps/institutional-site/src/app/robots.ts`

---

#### [COMP-036.4] Performance optimization

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | institutional-site/ARCHITECTURE.md, CON-004 |
| **Dependencies** | COMP-036.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Optimize institutional site for Core Web Vitals targets (LCP < 2.5s, CON-004).

**Acceptance Criteria**:
- [ ] All images use `next/image` with `priority` for above-fold
- [ ] Fonts preloaded with `next/font`
- [ ] LCP < 2.5s measured with Lighthouse (target p75)
- [ ] CLS < 0.1 (no layout shifts from async content)
- [ ] JS bundle < 50KB per page (server components minimize client bundle)

**Files Created/Modified**:
- `apps/institutional-site/next.config.ts` (optimization settings)

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
