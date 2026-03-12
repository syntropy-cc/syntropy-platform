# Collaboration Layer — Subdomain Architecture

> **Document Type**: Subdomain Architecture Document (Level 3 - Component)
> **Parent Domain**: [Hub](../ARCHITECTURE.md)
> **Root Architecture**: [System Architecture](../../../ARCHITECTURE.md)
> **Last Updated**: 2026-03-12
> **Subdomain Owner**: Syntropy Core Team

## Metadata

| Field | Value |
|-------|-------|
| **Subdomain Type** | Core Domain |
| **Parent Domain** | Hub |
| **Boundary Model** | Internal Module (within Hub domain) |
| **Implementation Status** | Not Started |

---

## Business Scope

### What This Subdomain Solves

The Collaboration Layer is the heart of Hub — it provides the structured collaboration model that makes digital project work verifiable and organized. Issue, Contribution, and HackinDimension are Hub-exclusive concepts that solve the problem of "informal collaboration without attribution." When a Contribution is accepted and integrated, it becomes a DIP-anchored artifact with the contributor's cryptographic signature — permanent, verifiable proof of their contribution.

### Subdomain Classification Rationale

**Type**: Core Domain. The combination of structured Issue/Contribution lifecycles with automatic DIP artifact creation on contribution acceptance, plus the HackinDimension model for time-bounded collaborative events, constitutes novel collaboration infrastructure.

---

## Aggregate Roots

### Issue

**Responsibility**: Define discrete units of work; manage work assignment and review status.

**Domain Events emitted**:
- `hub.issue.created` — when an Issue is opened
- `hub.issue.closed` — when an Issue transitions to Closed

```mermaid
stateDiagram-v2
    [*] --> Open : create()
    Open --> InProgress : assign()
    InProgress --> InReview : submit_for_review()
    InReview --> InProgress : request_changes()
    InReview --> Closed : accept()
    Open --> Closed : close_without_implementation()
```

### Contribution

**Responsibility**: Track submitted work products; manage review lifecycle; trigger DIP artifact publication on acceptance.

**Domain Events emitted**:
- `hub.contribution.submitted` — Submitted state
- `hub.contribution.integrated` — Integrated state (after DIP publication)

```mermaid
stateDiagram-v2
    [*] --> Submitted : submit()
    Submitted --> InReview : assign_reviewer()
    InReview --> Accepted : accept()
    InReview --> Rejected : reject()
    Accepted --> Integrated : integrate()[DIP publication successful]
    Rejected --> [*]
    Integrated --> [*]
```

### HackinDimension

**Responsibility**: Manage structured collaborative events; create challenge-specific Issues; aggregate Contributions from the event.

**Domain Events emitted**:
- `hub.hackin.started` — event begins
- `hub.hackin.completed` — event concludes (with participation summary)

```mermaid
erDiagram
    ISSUE {
        uuid id PK
        uuid project_id FK
        string dip_project_id
        string title
        text description
        jsonb acceptance_criteria
        string status
        uuid assignee_id FK
        uuid reporter_id FK
        uuid hackin_dimension_id FK
        timestamp created_at
        timestamp closed_at
    }

    CONTRIBUTION {
        uuid id PK
        uuid project_id FK
        uuid contributor_id FK
        string title
        text description
        string status
        string dip_artifact_id
        uuid hackin_dimension_id FK
        timestamp submitted_at
        timestamp accepted_at
        timestamp integrated_at
    }

    CONTRIBUTION_ISSUE_LINK {
        uuid contribution_id FK
        uuid issue_id FK
    }

    HACKIN_DIMENSION {
        uuid id PK
        uuid project_id FK
        string title
        text description
        jsonb challenge_definition
        timestamp start_at
        timestamp end_at
        string status
    }

    ISSUE ||--o{ CONTRIBUTION_ISSUE_LINK : "addressed by"
    CONTRIBUTION ||--o{ CONTRIBUTION_ISSUE_LINK : "addresses"
    HACKIN_DIMENSION ||--o{ CONTRIBUTION : "generates"
    HACKIN_DIMENSION ||--o{ ISSUE : "creates"
```

---

## Domain Services

| Service | Responsibility | Operates On |
|---------|---------------|-------------|
| `ContributionIntegrationService` | On Contribution acceptance: calls DIP ACL adapter to publish artifact; sets dip_artifact_id; closes linked Issues if criteria met | Contribution, Issue aggregates, DIP adapter |
| `HackinEventOrchestrator` | Manages HackinDimension lifecycle; creates structured Issues from challenge definition; aggregates participation records | HackinDimension aggregate |

---

## Traceability

| Vision Element | Section | How This Subdomain Implements It |
|----------------|---------|----------------------------------|
| Structured contribution workflow (cap. 28) | §28 | Contribution lifecycle with DIP artifact creation on acceptance |
| Issue system (cap. 29) | §29 | Issue lifecycle from Open to Closed |
| Hackin model (cap. 30) | §30 | HackinDimension for time-bounded collaborative events |
