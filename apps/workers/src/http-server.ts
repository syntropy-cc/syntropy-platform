/**
 * HTTP server for Prometheus /metrics and /health (COMP-034.5).
 *
 * Serves GET /metrics (Prometheus text format) and GET /health (JSON with workers status).
 */

import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { register, collectDefaultMetrics } from "prom-client";
import type { WorkerRegistry } from "./worker-registry.js";

let defaultMetricsCollected = false;

function ensureDefaultMetrics(): void {
  if (!defaultMetricsCollected) {
    collectDefaultMetrics({ register });
    defaultMetricsCollected = true;
  }
}

const METRICS_CONTENT_TYPE = "text/plain; version=0.0.4; charset=utf-8";

/** Default port when WORKERS_HTTP_PORT is not set. */
export const DEFAULT_HTTP_PORT = 9090;

function getPort(): number {
  const env = process.env.WORKERS_HTTP_PORT ?? process.env.METRICS_PORT;
  if (env) {
    const n = parseInt(env, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return DEFAULT_HTTP_PORT;
}

async function handleMetrics(
  _req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.setHeader("Content-Type", METRICS_CONTENT_TYPE);
  try {
    const metrics = await register.metrics();
    res.statusCode = 200;
    res.end(metrics);
  } catch (err) {
    res.statusCode = 500;
    res.end(
      `# Error collecting metrics: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

async function handleHealth(
  registry: WorkerRegistry,
  _req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.setHeader("Content-Type", "application/json");
  try {
    const workers = await registry.getHealth();
    const status = Object.values(workers).every((w) => w.status === "ok")
      ? "ok"
      : "degraded";
    const body = JSON.stringify({
      status,
      workers,
      timestamp: new Date().toISOString(),
    });
    res.statusCode = 200;
    res.end(body);
  } catch (err) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        status: "unhealthy",
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      })
    );
  }
}

/**
 * Creates and starts an HTTP server for /metrics and /health.
 * Registers default Node.js metrics with prom-client.
 *
 * @param registry - WorkerRegistry for health worker status.
 * @param port - Port to listen on (default from WORKERS_HTTP_PORT or 9090).
 * @returns The server instance (already listening).
 */
export function createMetricsHealthServer(
  registry: WorkerRegistry,
  port?: number
): Server {
  const listenPort = port ?? getPort();

  ensureDefaultMetrics();

  const server = createServer((req, res) => {
    const url = req.url?.split("?")[0] ?? "";
    if (req.method === "GET" && url === "/metrics") {
      void handleMetrics(req, res);
      return;
    }
    if (req.method === "GET" && (url === "/health" || url === "/health/live")) {
      void handleHealth(registry, req, res);
      return;
    }
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not Found");
  });

  server.listen(listenPort, () => {
    console.info(`[workers] Metrics/health server listening on port ${listenPort}`);
  });

  return server;
}
