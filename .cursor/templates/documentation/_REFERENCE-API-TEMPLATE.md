# API Reference Page Template

> Reference pages are **information-oriented**. They provide precise, complete, and authoritative technical descriptions. API reference pages document every endpoint for a resource group.

## Template

```markdown
# {Resource Name} API

{One sentence describing what this resource represents.}

## Base URL

```
{BASE_URL}/api/v{VERSION}/{resource}
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/{resource}` | List all {resources} |
| POST | `/{resource}` | Create a new {resource} |
| GET | `/{resource}/{id}` | Get a specific {resource} |
| PUT | `/{resource}/{id}` | Update a {resource} |
| DELETE | `/{resource}/{id}` | Delete a {resource} |

---

## List {Resources}

```
GET /{resource}
```

{Brief description of what this endpoint returns.}

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 20 | Maximum items to return (1-100) |
| `offset` | integer | No | 0 | Number of items to skip |
| `{filter}` | string | No | — | {Description of filter} |

### Response

**Status**: `200 OK`

```json
{
  "data": [
    {
      "id": "{resource}_a1b2c3",
      "name": "Example Resource",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | {Description} |
| `created_at` | string (ISO 8601) | Creation timestamp |

### Example

```bash
curl -X GET "https://api.example.com/v1/{resource}?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Create {Resource}

```
POST /{resource}
```

{Brief description.}

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | {Description}. Max 128 characters. |
| `{field}` | {type} | {Yes/No} | {Description} |

### Example Request

```bash
curl -X POST "https://api.example.com/v1/{resource}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Resource",
    "{field}": "{value}"
  }'
```

### Response

**Status**: `201 Created`

```json
{
  "data": {
    "id": "{resource}_d4e5f6",
    "name": "My Resource",
    "{field}": "{value}",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Errors

| Status | Code | Description |
|--------|------|-------------|
| `400` | `VALIDATION_ERROR` | Request body validation failed |
| `409` | `DUPLICATE` | A {resource} with this name already exists |
| `429` | `RATE_LIMITED` | Too many requests |

---

## Get {Resource}

```
GET /{resource}/{id}
```

{Continue the same pattern for each endpoint...}

---

## Error Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description",
    "details": [
      {"field": "name", "message": "Name is required"}
    ]
  },
  "meta": {
    "request_id": "req_x1y2z3"
  }
}
```

## See Also

- [{Resource} Tutorial](../tutorials/{resource}-tutorial.md)
- [Authentication Guide](../getting-started/authentication.md)
- [{Related Resource} API](./{related-resource}.md)
```

## Writing Guidelines

1. **Be exhaustive** — document every field, parameter, header, and status code
2. **Show real responses** — use realistic JSON, not abbreviated
3. **Include all error codes** — the reader needs to handle every possible error
4. **Consistent structure** — every endpoint follows the same section order
5. **Copy-paste examples** — `curl` commands should work when pasted (except for token/URL)

## Traceability

| Field | Value |
|-------|-------|
| **Architecture API Spec** | {Link to API definition in architecture docs} |
| **Domain** | {Which domain owns this resource} |
| **Component** | {Which implementation component implements this} |
