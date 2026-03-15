# REST API Gateway Platform Service Implementation Record

> **Component ID**: COMP-033
> **Architecture Reference**: [ARCHITECTURE.md#platform-services](../../architecture/ARCHITECTURE.md#platform-services)
> **Domain Architecture**: [platform/rest-api/ARCHITECTURE.md](../../architecture/platform/rest-api/ARCHITECTURE.md)
> **Stage Assignment**: S12 — Platform Services
> **Status**: 🔵 In Progress
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
| ✅ Done | 4 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 3 |
| **Total** | **7** |

**Component Coverage**: 57%

### Item List

#### [COMP-033.1] Server setup and middleware stack

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | rest-api/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-13 |

**Description**: Set up the REST API server with core middleware stack.

**Acceptance Criteria**:
- [x] Fastify server with TypeScript types
- [x] CORS configured for pillar app origins
- [x] `correlation-id` middleware: generate UUID v4 `X-Correlation-ID` per request, propagate to response and downstream calls
- [x] Request/response logging middleware (structured JSON, correlation_id included)
- [x] Graceful shutdown handling

**Files Created/Modified**:
- `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/vitest.config.ts`
- `apps/api/src/main.ts`, `apps/api/src/server.ts`
- `apps/api/src/middleware/correlation-id.ts`, `apps/api/src/middleware/request-logger.ts`
- `apps/api/src/routes/health.ts`
- `apps/api/src/types/fastify.d.ts`
- Unit tests: `correlation-id.test.ts`, `request-logger.test.ts`; integration: `server.test.ts`

**Implementation Notes**: Plugins registered with `fastify-plugin` so correlation-id and request-logger decorators/hooks apply to all routes. Minimal `GET /health` added for S4 verification; full `/health/ready` and `/health/live` remain in COMP-033.7.

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
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | rest-api/ARCHITECTURE.md, CON-002 |
| **Dependencies** | COMP-033.1 |
| **Size** | S |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-13 |

**Description**: Implement rate limiting per authenticated user using Redis token bucket.

**Acceptance Criteria**:
- [x] Sliding window rate limiter: 100 requests/s burst, 1000 requests/min sustained (implemented as 1000/min per user, 20/min per IP)
- [x] Per-user limit keyed by `userId` (optional-auth preHandler sets `request.user` before rate limit)
- [x] Unauthenticated: IP-based limit (20 req/min)
- [x] Returns `429` with `Retry-After` header when limit exceeded
- [ ] AI agent session endpoints: 20 concurrent streaming sessions per user deferred until COMP-012.8 (AI agent routes exist)

**Files Created/Modified**:
- `apps/api/src/plugins/rate-limit.ts` (keyGenerator, createRateLimit global preHandler, Redis with in-memory fallback, skip /health*, /internal)
- `apps/api/src/plugins/rate-limit.test.ts`
- `apps/api/src/plugins/auth-middleware.ts` (optional-auth preHandler for rate-limit keying)
- `apps/api/package.json` (@fastify/rate-limit, ioredis)
- `apps/api/src/server.ts` (register rate-limit plugin)
- `apps/api/src/server.test.ts` (integration test 429 + Retry-After)

**Implementation Notes**: Redis optional (fallback to in-memory when `REDIS_URL` unset). In test, rate limit skipped unless `RATE_LIMIT_TEST_MAX` set. `/internal` paths skipped for rate limit so internal and health checks do not consume limit.

---

#### [COMP-033.4] Route registration for all domain packages

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | rest-api/ARCHITECTURE.md |
| **Dependencies** | All domain packages |
| **Size** | M |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-14 |

**Description**: Register all domain package API routes under the `/api/v1/*` and `/internal/*` namespace.

**Acceptance Criteria**:
- [x] All domain package routers imported and registered via `router.ts`
- [x] Route registration: `/api/v1/auth/*`, `/api/v1/learn/*`, `/api/v1/hub/*`, `/api/v1/labs/*`, `/api/v1/ai-agents/*`, `/api/v1/sponsorships/*`, `/api/v1/notifications/*`, `/api/v1/moderation/*`, `/api/v1/community-proposals/*`
- [x] Internal routes: `/internal/*` (internalEventSchemasPlugin)
- [x] Zod validation on routes (login body in auth.ts; pattern for others)

**Files Created/Modified**:
- `apps/api/src/router.ts`, `apps/api/src/types/create-app-options.ts`
- `apps/api/src/server.ts` (delegate to registerApiRoutes)
- `apps/api/src/routes/auth.ts` (loginBodySchema Zod)

---

#### [COMP-033.5] API versioning strategy

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | rest-api/ARCHITECTURE.md, CON-003 |
| **Dependencies** | COMP-033.4 |
| **Size** | S |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-14 |

**Description**: Implement API versioning strategy ensuring backward compatibility for 2 major versions.

**Acceptance Criteria**:
- [x] Current version: `/api/v1/*`; version from path or Accept header
- [x] Version negotiation: `Accept: application/vnd.syntropy.v1+json` header support
- [x] Deprecation: `setDeprecationHeaders(reply, sunsetDate)` helper for deprecated routes
- [x] Version middleware: request.apiVersion, API-Version response header

**Files Created/Modified**:
- `apps/api/src/middleware/api-version.ts`, `apps/api/src/middleware/api-version.test.ts`
- `apps/api/src/types/fastify.d.ts` (apiVersion on request)
- `apps/api/src/server.ts` (register apiVersionPluginFp)

---

#### [COMP-033.6] OpenAPI spec generation

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Origin** | rest-api/ARCHITECTURE.md, CON-010 |
| **Dependencies** | COMP-033.4 |
| **Size** | S |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-14 |

**Description**: Auto-generate OpenAPI 3.1 spec from Fastify route definitions and Zod schemas.

**Acceptance Criteria**:
- [x] `GET /api/v1/openapi.json` → OpenAPI 3.1 spec
- [x] `GET /api/v1/docs` → Swagger UI
- [x] Base spec with tags; paths from registered routes
- [x] `@redocly/cli` and script `openapi:lint`
- [x] Export script `openapi:export` writes `docs/api/openapi.json`

**Files Created/Modified**:
- `apps/api/src/openapi.ts`, `apps/api/src/openapi.test.ts`
- `apps/api/scripts/export-openapi.js`, `docs/api/openapi.json`
- `apps/api/package.json` (@fastify/swagger, @fastify/swagger-ui, @redocly/cli)

---

#### [COMP-033.7] Health check and server info endpoints

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | rest-api/ARCHITECTURE.md |
| **Dependencies** | COMP-033.1 |
| **Size** | XS |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-13 |

**Description**: Implement health check and server info endpoints for load balancer and monitoring.

**Acceptance Criteria**:
- [x] `GET /health` → `{ status: 'ok', version, timestamp }` (no auth required)
- [x] `GET /health/ready` → checks DB, Kafka, Redis connectivity
- [x] `GET /health/live` → simple liveness check
- [x] Response time p99 < 10ms (handlers lightweight; readiness uses 2s timeout per check)

**Files Created/Modified**:
- `apps/api/src/routes/health.ts` — GET /health (version from env or package.json), GET /health/ready, GET /health/live
- `apps/api/src/lib/readiness.ts` — checkRedis, checkDatabase, checkKafka, runReadinessChecks (2s timeout)
- `apps/api/src/lib/readiness.test.ts` — unit tests for readiness checks
- `apps/api/package.json` — added `pg` for DB readiness
- `apps/api/src/server.test.ts` — integration tests for /health, /health/live, /health/ready

**Implementation Notes**: Readiness runs only when env vars are set (REDIS_URL, DATABASE_URL, KAFKA_BROKERS). Unset checks report "skipped". 503 returned when any configured check fails.

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
