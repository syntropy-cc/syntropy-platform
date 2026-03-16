# Projects API

DIP projects: create, get, and read dependency graph (DAG). Projects belong to institutions and contain artifact manifests. All endpoints require authentication.

## Base path

```
/api/v1/projects
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/projects` | Create a project (body: institutionId, name, type, etc.) |
| GET | `/api/v1/projects/:id` | Get project by ID |
| GET | `/api/v1/projects/:id/dag` | Get dependency graph (nodes and edges) |

## Create project

```
POST /api/v1/projects
```

**Request body**: Includes `institutionId`, `name`, `type` (e.g. `project`, `research-line`), and optional fields per domain.

**Response** `201 Created` — Project DTO with `id`, `institutionId`, `name`, `status`, etc.

**Errors**: 400 (validation), 401, 403, 404 (institution not found), 422 (domain rules), 503.

## Get project

```
GET /api/v1/projects/:id
```

**Response** `200 OK` — Full project object.

**Errors**: 401, 404.

## Get project DAG

```
GET /api/v1/projects/:id/dag
```

**Response** `200 OK` — `{ "nodes": [...], "edges": [...] }` or equivalent DAG representation.

**Errors**: 401, 404.

## See Also

- [Hub API](hub.md) — issues and contributions
- [Institutions and Governance API](institutions-governance.md)
- [Artifacts and the DIP](../../concepts/artifacts-and-dip.md)
