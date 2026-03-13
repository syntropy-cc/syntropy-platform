---
artifact_type: llm-documentation-extended
generated_by: "Vision-to-System Framework / Prompt 01-C"
last_updated: 2026-03-12
parent_document: ./AGENTS.md
completeness: "architecture-only"
---

# Syntropy Ecosystem — LLM Agent Reference (Extended)

> This document extends [AGENTS.md](./AGENTS.md) with additional domain details that exceeded the main document's token budget. Always load AGENTS.md first; this file supplements it.

---

## Section 2 Extension — Additional Domain Entities

### AVU Wallet (DIP)

An Abstract Value Unit ledger entry per user within a DigitalProject or DigitalInstitution treasury.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| user_id | string (UUID) | yes | — |
| treasury_id | string (UUID) | yes | references Treasury of a DigitalProject or DigitalInstitution |
| avu_balance | integer | yes | non-negative; increases via DistributionRun; decreases via liquidation |
| last_distribution_at | timestamp | no | — |

**Invariants**:
- `avu_balance` never negative
- Only the DIP Value Distribution & Treasury subdomain may write to this entity
- Concrete currencies never appear in wallet records; only AVU integers

---

### DOIRecord (Labs)

The record linking a published Article version to a registered Digital Object Identifier.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| article_id | string (UUID) | yes | immutable; references Article |
| article_version | string (semver) | yes | immutable; the version that received the DOI |
| doi | string | yes | immutable; format: `10.{registrant}/{suffix}` |
| doi_registrar | enum: `datacite`, `crossref` | yes | — |
| registered_at | timestamp | yes | immutable |
| metadata | object | yes | JATS XML–compatible metadata at time of registration |

**Invariants**:
- All fields immutable once created
- DOI can only be created for articles in `status: published`

---

### AgentMemory (AI Agents)

A persistent memory record summarizing significant insights from a user's agent sessions, used in future context assembly.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| user_id | string (UUID) | yes | — |
| pillar | enum: `learn`, `hub`, `labs`, `cross-pillar` | yes | — |
| memory_type | enum: `short_term`, `long_term` | yes | short_term TTL-expired; long_term persisted |
| content | string | yes | distilled summary; not raw conversation |
| source_session_id | string (UUID) | yes | references AgentSession |
| created_at | timestamp | yes | — |
| expires_at | timestamp | no | set for short_term; null for long_term |

---

### IDESession (IDE)

An active embedded IDE session with its associated container.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| user_id | string (UUID) | yes | — |
| context_entity_type | enum: `fragment`, `issue`, `experiment` | yes | — |
| context_entity_id | string (UUID) | yes | — |
| language_runtime | enum: `node`, `python`, `base` | yes | — |
| container_status | enum: `provisioning`, `active`, `idle`, `terminated` | yes | — |
| resource_quota | object | yes | `cpu_vcpu`, `memory_mb`, `disk_mb` |
| started_at | timestamp | yes | — |
| last_active_at | timestamp | yes | updated on user action |
| terminated_at | timestamp | no | set on termination |

**Invariants**:
- Container terminates automatically after 30 minutes of inactivity (configurable)
- `resource_quota` enforced at container runtime; exceeding limits terminates the container
- `terminated_at` immutable once set

---

### Thread (Communication)

A contextualized discussion anchored to a specific entity in any domain.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| anchor_entity_type | string | yes | e.g., `fragment`, `article`, `issue`, `artifact` |
| anchor_entity_id | string (UUID) | yes | ID of the anchored entity |
| title | string | yes | max 200 chars |
| status | enum: `open`, `locked`, `archived` | yes | — |
| created_by | string (UUID) | yes | — |

**Invariants**:
- `anchor_entity_id` must resolve at creation time; orphaned anchors are prevented
- Locked threads reject new messages

---

### UserRole (Identity)

A granted role record for a specific user. Roles may be scoped to an entity (institution, project).

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| user_id | string (UUID) | yes | — |
| role_name | enum: `learner`, `creator`, `researcher`, `institution_admin`, `reviewer`, `moderator`, `platform_admin` | yes | — |
| scope_entity_type | string | no | e.g., `institution`, `project`; null = global |
| scope_entity_id | string (UUID) | no | specific entity scope; null = platform-wide |
| granted_at | timestamp | yes | — |
| granted_by | string (UUID) | yes | — |
| revoked_at | timestamp | no | set on revocation |

**Invariants**:
- `revoked_at` immutable once set
- Role grants and revocations may only be initiated by Identity domain (other domains trigger via event bus)

---

### SponsorshipRecord (Sponsorship)

A voluntary financial support record from a sponsor to a creator.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable |
| sponsor_id | string (UUID) | yes | — |
| creator_id | string (UUID) | yes | — |
| tier | enum: `one_time`, `monthly` | yes | — |
| amount_cents | integer | yes | positive integer; currency in `currency` field |
| currency | string (ISO 4217) | yes | e.g., `USD`, `EUR`, `BRL` |
| status | enum: `active`, `cancelled`, `paused` | yes | — |
| stripe_subscription_id | string | no | for monthly; handled by Stripe ACL |
| created_at | timestamp | yes | — |

---

## Section 3 Extension — Additional REST Endpoints

### DIP — IACP Phase Endpoints

##### POST /artifacts/{artifact_id}/iacp/identify
IACP Phase 1: Identification. Register intent to use an artifact.

**Response** `201`: `{ iacp_id, status: "identified" }`

---

##### POST /iacp/{id}/negotiate
IACP Phase 2: Contract negotiation. Submit proposed terms.

**Request**: `{ proposed_terms: object }` (schema defined by ArtifactManifesto)

**Response** `200`: `{ iacp_id, status: "negotiated", agreed_terms: object }`

---

##### POST /iacp/{id}/utilize
IACP Phase 3: Record utilization start.

**Response** `200`: `{ iacp_id, status: "in_use" }`

---

##### POST /iacp/{id}/register-usage
IACP Phase 4: Register completed usage (triggers AVU computation).

**Request**: `{ usage_description: string, used_at: string (ISO 8601) }`

**Response** `200`: `{ iacp_id, status: "completed", avu_computed: integer }`

**Errors**: `422 DOMAIN_ERROR` — phase 3 not completed; `422 DOMAIN_ERROR` — DependencyGraph acyclicity violation

---

### Platform Core — Portfolio and Events

##### GET /portfolio/{user_id}/events
Retrieve the raw AppendOnlyLog entries attributed to a user. Useful for audit.

**Request** (query): `page?: integer`, `per_page?: integer (max 50)`, `since?: timestamp`

**Response** `200`: Paginated list of LogEntry summaries `{ event_type, sequence_number, logged_at, hash }`

**Permission required**: `platform:audit:read` (platform_admin role only) or `user_id = authenticated user`

---

##### GET /recommendations
Get personalized cross-pillar recommendations for the authenticated user.

**Response** `200`: `{ recommendations: [{ entity_type, entity_id, relevance_score, reason }] }`

---

### Communication

##### POST /threads
Create a contextualized discussion thread anchored to an entity.

**Request**:
```
anchor_entity_type: string — required
anchor_entity_id: string (UUID) — required
title: string — required, max 200 chars
```

**Response** `201`: Thread object

---

## Section 5 Extension — Additional Lifecycle Constraints

### AVU computation and treasury

- AVUs are computed only from `POST /iacp/{id}/register-usage` (IACP Phase 4). No other action generates AVUs.
- Liquidation (AVU → fiat currency) is a separate endpoint (`POST /treasury/{id}/liquidate`) and requires Stripe Connect onboarding to be complete for the user.
- The oracle rate (AVU → currency conversion) is set by platform admins and is not configurable per institution.

### IDESession lifecycle

- `POST /ide/sessions` creates a session and begins container provisioning (state: `provisioning`).
- Do not attempt code execution until `container_status: active`. Poll `GET /ide/sessions/{id}` until `active`.
- Inactivity timeout is 30 minutes. After timeout the container terminates; a new session must be created.
- Resource quota enforcement is at the container level; quota violations produce a `503 SERVICE_UNAVAILABLE` from the code execution endpoint.

### Nostr anchoring race condition prevention

- Never attempt to use `identity_record_id` as a reference before confirming `anchoring_status: anchored`.
- Anchoring takes 1–30 seconds depending on relay response. Build polling with exponential backoff (2s, 4s, 8s, 16s, max 60s).
- If `anchoring_status: failed` is returned, the artifact was recorded in the platform but is not externally anchored. Contact platform support to retry.

---

## Section 6 Extension — Additional Failure Modes

**Wrong**: Call `POST /iacp/{id}/utilize` before `POST /iacp/{id}/negotiate` is accepted.
**Correct**: IACP phases must execute in strict order. Phase 2 must return `status: negotiated` before Phase 3 is accepted.

**Wrong**: Use AVU balance from the wallet to calculate expected fiat payout without checking the oracle rate.
**Correct**: Fetch the current oracle rate from `GET /treasury/oracle-rates?currency=USD` (or applicable currency) before computing expected liquidation value.

**Wrong**: Create an Article with `human_approved: true` in the same request.
**Correct**: The `human_approved` field defaults to `false` and can only be set by a separate `PATCH /articles/{id}` call after the author reviews the AI-assisted content. Setting it at creation is ignored.

**Wrong**: Submit multiple IACP Phase 4 registration requests for the same usage event to get multiple AVU computations.
**Correct**: Phase 4 is idempotent using `Idempotency-Key` header. Duplicate registrations return the original Phase 4 response without computing additional AVUs.
