---
artifact_type: llm-documentation
generated_by: "Vision-to-System Framework / Prompt {01-C | 07 | 08c}"
last_updated: {YYYY-MM-DD}
token_budget: 4000
system_version: "{version from ARCHITECTURE.md}"
completeness: "{architecture-only | complete}"
---

<!-- GENERATION INSTRUCTIONS (remove this block when generating)

This template is filled top-to-bottom by the generating agent.

SOURCE DOCUMENTS:
- System Identity              ← docs/architecture/ARCHITECTURE.md (System Purpose section)
- Domain Model                 ← docs/architecture/domains/*/ARCHITECTURE.md (Data Architecture + ERD)
- Integration Prerequisites    ← docs/architecture/platform/*/ARCHITECTURE.md (environments, versioning)
                                  docs/architecture/cross-cutting/security/ARCHITECTURE.md (credential flow)
                                  docs/architecture/ARCHITECTURE.md (SDK, tech stack)
- Entry Points (API)           ← docs/architecture/domains/*/ARCHITECTURE.md (API Design sections)
- Entry Points (CLI)           ← docs/architecture/platform/*/ARCHITECTURE.md (Command interface sections)
- Entry Points (Evts)          ← docs/architecture/domains/*/ARCHITECTURE.md (Event Contracts sections)
- Cross-Cutting                ← docs/architecture/cross-cutting/*/ARCHITECTURE.md (all sections)
- State/Sequencing             ← domain docs (state machine diagrams, sequence diagrams)
- Failure Modes                ← architecture inference at 01-C; code scan at 07

CRITICAL SELF-CONTAINMENT RULE:
An agent building an integration reads ONLY this file. It must never need to access docs/architecture/,
docs/user/, docs/context/, or any other directory. Before completing generation, verify:
  Can an agent make its first valid authenticated API call using only this document?
  → If not, add the missing information inline. Do not point to another document.

COMPRESSION RULES PER SECTION:
- Identity: 3–5 sentences verbatim from architecture, no adjectives, no rationale
- Domain Model: every field typed; omit field descriptions if the name is self-evident
- Entry Points: every endpoint/command; omit fields that have no constraints; add error codes verbatim
- Cross-Cutting: every contract complete; explanatory text one sentence max
- State/Sequencing: one rule per line; omit any rule inferable from domain model invariants
- Failure Modes: minimum 5 entries; wrong→correct format only; no explanations

EXCLUSIONS (never write these):
- Architecture rationale or ADR references
- UX principles, design decisions, visual direction
- Implementation notes or development conventions
- Links to external documents
- Any content that does not help an agent use the system correctly

TOKEN BUDGET: Target 4,000. Hard limit 6,000. If over limit, move lowest-priority domain
sections to docs/llm/AGENTS-EXTENDED.md and add a reference note here.

END GENERATION INSTRUCTIONS -->

# {System Name} — LLM Agent Reference

<!-- SECTION 1: IDENTITY
Extract from ARCHITECTURE.md → System Purpose.
Write 3–5 sentences: what the system does, who its consumers are, what it explicitly does not do.
No adjectives. No vision language. No rationale.
-->

## 1. System Identity

{System name} {verb phrase describing core function}. {Primary consumer description — who calls this system and for what purpose}. {Second sentence if needed to clarify operational scope}. The system does not {explicit boundary 1 — what an agent might assume but is wrong}. The system does not {explicit boundary 2}.

---

<!-- SECTION 2: DOMAIN MODEL
Extract from each domain's ARCHITECTURE.md → Data Architecture section and ERD diagrams.
One entity block per entity. Every field must have a type.
Do not summarize or paraphrase entity definitions — extract them.
At 01-C: fill from architecture. At 07: verify against src/ entity classes.
-->

## 2. Domain Model

<!-- One block per entity. Repeat the structure below for each entity across all domains. -->

### {EntityName}

{One sentence: what this entity represents in the domain.}

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable after creation |
| {field_name} | {type} | {yes/no} | {constraint, or "none"} |
| {field_name} | {type} | {yes/no} | {constraint, or "none"} |

**Relationships**:
- {belongs to / has many / references} {EntityName} via `{field_name}`

**Invariants**:
- {rule that must always hold — e.g., "status must be 'active' when billing_date is set"}
- {additional invariant}

---

<!-- Repeat for each entity in each domain -->

### {EntityName}

{One sentence: what this entity represents.}

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string (UUID) | yes | immutable after creation |
| {field_name} | {type} | {yes/no} | {constraint, or "none"} |

**Relationships**:
- {relationship}

**Invariants**:
- {invariant}

---

<!-- SECTION 3: ENTRY POINTS
Extract from each domain's ARCHITECTURE.md → API Design + Event Contracts sections.
Extract from platform docs → CLI command definitions.
Extract Integration Prerequisites from: platform docs (environments, versioning), cross-cutting/security
  (credential acquisition), architecture root (SDK availability).
Every public interface must appear. No endpoint, command, or event may be omitted.
This section must be self-contained: an agent reads it and makes its first call without consulting
any other document. The Integration Prerequisites subsection must NOT carry TODO markers.
At 01-C: fill everything from architecture. At 07: verify method signatures and error codes against src/.
-->

## 3. Entry Points

<!-- ── INTEGRATION PREREQUISITES ────────────────────────────────── -->
<!-- This subsection is MANDATORY. Fill it entirely from architecture at 01-C.
     No TODO markers are permitted here — this information must exist in the architecture.
     An agent that cannot find this information here has no other document to consult.
-->

### Integration Prerequisites

**Environments**:

| Name | Base URL | Purpose |
|------|----------|---------|
| production | `{https://api.example.com}` | live traffic |
| staging | `{https://staging-api.example.com}` | integration testing |

<!-- Add or remove rows as needed. If only one environment exists, state that explicitly. -->

**API versioning**: {Version is embedded in the URL path as `{/v1/}` — all paths below already include it. | Version is specified via `Accept-Version: {format}` header. | All endpoints are unversioned.}

**Credential acquisition**: {Describe the complete process an agent uses to obtain its first usable token or API key.}

To obtain credentials: call `{METHOD} {/auth/endpoint}` with:
```
{field_name}: {type} — {description}
{field_name}: {type} — {description}
```

Response `{2xx status}`:
```
{credential_field}: {type} — {use this as the Bearer token | API key | value for X-Api-Key header}
expires_in: integer — seconds until credential expires
```

<!-- If credential acquisition requires an out-of-band step (e.g., developer portal registration),
     describe the step completely here. Do not say "register at the portal" — say what the portal
     returns and how to use the returned value. -->

**SDK availability**: {No official SDK — use the REST API or CLI directly. | Official SDKs available: {language} (`{install command}`); {language} (`{install command}`).}

---

<!-- ── REST API ─────────────────────────────────────────────────── -->
<!-- Add this subsection only if the system exposes REST endpoints. -->

### REST API

<!-- Base URL note: state here if the base URL is environment-specific -->
Base URL: `{https://api.example.com/v1}` — prefix every path below with this value.

#### {Resource Group Name}

##### {METHOD} {/path/with/{param}}

{One sentence: what this operation does.}

**Request**:
```
{param_name}: {type} — path parameter, {constraint}
{header_name}: {type} — header, {constraint}
{field_name}: {type} — body, required, {constraint}
{field_name}: {type} — body, optional, default: {value}
```

**Response** `{2xx status}`:
```
{field_name}: {type}
{field_name}: {type}
{field_name}: {type}
```

**Errors**: `{4xx}` — {condition that causes this}; `{4xx}` — {condition}; `{5xx}` — {condition}

---

##### {METHOD} {/path}

{One sentence: what this operation does.}

**Request**:
```
{field_name}: {type} — {constraint}
```

**Response** `{2xx status}`:
```
{field_name}: {type}
```

**Errors**: `{code}` — {condition}

---

<!-- ── CLI COMMANDS ──────────────────────────────────────────────── -->
<!-- Add this subsection only if the system exposes CLI commands. -->

### CLI Commands

#### {program} {command} {subcommand}

{One sentence: what this command does.}

**Usage**: `{program} {command} [options] <required-arg>`

**Arguments**:
- `<arg-name>` — {type}, {description}

**Options**:
- `--{flag} <value>` — {type}, default: `{value}`, {description}
- `--{flag}` — boolean flag, {description}

**Exit codes**: `0` — success; `1` — {condition}; `2` — {condition}

---

<!-- ── EVENTS ────────────────────────────────────────────────────── -->
<!-- Add this subsection only if the system publishes or consumes events. -->

### Events

#### {EventName}

Emitted by `{domain}` when {condition that triggers emission}.

**Payload**:
```
{field_name}: {type}
{field_name}: {type}
{field_name}: {type}
```

**Consumers**: {domain or service that subscribes to this event}

---

<!-- SECTION 4: CROSS-CUTTING CONTRACTS
Extract from docs/architecture/cross-cutting/*/ARCHITECTURE.md.
State each contract once. Complete. Verbatim where possible.
If a contract does not apply, state "not applicable — {one-sentence reason}".
At 01-C: fill from architecture. At 07: verify token formats and error codes against src/.
-->

## 4. Cross-Cutting Contracts

### Authentication

<!-- State the mechanism, header, and how a token is obtained. -->

{Mechanism — e.g., Bearer JWT / API Key / mTLS}. Include `{Header-Name}: {format}` in every request. Tokens are obtained by calling `{endpoint or method}`.

Token format: `{description — e.g., JWT with claims: sub (user ID), exp (expiry), roles (array)}`

Tokens expire after `{duration}`. Refresh by `{method}`.

### Error Format

Every error response uses this JSON structure:

```json
{
  "error": {
    "code": "string — machine-readable code",
    "message": "string — human-readable explanation",
    "details": [
      {
        "field": "string — affected field, omitted if not field-specific",
        "reason": "string — specific validation failure"
      }
    ],
    "request_id": "string — trace ID for support"
  }
}
```

**Standard error codes**:

| HTTP Status | Code | Meaning |
|-------------|------|---------|
| 400 | `VALIDATION_ERROR` | Request body failed validation; check `details` |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 403 | `FORBIDDEN` | Authenticated but lacks permission for this operation |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Operation conflicts with current resource state |
| 422 | `UNPROCESSABLE` | Request is valid but violates a business rule |
| 429 | `RATE_LIMITED` | Rate limit exceeded; see Retry-After header |
| 500 | `INTERNAL_ERROR` | Server error; retry with exponential backoff |

<!-- Add system-specific codes below: -->
| {status} | `{CODE}` | {meaning} |

### Pagination

<!-- State the pagination pattern exactly. -->

{Cursor-based | Offset-based} pagination.

**Request parameters**:
```
{limit | page_size}: integer — items per page, default: {N}, max: {N}
{cursor | offset | page}: {type} — {description}
```

**Response envelope**:
```
data: array — the items for this page
{next_cursor | next_page | total}: {type} — {description}
has_more: boolean — true if additional pages exist
```

### Rate Limits

<!-- State limits, scope, and the response when exceeded. -->

{N} requests per {unit time} per {scope: user / IP / API key / global}.

Response when exceeded: HTTP `429` with `Retry-After: {seconds}` header and `RATE_LIMITED` error code.

`rate-limits: not applicable — {reason}` ← use this if no rate limits exist.

### Idempotency

<!-- State whether idempotency is supported and how. -->

{Idempotency-Key header is supported for all mutation endpoints. | Idempotency is not applicable — all mutations are naturally idempotent. | Idempotency is not supported.}

To use: include `Idempotency-Key: {uuid}` header. Duplicate requests with the same key within `{TTL}` return the original response without re-executing.

---

<!-- SECTION 5: STATE AND SEQUENCING CONSTRAINTS
Extract from domain architecture docs: state machine diagrams, sequence diagrams.
One rule per line. Group by entity or operation.
At 01-C: fill from architecture state machines. At 07: verify against src/ state logic.
-->

## 5. State and Sequencing Constraints

<!-- One block per entity with a meaningful lifecycle, and one block per multi-step operation. -->

### {EntityName} lifecycle

- `{EntityName}` must exist before any `{RelatedEntity}` references it via `{field_name}`.
- Status transitions are: `{state_a}` → `{state_b}` → `{state_c}`. No other transitions are valid.
- Transitioning from `{state_x}` to `{state_y}` is irreversible.
- `{EntityName}` in status `{blocked_state}` cannot be {operation — e.g., updated, deleted}.
- `{field_name}` must be set before status can advance to `{state}`.

### {OperationName} sequencing

- `{prerequisite operation}` must complete successfully before `{dependent operation}` is called.
- Calling `{endpoint}` without first calling `{prerequisite endpoint}` returns `{error code}`.
- `{operation A}` and `{operation B}` must not be called concurrently for the same `{EntityName}.id`.

---

<!-- SECTION 6: KNOWN FAILURE MODES
At 01-C: add architecture-inferable failures (wrong sequencing, missing required fields, wrong state transitions).
At 07: add implementation-observed failures (actual error conditions from src/ code scan, guard clauses, validators).
Minimum 5 entries. Format: Wrong → Correct. No explanations beyond one sentence.
-->

## 6. Known Failure Modes

### Authentication and authorization

**Wrong**: Send request without `{Header-Name}` header.
**Correct**: Include `{Header-Name}: Bearer {token}` in every request. Requests without this header return `401 UNAUTHORIZED` immediately.

**Wrong**: Use an expired token without checking `exp` claim before calling.
**Correct**: Check token expiry before each request session. Refresh the token if `exp` is within {buffer duration} of current time.

### Domain model violations

**Wrong**: Create `{RelatedEntity}` before creating its parent `{EntityName}`.
**Correct**: Create `{EntityName}` first, capture the returned `id`, then pass it as `{field_name}` when creating `{RelatedEntity}`.

**Wrong**: Send `{field_name}` as `null` when creating `{EntityName}` with status `{state}`.
**Correct**: `{field_name}` is required when status is `{state}`. Include a non-null value or set status to `{alternative_state}` first.

### State transition errors

**Wrong**: Call `{endpoint}` on `{EntityName}` with status `{wrong_state}`.
**Correct**: Check `{EntityName}.status` before calling `{endpoint}`. This endpoint requires status `{required_state}`. If status is `{wrong_state}`, call `{prerequisite endpoint}` first.

### Common misuse patterns

<!-- TODO: populate at Prompt 07 — add implementation-observed failures from src/ error handlers and guard clauses -->

**Wrong**: Assume `{operation}` is idempotent and retry without checking the response.
**Correct**: {Correct retry strategy specific to this system's idempotency contract}.

**Wrong**: Parse only the top-level `error.code` field when handling errors.
**Correct**: Check `error.details` for field-level validation failures. `VALIDATION_ERROR` responses always include at least one entry in `details`.

---

<!-- OVERFLOW NOTE (add only if AGENTS-EXTENDED.md was created):

Some domain sections are extended due to token budget constraints.
See docs/llm/AGENTS-EXTENDED.md for: {list of extended sections}.

-->
