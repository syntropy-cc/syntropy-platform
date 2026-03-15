/**
 * Next.js instrumentation (COMP-038.3).
 * Runs once when the Node server starts; initializes OpenTelemetry tracing.
 */

import { initTracing } from "@syntropy/platform-core";

export async function register() {
  initTracing({ serviceName: "institutional-site" });
}
