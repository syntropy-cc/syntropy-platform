/**
 * REST API process entry point (COMP-033.1).
 *
 * Starts the Fastify server on PORT (default 8080), handles SIGTERM/SIGINT
 * with graceful shutdown (30s timeout).
 */

import { createLogger, initTracing } from "@syntropy/platform-core";
import { createApp } from "./server.js";

const SHUTDOWN_TIMEOUT_MS = 30_000;
const DEFAULT_PORT = 8080;
const log = createLogger("api");

async function run(): Promise<void> {
  initTracing({ serviceName: "api" });
  const app = await createApp();
  const port = Number(process.env.PORT) || DEFAULT_PORT;

  const shutdown = (signal: string) => {
    log.info({ signal }, "Received signal; starting graceful shutdown");
    app
      .close()
      .then(() => {
        log.info("Shutdown complete");
        process.exit(0);
      })
      .catch((err) => {
        log.error({ err }, "Shutdown error");
        process.exit(1);
      });
    setTimeout(() => {
      log.warn("Shutdown timeout; forcing exit");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  await app.listen({ port, host: "0.0.0.0" });
  log.info({ port }, "API server listening");
}

run().catch((err) => {
  log.fatal({ err }, "Failed to start API");
  process.exit(1);
});
