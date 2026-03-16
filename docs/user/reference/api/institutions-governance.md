# Institutions and Governance API

Digital institutions, governance contracts, proposals, voting, and public institution discovery. Covers Hub institution management and DIP governance. All mutation endpoints require authentication.

## Endpoint groups

| Prefix | Description |
|--------|-------------|
| `/api/v1/institutions` | Create and get institutions |
| `/api/v1/institutions/:id/proposals` | Create proposals |
| `/api/v1/proposals/:id/vote` | Vote on proposals |
| `/api/v1/public/institutions` or similar | Public read-only institution list (may be unauthenticated) |

## Create institution

```
POST /api/v1/institutions
```

**Request body**: `name`, `type` (`institution` | `laboratory`), `contract_template_id` (or equivalent), optional founding members.

**Response** `201 Created` — Institution with `id`, `status`, `governance_contract_id`, `legitimacy_chain_head`.

**Errors**: 400, 401, 403, 422 (invalid template or domain rules), 503.

## Get institution

```
GET /api/v1/institutions/:id
```

**Response** `200 OK` — Full institution (governance, members, projects as permitted).

**Errors**: 401, 404.

## Create proposal

```
POST /api/v1/institutions/:id/proposals
```

**Request body**: `proposal_type`, `content` (schema per contract). Submitter must have permission under the institution’s governance contract.

**Response** `201 Created` — Proposal with `id`, `status: "draft"` (or next state).

**Errors**: 400, 401, 403, 404, 422 (proposal type not allowed or content invalid), 503.

## Vote on proposal

```
POST /api/v1/proposals/:id/vote
```

**Request body**: e.g. `{ "vote": "approve" | "reject" }` or equivalent. Voter must be in the responsible chamber.

**Response** `200 OK` — Updated proposal or vote confirmation.

**Errors**: 401, 403, 404, 409 (e.g. already voted), 422 (voting phase closed or invalid), 503.

## Public institutions

Public discovery endpoints (e.g. `GET /api/v1/public/institutions` or under hub-discover) return list of public institutions; may support query params for search/pagination. May not require auth.

## See Also

- [Contracts API](contracts.md)
- [Projects API](projects.md)
- [Institutions and Governance](../../concepts/institutions-and-governance.md)
- [How to create an institution](../../how-to/create-institution.md)
