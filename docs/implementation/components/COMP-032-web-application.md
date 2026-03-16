# Web Application Platform Service Implementation Record

> **Component ID**: COMP-032
> **Architecture Reference**: [ARCHITECTURE.md#platform-services](../../architecture/ARCHITECTURE.md#platform-services)
> **Domain Architecture**: [platform/web-application/ARCHITECTURE.md](../../architecture/platform/web-application/ARCHITECTURE.md)
> **Stage Assignment**: S12 — Platform Services
> **Status**: 🔵 In Progress
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-16

## Component Overview

### Architecture Summary

The Web Application is the single user-facing delivery interface for the Syntropy Ecosystem (ADR-012). It is a Next.js application using the App Router, delivering the institutional home (entry, login, signup), the three pillar areas (Learn, Hub, Labs), a shared user area for cross-pillar features (portfolio, search, recommendations, planning, settings — e.g. under `/dashboard`), and admin. There is no dedicated "Platform" route or section; the Platform is the technical foundation (backend), not a user-facing pillar. See [platform/web-application/ARCHITECTURE.md](../../architecture/platform/web-application/ARCHITECTURE.md).

**Responsibilities**:
- Next.js 14 App Router routing for institutional home, three pillars, shared user area, and admin
- Auth Provider integration (Supabase client-side, token in cookie)
- Design system adoption (UI package theme, layout components)
- API route handlers delegating to domain packages
- WCAG 2.1 AA compliance setup

**Key Interfaces**:
- Browser routes: institutional home, `/learn/*`, `/hub/*`, `/labs/*`, `/dashboard/*`, `/admin/*` (no `/platform`)
- API routes: `/api/v1/*` delegating to domain packages

### Implementation Scope

**In Scope**:
- Next.js routing for institutional home + three pillars (Learn, Hub, Labs) + shared user area (e.g. `/dashboard`) + admin
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
- Any "Platform" pillar or `/platform` route (ADR-012)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 2 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 9 |
| **Total** | **11** |

**Component Coverage**: 25% (2/8 original items; 3 ADR-012 items in backlog)

**Implementation Log (Implementation Plan item COMP-032.1 — Next.js app scaffolding and design system)**  
2026-03-13: Implemented shared design system and app shells. **packages/ui**: Tailwind + shadcn-style components (Button, ThemeToggle, AppLayout), ThemeProvider with light/dark and `data-theme` + localStorage persistence, theme CSS variables in `src/theme.css` (exported as `@syntropy/ui/styles`). **apps/platform**: Upgraded to use @syntropy/ui (ThemeProvider, AppLayout, ThemeToggle), Tailwind and PostCSS, AppShell client wrapper. **apps/learn, hub, labs**: Scaffolded as Next.js 14 App Router apps (ports 3001, 3002, 3003), each with layout using ThemeProvider + AppLayout + nav links to other apps, stub index page. Cross-app nav uses localhost URLs in dev. Removed legacy `src/env.ts` from learn/hub/labs (had depended on @syntropy/platform-core). Unit/component tests in packages/ui for ThemeProvider, useTheme, Button, AppLayout (Vitest + RTL + jest-dom).

**Implementation Log (Implementation Plan item COMP-032.2 — Auth Provider integration)**  
2026-03-13: Implemented in `apps/platform`. Created minimal Next.js 14 App Router app with: `@supabase/ssr` and `@supabase/supabase-js`; browser/server/middleware Supabase clients; `AuthProvider` (client) and `useUser()` hook; `/login` page (email/password); `/logout` route (GET/POST signOut + redirect); middleware refreshing session and redirecting unauthenticated users from `/dashboard` to `/login`; protected `/dashboard` page. Unit tests for `useUser` and `AuthContext`. Build requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.local.example`).

**Implementation Log (COMP-032.6 — Admin dashboard pages)**  
2026-03-14: Admin section in `apps/platform`: `admin/layout.tsx` with role gate (PlatformAdmin/PlatformModerator via `fetchApi("auth/me")`), redirect to `/forbidden` when unauthorized; `admin/moderation/page.tsx` fetches flags via `fetchApi("moderation/flags")` and renders table; `admin/users` and `admin/policies` placeholder pages; `forbidden/page.tsx` for 403; middleware protects `/admin`. Tests: moderation page (flags, error, empty).

**Implementation Log (COMP-032.7 — API proxy)**  
2026-03-14: `apps/platform/src/app/api/v1/[...path]/route.ts` proxies all methods to `API_URL`; reads session via `createClient()`, forwards `Authorization: Bearer`; error envelope preserved for 4xx/5xx; `getApiUrl()` for testability. `src/lib/api-client.ts` for server-side fetch with auth (calls API_URL directly). `.env.local.example` documents `API_URL`. Tests: route.test.ts (auth forward, 502 on throw, 403 body).

**Implementation Log (COMP-032.8 — Error boundaries)**  
2026-03-14: Root `error.tsx` (client) with message and digest/correlation ID; `not-found.tsx` (404); `forbidden/page.tsx` (403); `loading.tsx` skeleton. Tests: error.test.tsx, not-found.test.tsx.

**Implementation Log (COMP-032.9 — Remove /platform route; shared user area)**  
2026-03-16: Added `apps/platform/src/app/platform/[[...path]]/page.tsx` (optional catch-all) redirecting `/platform` and `/platform/*` to `/dashboard`. Dashboard page extended with placeholder links for portfolio, search, recommendations, planning, settings under `/dashboard/*`. AppShell nav: Home, Learn, Hub, Labs, Dashboard (no "Platform"). `packages/ui` AppLayout default label "Platform" → "Home". Learn, Hub, Labs app layouts: "Platform" → "Home", added "Dashboard" link to `http://localhost:3000/dashboard`. ADR-012 compliant.

**Implementation Log (COMP-032.10 — Institutional site as main entry)**  
2026-03-16: Replaced `apps/platform/src/app/page.tsx` stub with institutional home: ecosystem headline, three pillars (Learn, Hub, Labs) copy, Log in and Get started CTAs to `/login`, post-auth flow description. Entry flow: `/` → login → `/dashboard`; no separate Platform page.

**Implementation Log (COMP-032.11 — Navigation and IA)**  
2026-03-16: Audited nav (already updated in 032.9). Root layout metadata: description set to "Institutional home, Learn, Hub, Labs, Dashboard". `packages/ui` AppLayout comment updated to "Home, Learn, Hub, Labs, Dashboard"; no "Platform" section in IA.

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

#### [COMP-032.9] Remove /platform route; add or rename shared user area (e.g. /dashboard)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | ADR-012 |
| **Dependencies** | — |
| **Size** | M |
| **Created** | 2026-03-16 |

**Description**: Remove or redirect any `/platform` route; adopt a shared user area prefix (e.g. `/dashboard` or `/me`) for portfolio, search, recommendations, planning, and settings so cross-pillar features are not under a "Platform" pillar (ADR-012).

**Acceptance Criteria**:
- [ ] No `/platform` route (remove or redirect to shared user area)
- [ ] Portfolio, search, recommendations, planning, settings live under shared prefix (e.g. `/dashboard` or `/me`)
- [ ] Routing and links updated consistently

**Files Created/Modified**:
- `apps/platform/` routing and nav (and any pillar apps that reference /platform)

---

#### [COMP-032.10] Ensure institutional site is the main entry (landing, login, signup, app access)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | ADR-012 |
| **Dependencies** | COMP-036 |
| **Size** | M |
| **Created** | 2026-03-16 |

**Description**: Ensure the institutional site is the main entry point of the single web application: landing at `/`, login/signup, and access to the application (Learn, Hub, Labs, dashboard) flow from it (GitHub-style; ADR-012).

**Acceptance Criteria**:
- [ ] Landing/entry is the institutional home (e.g. `/` or institutional site)
- [ ] Login and signup are reachable from the entry flow
- [ ] After auth, user can reach Learn, Hub, Labs, and shared user area
- [ ] No separate "Platform" page; institutional site is the public face of the app

**Files Created/Modified**:
- `apps/platform/` or integration with `apps/institutional-site` for entry flow

---

#### [COMP-032.11] Update navigation and IA (three pillars + shared user area; no Platform section)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Origin** | ADR-012 |
| **Dependencies** | COMP-032.9, COMP-032.10 |
| **Size** | S |
| **Created** | 2026-03-16 |

**Description**: Update navigation and information architecture to reflect three pillar areas plus shared user area only; remove any "Platform" section from nav/IA (ADR-012).

**Acceptance Criteria**:
- [ ] Navigation shows Learn, Hub, Labs, and shared user area (e.g. Dashboard) only
- [ ] No "Platform" tab, section, or nav item
- [ ] IA docs and in-app labels aligned with three pillars + shared user area

**Files Created/Modified**:
- `packages/ui` nav components, `apps/platform` layout/nav, any IA or menu config

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

## Evolution History

### v1.0 - Initial Implementation

**Date**: 2026-03-13
**Milestone**: M1–M5

- Initial implementation: app shells, auth, pillar pages (Learn, Hub, Labs), admin, API proxy, error boundaries.
- Coverage: COMP-032.1–032.8 per Implementation Plan.

### v1.1 - ADR-012 Platform as Foundation

**Date**: 2026-03-16
**Trigger**: ADR-012

- Platform is technical foundation only; no user-facing "Platform" pillar or `/platform` route.
- Shared user area (e.g. `/dashboard`) for portfolio, search, recommendations, planning, settings.
- COMP-032.9, COMP-032.10, COMP-032.11 implemented: `/platform` redirect to `/dashboard`; institutional home at `/`; nav = Home, Learn, Hub, Labs, Dashboard; dashboard placeholders for portfolio, search, recommendations, planning, settings.

---

## References

### Architecture Documents

- [Web Application Platform Architecture](../../architecture/platform/web-application/ARCHITECTURE.md)

### Related ADRs

| ADR | Title | Relevance |
|-----|-------|-----------|
| [ADR-012](../../architecture/decisions/ADR-012-platform-as-foundation-institutional-home.md) | Platform as Technical Foundation Only; Institutional Site as System Home | No /platform route; shared user area; institutional site as main entry. |
