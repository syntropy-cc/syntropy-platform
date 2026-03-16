# Quick Start

This guide walks you through the most common path: create an account, sign in, and complete one meaningful action so you see how the platform works end-to-end.

## What you'll do

You will sign in to the platform, then either publish a first artifact (Learn) or call the REST API to create an artifact. By the end you will have used authentication and one core DIP capability.

## Prerequisites

- [Installation](installation.md) completed — API and (optionally) web app are running.
- A user account (Supabase Auth). If using local Supabase, create a user via the Supabase dashboard or sign-up flow.

## Option A: Quick start via web app

1. Open the platform URL (e.g. `http://localhost:3000`).
2. Click **Login** and sign in with your email and password.
3. Go to **Learn** and pick a track, or go to **Hub** and browse projects.
4. Complete one action: for example, open a fragment in Learn, build the artifact in the embedded IDE, and publish it. Your portfolio will record the event.

## Option B: Quick start via API

### 1. Get an access token

```bash
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your-password"}'
```

Example response:

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

Save the `data.token` value as your Bearer token.

### 2. Call a protected endpoint

Get your profile:

```bash
export TOKEN="<paste token here>"
curl -X GET "http://localhost:8080/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Create an artifact (DIP)

Create a draft artifact:

```bash
curl -X POST "http://localhost:8080/api/v1/artifacts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"# Hello World"}'
```

You should receive `201 Created` with an artifact object (`id`, `authorId`, `status: "draft"`, etc.). You can then submit and publish it via `PUT /api/v1/artifacts/:id/submit` and `PUT /api/v1/artifacts/:id/publish` (see [Artifacts API](../reference/api/artifacts.md)).

## What you've learned

- You can sign in (web or API) and obtain a Bearer token.
- The API uses envelope responses (`data`, `meta`) and requires `Authorization: Bearer <token>` for protected routes.
- You can create an artifact via the API; the DIP tracks draft → submit → publish.

## Next steps

- [Tutorial: Onboarding to First Artifact](../tutorials/01-onboarding-first-artifact.md)
- [How to create an artifact](../how-to/create-artifact.md)
- [API Overview](../reference/api/overview.md)

## See Also

- [Installation](installation.md)
- [Authenticate with the API](../how-to/authenticate-api.md)
- [Artifacts and the DIP](../concepts/artifacts-and-dip.md)
