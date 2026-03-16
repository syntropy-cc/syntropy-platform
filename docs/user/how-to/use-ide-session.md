# How to Use an IDE Session

> **Goal**: Create an IDE session via the API, start it, and connect to the WebSocket for terminal or editor interaction.
>
> **Prerequisites**: Authenticated user; IDE service and container orchestration configured on the server.

## Overview

The platform provides an embedded IDE (Monaco-based) and per-user sessions. You create a session with `POST /api/v1/ide/sessions`, then start it with `POST /api/v1/ide/sessions/:id/start`, and connect to the session’s WebSocket URL for real-time terminal or editor streams.

## Steps

### 1. Create a session

```bash
curl -X POST "https://api.syntropy.cc/api/v1/ide/sessions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

The response is `201 Created` with a session object containing `id`, `status`, and often a `webSocketUrl` or similar (or you get it after start). Save the session `id`.

### 2. Start the session

```bash
curl -X POST "https://api.syntropy.cc/api/v1/ide/sessions/{SESSION_ID}/start" \
  -H "Authorization: Bearer $TOKEN"
```

The server provisions the container and sets the session to active. The response may include the WebSocket URL for the session.

### 3. Connect to the WebSocket

Use the WebSocket URL from the session (e.g. `wss://api.syntropy.cc/api/v1/ide/sessions/{SESSION_ID}/ws`). Connect with the same Bearer token (e.g. in a query param or subprotocol) as required by the server. You can then send and receive messages for terminal I/O or editor events.

### 4. Suspend when done (optional)

To free resources without deleting the session:

```bash
curl -X POST "https://api.syntropy.cc/api/v1/ide/sessions/{SESSION_ID}/suspend" \
  -H "Authorization: Bearer $TOKEN"
```

## Result

You have an active IDE session with a container and a WebSocket connection for terminal/editor use. The web app typically embeds this same flow so users get a seamless IDE inside the browser.

## Variations

**Quota**: The server may enforce a per-user session quota. If you get `429 Too Many Requests`, close or suspend existing sessions before creating a new one.

**Session ownership**: Only the user who created the session can start, suspend, or connect to it; `GET /api/v1/ide/sessions/:id` returns the session only for the owner.

## Troubleshooting

**401 UNAUTHORIZED** — Token missing or invalid. Re-authenticate.

**404 NOT_FOUND** — Session ID wrong or session was deleted. Create a new session.

**429 RATE_LIMITED** — Session quota exceeded. Suspend or close other sessions.

**503 SERVICE_UNAVAILABLE** — IDE or container backend not configured. Check server configuration.

## See Also

- [Communication, Planning, IDE API](../reference/api/communication-planning-ide.md)
- [Quick Start](../getting-started/quick-start.md)
