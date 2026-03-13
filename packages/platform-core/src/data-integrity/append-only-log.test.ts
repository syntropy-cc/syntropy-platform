/**
 * Unit tests for append-only log (COMP-039.3).
 */

import { describe, it, expect } from "vitest";
import { appendToLog, type AppendOnlyLogEntry, type AppendOnlyLogClient } from "./append-only-log.js";

describe("appendToLog", () => {
  it("calls client execute with correct SQL and params shape", async () => {
    const executed: { sql: string; params: unknown[] }[] = [];
    const client: AppendOnlyLogClient = {
      async execute(sql, params) {
        executed.push({ sql, params });
      },
    };

    const entry: AppendOnlyLogEntry = {
      actor_id: "actor-1",
      event_type: "TestEvent",
      payload: { foo: "bar" },
      schema_version: "1.0",
      correlation_id: "corr-1",
      causation_id: null,
    };

    await appendToLog(client, entry);

    expect(executed).toHaveLength(1);
    expect(executed[0].sql).toContain("INSERT INTO platform_core.append_only_log");
    expect(executed[0].sql).toContain("actor_id");
    expect(executed[0].sql).toContain("event_type");
    expect(executed[0].sql).toContain("payload");
    expect(executed[0].sql).toContain("schema_version");
    expect(executed[0].sql).toContain("correlation_id");
    expect(executed[0].sql).toContain("causation_id");
    expect(executed[0].params).toEqual([
      "actor-1",
      "TestEvent",
      '{"foo":"bar"}',
      "1.0",
      "corr-1",
      null,
    ]);
  });

  it("passes null for optional correlation_id and causation_id when omitted", async () => {
    const executed: { params: unknown[] }[] = [];
    const client: AppendOnlyLogClient = {
      async execute(_, params) {
        executed.push({ params });
      },
    };

    await appendToLog(client, {
      actor_id: "a",
      event_type: "E",
      payload: {},
      schema_version: "1",
    });

    expect(executed[0].params[4]).toBeNull();
    expect(executed[0].params[5]).toBeNull();
  });
});
