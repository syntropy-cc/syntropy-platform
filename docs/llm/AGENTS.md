---
artifact_type: llm-documentation
generated_by: "Vision-to-System Framework / Prompt 01-C"
last_updated: 2026-03-12
token_budget: 4000
system_version: "1.0.0"
completeness: "architecture-only"
---

# Syntropy Ecosystem — LLM Agent Reference

## 1. System Identity

The Syntropy Ecosystem is a unified platform where learning (Syntropy Learn), building (Syntropy Hub), and researching (Syntropy Labs) share a single event log, portfolio, and identity layer. Agents interact via REST API to manage artifacts, institutions, learning content, collaborative projects, and scientific publications. The system records every meaningful action as an immutable event; portfolio state is derived from this log, not from self-reporting. The system does not accept direct database writes from external callers; all mutations go through domain services. The system does not expose LLM-to-LLM agent interfaces directly; agents interact through the same REST API as human users.

---

## 2. Domain Model

### Artifact (DIP)

The fundamental ownership unit — any versioned creative or intellectual product with a cryptographic identity anchor.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable after creation |
| type | enum: `code`, `scientific-article`, `dataset`, `experiment`, `document`, `composite` | yes | immutable after anchoring |
| title | string | yes | max 500 chars |
| content_hash | string (SHA-256) | yes | immutable after anchoring |
| creator_id | string (UUID) | yes | references Identity User |
| status | enum: `draft`, `published`, `deprecated` | yes | transitions: draft→published→deprecated |
| version | string (semver) | yes | each published version is permanent |
| identity_record_id | string (UUID) | no | set when anchored to Nostr; null if draft |
| anchoring_status | enum: `pending`, `anchored`, `failed` | yes | set on publication |
| created_at | timestamp (ISO 8601) | yes | immutable |

**Invariants**:
- `status` may not revert from `published` to `draft`
- `identity_record_id` is immutable once set
- `content_hash` is immutable once `anchoring_status = anchored`

---

### IdentityRecord (DIP)

The immutable cryptographic proof of an Artifact's authorship, anchored to Nostr relays.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| artifact_id | string (UUID) | yes | references Artifact; immutable |
| creator_public_key | string (secp256k1 hex) | yes | immutable |
| content_hash | string (SHA-256) | yes | immutable |
| nostr_event_id | string (64-char hex) | yes | set on anchoring; immutable |
| anchoring_relay_urls | string[] | yes | relays confirming the event |
| anchored_at | timestamp | yes | immutable |

**Invariants**:
- All fields immutable after creation; no update operations permitted

---

### DigitalProject (DIP)

A governed, artifact-bearing unit of collaborative work with an emergent dependency graph.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| institution_id | string (UUID) | yes | references DigitalInstitution |
| type | enum: `project`, `research-line` | yes | immutable |
| name | string | yes | max 200 chars |
| status | enum: `active`, `archived` | yes | — |
| governance_contract_id | string (UUID) | no | active GovernanceContract |
| treasury_id | string (UUID) | yes | references Treasury |

---

### DigitalInstitution (DIP)

A governed digital organization with chambers, a governance contract, and a legitimacy chain.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| type | enum: `institution`, `laboratory` | yes | immutable |
| name | string | yes | max 200 chars |
| governance_contract_id | string (UUID) | yes | active GovernanceContract |
| legitimacy_chain_head | string (UUID) | yes | latest LegitimacyChain entry |
| status | enum: `active`, `dissolved` | yes | — |

---

### Proposal (DIP)

A governance action submitted for deliberation under a DigitalInstitution's GovernanceContract.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| institution_id | string (UUID) | yes | — |
| submitter_id | string (UUID) | yes | — |
| status | enum: `draft`, `discussion`, `voting`, `approved`, `rejected`, `contested`, `executed` | yes | see lifecycle below |
| proposal_type | string | yes | defined in GovernanceContract |
| content | object | yes | schema defined by proposal_type |
| created_at | timestamp | yes | — |

**Invariants**:
- Status transitions: `draft`→`discussion`→`voting`→`approved`/`rejected`→(optional)`contested`→`executed`
- No backward transitions
- `executed` is terminal

---

### Track (Learn)

A construction plan for building a real project, organized as ordered courses.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| career_id | string (UUID) | yes | — |
| title | string | yes | max 200 chars |
| reference_project_id | string (UUID) | yes | DIP DigitalProject ID; immutable after creation |
| status | enum: `draft`, `published`, `archived` | yes | — |
| creator_id | string (UUID) | yes | — |

**Invariants**:
- `reference_project_id` must resolve to a valid DIP DigitalProject
- Cannot publish without at least one published Course

---

### Fragment (Learn)

The smallest learning unit; must contain Problem, Theory, and Artifact sections.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| course_id | string (UUID) | yes | — |
| title | string | yes | max 200 chars |
| problem | string (markdown) | yes | required section |
| theory | string (markdown) | yes | required section |
| artifact_prompt | string (markdown) | yes | required section |
| published_artifact_id | string (UUID) | no | set once on learner completion; immutable |
| status | enum: `draft`, `published` | yes | — |
| ai_assisted | boolean | yes | — |
| human_approved | boolean | yes | must be `true` before `status = published` |

**Invariants**:
- All three sections (`problem`, `theory`, `artifact_prompt`) required; creation rejected if any missing
- `published_artifact_id` immutable once set

---

### Issue (Hub)

A scoped work item in a DigitalProject requesting a specific Contribution.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| project_id | string (UUID) | yes | DIP DigitalProject ID |
| title | string | yes | max 200 chars |
| description | string (markdown) | yes | — |
| status | enum: `open`, `in_progress`, `in_review`, `closed` | yes | — |
| assignee_id | string (UUID) | no | — |
| created_by | string (UUID) | yes | — |

---

### Contribution (Hub)

An artifact submitted as a response to an Issue; follows a review cycle.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| issue_id | string (UUID) | yes | — |
| contributor_id | string (UUID) | yes | — |
| artifact_id | string (UUID) | yes | DIP Artifact ID |
| status | enum: `submitted`, `in_review`, `accepted`, `rejected`, `integrated` | yes | — |
| review_notes | string | no | — |

**Invariants**:
- Status: `submitted`→`in_review`→`accepted`/`rejected`; `accepted`→`integrated`
- Cannot submit if `issue.status = closed`

---

### Article (Labs)

A versioned scientific article in MyST Markdown format with immutable published versions.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| author_id | string (UUID) | yes | — |
| title | string | yes | max 500 chars |
| myst_source | string (MyST Markdown) | yes | canonical content |
| status | enum: `draft`, `published`, `versioned` | yes | — |
| current_version | string (semver) | yes | increments on each publication |
| doi_record_id | string (UUID) | no | set when DOI registered |
| ai_assisted | boolean | yes | — |
| human_approved | boolean | yes | must be `true` before publication |

**Invariants**:
- Each published version is permanent; content of a published version never changes
- `doi_record_id` immutable once set

---

### Review (Labs)

A peer review of a published Article, linked to specific passages.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| article_id | string (UUID) | yes | — |
| reviewer_id | string (UUID) | yes | reviewer must not be the article author |
| status | enum: `draft`, `published`, `responded` | yes | — |
| content | string (markdown) | yes | — |
| visibility | enum: `visible`, `filtered` | yes | filtered if reviewer reputation below threshold |

**Invariants**:
- `reviewer_id` must differ from `article.author_id`
- Reviews are permanent public record; no deletion

---

### Portfolio (Platform Core)

The verifiable record of a user's contributions across all pillars, derived from the AppendOnlyLog.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| user_id | string (UUID) | yes | 1:1 with Identity User; immutable |
| xp_total | integer | yes | monotonically increasing |
| skill_records | SkillRecord[] | yes | derived from completed Fragments and Contributions |
| achievement_ids | string[] | yes | references Platform Core Achievements |
| collectible_instance_ids | string[] | yes | awarded items |
| last_updated_at | timestamp | yes | — |

**Invariants**:
- Read-only from external callers; written only by Portfolio Aggregation subdomain
- `xp_total` never decreases

---

### AIAgent (AI Agents)

A versioned agent definition with a system prompt, tool set, and activation policy.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| name | string | yes | unique; e.g., `fragment-author-agent` |
| version | string (semver) | yes | — |
| pillar | enum: `learn`, `hub`, `labs`, `cross-pillar` | yes | — |
| system_prompt | string | yes | immutable per version |
| preferred_model | string | yes | e.g., `claude-3-5-sonnet-20241022` |
| status | enum: `active`, `deprecated` | yes | — |

---

### AgentSession (AI Agents)

A single agent interaction session for a user, scoped to a specific agent and context entity.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| agent_id | string (UUID) | yes | references AIAgent |
| user_id | string (UUID) | yes | — |
| context_entity_id | string (UUID) | yes | entity the session is about (Fragment, Issue, etc.) |
| status | enum: `active`, `closed` | yes | — |
| started_at | timestamp | yes | — |
| closed_at | timestamp | no | set on close |

**Invariants**:
- `closed_at` immutable once set; session in `closed` status cannot receive new messages

---

## 3. Entry Points

### Integration Prerequisites

**Environments**:

| Name | Base URL | Purpose |
|------|----------|---------|
| production | `https://api.syntropy.cc/v1` | live traffic |
| staging | `https://staging.api.syntropy.cc/v1` | integration testing |

> **Architecture gap note**: Production and staging URLs are not yet provisioned (system is pre-deployment). The values above are architecture assumptions. Verify against deployment configuration before use.

**API versioning**: Version is embedded in the URL path as `/v1/` — all paths below already include it.

**Credential acquisition**: Call `POST /v1/auth/login` with:
```
email: string — registered user email
password: string — user password
```

Response `200`:
```
access_token: string — use as Bearer token in Authorization header
refresh_token: string — use to obtain a new access_token when expired
expires_in: integer — seconds until access_token expires (typically 3600)
token_type: "bearer"
```

Refresh: `POST /v1/auth/refresh` with `{ refresh_token: string }` → new `access_token`.

**SDK availability**: No official SDK — use the REST API directly.

---

### REST API

Base URL: prefix every path below with the environment base URL above.

Authentication: `Authorization: Bearer {access_token}` required on all non-public endpoints.

#### Identity

##### POST /auth/login
Authenticate and obtain an access token.

**Request**:
```
email: string — body, required
password: string — body, required
```

**Response** `200`: `{ access_token, refresh_token, expires_in, token_type }`

**Errors**: `401` — invalid credentials; `429` — rate limited

---

##### GET /users/me
Return the authenticated user's profile and roles.

**Response** `200`: `{ id, email, display_name, roles[], created_at }`

---

#### DIP — Artifacts

##### POST /artifacts
Publish a new artifact. Triggers DIP identity anchoring.

**Request**:
```
type: string — required, one of: code, scientific-article, dataset, experiment, document, composite
title: string — required, max 500 chars
content_hash: string — required, SHA-256 of artifact content
storage_reference: string — required, Supabase Storage object path
creator_public_key: string — required, secp256k1 public key for Nostr signing
```

**Response** `202`: `{ id, status: "pending_anchoring", anchoring_status: "pending" }`

**Errors**: `400 VALIDATION_ERROR`; `422 DOMAIN_ERROR` — invalid content_hash format

---

##### GET /artifacts/{id}
Retrieve an artifact by ID.

**Response** `200`: Full Artifact object

**Errors**: `404 NOT_FOUND`; `403 FORBIDDEN` — artifact is draft and caller is not creator

---

##### GET /artifacts/{id}/identity-record
Retrieve the Nostr-anchored IdentityRecord for a published artifact.

**Response** `200`: Full IdentityRecord object

**Errors**: `404 NOT_FOUND` — artifact not yet anchored; `422 DOMAIN_ERROR` — anchoring failed

---

#### DIP — Institutions

##### POST /institutions
Create a digital institution with a pre-audited governance template.

**Request**:
```
name: string — required, max 200 chars
type: string — required: institution | laboratory
contract_template_id: string — required, Hub ContractTemplate ID
```

**Response** `201`: `{ id, status: "active", governance_contract_id, legitimacy_chain_head }`

**Errors**: `400 VALIDATION_ERROR`; `422 DOMAIN_ERROR` — invalid contract template

---

##### POST /institutions/{id}/proposals
Submit a governance proposal.

**Request**:
```
proposal_type: string — required, defined in GovernanceContract
content: object — required, schema matches proposal_type
```

**Response** `201`: `{ id, status: "draft" }`

**Errors**: `403 FORBIDDEN`; `422 DOMAIN_ERROR` — proposal type not permitted by contract

---

#### Learn

##### GET /tracks
List published tracks. Public endpoint — no auth required.

**Request** (query): `career_id?: string`, `page?: integer (default: 1)`, `per_page?: integer (default: 20, max: 100)`

**Response** `200`: Paginated list of Track summaries

---

##### POST /tracks/{track_id}/enroll
Enroll the authenticated user in a track.

**Response** `201`: `{ enrollment_id, track_id, user_id, enrolled_at }`

**Errors**: `409 CONFLICT` — already enrolled; `404 NOT_FOUND`

---

##### GET /fragments/{id}
Get a fragment's content for display.

**Response** `200`: Fragment object with `problem`, `theory`, `artifact_prompt` sections

**Errors**: `404 NOT_FOUND`; `403 FORBIDDEN` — fragment not yet unlocked for learner (fog-of-war)

---

#### Hub

##### POST /projects/{project_id}/issues
Create an issue in a project.

**Request**:
```
title: string — required, max 200 chars
description: string — required, markdown
```

**Response** `201`: Issue object with `status: "open"`

**Errors**: `403 FORBIDDEN` — caller lacks `hub:issue:create` permission on project

---

##### POST /issues/{issue_id}/contributions
Submit a contribution (artifact response) to an issue.

**Request**:
```
artifact_id: string — required, published DIP Artifact ID
```

**Response** `201`: Contribution object with `status: "submitted"`

**Errors**: `409 CONFLICT` — issue is closed; `422 DOMAIN_ERROR` — artifact not published

---

#### Labs

##### POST /articles
Create a new article draft.

**Request**:
```
title: string — required, max 500 chars
```

**Response** `201`: Article object with `status: "draft"`

---

##### PUT /articles/{id}/content
Update the MyST Markdown content of a draft article.

**Request**:
```
myst_source: string — required
```

**Response** `200`: Updated Article object

**Errors**: `403 FORBIDDEN`; `422 DOMAIN_ERROR` — article already published (immutable)

---

##### POST /articles/{id}/publish
Publish a specific version of an article, making it public and opening peer review.

**Response** `202`: `{ id, status: "published", current_version, doi_registration_status: "pending" }`

**Errors**: `422 DOMAIN_ERROR` — `human_approved` is false; `409 CONFLICT` — already published at this version

---

#### Platform Core

##### GET /portfolio/{user_id}
Get a user's verifiable portfolio.

**Response** `200`: Portfolio object with `xp_total`, `skill_records[]`, `achievement_ids[]`

**Errors**: `404 NOT_FOUND`; `403 FORBIDDEN` — private portfolio, caller lacks permission

---

##### GET /search
Cross-pillar search across artifacts, tracks, articles, projects, and institutions.

**Request** (query): `q: string — required`, `type?: string — filter by entity type`, `page?: integer`

**Response** `200`: Paginated search results with `entity_type`, `id`, `title`, `relevance_score`

---

#### AI Agents

##### POST /ai-agents/sessions
Start a new agent session for a specific context entity.

**Request**:
```
agent_name: string — required, e.g., "fragment-author-agent"
context_entity_type: string — required, e.g., "fragment"
context_entity_id: string — required, UUID of the entity
```

**Response** `201`: AgentSession object with `status: "active"`

**Errors**: `404 NOT_FOUND` — agent not found; `403 FORBIDDEN` — tool scope insufficient for caller's role

---

##### POST /ai-agents/sessions/{id}/messages
Send a message to an active agent session.

**Request**:
```
content: string — required
```

**Response** `200`: `{ response: string, tool_calls_made: string[], session_id: string }`

**Errors**: `422 DOMAIN_ERROR` — session is closed; `429 RATE_LIMITED`

---

### Events

#### learn.fragment-artifact-engine.artifact_published

Emitted by `Learn` domain when a learner publishes a Fragment artifact.

**Payload**:
```
user_id: string (UUID)
fragment_id: string (UUID)
artifact_id: string (UUID) — DIP Artifact ID assigned
track_id: string (UUID)
course_id: string (UUID)
published_at: timestamp
schema_version: string
```

**Consumers**: Platform Core (Portfolio Aggregation), Platform Core (Search)

---

#### dip.artifact-registry.identity_record_anchored

Emitted by `DIP` Artifact Registry when Nostr anchoring is confirmed.

**Payload**:
```
artifact_id: string (UUID)
identity_record_id: string (UUID)
nostr_event_id: string (64-char hex)
relay_urls: string[]
anchored_at: timestamp
schema_version: string
```

**Consumers**: Platform Core (AppendOnlyLog), Platform Core (Portfolio Aggregation)

---

#### hub.collaboration-layer.contribution_accepted

Emitted by `Hub` when a contribution is accepted by a project maintainer.

**Payload**:
```
contribution_id: string (UUID)
issue_id: string (UUID)
contributor_id: string (UUID)
artifact_id: string (UUID)
project_id: string (UUID)
accepted_at: timestamp
schema_version: string
```

**Consumers**: Platform Core (Portfolio Aggregation), Platform Core (Search), DIP (IACP integration trigger)

---

## 4. Cross-Cutting Contracts

### Authentication

Bearer JWT (Supabase-signed). Include `Authorization: Bearer {access_token}` in every request. Tokens are obtained by calling `POST /v1/auth/login`. Refresh via `POST /v1/auth/refresh` when expired.

Token format: JWT with claims: `sub` (user UUID), `exp` (expiry unix timestamp), `roles` (string array of role names), `email` (string).

Tokens expire after 3600 seconds. Refresh using the `refresh_token` from the login response.

### Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid",
    "details": [
      { "field": "email", "code": "INVALID_FORMAT", "message": "Email must contain '@'" }
    ]
  },
  "meta": {
    "timestamp": "2026-03-12T14:30:00.123Z",
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "api_version": "1.0"
  }
}
```

**Standard error codes**:

| HTTP Status | Code | Meaning |
|-------------|------|---------|
| 400 | `VALIDATION_ERROR` | Request body failed validation; check `details` |
| 401 | `UNAUTHORIZED` | Missing or invalid access_token |
| 403 | `FORBIDDEN` | Authenticated but lacks permission |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Resource already exists or state invariant violated |
| 422 | `DOMAIN_ERROR` | Business rule violation (e.g., IACP phase skipped, Fragment missing section) |
| 429 | `RATE_LIMITED` | Rate limit exceeded; see `Retry-After` header |
| 503 | `SERVICE_UNAVAILABLE` | Upstream dependency unavailable; retry with backoff |

### Pagination

Offset-based pagination on all list endpoints.

**Request parameters**:
```
page: integer — page number (1-indexed), default: 1
per_page: integer — items per page, default: 20, max: 100
```

**Response envelope**:
```
data: array — items for this page
pagination.page: integer
pagination.per_page: integer
pagination.total: integer — total items matching query
pagination.has_next: boolean
meta.timestamp: string
meta.request_id: string
meta.api_version: string
```

### Rate Limits

Per authenticated user per tier. Default tier (Learner): 600 requests per minute. Creator/Researcher: 1200 per minute. Institution Admin: 2400 per minute. Unauthenticated: 60 per minute.

Response when exceeded: HTTP `429` with `Retry-After: {seconds}` header and `RATE_LIMITED` error code.

Rate limit headers on every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

### Idempotency

Idempotency-Key header is supported for all POST mutation endpoints. Include `Idempotency-Key: {uuid}` header. Duplicate requests with the same key within 24 hours return the original response without re-executing.

---

## 5. State and Sequencing Constraints

### Artifact publication lifecycle

- `Artifact` must be created with `status: draft` before publication.
- Calling `POST /artifacts` always creates in `anchoring_status: pending`; poll `GET /artifacts/{id}` until `anchoring_status: anchored` before referencing the `identity_record_id`.
- `status: published` is irreversible; `status: deprecated` is also irreversible.
- An Article requires `human_approved: true` before `POST /articles/{id}/publish` succeeds.

### IACP phase sequencing

- IACP phases must execute in order: Identification → ContractNegotiation → Utilization → UsageRegistration.
- Calling a phase endpoint without completing the prior phase returns `422 DOMAIN_ERROR`.

### Proposal lifecycle

- `Proposal.status` transitions: `draft`→`discussion`→`voting`→`approved`/`rejected`→(optional)`contested`→`executed`.
- `executed` is terminal. No backward transitions.
- Calling `POST /institutions/{id}/proposals/{proposal_id}/execute` on a non-`approved` proposal returns `422 DOMAIN_ERROR`.

### Fragment authoring

- A Fragment requires all three sections (`problem`, `theory`, `artifact_prompt`) before `status` can advance to `published`.
- Setting `status: published` on a Fragment with `human_approved: false` returns `422 DOMAIN_ERROR`.

### Agent sessions

- `AgentSession` in `closed` status cannot receive new messages; `POST /ai-agents/sessions/{id}/messages` returns `422 DOMAIN_ERROR`.
- A new session must be started per context entity; an agent session is not reusable across different Fragment IDs.

---

## 6. Known Failure Modes

### Authentication and authorization

**Wrong**: Send a request without the `Authorization` header.
**Correct**: Include `Authorization: Bearer {access_token}` in every non-public request. Requests without this header return `401 UNAUTHORIZED` immediately.

**Wrong**: Use an expired `access_token` without refreshing.
**Correct**: Check the `exp` claim in the JWT before each request session. If `exp` is within 60 seconds of current time, call `POST /v1/auth/refresh` first.

**Wrong**: Attempt `POST /artifacts` with a Learner-tier account to publish artifacts that require Creator role.
**Correct**: Verify the required permission (`dip:artifact:publish`) is in the user's `roles` before calling. `403 FORBIDDEN` is returned if permission is absent.

### Domain model violations

**Wrong**: Call `POST /articles/{id}/publish` without first setting `human_approved: true` on the article.
**Correct**: AI-assisted articles require explicit human approval. Call `PATCH /articles/{id}` with `{ human_approved: true }` before publishing.

**Wrong**: Reference a DIP Artifact in a Contribution before `anchoring_status: anchored`.
**Correct**: Poll `GET /artifacts/{id}` until `anchoring_status` is `anchored`. A Contribution with an unanchored Artifact returns `422 DOMAIN_ERROR`.

**Wrong**: Submit a Fragment with missing `problem`, `theory`, or `artifact_prompt`.
**Correct**: All three sections are required. Partial Fragment creation returns `422 DOMAIN_ERROR` with details listing missing sections.

### State transition errors

**Wrong**: Call `POST /institutions/{id}/proposals/{proposal_id}/execute` on a Proposal with `status: voting`.
**Correct**: Proposal must reach `status: approved` via the voting phase before execution is permitted.

**Wrong**: Submit a Contribution to a closed Issue.
**Correct**: Check `issue.status` before submission. `status: closed` prevents new Contributions; `409 CONFLICT` is returned.

**Wrong**: Assume Nostr anchoring is synchronous; use `identity_record_id` immediately after `POST /artifacts`.
**Correct**: Anchoring is asynchronous. Poll `GET /artifacts/{id}` with `anchoring_status` check. The `identity_record_id` field is null until `anchoring_status: anchored`.

---

Some domain sections are extended due to token budget constraints.
See [docs/llm/AGENTS-EXTENDED.md](./AGENTS-EXTENDED.md) for: Supporting domain entities (Sponsorship, Communication, Planning, IDE, Governance & Moderation), full AVU/Treasury entity schema, full DOIRecord schema, and complete AgentMemory entity.
