# API Overview

The Syntropy Platform exposes a REST API under `/api/v1/`. All clients (web app, mobile, integrations) use this API. Responses use a consistent envelope format; errors use standard codes; authentication is Bearer JWT.

## Base URL

Use the base URL for your environment:

| Environment | Base URL |
|-------------|---------|
| Production | `https://api.syntropy.cc` |
| Staging | `https://staging.api.syntropy.cc` |
| Local | `http://localhost:8080` |

All paths below are relative to the base URL. Version is in the path: `/api/v1/...`.

## Authentication

Protected endpoints require:

```
Authorization: Bearer <access_token>
```

Obtain the token by calling `POST /api/v1/auth/login` with `email` and `password`. The response includes `data.token`; use that as the Bearer token. See [How to authenticate with the API](../../how-to/authenticate-api.md) and [Identity API](identity.md).

Public endpoints (e.g. some GETs for tracks or public institutions) do not require a token.

## Response envelope

### Success

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-16T12:00:00.000Z",
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "api_version": "1.0"
  }
}
```

### Paginated list

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

### Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid",
    "details": [
      { "field": "email", "code": "INVALID_FORMAT", "message": "Email must contain '@'" }
    ]
  },
  "meta": { "request_id": "...", "timestamp": "...", "api_version": "1.0" }
}
```

## Error codes

| HTTP | Code | Meaning |
|------|------|--------|
| 400 | `BAD_REQUEST` / `VALIDATION_ERROR` | Invalid request body or parameters; check `details` |
| 401 | `UNAUTHORIZED` | Missing or invalid Bearer token |
| 403 | `FORBIDDEN` | Valid token but insufficient permissions |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | State conflict or invariant violation (e.g. duplicate, invalid transition) |
| 422 | `DOMAIN_ERROR` | Business rule violation (e.g. fragment missing section, IACP phase order) |
| 429 | `RATE_LIMITED` | Rate limit exceeded; use `Retry-After` if present |
| 503 | `SERVICE_UNAVAILABLE` | Upstream (e.g. Supabase, Kafka) unavailable |

## Rate limiting

Limits are per user (or IP when unauthenticated) per minute:

| Tier | Requests/minute |
|------|-----------------|
| Unauthenticated | 60 |
| Learner | 600 |
| Creator / Researcher | 1200 |
| Institution Admin | 2400 |

Responses include:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

When exceeded you get `429` and `RATE_LIMITED`.

## Pagination

List endpoints support:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-based) |
| `per_page` | integer | 20 | Items per page (max typically 100) |

Response includes `pagination.page`, `pagination.per_page`, `pagination.total`, `pagination.has_next`.

## Endpoint prefixes

| Prefix | Domain |
|--------|--------|
| `/api/v1/auth/*`, `/api/v1/users/*` | Identity |
| `/api/v1/artifacts/*`, `/api/v1/contracts/*`, `/api/v1/projects/*`, `/api/v1/iacp/*` | DIP |
| `/api/v1/portfolios/*`, `/api/v1/search`, `/api/v1/recommendations/*` | Platform Core |
| `/api/v1/learn/*` (tracks, fragments, etc.) | Learn |
| `/api/v1/hub/*`, `/api/v1/institutions/*`, `/api/v1/proposals/*` | Hub / Governance |
| `/api/v1/labs/*` (articles, reviews, doi, experiments) | Labs |
| `/api/v1/ai-agents/*`, `/api/v1/agents/*` | AI Agents |
| `/api/v1/sponsorships/*` | Sponsorship |
| `/api/v1/notifications/*`, `/api/v1/planning/*`, `/api/v1/ide/*` | Communication, Planning, IDE |
| `/api/v1/moderation/*`, `/api/v1/community-proposals/*` | Governance & Moderation |

## See Also

- [Identity API](identity.md)
- [How to authenticate with the API](../../how-to/authenticate-api.md)
- [Configuration](../configuration.md)
