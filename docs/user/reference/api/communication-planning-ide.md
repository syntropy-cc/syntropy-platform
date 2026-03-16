# Communication, Planning, and IDE API

Communication (notifications), Planning (tasks), and IDE (sessions and WebSocket) endpoints.

## Notifications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/notifications` | List notifications for current user (paginated, auth) |

**Query**: `page`, `per_page`, optional filters.

**Response** `200 OK` — Paginated list of notifications (id, type, title, body, read, created_at, link).

**Errors**: 401, 429, 503.

## Planning

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/planning/tasks` | List planning tasks for current user |
| POST | `/api/v1/planning/tasks` | Create task (if exposed) |
| PATCH | `/api/v1/planning/tasks/:id` | Update task (if exposed) |

**Response** `200 OK` — List of tasks (id, title, status, pillar context, due date, etc.).

**Errors**: 401, 403, 404, 429, 503.

## IDE

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/ide/sessions` | Create IDE session |
| GET | `/api/v1/ide/sessions/:id` | Get session (owner only) |
| POST | `/api/v1/ide/sessions/:id/start` | Start session (provision container) |
| POST | `/api/v1/ide/sessions/:id/suspend` | Suspend session |
| WebSocket | `/api/v1/ide/sessions/:id/ws` | Terminal/editor stream (Bearer in query or subprotocol) |

**Create session** — Body may be `{}` or include project/artifact context. **Response** `201 Created` — Session with `id`, `status`, optional `webSocketUrl` or URL derived from `id`.

**Start** — **Response** `200 OK` — Session with status active and WebSocket URL.

**Errors**: 401, 404, 429 (quota exceeded), 503 (IDE/container backend not configured).

## See Also

- [How to use an IDE session](../../how-to/use-ide-session.md)
- [API Overview](overview.md)
