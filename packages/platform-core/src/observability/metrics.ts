/**
 * Prometheus metrics factory for platform services (COMP-038.4).
 *
 * Provides a per-service registry with standard HTTP/DB metrics and custom
 * domain metrics. Each service (api, workers) should call createMetrics once
 * and expose GET /metrics using the returned registry.
 *
 * Architecture: COMP-038, cross-cutting/observability/ARCHITECTURE.md
 */

import {
  Counter,
  Gauge,
  Histogram,
  type Registry,
  Registry as RegistryConstructor,
  collectDefaultMetrics,
} from "prom-client";

/** Default histogram buckets for HTTP and DB duration (seconds). */
const DEFAULT_DURATION_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

export interface PlatformMetrics {
  /** Prometheus registry for this service. Use for GET /metrics. */
  registry: Registry;
  /** Histogram: HTTP request duration in seconds. Labels: method, route, status_code. */
  httpRequestDurationSeconds: Histogram<string>;
  /** Counter: Total HTTP requests. Labels: method, route, status_code. */
  httpRequestsTotal: Counter<string>;
  /** Histogram: DB query duration in seconds. Labels: operation. */
  dbQueryDurationSeconds: Histogram<string>;
  /** Counter: Artifact publications. Labels: status (optional). */
  artifactPublicationsTotal: Counter<string>;
  /** Counter: AI agent invocations. Labels: agent, status (optional). */
  aiAgentInvocationsTotal: Counter<string>;
  /** Gauge: Active IDE sessions. */
  ideSessionsActiveTotal: Gauge<string>;
}

/**
 * Creates a Prometheus metrics registry and standard/custom metrics for a service.
 *
 * Each service (e.g. "api", "workers") should call this once at startup and use
 * the returned registry for the GET /metrics endpoint. Node.js default metrics
 * (CPU, memory, GC) are collected on this registry.
 *
 * @param serviceName - Name of the service (e.g. "api", "workers").
 * @returns PlatformMetrics with registry and metric accessors.
 *
 * @example
 * const metrics = createMetrics("api");
 * app.get("/metrics", async (_req, reply) => {
 *   reply.type("text/plain").send(await metrics.registry.metrics());
 * });
 * // Record HTTP request:
 * metrics.httpRequestsTotal.inc({ method: "GET", route: "/health", status_code: "200" });
 */
export function createMetrics(serviceName: string): PlatformMetrics {
  const registry = new RegistryConstructor();
  registry.setDefaultLabels({ service: serviceName });

  const httpRequestDurationSeconds = new Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: DEFAULT_DURATION_BUCKETS,
    registers: [registry],
  });

  const httpRequestsTotal = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
    registers: [registry],
  });

  const dbQueryDurationSeconds = new Histogram({
    name: "db_query_duration_seconds",
    help: "Database query duration in seconds",
    labelNames: ["operation"],
    buckets: DEFAULT_DURATION_BUCKETS,
    registers: [registry],
  });

  const artifactPublicationsTotal = new Counter({
    name: "artifact_publications_total",
    help: "Total number of artifact publications",
    labelNames: ["status"],
    registers: [registry],
  });

  const aiAgentInvocationsTotal = new Counter({
    name: "ai_agent_invocations_total",
    help: "Total number of AI agent invocations",
    labelNames: ["agent", "status"],
    registers: [registry],
  });

  const ideSessionsActiveTotal = new Gauge({
    name: "ide_sessions_active_total",
    help: "Total number of active IDE sessions",
    labelNames: [],
    registers: [registry],
  });

  collectDefaultMetrics({ register: registry });

  return {
    registry,
    httpRequestDurationSeconds,
    httpRequestsTotal,
    dbQueryDurationSeconds,
    artifactPublicationsTotal,
    aiAgentInvocationsTotal,
    ideSessionsActiveTotal,
  };
}
