# REST API — Platform Architecture

> **Document Type**: Platform Service Architecture Document
> **Parent**: [System Architecture](../../ARCHITECTURE.md)
> **Last Updated**: 2026-03-12
> **Owner**: Syntropy Core Team

---

## Service Overview

The REST API is the primary external interface for all client applications (web app, mobile, third-party integrations). It acts as the API gateway layer — routing requests to domain services, enforcing authentication, applying rate limiting, and standardizing response formats.

---

## Architecture

### High-Level Diagram

```mermaid
graph TB
    subgraph clients [Clients]
        WEB["Web Application"]
        MOBILE["Mobile App (future)"]
        THIRD_PARTY["Third-party integrations"]
    end

    subgraph apiGateway [REST API Gateway]
        AUTH_MW["Auth Middleware\n(IdentityToken verification)"]
        RATE_LIMITER["Rate Limiter\n(per tier)"]
        ROUTER["Request Router\n(per domain)"]
        RESP_FORMATTER["Response Formatter\n(envelope format)"]
    end

    subgraph domainServices [Domain Services (internal)]
        LEARN_SVC["Learn Service"]
        HUB_SVC["Hub Service"]
        LABS_SVC["Labs Service"]
        DIP_SVC["DIP Service"]
        PLAT_CORE_SVC["Platform Core Service"]
        IDENTITY_SVC["Identity Service"]
        AI_AGENTS_SVC["AI Agents Service"]
    end

    WEB --> AUTH_MW
    MOBILE --> AUTH_MW
    THIRD_PARTY --> AUTH_MW
    AUTH_MW --> RATE_LIMITER
    RATE_LIMITER --> ROUTER
    ROUTER --> LEARN_SVC
    ROUTER --> HUB_SVC
    ROUTER --> LABS_SVC
    ROUTER --> DIP_SVC
    ROUTER --> PLAT_CORE_SVC
    ROUTER --> IDENTITY_SVC
    ROUTER --> AI_AGENTS_SVC
    domainServices --> RESP_FORMATTER
```

---

## Versioning Strategy

**URL versioning** for major versions: `/api/v1/`, `/api/v2/`

**Header versioning** for minor non-breaking additions: `API-Version: v1.1`

Rules:
- Major version bump required for any breaking change (field removal, type change, behavior change)
- v1 and v2 coexist for minimum 6 months during transition
- Deprecation announced in response headers: `Deprecation: Sat, 01 Jan 2028 00:00:00 GMT`

---

## Response Envelope Format

All API responses follow this structure:

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-12T14:30:00.123Z",
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "api_version": "1.0"
  }
}
```

### Paginated Response

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 243,
    "has_next": true
  },
  "meta": { ... }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Email must contain '@' and a valid domain"
      }
    ]
  },
  "meta": { ... }
}
```

### Error Codes

| HTTP Status | Error Code | Meaning |
|-------------|------------|---------|
| 400 | `VALIDATION_ERROR` | Request body failed validation |
| 401 | `UNAUTHORIZED` | Missing or invalid IdentityToken |
| 403 | `FORBIDDEN` | Valid token but insufficient permissions |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Resource already exists or invariant violation |
| 422 | `DOMAIN_ERROR` | Business rule violation (e.g., fragment missing section) |
| 429 | `RATE_LIMITED` | Rate limit exceeded |
| 503 | `SERVICE_UNAVAILABLE` | Upstream dependency unavailable |

---

## Authentication

All endpoints (except auth initiation and public GET endpoints) require:

```
Authorization: Bearer {IdentityToken}
```

IdentityToken is a JWT signed by Supabase Auth, verified by Identity domain at the API gateway.

---

## Rate Limiting

Rate limiting is applied per user per tier:

| Tier | Limit | Window |
|------|-------|--------|
| Unauthenticated | 60 req | 1 minute |
| Learner (Free) | 600 req | 1 minute |
| Creator | 1200 req | 1 minute |
| Researcher | 1200 req | 1 minute |
| InstitutionAdmin | 2400 req | 1 minute |
| Service (internal) | Unlimited | — |

Rate limit headers returned on every response:
- `X-RateLimit-Limit: 600`
- `X-RateLimit-Remaining: 543`
- `X-RateLimit-Reset: 1741789200`

---

## Key Endpoint Prefixes

| Prefix | Domain | Notes |
|--------|--------|-------|
| `/api/v1/auth/*` | Identity | Login, logout, token refresh |
| `/api/v1/users/*` | Identity | User profile management |
| `/api/v1/portfolio/*` | Platform Core | Portfolio, XP, achievements |
| `/api/v1/search` | Platform Core | Cross-pillar search |
| `/api/v1/recommendations` | Platform Core | Personalized recommendations |
| `/api/v1/tracks/*` | Learn | Track and course management |
| `/api/v1/fragments/*` | Learn | Fragment lifecycle |
| `/api/v1/projects/*` | Hub | Project and issue management |
| `/api/v1/contributions/*` | Hub | Contribution lifecycle |
| `/api/v1/articles/*` | Labs | Article lifecycle |
| `/api/v1/reviews/*` | Labs | Peer review management |
| `/api/v1/artifacts/*` | DIP | Artifact registry and IACP |
| `/api/v1/institutions/*` | DIP + Hub | Institution management |
| `/api/v1/ai-agents/*` | AI Agents | Agent session management |
| `/api/v1/admin/*` | Platform Admin | Admin operations (PlatformAdmin role required) |

---

## Security Considerations

- All endpoints served over TLS 1.3
- CORS policy: allow only known origins (web app domains)
- Request size limits: 1MB for API requests, 50MB for artifact upload endpoints
- SQL injection prevention: parameterized queries in all domain services
- No sensitive data in error messages returned to clients
