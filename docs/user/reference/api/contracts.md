# Contracts API

DIP governance contracts: create and evaluate. Contracts define executable rules for institutions (roles, chambers, voting). All endpoints require authentication.

## Base path

```
/api/v1/contracts
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/contracts` | Create a contract (DSL body) |
| GET | `/api/v1/contracts/:id` | Get contract by ID |
| POST | `/api/v1/contracts/:id/evaluate` | Evaluate contract with request and state |

## Create contract

```
POST /api/v1/contracts
```

**Request body**: Contract definition (DSL). Structure is domain-specific; see governance/contracts domain docs. Invalid or empty DSL returns 400.

**Response** `201 Created` — Contract object with `id`, `institutionId` (if applicable), and contract payload.

**Errors**: 400 (invalid DSL), 401, 403, 503.

## Get contract

```
GET /api/v1/contracts/:id
```

**Response** `200 OK` — Full contract object.

**Errors**: 400 (invalid id), 404, 401.

## Evaluate contract

```
POST /api/v1/contracts/:id/evaluate
```

**Request body**: `{ "request": {...}, "state": {...} }` — shape defined by contract DSL.

**Response** `200 OK` — `{ "permitted": boolean, "state": {...} }` or equivalent evaluation result.

**Errors**: 400, 404, 422 (e.g. invalid request/state for contract), 401.

## See Also

- [Institutions and Governance API](institutions-governance.md)
- [Institutions and Governance](../../concepts/institutions-and-governance.md)
- [API Overview](overview.md)
