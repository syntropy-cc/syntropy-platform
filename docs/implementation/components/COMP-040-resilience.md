# Resilience Cross-Cutting Implementation Record

> **Component ID**: COMP-040
> **Architecture Reference**: [cross-cutting/resilience/ARCHITECTURE.md](../../architecture/cross-cutting/resilience/ARCHITECTURE.md)
> **Stage Assignment**: S13 — Cross-Cutting Concerns
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Resilience cross-cutting concerns implement fault-tolerance patterns across all external integrations: circuit breakers, retry policies with exponential backoff, Dead Letter Queue integration, and timeout configurations. These are implemented as shared utilities in `packages/platform-core` (CON-009). Every external adapter (Stripe, Nostr, DataCite, LLM providers, Kubernetes) must use these patterns.

**Responsibilities**:
- Circuit breaker pattern library for external service calls
- Retry policy with exponential backoff (max 3 retries, CON-009)
- Timeout decorators/wrappers (configurable per integration)
- Health check aggregation (all circuit breaker states)
- Integration with DLQ for async operation failures

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 5 |
| **Total** | **5** |

**Component Coverage**: 0%

### Item List

#### [COMP-040.1] Circuit breaker library

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | cross-cutting/resilience/ARCHITECTURE.md, CON-009 |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement circuit breaker pattern library for all external service calls.

**Acceptance Criteria**:
- [ ] `CircuitBreaker` class with states: `Closed`, `Open`, `HalfOpen`
- [ ] Configuration: `failureThreshold`, `successThreshold`, `timeout` (ms)
- [ ] `execute<T>(fn: () => Promise<T>): Promise<T>` wraps external call
- [ ] `Open` state: fast-fail with `CircuitOpenError`, no call to external service
- [ ] `HalfOpen` state: allow one test call per timeout period
- [ ] Metrics: `circuit_breaker_state_transitions_total`, `circuit_breaker_calls_total` (by outcome)
- [ ] Used by: `LLMAdapter`, `StripePaymentAdapter`, `DataCiteAdapter`, `NostrAnchor`, `KubernetesContainerAdapter`

**Files Created/Modified**:
- `packages/platform-core/src/resilience/circuit-breaker.ts`
- `packages/platform-core/src/resilience/circuit-breaker.test.ts`

---

#### [COMP-040.2] Retry policy with exponential backoff

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | cross-cutting/resilience/ARCHITECTURE.md, CON-009 |
| **Dependencies** | COMP-040.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement retry policy with exponential backoff and jitter for transient failure handling.

**Acceptance Criteria**:
- [ ] `withRetry<T>(fn: () => Promise<T>, policy: RetryPolicy): Promise<T>`
- [ ] `RetryPolicy`: `maxAttempts` (default 3), `baseDelayMs` (default 1000), `backoffMultiplier` (default 2), `jitterMs` (default 200)
- [ ] Does NOT retry: `4xx` HTTP errors (except `429`), `CircuitOpenError`
- [ ] Does retry: network errors, `5xx` errors, `429` (with `Retry-After` respect)
- [ ] Retry attempts logged with `warn` level, including attempt number and error
- [ ] Integration with circuit breaker: retries counted toward failure threshold

**Files Created/Modified**:
- `packages/platform-core/src/resilience/retry-policy.ts`

---

#### [COMP-040.3] Timeout wrapper

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | cross-cutting/resilience/ARCHITECTURE.md, CON-002 |
| **Dependencies** | COMP-001 |
| **Size** | XS |
| **Created** | 2026-03-13 |

**Description**: Implement timeout wrapper ensuring all external calls respect timeout limits (CON-002).

**Acceptance Criteria**:
- [ ] `withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T>`
- [ ] Throws `TimeoutError` with `operation` and `timeoutMs` fields
- [ ] Default timeouts: HTTP external calls 30s, DB queries 10s, background jobs 5min (CON-002)
- [ ] Applied to all adapters: `LLMAdapter`, `StripePaymentAdapter`, `DataCiteAdapter`, `NostrAnchor`

**Files Created/Modified**:
- `packages/platform-core/src/resilience/timeout.ts`

---

#### [COMP-040.4] Resilient adapter base class

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | cross-cutting/resilience/ARCHITECTURE.md |
| **Dependencies** | COMP-040.1, COMP-040.2, COMP-040.3 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Build `ResilientAdapter` base class that combines circuit breaker, retry, and timeout for external service adapters.

**Acceptance Criteria**:
- [ ] `ResilientAdapter` abstract base class
- [ ] `protected call<T>(name: string, fn: () => Promise<T>): Promise<T>` method
- [ ] `call()` combines: timeout → circuit breaker → retry (in this order)
- [ ] All adapters in the system extend `ResilientAdapter`:
  - `LLMAdapter` (COMP-012)
  - `StripePaymentAdapter` (COMP-027)
  - `DataCiteAdapter` (COMP-026)
  - `KubernetesContainerAdapter` (COMP-035)
  - `NostrAnchor` (COMP-039)
- [ ] Health status exposed: `isHealthy()` returns `true` if circuit is `Closed`

**Files Created/Modified**:
- `packages/platform-core/src/resilience/resilient-adapter.ts`

---

#### [COMP-040.5] Resilience integration tests

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | CON-010 |
| **Dependencies** | COMP-040.4 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Integration tests for resilience patterns with simulated failure scenarios.

**Acceptance Criteria**:
- [ ] Circuit breaker tests: trip on threshold failures, recover on success in HalfOpen
- [ ] Retry tests: transient failure recovery, permanent failure after max retries, `429` backoff
- [ ] Timeout tests: operation exceeds timeout → `TimeoutError`
- [ ] `ResilientAdapter` integration test with mock external service
- [ ] All tests < 10 seconds total (use short timeout/delay values)

**Files Created/Modified**:
- `packages/platform-core/src/resilience/resilience.integration.test.ts`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | Package setup |
| All external adapters | Internal | ⬜ Not Started | Use resilience patterns |

---

## References

### Architecture Documents

- [Resilience Cross-Cutting Architecture](../../architecture/cross-cutting/resilience/ARCHITECTURE.md)
