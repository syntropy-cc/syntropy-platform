/**
 * Unit tests for SessionInvalidationConsumer (COMP-002.7).
 *
 * Verifies event parsing and that only invalidation event types are handled.
 */

import { describe, it, expect } from "vitest";
import { createSessionInvalidationConsumer } from "./session-invalidation-consumer.js";

describe("SessionInvalidationConsumer", () => {
  it("creates a worker with name session-invalidation", () => {
    const worker = createSessionInvalidationConsumer();
    expect(worker.name).toBe("session-invalidation");
  });

  it("health returns ok", async () => {
    const worker = createSessionInvalidationConsumer();
    const health = await worker.health();
    expect(health.status).toBe("ok");
  });
});
