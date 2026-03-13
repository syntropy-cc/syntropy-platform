# ADR-002: Event Bus Technology Selection

## Status

Accepted

## Date

2026-03-12

## Context

The modular monolith architecture (ADR-001) requires a reliable event bus for asynchronous cross-domain communication. Every action in the ecosystem — a Fragment being published, a Contribution being accepted, a GovernanceContract being executed — must be recorded as an event. Several downstream subdomains depend on this stream:

- **Portfolio Aggregation** (Platform Core) consumes all events to build verifiable portfolios
- **Search & Recommendation** (Platform Core) subscribes to domain events to update its cross-pillar index
- **AppendOnlyLog** (Event Bus & Audit) persists every event in hash-chained sequence

The event bus has demanding requirements:

- **Durability**: Events must survive broker restarts; a lost portfolio event means a missing portfolio entry — unacceptable for a "verifiable portfolio" system
- **Consumer groups**: Multiple independent consumers (Portfolio Aggregation, Search, future subscribers) must each process every event independently, without racing. This requires a log-based broker, not a queue-based broker
- **Ordering guarantees**: Within a single domain's topic partition, events must arrive in causal order
- **Replay capability**: If a new consumer (e.g., a new analytics subscriber) needs to be added later, it must be able to replay historical events from the beginning of the log
- **Schema enforcement**: Every event must be validated against a registered schema version before acceptance (Event Schema Registry, Platform Core)
- **Development ergonomics**: The team must be able to run the full system locally without external broker dependencies during feature development

Two constraints define the solution space:
1. The DIP event signing architecture (ADR-010) requires that certain events (DIP protocol events) are additionally anchored to Nostr relays, independent of the event bus transport. The event bus does not need to be the signing mechanism.
2. The initial team size (2–5 developers) means operational simplicity matters. A broker that requires specialized ops knowledge adds risk.

## Decision

We will use **Apache Kafka** as the production event bus, with a **pluggable transport abstraction** that allows an **in-process EventEmitter** adapter for local development and unit testing.

Specifically:

1. **Production**: Apache Kafka (self-hosted via Docker/Kubernetes or managed via Confluent Cloud / Upstash Kafka) with:
   - One Kafka topic per domain (e.g., `platform-core.events`, `dip.events`, `learn.events`)
   - Consumer groups per subscriber (e.g., `portfolio-aggregation`, `search-indexer`)
   - At-least-once delivery semantics; consumers are responsible for idempotent processing
   - Message retention: 30 days minimum (longer for DIP protocol events)
   - Replication factor: 3 in production for durability

2. **Development/Testing**: In-process `EventEmitter`-based adapter implementing the same `IEventBus` interface. Events are synchronous within the same process, making tests deterministic without Kafka infrastructure. Docker Compose integration tests use a real Kafka container.

3. **Transport abstraction** (`IEventBus` interface in `packages/events`):
   ```typescript
   interface IEventBus {
     publish(event: EcosystemEvent): Promise<void>;
     subscribe(eventType: string, handler: EventHandler, options?: SubscribeOptions): Subscription;
   }
   ```
   All domain packages depend only on this interface (ARCH-002). The Kafka and EventEmitter implementations live in `packages/platform-core/infrastructure/`.

4. **Schema validation** happens before publication: the `EventBus` implementation calls `SchemaValidationService` (Event Bus & Audit subdomain) before forwarding to Kafka. Invalid events are rejected with a structured error — never silently dropped.

## Alternatives Considered

### Alternative 1: RabbitMQ

A message broker based on AMQP with exchanges, queues, and routing keys. Mature, widely understood, easier to operate than Kafka.

**Pros**:
- Lower operational complexity than Kafka (no ZooKeeper/KRaft needed for small setups)
- Flexible routing (topic exchanges, fanout, direct)
- Excellent management UI
- Well-documented; large ecosystem of tutorials

**Cons**:
- Queue-based model: once a message is consumed, it is gone. Consumer groups with independent offsets require explicit queue duplication per consumer — complex to manage correctly
- No native log replay: a new consumer added months later cannot replay historical events
- Message ordering within a queue is guaranteed only within a single queue; routing messages to multiple queues for different consumers breaks per-message ordering guarantees
- Does not natively support the "read from offset X" pattern needed for Portfolio Aggregation rebuilds after crashes

**Why rejected**: The Portfolio Aggregation subdomain requires the ability to rebuild its state by replaying all events from a point in time. The Search indexer needs the same. RabbitMQ's queue model does not provide native replay; implementing it requires custom solutions that reintroduce the complexity we want to avoid. Kafka's log compaction and consumer offset management are purpose-built for this pattern.

### Alternative 2: Redis Streams

Redis 5.0+ streams provide an append-only log structure with consumer groups and offset-based delivery.

**Pros**:
- Very low latency (sub-millisecond delivery)
- Already familiar to teams using Redis for caching
- Supports consumer groups and at-least-once semantics
- Simple to deploy alongside Redis cache instances

**Cons**:
- Memory-bound by default: streams stored in RAM; retention is limited by available memory unless using `XADD MAXLEN` with disk persistence — complex to configure for unbounded event logs
- Less mature than Kafka for high-volume, long-term event log use cases
- Consumer group management (explicit `XACK`, offset tracking) is more manual than Kafka's native consumer group protocol
- Limited ecosystem for schema registry integration

**Why rejected**: The append-only event log is the system of record for portfolios and audit trails. Memory-bound storage is incompatible with "indefinite retention" requirements for LogEntry and EventSchemaVersion entities. Redis Streams are appropriate for ephemeral streams (e.g., real-time notifications — used for Communication domain); they are not appropriate for the durable, replayable event log that Platform Core requires.

### Alternative 3: In-Process EventEmitter Only (No External Broker)

Implement the entire event bus as an in-process synchronous EventEmitter. Defer external broker introduction until the system reaches scale that requires it.

**Pros**:
- Zero infrastructure to manage
- Synchronous delivery eliminates eventual consistency complexity
- Trivially testable

**Cons**:
- Does not survive service restarts: all in-flight events are lost on crash
- Cannot support multiple consumer processes running independently (e.g., Portfolio Aggregation as a background worker separate from the web process)
- Synchronous delivery means a slow portfolio aggregation handler blocks the publish call
- Accumulates technical debt: migrating to a real broker later requires substantial refactoring if the codebase has assumed synchronous delivery

**Why rejected**: The "verifiable portfolio" guarantee requires event durability — events must not be lost on process crash. The background services architecture (platform/background-services) explicitly separates worker processes from the web application. An in-process-only approach cannot support this separation.

### Alternative 4: AWS SQS/SNS or Google Pub/Sub (Managed Cloud Queue)

Use a fully managed cloud messaging service.

**Pros**:
- Zero broker management
- Automatic scaling
- High availability from cloud provider

**Cons**:
- Standard SQS is a queue, not a log — same replay limitation as RabbitMQ
- SNS fanout adds routing complexity without solving replay
- Cloud provider lock-in: migrating away would require replacing all producer/consumer code
- Per-message pricing can become significant at high event volume
- Log replay requires purchasing the managed Kafka equivalent (MSK, Confluent Cloud) — at which point Kafka is the underlying technology anyway

**Why rejected**: The system is designed to be deployable by any institution (open source principle from Vision). Cloud-specific managed services undermine self-hosting capability. If a managed Kafka equivalent is needed, Confluent Cloud or Upstash Kafka provides it over standard Kafka protocol, maintaining the same abstraction.

## Consequences

### Positive

- Consumer groups allow Portfolio Aggregation and Search to independently track their processing offsets — each subscriber processes every event without competing with others.
- Log replay enables rebuilding any downstream state (portfolio, search index) from any point in time — critical for crash recovery and adding new consumers.
- The pluggable `IEventBus` abstraction means all 12 domain packages are completely unaware of whether Kafka or EventEmitter is running; domain logic never changes due to broker technology.
- Kafka's topic partitioning provides natural ordering within a domain's events.

### Negative

- Kafka adds infrastructure complexity: the team must manage (or pay for managed) Kafka brokers with ZooKeeper or KRaft.
  - **Mitigation**: For initial development, Docker Compose provides Kafka with a single command. For production, managed Kafka (Confluent Cloud free tier, or Upstash Kafka) eliminates ops burden until self-hosting becomes warranted.
- At-least-once semantics require all consumers to implement idempotent processing.
  - **Mitigation**: All consumers must document their idempotency strategy. Portfolio Aggregation uses sequence_number-based deduplication. Search indexing is naturally idempotent (upsert by entity ID).
- The in-process EventEmitter adapter hides Kafka's eventual consistency during development.
  - **Mitigation**: Integration tests (CI pipeline) run against a real Kafka container via Docker Compose. Eventual consistency behavior must be tested at the integration level.

### Neutral

- Kafka's log retention (30 days default, configurable per topic) means the AppendOnlyLog in PostgreSQL remains the authoritative indefinite record; Kafka is the transport, not the store of record.
- The pluggable transport abstraction adds a thin layer of indirection. This is a deliberate design trade-off to support the development experience (in-process adapter) without sacrificing production correctness.

## Implementation Notes

### Topic Naming Convention

```
{domain}.events          ← primary event stream per domain
{domain}.events.dlq      ← dead letter queue for failed processing
```

Examples:
- `learn.events`
- `dip.events`
- `platform-core.schema-registry.events`

### Consumer Group Naming Convention

```
{consumer-domain}.{consumer-subdomain}
```

Examples:
- `platform-core.portfolio-aggregation`
- `platform-core.search-recommendation`

### Initial Kafka Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `replication.factor` | 3 (production) | Durability against broker failure |
| `min.insync.replicas` | 2 | Ensure write acknowledgment from 2 replicas |
| `retention.ms` | 2592000000 (30 days) | Replay window for crash recovery |
| `message.max.bytes` | 1048576 (1 MB) | Events should be small; large payloads indicate design issue |

## References

- Vision Document: Section 9 (Priority 1: Reliability > 99.9%; Priority 8: Full event traceability)
- ADR-001: Modular Monolith — establishes need for event bus
- ADR-010: Event Signing and Immutability — Kafka is the transport; AppendOnlyLog is the store of record
- `docs/architecture/domains/platform-core/subdomains/event-bus-audit.md` — Event Bus & Audit subdomain design
- `docs/architecture/platform/background-services/ARCHITECTURE.md` — Worker topology and consumer group assignments

## Derived Rules

- `architecture.mdc`: ARCH-003 — No direct cross-context database access; event bus is the required async communication channel
- `constraints.mdc`: CON-009 — Integration patterns: event bus required for async inter-domain communication; circuit breaker required for broker dependency

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2026-03-12 | System Architect | Accepted | Kafka selected for durability and log replay; pluggable abstraction preserves development ergonomics |
