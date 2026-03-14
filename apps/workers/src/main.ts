/**
 * Background workers process entry point.
 *
 * Bootstraps WorkerRegistry, starts all workers concurrently, and handles
 * SIGTERM/SIGINT with graceful shutdown (30s). Unhandled rejections crash
 * the process so the orchestrator can restart (COMP-034.1).
 * Exposes GET /metrics and GET /health (COMP-034.5).
 *
 * Architecture: COMP-034, platform/background-services/ARCHITECTURE.md
 */

import { createLogger } from "@syntropy/platform-core";
import { getKafkaWorkers } from "./workers/kafka-workers.js";
import { createSearchIndexWorker } from "./workers/search-index-consumer.js";
import { createSessionInvalidationConsumer } from "./workers/session-invalidation-consumer.js";
import { createDlqProcessor } from "./workers/dlq-processor.js";
import { createCronScheduler } from "./scheduler/cron-scheduler.js";
import { WorkerRegistry } from "./worker-registry.js";
import { createMetricsHealthServer } from "./http-server.js";

const SHUTDOWN_TIMEOUT_MS = 30_000;
const log = createLogger("workers");

async function run(): Promise<void> {
  const registry = new WorkerRegistry();
  registry.register(createSearchIndexWorker());
  for (const worker of getKafkaWorkers()) {
    if (worker.name === "search-index") continue;
    registry.register(worker);
  }
  registry.register(createSessionInvalidationConsumer());
  registry.register(createDlqProcessor());
  registry.register(createCronScheduler());

  const httpServer = createMetricsHealthServer(registry);

  process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
    log.error({ err: reason, promise }, "Unhandled rejection; crashing process");
    process.exit(1);
  });

  const shutdown = (signal: string) => {
    log.info({ signal }, "Received signal; starting graceful shutdown");
    httpServer.close(() => {
      log.info("Metrics server closed");
    });
    registry
      .stopAll({ timeoutMs: SHUTDOWN_TIMEOUT_MS })
      .then(() => {
        log.info("Shutdown complete");
        process.exit(0);
      })
      .catch((err) => {
        log.error({ err }, "Shutdown error");
        process.exit(1);
      });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  await registry.startAll();
  log.info("All workers started");
}

run().catch((err) => {
  log.fatal({ err }, "Failed to start workers");
  process.exit(1);
});
