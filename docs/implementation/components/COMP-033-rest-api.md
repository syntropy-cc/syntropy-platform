# REST API Gateway Platform Service Implementation Record

> **Component ID**: COMP-033
> **Architecture Reference**: [ARCHITECTURE.md#platform-services](../../architecture/ARCHITECTURE.md#platform-services)
> **Domain Architecture**: [platform/rest-api/ARCHITECTURE.md](../../architecture/platform/rest-api/ARCHITECTURE.md)
> **Stage Assignment**: S12 — Platform Services
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

The REST API Gateway is the single entry point for all external (frontend) and internal (service-to-service) HTTP traffic. It handles authentication middleware, rate limiting, request routing to domain packages, API versioning, and OpenAPI spec generation. Built on Node.js/Express (or Fastify) with `packages/identity` middleware for token verification.

**Responsibilities**:
- Auth middleware: verify `IdentityToken` on all protected routes
- Rate limiting per user (100 req/s burst, 1000 req/min baseline)
- Request routing to domain package API handlers
- API versioning strategy (`/api/v1/*`)
- OpenAPI spec generation from route definitions
- Correlation ID injection and propagation

**Key Interfaces**:
- External: `https://api.syntropy.cc/api/v1/*`
- Internal: `http://api.internal/*` for service-to-service

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 7 |
| **Total** | **7** |

**Component Coverage**: 0%

### Item List

#### [COMP-033.1] Server setup and middleware stack

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | rest-api/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up the REST API server with core middleware stack.

**Acceptance Criteria**:
- [ ] Fastify server with TypeScript types
- [ ] CORS configured for pillar app origins
- [ ] `correlation-id` middleware: generate UUID v4 `X-Correlation-ID` per request, propagate to response and downstream calls
- [ ] Request/response logging middleware (structured JSON, correlation_id included)
- [ ] Graceful shutdown handling

**Files Created/Modified**:
- `apps/api/src/server.ts`
- `apps/api/src/middleware/correlation-id.ts`
- `apps/api/src/middleware/request-logger.ts`

---

#### [COMP-033.2] Auth middleware and token verification

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | rest-api/ARCHITECTURE.md |
| **Dependencies** | COMP-002 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement authentication middleware using `packages/identity` token verification.

**Acceptance Criteria**:
- [ ] `authMiddleware` calls `verifyIdentityToken()` from `packages/identity`
- [ ] Sets `request.user = { userId, actorId, roles }` on valid token
- [ ] Returns `401` with `error.code: 'UNAUTHORIZED'` on missing/invalid token
- [ ] Returns `403` with `error.code: 'FORBIDDEN'` when authenticated but missing required role
- [ ] Token cached in Redis for 5 minutes to avoid repeated Identity service calls
- [ ] mTLS for internal service-to-service routes (`/internal/*`)

**Files Created/Modified**:
- `apps/api/src/middleware/auth.ts`
- `apps/api/src/middleware/role-guard.ts`

---

#### [COMP-033.3] Rate limiting middleware

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | rest-api/ARCHITECTURE.md, CON-002 |
| **Dependencies** | COMP-033.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement rate limiting per authenticated user using Redis token bucket.

**Acceptance Criteria**:
- [ ] Sliding window rate limiter: 100 requests/s burst, 1000 requests/min sustained
- [ ] Per-user limit keyed by `userId`
- [ ] Unauthenticated: IP-based limit (20 req/min)
- [ ] Returns `429` with `Retry-After` header when limit exceeded
- [ ] AI agent session endpoints have separate higher limit (20 concurrent streaming sessions per user)

**Files Created/Modified**:
- `apps/api/src/middleware/rate-limiter.ts`

---

#### [COMP-033.4] Route registration for all domain packages

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | rest-api/ARCHITECTURE.md |
| **Dependencies** | All domain packages |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Register all domain package API routes under the `/api/v1/*` and `/internal/*` namespace.

**Acceptance Criteria**:
- [ ] All domain package routers imported and registered with correct prefix
- [ ] Route registration: `/api/v1/auth/*` (identity), `/api/v1/learn/*`, `/api/v1/hub/*`, `/api/v1/labs/*`, `/api/v1/ai-agents/*`, `/api/v1/sponsorships/*`, `/api/v1/notifications/*`, `/api/v1/moderation/*`, `/api/v1/community-proposals/*`
- [ ] Internal routes: `/internal/*` for all domain internal APIs (service-to-service only)
- [ ] Type-safe route parameter validation using Zod schemas

**Files Created/Modified**:
- `apps/api/src/router.ts`
- `apps/api/src/routes/` (import from domain packages)

---

#### [COMP-033.5] API versioning strategy

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | rest-api/ARCHITECTURE.md, CON-003 |
| **Dependencies** | COMP-033.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement API versioning strategy ensuring backward compatibility for 2 major versions.

**Acceptance Criteria**:
- [ ] Current version: `/api/v1/*`
- [ ] Version negotiation: `Accept: application/vnd.syntropy.v1+json` header support
- [ ] Deprecated endpoints return `Deprecation: true` header with `Sunset` date
- [ ] v1 maintained alongside v2 when v2 is released (2-version support window)
- [ ] Version middleware extracts requested version from URL or header

**Files Created/Modified**:
- `apps/api/src/middleware/api-version.ts`

---

#### [COMP-033.6] OpenAPI spec generation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | rest-api/ARCHITECTURE.md, CON-010 |
| **Dependencies** | COMP-033.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Auto-generate OpenAPI 3.1 spec from Fastify route definitions and Zod schemas.

**Acceptance Criteria**:
- [ ] `GET /api/v1/openapi.json` → OpenAPI 3.1 spec
- [ ] `GET /api/v1/docs` → Swagger UI
- [ ] All public endpoints documented with request/response schemas
- [ ] Generated spec validated with `@redocly/cli`
- [ ] Spec exported to `docs/api/openapi.json` during build

**Files Created/Modified**:
- `apps/api/src/openapi.ts`
- `docs/api/openapi.json` (generated)

---

#### [COMP-033.7] Health check and server info endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | rest-api/ARCHITECTURE.md |
| **Dependencies** | COMP-033.1 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement health check and server info endpoints for load balancer and monitoring.

**Acceptance Criteria**:
- [ ] `GET /health` → `{ status: 'ok', version, timestamp }` (no auth required)
- [ ] `GET /health/ready` → checks DB, Kafka, Redis connectivity
- [ ] `GET /health/live` → simple liveness check
- [ ] Response time p99 < 10ms

**Files Created/Modified**:
- `apps/api/src/routes/health.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | App shell |
| COMP-002 Identity | Internal | ⬜ Not Started | Token verification middleware |
| All domain packages | Internal | ⬜ Not Started | Route handlers |

---

## References

### Architecture Documents

- [REST API Platform Architecture](../../architecture/platform/rest-api/ARCHITECTURE.md)
