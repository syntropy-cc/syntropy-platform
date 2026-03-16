# Hub API

Hub domain: projects, issues, contributions, and discovery. Projects and issues are often backed by DIP projects; contributions link artifacts to issues.

## Endpoint groups

| Prefix | Description |
|--------|-------------|
| `/api/v1/projects` | DIP projects (see [Projects API](projects.md)) |
| `/api/v1/projects/:id/issues` or `/api/v1/issues` | Issues (create, list, get) |
| `/api/v1/issues/:id/contributions` or `/api/v1/contributions` | Contributions (submit, list, get) |
| `/api/v1/hub/discover` or similar | Public discovery (projects, institutions) |

(Exact paths from OpenAPI or route modules.)

## Create issue

```
POST /api/v1/projects/:projectId/issues
```
or
```
POST /api/v1/issues
```
**Request body**: `title`, `description` (markdown), optional `assignee_id`, priority.

**Response** `201 Created` — Issue with `id`, `project_id`, `title`, `description`, `status: "open"`.

**Errors**: 400, 401, 403, 404 (project), 422, 503.

## Submit contribution

```
POST /api/v1/issues/:issueId/contributions
```
**Request body**: `artifact_id` (published DIP artifact UUID).

**Response** `201 Created` — Contribution with `id`, `issue_id`, `contributor_id`, `artifact_id`, `status: "submitted"`.

**Errors**: 401, 403, 404, 409 (issue closed), 422 (artifact not published or not anchored), 503.

## Discover (public)

```
GET /api/v1/hub/discover?...
```

Query params may include filters (pillar, type, search). Returns public projects and/or institutions. May not require auth.

**Response** `200 OK` — Paginated list of discoverable items.

## See Also

- [Projects API](projects.md)
- [Institutions and Governance API](institutions-governance.md)
- [How to submit a contribution](../../how-to/submit-contribution.md)
- [Tutorial: Contribute to a Hub Project](../../tutorials/04-contribute-to-hub-project.md)
