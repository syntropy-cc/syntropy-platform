# Portfolios, Search, and Recommendations API

Portfolio, search, and recommendations (core services): user portfolio (XP, skills, achievements), cross-pillar search, and personalized recommendations. Portfolio and recommendations require authentication; search may allow unauthenticated or restricted access.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/portfolios/:userId` | Get user's portfolio (XP, skills, achievements, collectibles) |
| GET | `/api/v1/search` | Cross-pillar search (query param `q`, optional type filter, pagination) |
| GET | `/api/v1/recommendations/:userId` | Personalized recommendations for the user |

## Get portfolio

```
GET /api/v1/portfolios/:userId
```

**Response** `200 OK` — Portfolio object: `xp_total`, `skill_records`, `achievement_ids`, `collectible_instance_ids`, `last_updated_at`. Caller may only be allowed to read own portfolio unless permission grants otherwise.

**Errors**: 401, 403, 404.

## Search

```
GET /api/v1/search?q=...&type=...&page=1&per_page=20
```

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (full-text + semantic) |
| `type` | string | No | Filter by entity type (artifact, track, article, project, institution, etc.) |
| `page` | integer | No | Default 1 |
| `per_page` | integer | No | Default 20, max 100 |

**Response** `200 OK` — Paginated list of results; each item has `entity_type`, `id`, `title`, `relevance_score`, and type-specific fields.

**Errors**: 400 (missing `q`), 401 (if auth required), 429, 503.

## Recommendations

```
GET /api/v1/recommendations/:userId
```

**Response** `200 OK` — List of recommended items (e.g. issues to contribute to, fragments to try, articles to read) based on user activity and portfolio.

**Errors**: 401, 403, 404, 503.

## See Also

- [Portfolio and Events](../../concepts/portfolio-and-events.md)
- [API Overview](overview.md)
