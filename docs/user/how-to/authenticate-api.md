# How to Authenticate with the API

> **Goal**: Obtain a Bearer token and use it to call protected REST API endpoints.
>
> **Prerequisites**: A Syntropy user account (email/password or OAuth); the API base URL.

## Overview

The API uses Bearer JWT tokens. You get a token by signing in with `POST /api/v1/auth/login`; you then send that token in the `Authorization` header on every protected request.

## Steps

### 1. Sign in

Send a POST request to the login endpoint with your email and password:

```bash
curl -X POST "https://api.syntropy.cc/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"your-password"}'
```

(Replace the base URL with your environment, e.g. `http://localhost:8080` for local.)

### 2. Read the token from the response

The response looks like:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "actorId": "550e8400-e29b-41d4-a716-446655440000",
    "roles": ["learner"]
  },
  "meta": { "request_id": "...", "timestamp": "..." }
}
```

Use `data.token` as your Bearer token.

### 3. Call protected endpoints

Include the token in every request to protected routes:

```bash
export TOKEN="<paste data.token here>"
curl -X GET "https://api.syntropy.cc/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

## Result

- `GET /api/v1/auth/me` returns your profile and roles when the token is valid.
- Any other protected endpoint (e.g. `POST /api/v1/artifacts`, `GET /api/v1/portfolios/:userId`) accepts the same header.

## Variations

**Using a script or SDK**: Store the token in an environment variable or secure store and add the header in your HTTP client, e.g. `Authorization: Bearer ${TOKEN}`.

**Logout**: Call `POST /api/v1/auth/logout` with the Bearer token if the server supports it; on the client, discard the token.

## Troubleshooting

**401 UNAUTHORIZED** — Token missing, expired, or invalid. Sign in again to get a new token.

**400 BAD_REQUEST** — Login body invalid. Ensure `email` and `password` are sent as JSON and that the email format is valid.

**503 SERVICE_UNAVAILABLE** — Auth not configured (e.g. missing Supabase). Check server configuration.

## See Also

- [API Overview — Authentication](../reference/api/overview.md#authentication)
- [Identity API](../reference/api/identity.md)
- [Quick Start](../getting-started/quick-start.md)
