# Observability Cross-Cutting Implementation Record

> **Component ID**: COMP-038
> **Architecture Reference**: [cross-cutting/observability/ARCHITECTURE.md](../../architecture/cross-cutting/observability/ARCHITECTURE.md)
> **Stage Assignment**: S13 — Cross-Cutting Concerns
> **Status**: ⬜ Not Started
> **Created**: 2026-03-13
> **Last Updated**: 2026-03-13

## Component Overview

### Architecture Summary

Observability cross-cutting concerns implement the three pillars of observability across all services: structured logging (JSON with correlation/causation IDs), distributed tracing (OpenTelemetry), and metrics (Prometheus/Grafana). These are implemented as shared utilities in `packages/platform-core` that all domain packages import. The observability infrastructure ensures end-to-end request tracing across API → domain → event bus (ARCH-009).

**Responsibilities**:
- Structured JSON logger with correlation and causation ID propagation
- OpenTelemetry SDK integration (traces exported to Jaeger/Tempo)
- Prometheus metrics collection and exposition
- Grafana dashboard configuration
- Log aggregation (Loki or ELK)
- Alerting rules (PagerDuty/Slack integration)

---

## Work Items

### Summary

| Status | Count |
|--------|-------|
| ✅ Done | 0 |
| 🔵 In Progress | 0 |
| ⬜ Ready/Backlog | 6 |
| **Total** | **6** |

**Component Coverage**: 0%

### Item List

#### [COMP-038.1] Structured logger library

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | cross-cutting/observability/ARCHITECTURE.md, ARCH-009 |
| **Dependencies** | COMP-001 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Build a structured JSON logger library that all services use for consistent logging with correlation IDs.

**Acceptance Criteria**:
- [ ] `createLogger(service: string)` factory returns a pino/winston logger configured for JSON output
- [ ] `logger.info/warn/error(message, context)` — always includes: `service`, `correlation_id`, `causation_id`, `timestamp`, `level`
- [ ] `withCorrelationId(correlationId)` child logger for request-scoped logging
- [ ] Log levels configurable per environment: `debug` in dev, `info` in prod
- [ ] Secrets never in logs: `redact` patterns for `password`, `token`, `key`, `secret`
- [ ] Tests: log redaction, correlation ID propagation

**Files Created/Modified**:
- `packages/platform-core/src/observability/logger.ts`

---

#### [COMP-038.2] Correlation ID propagation middleware

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Critical |
| **Origin** | cross-cutting/observability/ARCHITECTURE.md |
| **Dependencies** | COMP-033, COMP-038.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Implement correlation ID propagation across HTTP requests, Kafka messages, and async contexts.

**Acceptance Criteria**:
- [ ] HTTP: `X-Correlation-ID` header generated if missing, propagated in all downstream calls
- [ ] Kafka: correlation_id in message headers for async tracing
- [ ] Async local storage (`AsyncLocalStorage`) stores correlation ID for thread-local-like propagation in Node.js
- [ ] All internal HTTP calls (service-to-service) automatically include `X-Correlation-ID` header
- [ ] `getCausationId()` utility derives causation chain from correlation ID

**Files Created/Modified**:
- `packages/platform-core/src/observability/correlation-context.ts`
- `apps/api/src/middleware/correlation-id.ts`

---

#### [COMP-038.3] OpenTelemetry distributed tracing

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | cross-cutting/observability/ARCHITECTURE.md, ARCH-009 |
| **Dependencies** | COMP-038.1 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Integrate OpenTelemetry SDK for distributed tracing across all services.

**Acceptance Criteria**:
- [ ] OpenTelemetry Node.js SDK initialized in all apps (auto-instrumentation for HTTP, PostgreSQL, Redis, Kafka)
- [ ] Custom spans for critical operations: `identity.verify_token`, `dip.publish_artifact`, `ai.invoke_agent`, etc.
- [ ] Traces exported to Jaeger (dev) / Tempo (prod) via OTLP
- [ ] Trace context propagated to Kafka messages (W3C TraceContext)
- [ ] Sampling: 100% in dev, 10% in prod (configurable)

**Files Created/Modified**:
- `packages/platform-core/src/observability/tracing.ts`
- `apps/*/src/instrumentation.ts` (Next.js instrumentation hook)
- `apps/api/src/tracing.ts`

---

#### [COMP-038.4] Prometheus metrics

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | High |
| **Origin** | cross-cutting/observability/ARCHITECTURE.md |
| **Dependencies** | COMP-038.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Set up Prometheus metrics collection for all services.

**Acceptance Criteria**:
- [ ] `packages/platform-core` exports `createMetrics(service)` factory with pre-configured counters and histograms
- [ ] Standard metrics: `http_request_duration_seconds`, `http_requests_total`, `db_query_duration_seconds`
- [ ] Custom domain metrics: `artifact_publications_total`, `ai_agent_invocations_total`, `ide_sessions_active_total`
- [ ] `GET /metrics` endpoint on API and workers apps (Prometheus format)
- [ ] `collectDefaultMetrics()` for Node.js runtime metrics (CPU, memory, GC)

**Files Created/Modified**:
- `packages/platform-core/src/observability/metrics.ts`

---

#### [COMP-038.5] Grafana dashboards and alerting rules

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | cross-cutting/observability/ARCHITECTURE.md |
| **Dependencies** | COMP-038.4 |
| **Size** | M |
| **Created** | 2026-03-13 |

**Description**: Create Grafana dashboards and Prometheus alerting rules.

**Acceptance Criteria**:
- [ ] `Platform Overview` dashboard: request rate, error rate, latency p50/p95/p99
- [ ] `DIP Activity` dashboard: artifact publications, governance proposals, AVU distributions
- [ ] `AI Agents` dashboard: invocation rate, LLM latency, context model size
- [ ] Alerting rules:
  - API p99 latency > 500ms for 5min → warning
  - Error rate > 1% for 5min → critical
  - DLQ depth > 100 → warning
  - IDE sessions > 90% of quota → warning
- [ ] Dashboards as JSON files in repo (Grafana as code)

**Files Created/Modified**:
- `infra/grafana/dashboards/`
- `infra/prometheus/alert-rules.yml`

---

#### [COMP-038.6] Log aggregation pipeline configuration

| Field | Value |
|-------|-------|
| **Status** | ⬜ Ready |
| **Priority** | Medium |
| **Origin** | cross-cutting/observability/ARCHITECTURE.md |
| **Dependencies** | COMP-038.1 |
| **Size** | S |
| **Created** | 2026-03-13 |

**Description**: Configure log aggregation pipeline (Loki + Promtail or equivalent).

**Acceptance Criteria**:
- [ ] Dev: `docker-compose.yml` includes Grafana + Loki + Promtail
- [ ] Promtail configured to scrape Docker container logs
- [ ] Loki retention: 30 days
- [ ] Log search: `Explore` in Grafana with pre-built LogQL queries for common patterns
- [ ] Correlation ID searchable in Loki labels

**Files Created/Modified**:
- `infra/loki/` configuration files
- `infra/promtail/` configuration files
- `docker/docker-compose.observability.yml`

---

## Dependencies

### This Component Requires

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| COMP-001 Monorepo Infrastructure | Internal | ⬜ Not Started | Package setup |
| COMP-033 REST API | Internal | ⬜ Not Started | Middleware wiring |
| COMP-034 Background Services | Internal | ⬜ Not Started | Worker metrics |

---

## References

### Architecture Documents

- [Observability Cross-Cutting Architecture](../../architecture/cross-cutting/observability/ARCHITECTURE.md)
