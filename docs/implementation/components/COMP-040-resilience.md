# Resilience Cross-Cutting Implementation Record

> **Component ID**: COMP-040
> **Architecture Reference**: [cross-cutting/resilience/ARCHITECTURE.md](../../architecture/cross-cutting/resilience/ARCHITECTURE.md)
> **Stage Assignment**: S13 — Cross-Cutting Concerns
> **Status**: 🔵 In Progress
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
| ✅ Done | 4 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 1 |
| **Total** | **5** |

**Component Coverage**: 80%

### Item List

#### [COMP-040.1] Circuit breaker library

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | cross-cutting/resilience/ARCHITECTURE.md, CON-009 |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-13 |

**Description**: Implement circuit breaker pattern library for all external service calls.

**Acceptance Criteria**:
- [x] `CircuitBreaker` class with states: `Closed`, `Open`, `HalfOpen`
- [x] Configuration: `failureThreshold`, `successThreshold`, `resetTimeoutMs`
- [x] `execute<T>(fn: () => Promise<T>): Promise<T>` wraps external call
- [x] `Open` state: fast-fail with `CircuitOpenError`, no call to external service
- [x] `HalfOpen` state: allow one test call per timeout period
- [x] Optional callbacks `onStateChange` / `onCall` for metrics integration
- [ ] Used by: `LLMAdapter`, `StripePaymentAdapter`, `DataCiteAdapter`, `NostrAnchor`, `KubernetesContainerAdapter` (when those adapters exist)

**Files Created/Modified**:
- `packages/platform-core/src/resilience/errors.ts` — `CircuitOpenError`, `TimeoutError`
- `packages/platform-core/src/resilience/circuit-breaker.ts`
- `packages/platform-core/src/resilience/circuit-breaker.test.ts`
- `packages/platform-core/src/index.ts` — exports resilience

---

#### [COMP-040.2] Retry policy with exponential backoff

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | cross-cutting/resilience/ARCHITECTURE.md, CON-009 |
| **Dependencies** | COMP-040.1 |
| **Size** | S |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-13 |

**Description**: Implement retry policy with exponential backoff and jitter for transient failure handling.

**Acceptance Criteria**:
- [x] `RetryPolicy.execute<T>(fn, options?)` (API per Implementation Plan Section 7)
- [x] `RetryPolicy`: `maxAttempts` (default 3), `baseDelayMs` (default 1000), `backoffMultiplier` (default 2), `jitterMs` (default 200)
- [x] Does NOT retry: `4xx` HTTP errors (except `429`), `CircuitOpenError`
- [x] Does retry: network errors, `5xx` errors, `429`
- [x] Retry attempts logged with `warn` level when logger provided
- [x] Integration with circuit breaker: retries can be wrapped by caller and passed to CircuitBreaker

**Files Created/Modified**:
- `packages/platform-core/src/resilience/retry-policy.ts`
- `packages/platform-core/src/resilience/retry-policy.test.ts`
- `packages/platform-core/src/index.ts` — exports RetryPolicy, isRetryableError, types

---

#### [COMP-040.3] Timeout wrapper

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | cross-cutting/resilience/ARCHITECTURE.md, CON-002 |
| **Dependencies** | COMP-001 |
| **Size** | XS |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-13 |

**Description**: Implement timeout wrapper ensuring all external calls respect timeout limits (CON-002).

**Acceptance Criteria**:
- [x] `withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T>`
- [x] Throws `TimeoutError` with `operation` and `timeoutMs` fields
- [x] Default timeouts: HTTP external calls 30s, DB queries 10s, background jobs 5min (CON-002)
- [ ] Applied to all adapters: `LLMAdapter`, `StripePaymentAdapter`, `DataCiteAdapter`, `NostrAnchor`

**Files Created/Modified**:
- `packages/platform-core/src/resilience/timeout.ts` — `withTimeout`, `DEFAULT_HTTP_TIMEOUT_MS`, `DEFAULT_DB_TIMEOUT_MS`, `DEFAULT_JOB_TIMEOUT_MS`
- `packages/platform-core/src/resilience/timeout.test.ts`
- `packages/platform-core/src/index.ts` — exports timeout

---

#### [COMP-040.4] BulkheadPattern (semaphore concurrency limiter)

| Field | Value |
|-------|-------|
| **Status** | ✅ Done |
| **Priority** | High |
| **Origin** | cross-cutting/resilience/ARCHITECTURE.md, Implementation Plan Section 7 |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |
| **Completed** | 2026-03-13 |

**Description**: Bulkhead pattern limits concurrent executions; implemented per Implementation Plan Section 7 (Resilient adapter base class is a later item).

**Acceptance Criteria**:
- [x] `Bulkhead(config)` with `maxConcurrent` and `rejectOverflow` (queue or reject)
- [x] `execute<T>(fn: () => Promise<T>): Promise<T>` acquires semaphore, runs fn, releases in finally
- [x] Excess calls queued when `rejectOverflow` false; rejected with `BulkheadRejectedError` when true
- [x] Unit tests verify concurrency limit and overflow behavior

**Files Created/Modified**:
- `packages/platform-core/src/resilience/bulkhead.ts`
- `packages/platform-core/src/resilience/bulkhead.test.ts`
- `packages/platform-core/src/index.ts` — exports Bulkhead, BulkheadRejectedError, BulkheadConfig

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
