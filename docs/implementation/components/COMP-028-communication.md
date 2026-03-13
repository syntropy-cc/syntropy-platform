# Communication Implementation Record

> **Component ID**: COMP-028
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/communication/ARCHITECTURE.md](../../architecture/domains/communication/ARCHITECTURE.md)
> **Stage Assignment**: S11 — Supporting Domains
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Communication is a **Generic Subdomain** providing messaging, thread management, and notifications. A `Thread` is always anchored to a specific entity (Issue, Contribution, Article, Review, Sandbox) — there are no free-floating threads. `Notification` preferences control how and when users receive alerts across channels. The system supports both synchronous notifications (platform UI) and asynchronous delivery (email, push).

**Responsibilities**:
- Manage `Thread` lifecycle anchored to domain entities
- Manage `Reply` and `Message` entities within threads
- Deliver `Notification` to users via configured channels
- Subscribe to domain events to create automatic notifications

**Key Interfaces**:
- Internal API: thread management, notification delivery
- Public API: user notification preferences

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 7 |
| **Total** | **7** |

**Component Coverage**: 0%

### Item List

#### [COMP-028.1] Package setup, Thread and Message aggregates

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | communication/ARCHITECTURE.md |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up `packages/communication` and implement Thread and Message entities.

**Acceptance Criteria**:
- [ ] `packages/communication` fully scaffolded
- [ ] `Thread` aggregate: `id`, `anchor_type`, `anchor_id`, `title (optional)`, `participant_ids[]`, `status (open|closed)`, `created_by`, `created_at`
- [ ] Invariant: Thread cannot be created without `anchor_type` and `anchor_id`
- [ ] `Reply` entity: `thread_id`, `author_id`, `content`, `created_at`, `updated_at`
- [ ] `Message` entity (direct, not threaded): `sender_id`, `recipient_id`, `content`, `sent_at`
- [ ] Unit tests: unanchored thread creation throws

**Files Created/Modified**:
- `packages/communication/src/domain/thread.ts`
- `packages/communication/src/domain/reply.ts`
- `packages/communication/src/domain/message.ts`

---

#### [COMP-028.2] Notification entity and preferences

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | communication/ARCHITECTURE.md |
| **Dependencies** | COMP-028.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `Notification` entity and `NotificationPreference` entity for per-user channel configuration.

**Acceptance Criteria**:
- [ ] `Notification` entity: `id`, `recipient_id`, `notification_type`, `anchor_type`, `anchor_id`, `content (JSONB)`, `channel (platform|email|push)`, `status (pending|delivered|read)`, `created_at`
- [ ] `NotificationPreference` entity: `user_id`, `notification_type`, `enabled_channels[]`, `quiet_hours (JSONB)`
- [ ] Default: all notification types enabled on platform channel

**Files Created/Modified**:
- `packages/communication/src/domain/notification.ts`
- `packages/communication/src/domain/notification-preference.ts`

---

#### [COMP-028.3] NotificationService

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | communication/ARCHITECTURE.md |
| **Dependencies** | COMP-028.2 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement `NotificationService` that creates and delivers notifications based on user preferences.

**Acceptance Criteria**:
- [ ] `NotificationService.notify(recipientId, type, anchor, content)` checks preferences, creates Notification records per enabled channel
- [ ] Email delivery via `EmailAdapter` (ACL wrapping transactional email provider)
- [ ] Platform notifications stored and served via SSE or polling
- [ ] Respects quiet hours — queues during off-hours, delivers at window start

**Files Created/Modified**:
- `packages/communication/src/application/notification-service.ts`
- `packages/communication/src/infrastructure/email-adapter.ts`

---

#### [COMP-028.4] Domain event consumers for automatic notifications

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | communication/ARCHITECTURE.md |
| **Dependencies** | COMP-028.3, COMP-009 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement Kafka consumers that subscribe to domain events and trigger appropriate notifications.

**Acceptance Criteria**:
- [ ] `hub.contribution.submitted` → notify project maintainers
- [ ] `labs.review.submitted` → notify article authors
- [ ] `learn.mentorship.proposed` → notify mentor
- [ ] `labs.review.published` → notify article author
- [ ] Consumer group: `communication-notification-triggers`
- [ ] All notification consumers use `NotificationService`

**Files Created/Modified**:
- `packages/communication/src/infrastructure/consumers/notification-event-consumer.ts`

---

#### [COMP-028.5] Repository and PostgreSQL implementation

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | communication/ARCHITECTURE.md, ADR-004 |
| **Dependencies** | COMP-028.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Repository and migration for communication entities.

**Acceptance Criteria**:
- [ ] Repositories for Thread, Reply, Message, Notification, NotificationPreference
- [ ] Migration with proper indexes: `threads(anchor_type, anchor_id)`, `notifications(recipient_id, status)`

**Files Created/Modified**:
- `packages/communication/src/infrastructure/repositories/`
- `packages/communication/src/infrastructure/migrations/001_communication.sql`

---

#### [COMP-028.6] Internal and public API endpoints

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | communication/ARCHITECTURE.md |
| **Dependencies** | COMP-028.5 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: REST API for thread management and notifications.

**Acceptance Criteria**:
- [ ] `POST /internal/communication/threads` → create thread for anchor
- [ ] `GET /internal/communication/threads/{anchor_type}/{anchor_id}` → thread for entity
- [ ] `POST /internal/communication/threads/{id}/replies` → add reply
- [ ] `GET /api/v1/notifications` → user's notifications (paginated)
- [ ] `PATCH /api/v1/notifications/{id}/read` → mark read
- [ ] `GET/PUT /api/v1/notification-preferences` → user preferences

**Files Created/Modified**:
- `packages/communication/src/api/routes/threads.ts`
- `packages/communication/src/api/routes/notifications.ts`

---

#### [COMP-028.7] Real-time notification delivery (SSE)

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | communication/ARCHITECTURE.md |
| **Dependencies** | COMP-028.6 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement SSE endpoint for real-time notification delivery to connected clients.

**Acceptance Criteria**:
- [ ] `GET /api/v1/notifications/stream` → SSE stream for authenticated user
- [ ] New notifications pushed immediately via SSE
- [ ] Heartbeat every 30s to keep connection alive
- [ ] Client reconnection handled with `Last-Event-ID`

**Files Created/Modified**:
- `packages/communication/src/api/routes/notification-stream.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-002 Identity | Internal | ⬜ Not Started | User identity |
| COMP-009 Event Bus & Audit | Internal | ⬜ Not Started | Domain events for notifications |
| Email provider (SES/SendGrid) | External | ✅ Available | Email delivery |

---

## References

### Architecture Documents

- [Communication Domain Architecture](../../architecture/domains/communication/ARCHITECTURE.md)
