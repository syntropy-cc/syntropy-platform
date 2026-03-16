# IACP API

Inter-Artifact Communication Protocol: create an IACP (draft), add parties, sign, and activate. Used when artifacts interact under the DIP. All endpoints require authentication.

## Base path

```
/api/v1/iacp
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/iacp` | Create IACP (draft, add parties, submit, save) |
| GET | `/api/v1/iacp/:id` | Get IACP by ID |
| POST | `/api/v1/iacp/:id/sign` | Add signature for authenticated actor |
| POST | `/api/v1/iacp/:id/activate` | Transition to active (after threshold met) |

## Create IACP

```
POST /api/v1/iacp
```

**Request body**: IACP definition (parties, artifact references, terms). Structure is domain-specific; see DIP IACP subdomain docs.

**Response** `201 Created` — IACP object with `id`, `status`, etc.

**Errors**: 400 (invalid body), 401, 422 (e.g. DAG acyclicity, contract compatibility), 503.

## Get IACP

```
GET /api/v1/iacp/:id
```

**Response** `200 OK` — Full IACP object.

**Errors**: 401, 404.

## Sign IACP

```
POST /api/v1/iacp/:id/sign
```

**Request body**: Optional payload (e.g. party identifier). Authenticated user is recorded as signer.

**Response** `200 OK` — Updated IACP (signature count, status).

**Errors**: 401, 404, 409 (already signed by this actor), 422 (phase or threshold).

## Activate IACP

```
POST /api/v1/iacp/:id/activate
```

Transitions IACP to active when required signatures/threshold are met.

**Response** `200 OK` — Updated IACP with status active.

**Errors**: 401, 404, 422 (threshold not met or invalid state).

## See Also

- [Artifacts API](artifacts.md)
- [Artifacts and the DIP](../../concepts/artifacts-and-dip.md)
- [API Overview](overview.md)
