# Moderation API

Governance & Moderation: content flags and community proposals. Typically requires moderator or admin role.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/moderation/flags` | List moderation flags (queue) |
| PATCH | `/api/v1/moderation/flags/:id` | Act on flag (dismiss, escalate, etc.) |
| GET | `/api/v1/community-proposals` | List community governance proposals (if exposed) |
| POST | `/api/v1/community-proposals` | Create community proposal (if exposed) |

**List flags** — **Response** `200 OK` — Paginated list of flagged content (id, entity_type, entity_id, reporter_id, reason, status, created_at). Requires moderator role.

**Act on flag** — **Request body**: `action` (e.g. dismiss, remove, escalate), optional note. **Response** `200 OK` — Updated flag.

**Errors**: 401, 403 (insufficient role), 404, 422, 429, 503.

## See Also

- [API Overview](overview.md)
- [Institutions and Governance](institutions-governance.md)
