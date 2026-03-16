# Identity API

Authentication and user profile endpoints. Identity is provided by Supabase Auth; the API wraps it and returns a consistent token and profile.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Sign in with email/password; returns token and claims |
| POST | `/api/v1/auth/logout` | Sign out (client should discard token) |
| GET | `/api/v1/auth/me` | Current user from Bearer token |
| GET | `/api/v1/users/:id` | User profile by ID (if exposed) |

## POST /api/v1/auth/login

Sign in and get a Bearer token.

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email |
| `password` | string | Yes | User password |

**Response** `200 OK`

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "actorId": "550e8400-e29b-41d4-a716-446655440000",
    "roles": ["learner"]
  },
  "meta": { "request_id": "...", "timestamp": "...", "api_version": "1.0" }
}
```

**Errors**

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid body (e.g. validation failure on email/password) |
| 401 | UNAUTHORIZED | Invalid credentials |
| 503 | SERVICE_UNAVAILABLE | Auth not configured (missing Supabase) |

## GET /api/v1/auth/me

Return the authenticated user's profile and roles. Requires `Authorization: Bearer <token>`.

**Response** `200 OK`

```json
{
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "actorId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "you@example.com",
    "roles": ["learner"]
  },
  "meta": { "request_id": "...", "timestamp": "...", "api_version": "1.0" }
}
```

**Errors**

| Status | Code | Description |
|--------|------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid token |

## POST /api/v1/auth/logout

Sign out. Client should discard the token after calling. Requires Bearer token.

**Response** `200 OK` (or 204). Body may be empty.

## Example

```bash
# Login
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"your-password"}'

# Get profile
curl -X GET "http://localhost:8080/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

## See Also

- [API Overview](overview.md)
- [How to authenticate with the API](../../how-to/authenticate-api.md)
