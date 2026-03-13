/**
 * Unit tests for DLQ processor (COMP-034.3).
 */

import { describe, it, expect } from "vitest";
import { createDlqProcessor } from "./dlq-processor.js";

describe("DLQ processor", () => {
  it("creates a worker with name dlq-processor", () => {
    const worker = createDlqProcessor();
    expect(worker.name).toBe("dlq-processor");
  });

  it("health returns ok", async () => {
    const worker = createDlqProcessor();
    const health = await worker.health();
    expect(health.status).toBe("ok");
  });
});
