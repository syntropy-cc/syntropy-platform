# Web Application — Platform Architecture

> **Document Type**: Platform Service Architecture Document
> **Parent**: [System Architecture](../../ARCHITECTURE.md)
> **Last Updated**: 2026-03-16
> **Owner**: Syntropy Core Team

---

## Service Overview

The Web Application is the single user-facing delivery interface for the Syntropy Ecosystem. It is a Next.js application using the App Router, delivering the institutional home (entry, login, signup), the three pillar areas (Learn, Hub, Labs), a shared user area for cross-pillar features (portfolio, search, recommendations, planning, settings), and admin. There is no dedicated "Platform" route or section — the Platform is the technical foundation (backend), not a user-facing pillar (ADR-012). The app uses SSR for public-facing routes and CSR for interactive application views. It is not a domain; it has no owned business logic; it renders domain state.

---

## Architecture

### High-Level Diagram

```mermaid
graph TB
    subgraph webApp [Web Application — Next.js App Router]
        subgraph learnRoutes [/learn — Learn Pillar]
            LEARN_PAGES["Track browser, Course view,\nFragment editor, Creator studio"]
        end
        subgraph hubRoutes [/hub — Hub Pillar]
            HUB_PAGES["Institution browser,\nProject view, Issue board,\nContribution reviewer"]
        end
        subgraph labsRoutes [/labs — Labs Pillar]
            LABS_PAGES["Article browser,\nArticle editor,\nPeer review interface"]
        end
        subgraph dashboardRoutes ["/dashboard — Shared User Area"]
            DASH_PAGES["Portfolio dashboard,\nSearch, Recommendations,\nPlanning board, Settings"]
        end
        subgraph adminRoutes [/admin — Platform Admin]
            ADMIN_PAGES["User management,\nModerationFlags,\nSchema registry,\nSystem health"]
        end
        DESIGN_SYS["Design System\n(packages/ui)"]
        AUTH_PROVIDER["Auth Provider\n(Identity token management)"]
    end

    LEARN_PAGES --> DESIGN_SYS
    HUB_PAGES --> DESIGN_SYS
    LABS_PAGES --> DESIGN_SYS
    DASH_PAGES --> DESIGN_SYS

    AUTH_PROVIDER -->|"IdentityToken in session"| LEARN_PAGES
    AUTH_PROVIDER -->|"IdentityToken in session"| HUB_PAGES
```

---

## Components

### Routing Structure

| Route Prefix | Pillar / Function | Rendering Mode | Authentication |
|-------------|-------------------|----------------|----------------|
| `/` | Institutional home (entry, ecosystem, login, signup) | SSG / ISR | Public |
| `/learn/*` | Learn pillar | SSR + CSR | Required for enrolled content |
| `/hub/*` | Hub pillar | SSR + CSR | Required for private projects |
| `/labs/*` | Labs pillar | SSR + CSR | Required for drafts |
| `/dashboard/*` | Shared user area (portfolio, search, recommendations, planning, settings) | CSR | Required |
| `/admin/*` | Platform administration | CSR | PlatformAdmin role required |
| `/api/*` | BFF (Backend for Frontend) routes | Server | Internal |

There is no `/platform` route. Cross-pillar features are under the shared user area (e.g. `/dashboard` or `/me`), not under a "Platform" pillar (ADR-012).

### Design System

The unified design system (`packages/ui`) provides:
- Component library (buttons, forms, cards, navigation) shared across all pillars
- **Pillar-specific theme tokens**: Each pillar has a distinct visual identity (Learn = educational warm palette; Hub = productive cool palette; Labs = scientific neutral palette) while sharing the same component primitives
- Responsive layouts supporting mobile, tablet, and desktop
- WCAG 2.1 AA accessibility compliance

### Auth Integration

The web application integrates with Identity via:
- Session storage: Supabase Auth client-side session (JWT in httpOnly cookie)
- `useIdentityToken()` hook: provides current IdentityToken and user profile to all components
- Route protection: Next.js middleware verifies IdentityToken before rendering protected routes
- Server-side token refresh: App Router server components fetch fresh tokens before render

---

## Interfaces

### External Interfaces

| Interface | URL | Protocol | Auth | Notes |
|-----------|-----|----------|------|-------|
| REST API Gateway | `https://api.syntropy.cc/v1` | HTTPS | IdentityToken | All domain data fetched via REST API |
| AI Agents streaming | `https://api.syntropy.cc/v1/ai-agents/sessions/{id}/stream` | Server-Sent Events | IdentityToken | Streaming agent responses |
| IDE WebSocket | `wss://ide.syntropy.cc/{session_id}` | WebSocket + Monaco | IdentityToken | IDE session connection |
| Supabase Auth | Supabase-provided URL | HTTPS | OAuth2/magic link | Auth callbacks only |

---

## Operational Model

### Deployment

| Environment | Infrastructure | Notes |
|-------------|---------------|-------|
| Production | Vercel (or equivalent edge CDN) | SSG pages served from CDN; SSR/CSR from serverless functions |
| Staging | Same infrastructure | Preview deployments per branch |
| Development | Local Next.js dev server | `next dev` with hot reload |

### Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Core Web Vitals |
| CLS (Cumulative Layout Shift) | < 0.1 | Core Web Vitals |
| FID / INP | < 200ms | Core Web Vitals |
| Initial bundle size | < 200KB gzipped | Webpack bundle analysis |

### Accessibility

WCAG 2.1 AA compliance required for all user-facing routes. Verified via:
- Axe-core automated tests in CI
- Screen reader manual testing for key flows (enrollment, fragment editor, contribution submission)
- Keyboard navigation complete for all interactive elements

---

## Security Considerations

- CSP (Content Security Policy) headers on all routes
- httpOnly + Secure cookies for session storage
- No sensitive data in client-side JavaScript bundles
- Admin routes require PlatformAdmin role verified server-side (not client-side guard only)
