# Web Application Platform Service Implementation Record

> **Component ID**: COMP-032
> **Architecture Reference**: [ARCHITECTURE.md#platform-services](../../architecture/ARCHITECTURE.md#platform-services)
> **Domain Architecture**: [platform/web-application/ARCHITECTURE.md](../../architecture/platform/web-application/ARCHITECTURE.md)
> **Stage Assignment**: S12 — Platform Services
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

The Web Application platform service delivers the 4 pillar Next.js applications (Learn, Hub, Labs, Admin) using the Next.js 14 App Router. Each app is a separate workspace (`apps/learn`, `apps/hub`, `apps/labs`, `apps/admin`) that imports domain packages and renders their APIs. Key concerns: WCAG 2.1 AA accessibility, Auth Provider integration (Supabase Auth client), and design system adoption from `packages/ui`.

**Responsibilities**:
- Next.js 14 App Router routing configuration for all pillar apps
- Auth Provider integration (Supabase client-side, token in cookie)
- Design system adoption (UI package theme, layout components)
- API route handlers delegating to domain packages
- WCAG 2.1 AA compliance setup

**Key Interfaces**:
- Browser routes: each pillar app's URL structure
- API routes: `/api/v1/*` delegating to domain packages

### Implementation Scope

**In Scope**:
- Next.js routing structure for all 4 apps
- Auth provider setup (login/callback pages, middleware for protected routes)
- Layout components (sidebar nav, header, breadcrumbs) from UI package
- Core page components for each pillar (index, detail, editor pages)
- API route handlers (thin proxy to domain packages)
- Error boundary and loading state components
- SEO metadata configuration

**Out of Scope**:
- Domain business logic (in domain packages)
- Design system component library (COMP-032 uses it but doesn't own it)
- Institutional Site SSG (COMP-036)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 8 |
| **Total** | **8** |

**Component Coverage**: 0%

### Item List

#### [COMP-032.1] Auth Provider setup and protected route middleware

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | web-application/ARCHITECTURE.md |
| **Dependencies** | COMP-002, COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up Supabase Auth client-side integration, middleware for protected routes, and auth callback handling.

**Acceptance Criteria**:
- [ ] Supabase Auth client configured in all pillar apps
- [ ] `middleware.ts` in each app validates `IdentityToken` cookie on every request
- [ ] Unauthenticated requests redirected to `/login`
- [ ] Login page with OAuth buttons (Google, GitHub) and magic-link form
- [ ] Auth callback page handles Supabase redirect

**Files Created/Modified**:
- `apps/learn/middleware.ts`, `apps/hub/middleware.ts`, `apps/labs/middleware.ts`, `apps/admin/middleware.ts`
- `apps/learn/src/app/(auth)/login/page.tsx`, etc.
- `apps/learn/src/app/(auth)/callback/page.tsx`, etc.

---

#### [COMP-032.2] Design system and layout components

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | web-application/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Build core layout components using the `packages/ui` theme: navigation sidebar, topbar, breadcrumb, page shell.

**Acceptance Criteria**:
- [ ] `AppLayout` component: sidebar nav + topbar + main content area
- [ ] Navigation sidebar: pillar-specific nav items, user avatar, notifications indicator
- [ ] Topbar: breadcrumb trail, search trigger, AI agent activation button
- [ ] All components WCAG 2.1 AA compliant (keyboard navigation, ARIA labels, color contrast)
- [ ] Dark mode support via CSS variables from `packages/ui` theme
- [ ] Responsive: mobile (stacked), tablet (collapsible sidebar), desktop (expanded)

**Files Created/Modified**:
- `packages/ui/src/components/app-layout.tsx`
- `packages/ui/src/components/navigation-sidebar.tsx`
- `packages/ui/src/components/topbar.tsx`
- `packages/ui/src/components/breadcrumb.tsx`

---

#### [COMP-032.3] Learn pillar pages

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | web-application/ARCHITECTURE.md |
| **Dependencies** | COMP-032.2, COMP-015, COMP-016 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement Learn pillar Next.js pages: careers list, track view (FogOfWar), course view, fragment view with 3-section editor.

**Acceptance Criteria**:
- [ ] `/learn` → career list
- [ ] `/learn/tracks/[id]` → track with FogOfWar-filtered courses
- [ ] `/learn/courses/[id]` → course with fragment list
- [ ] `/learn/fragments/[id]` → fragment view with Problem/Theory/Artifact section tabs
- [ ] `/learn/create/[track_id]` → creator workflow UI (5-phase progress indicator)
- [ ] `/learn/mentorship` → mentorship dashboard
- [ ] Server Components for static-like data, Client Components for interactive fragment editing

**Files Created/Modified**:
- `apps/learn/src/app/(main)/` pages

---

#### [COMP-032.4] Hub pillar pages

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | web-application/ARCHITECTURE.md |
| **Dependencies** | COMP-032.2, COMP-019, COMP-020 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement Hub pillar pages: public square, project view, issue tracker, contribution workflow, institution pages.

**Acceptance Criteria**:
- [ ] `/hub` → public square discovery grid
- [ ] `/hub/projects/[id]` → project with issue tracker and contributions
- [ ] `/hub/issues/[id]` → issue detail with thread
- [ ] `/hub/contribute/[contribution_id]` → contribution editor with sandbox launch
- [ ] `/hub/institutions/[id]` → InstitutionProfile page
- [ ] `/hub/institutions/new` → institution creation wizard

**Files Created/Modified**:
- `apps/hub/src/app/(main)/` pages

---

#### [COMP-032.5] Labs pillar pages

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | web-application/ARCHITECTURE.md |
| **Dependencies** | COMP-032.2, COMP-022, COMP-023 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement Labs pillar pages: article browser, MyST article editor, experiment management, peer review.

**Acceptance Criteria**:
- [ ] `/labs` → article browser with filters
- [ ] `/labs/articles/[id]` → article preview (rendered MyST HTML)
- [ ] `/labs/articles/[id]/edit` → MyST article editor (Monaco for MyST)
- [ ] `/labs/experiments/[id]` → experiment design and results
- [ ] `/labs/articles/[id]/reviews` → peer review interface with passage linking
- [ ] Split-pane editor: MyST source | rendered preview

**Files Created/Modified**:
- `apps/labs/src/app/(main)/` pages

---

#### [COMP-032.6] Admin pillar pages

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | web-application/ARCHITECTURE.md |
| **Dependencies** | COMP-032.2, COMP-031 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Implement Admin pillar pages: moderation queue, user management, system health, event schema registry.

**Acceptance Criteria**:
- [ ] `/admin` → dashboard with system health metrics
- [ ] `/admin/moderation` → moderation flag queue
- [ ] `/admin/users` → user management with role assignment
- [ ] `/admin/event-schemas` → event schema registry browser
- [ ] `/admin/policies` → platform policy management
- [ ] Only accessible to `PlatformAdmin` and `PlatformModerator` roles

**Files Created/Modified**:
- `apps/admin/src/app/(main)/` pages

---

#### [COMP-032.7] API route handlers

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | web-application/ARCHITECTURE.md |
| **Dependencies** | COMP-033 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement Next.js API route handlers that delegate to the REST API gateway (COMP-033). These are thin proxies with auth header forwarding.

**Acceptance Criteria**:
- [ ] All pillar apps have `src/app/api/[...proxy]/route.ts` that forwards requests to `COMP-033` with auth header
- [ ] Token from cookie forwarded as `Authorization: Bearer` header
- [ ] Stream responses (SSE) proxied correctly for AI agent sessions and notifications

**Files Created/Modified**:
- `apps/*/src/app/api/[...proxy]/route.ts`

---

#### [COMP-032.8] Error boundaries, loading states, and SEO

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | web-application/ARCHITECTURE.md |
| **Dependencies** | COMP-032.3 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement error handling infrastructure and SEO metadata for all pillar apps.

**Acceptance Criteria**:
- [ ] `error.tsx` at app root level for graceful error display
- [ ] `loading.tsx` with skeleton components for all data-heavy pages
- [ ] `not-found.tsx` for 404 handling
- [ ] Dynamic `metadata` for article/track/project pages (title, description, OG)
- [ ] `robots.txt` and `sitemap.xml` for public pages

**Files Created/Modified**:
- `apps/*/src/app/error.tsx`, `loading.tsx`, `not-found.tsx`
- `apps/*/src/app/sitemap.ts`, `robots.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | App shells and UI package |
| COMP-002 Identity | Internal | ⬜ Not Started | Auth provider |
| COMP-033 REST API | Internal | ⬜ Not Started | Backend API calls |
| All domain packages | Internal | ⬜ Not Started | Data models and types |

---

## References

### Architecture Documents

- [Web Application Platform Architecture](../../architecture/platform/web-application/ARCHITECTURE.md)
