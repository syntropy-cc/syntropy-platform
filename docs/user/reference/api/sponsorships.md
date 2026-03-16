# Sponsorships API

Sponsorship domain: create a sponsorship (one-time or recurring), get sponsorship details, get impact metrics, and create a payment intent (Stripe) for the client to complete payment.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/sponsorships` | Create sponsorship (target creator/id, amount, frequency) |
| GET | `/api/v1/sponsorships/:id` | Get sponsorship by ID |
| GET | `/api/v1/sponsorships/:id/impact` | Get impact metric for sponsorship target |
| POST | `/api/v1/sponsorships/:id/payment-intent` | Create Stripe payment intent (returns client_secret) |

## Create sponsorship

```
POST /api/v1/sponsorships
```

**Request body**: Target (creator_id or equivalent), amount, currency, frequency (one-time | recurring). Exact fields from implementation.

**Response** `201 Created` — Sponsorship with `id`, `sponsor_id`, target, amount, status.

**Errors**: 400 (validation), 401, 404 (target not found), 503 (Stripe unavailable).

## Get sponsorship

```
GET /api/v1/sponsorships/:id
```

**Response** `200 OK` — Full sponsorship. Caller must be sponsor or have permission.

**Errors**: 401, 404.

## Get impact

```
GET /api/v1/sponsorships/:id/impact
```

**Response** `200 OK` — Impact metric (e.g. total support, number of sponsors) for the sponsorship’s target creator.

**Errors**: 401, 404.

## Payment intent

```
POST /api/v1/sponsorships/:id/payment-intent
```

**Response** `200 OK` — `{ "clientSecret": "..." }` for Stripe Elements or similar. Client completes payment on the frontend.

**Errors**: 401, 404, 503.

## See Also

- [How to sponsor a creator](../../how-to/sponsor-creator.md)
- [API Overview](overview.md)
