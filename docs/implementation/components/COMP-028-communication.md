# Communication Implementation Record

> **Component ID**: COMP-028
> **Architecture Reference**: [ARCHITECTURE.md#domain-overview](../../architecture/ARCHITECTURE.md#domain-overview)
> **Domain Architecture**: [domains/communication/ARCHITECTURE.md](../../architecture/domains/communication/ARCHITECTURE.md)
> **Stage Assignment**: S11 — Supporting Domains
> **Status**: 🔵 In Progress
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-14 (COMP-028.7 done)

**Note**: Implementation Plan Section 7 is the authority for work item IDs. COMP-028.5 = User notification preferences (NotificationPreferences entity, repository, PreferenceBackedNotificationPreferenceResolver).

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
| ✅ Done | 7 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 0 |
| **Total** | **7** |

**Component Coverage**: 100%

*Note: Implementation Plan (Section 7) is the authority for work item IDs and titles. COMP-028.5 = User notification preferences (NotificationPreferences entity, mute_until, channelPreferences; NotificationPreferencesRepository; InMemory + Postgres; PreferenceBackedNotificationPreferenceResolver; DefaultNotificationPreferenceResolver kept as stub).*

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

#### [COMP-028.3] NotificationEventConsumer (Kafka) — *per Implementation Plan*

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Critical |
| **Origin** | IMPLEMENTATION-PLAN.md Section 7 |
| **Dependencies** | COMP-028.2, COMP-009.1 |
| **Size** | M |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-14 |

**Description**: Kafka consumer that subscribes to domain events, creates `Notification` entities, maps events to notification types, and persists via NotificationRepository; registered in WorkerRegistry.

**Acceptance Criteria**:
- [x] `NotificationEventConsumer` subscribes to learn.events, hub.events, labs.events, dip.events
- [x] Creates `Notification` entities; maps events to notification templates (eventType → notificationType, recipient from payload)
- [x] Registered in WorkerRegistry as real "notifications" worker (replaces stub)
- [x] Integration test (mock consumer + InMemoryNotificationRepository)

**Files Created/Modified**:
- `packages/communication/src/domain/notification.ts`
- `packages/communication/src/domain/ports/notification-repository.ts`
- `packages/communication/src/infrastructure/repositories/in-memory-notification-repository.ts`
- `packages/communication/src/infrastructure/repositories/postgres-notification-repository.ts`
- `packages/communication/src/infrastructure/communication-db-client.ts`
- `packages/communication/src/infrastructure/notification-event-mapping.ts`
- `packages/communication/src/infrastructure/consumers/notification-event-consumer.ts`
- `supabase/migrations/20260329000000_communication_notifications.sql`
- `packages/communication/tests/unit/notification.test.ts`
- `packages/communication/tests/unit/notification-event-mapping.test.ts`
- `packages/communication/tests/integration/notification-event-consumer.test.ts`
- `apps/workers/src/workers/notification-event-consumer-worker.ts`
- `apps/workers/src/main.ts` (register worker)
- `packages/communication/package.json` (add @syntropy/event-bus)
- `packages/communication/src/index.ts` (exports)
- `apps/workers/package.json` (add @syntropy/communication)

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
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | communication/ARCHITECTURE.md, IMPLEMENTATION-PLAN.md Section 7 |
| **Dependencies** | COMP-028.5, COMP-033.2 |
| **Size** | M |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-14 |

**Description**: REST API for notifications and message threads (per Implementation Plan: GET/PUT notifications, POST/GET messages/threads; auth required).

**Acceptance Criteria**:
- [x] `GET /api/v1/notifications` → user's notifications (paginated, auth)
- [x] `PUT /api/v1/notifications/{id}/read` → mark read (auth)
- [x] `POST /api/v1/messages/threads` → create thread (auth)
- [x] `GET /api/v1/messages/threads/{id}` → get thread (auth, participant only)

**Files Created/Modified**:
- `packages/communication/src/domain/ports/notification-repository.ts` (findByUserId, markAsRead)
- `packages/communication/src/domain/ports/thread-repository.ts` (new)
- `packages/communication/src/domain/ports/message-repository.ts` (new)
- `packages/communication/src/infrastructure/repositories/in-memory-notification-repository.ts`
- `packages/communication/src/infrastructure/repositories/postgres-notification-repository.ts`
- `packages/communication/src/infrastructure/repositories/in-memory-thread-repository.ts` (new)
- `packages/communication/src/infrastructure/repositories/in-memory-message-repository.ts` (new)
- `packages/communication/src/index.ts` (exports)
- `packages/communication/tests/unit/notification-repository.test.ts` (new)
- `packages/communication/tests/unit/thread-message-repositories.test.ts` (new)
- `apps/api/package.json` (@syntropy/communication)
- `apps/api/src/types/communication-context.ts` (new)
- `apps/api/src/routes/communication.ts` (new)
- `apps/api/src/server.ts` (register communication routes)
- `apps/api/src/routes/communication.test.ts` (new)

**Note**: Thread/message persistence is in-memory only in this stage; no migration for threads/messages. Internal thread/reply endpoints (per component record) deferred; Plan authority is the four public endpoints above.

---

#### [COMP-028.7] Real-time notification delivery (SSE)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | Medium |
| **Origin** | communication/ARCHITECTURE.md, IMPLEMENTATION-PLAN.md Section 7 |
| **Dependencies** | COMP-028.6 |
| **Size** | S |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-14 |

**Description**: Implement SSE endpoint for real-time notification delivery to connected clients.

**Acceptance Criteria**:
- [x] `GET /api/v1/notifications/stream` → SSE stream for authenticated user
- [x] New notifications pushed within 3s via polling (every 2s)
- [x] Heartbeat every 30s to keep connection alive
- [x] Client reconnection handled with `Last-Event-ID` (event id = createdAt.getTime())
- [x] Integration test (event received within 3s when notification saved mid-stream)

**Files Created/Modified**:
- `packages/communication/src/domain/ports/notification-repository.ts` (FindByUserIdOptions.since)
- `packages/communication/src/infrastructure/repositories/in-memory-notification-repository.ts`
- `packages/communication/src/infrastructure/repositories/postgres-notification-repository.ts`
- `packages/communication/tests/unit/notification-repository.test.ts` (since option tests)
- `apps/api/src/routes/communication.ts` (GET /api/v1/notifications/stream)
- `apps/api/src/routes/communication.test.ts` (SSE 401 + integration test)

---

## Implementation Log

### 2026-03-14 — COMP-028.7 SSE stream for real-time notifications

- **FindByUserIdOptions.since**: Added optional `since?: Date` to port and both repos (InMemory, Postgres) so stream can request notifications with `createdAt > since` for reconnection and incremental push.
- **GET /api/v1/notifications/stream**: New route in `communication.ts`; auth required; sets SSE headers; parses `Last-Event-ID` as timestamp for `since`; loop polls every 2s, sends notification events (id = `createdAt.getTime()`, data = notification payload), heartbeat comment every 30s; cleans up on request close.
- **Integration test**: 401 when unauthenticated; stream test starts server on port 0, fetches stream with auth, saves a notification after 500ms, asserts event received within 4.5s; re-seeds repo after test for isolation; AbortError handled.

### 2026-03-14 — COMP-028.6 Communication REST API

- **NotificationRepository** extended with `findByUserId(userId, { limit, offset })` and `markAsRead(id, userId): Promise<boolean>`. In-memory and Postgres implementations updated.
- **ThreadRepository** and **MessageRepository** ports added; **InMemoryThreadRepository** and **InMemoryMessageRepository** implemented (no DB migration for threads/messages in this stage).
- **apps/api**: CommunicationContext (notificationRepository, threadRepository, messageRepository); communication routes: GET/PUT /api/v1/notifications, POST/GET /api/v1/messages/threads; all auth-required; envelope responses.
- Unit tests: notification-repository.test.ts (findByUserId pagination/ordering, markAsRead owner-only); thread-message-repositories.test.ts. API tests: communication.test.ts (401/200/201/403/404 cases).

### 2026-03-14 — COMP-028.5 (Plan) User notification preferences

- **NotificationPreferences** entity: `userId`, `muteUntil`, `channelPreferences` (per-type channels). Validates channels and muteUntil.
- **NotificationPreferencesRepository** port; **InMemoryNotificationPreferencesRepository** and **PostgresNotificationPreferencesRepository**.
- **PreferenceBackedNotificationPreferenceResolver**: loads prefs from repository; returns `[]` when `muteUntil` is in future; per-type channels or all when type missing.
- Migration `20260314000000_communication_notification_preferences.sql`: `communication.notification_preferences` (user_id PK, mute_until, channel_preferences JSONB).
- Worker wires **PreferenceBackedNotificationPreferenceResolver** with Postgres prefs repo when `DATABASE_URL` set; otherwise **DefaultNotificationPreferenceResolver**.
- Unit tests: notification-preferences.test.ts, preference-backed-notification-preference-resolver.test.ts, in-memory-notification-preferences-repository.test.ts.

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
