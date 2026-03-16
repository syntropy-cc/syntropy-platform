# Artifacts API

DIP artifact lifecycle: create (draft), get, submit, and publish. Published artifacts are cryptographically anchored (e.g. Nostr). All endpoints require authentication.

## Base path

```
/api/v1/artifacts
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/artifacts` | Create a draft artifact |
| GET | `/api/v1/artifacts/:id` | Get artifact by ID |
| PUT | `/api/v1/artifacts/:id/submit` | Transition draft → submitted |
| PUT | `/api/v1/artifacts/:id/publish` | Transition submitted → published (anchoring) |

## Create artifact (draft)

```
POST /api/v1/artifacts
```

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | No | Optional content (e.g. markdown or code). Body may be `{}` or omitted. |

**Response** `201 Created`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "authorId": "auth_...",
    "status": "draft",
    "createdAt": "2026-03-16T12:00:00.000Z",
    "publishedAt": null,
    "contentHash": null,
    "nostrEventId": null,
    "artifactType": null,
    "tags": []
  },
  "meta": { "request_id": "...", "timestamp": "...", "api_version": "1.0" }
}
```

**Errors**

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Body must be `{ "content"?: string }` or empty |
| 401 | UNAUTHORIZED | Not authenticated |
| 503 | SERVICE_UNAVAILABLE | DIP not configured |

## Get artifact

```
GET /api/v1/artifacts/:id
```

**Response** `200 OK` — Same shape as create response. For published artifacts, `publishedAt`, `contentHash`, and `nostrEventId` may be set.

**Errors**

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid artifact ID format |
| 404 | NOT_FOUND | Artifact not found |
| 401 | UNAUTHORIZED | Not authenticated |

## Submit artifact

```
PUT /api/v1/artifacts/:id/submit
```

Transitions the artifact from draft to submitted (ready for publish). No body.

**Response** `200 OK` — Updated artifact DTO with `status` reflecting submitted.

**Errors**

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid artifact ID format |
| 404 | NOT_FOUND | Artifact not found |
| 409 | CONFLICT | Invalid lifecycle transition (e.g. not in draft) |
| 401 | UNAUTHORIZED | Not authenticated |

## Publish artifact

```
PUT /api/v1/artifacts/:id/publish
```

Publishes the artifact and triggers anchoring (e.g. Nostr). No body. After success, the artifact is immutable for that version.

**Response** `200 OK` — Updated artifact; `publishedAt`, `contentHash`, `nostrEventId` set when anchoring succeeds.

**Errors**

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid artifact ID format |
| 404 | NOT_FOUND | Artifact not found |
| 409 | CONFLICT | Invalid lifecycle transition (e.g. not in submitted) |
| 401 | UNAUTHORIZED | Not authenticated |

## Example

```bash
# Create draft
curl -X POST "http://localhost:8080/api/v1/artifacts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"# Hello"}'

# Submit (use artifact id from response)
curl -X PUT "http://localhost:8080/api/v1/artifacts/{id}/submit" \
  -H "Authorization: Bearer $TOKEN"

# Publish
curl -X PUT "http://localhost:8080/api/v1/artifacts/{id}/publish" \
  -H "Authorization: Bearer $TOKEN"
```

## See Also

- [Artifacts and the DIP](../../concepts/artifacts-and-dip.md)
- [How to create an artifact](../../how-to/create-artifact.md)
- [IACP API](iacp.md)
