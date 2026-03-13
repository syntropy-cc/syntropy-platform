/**
 * Unit tests for CausalChainTracer (COMP-009.5).
 */

import { describe, it, expect } from "vitest";
import { CausalChainTracer } from "./CausalChainTracer.js";
import type { AppendOnlyLogRepository } from "./AppendOnlyLogRepository.js";
import type { EventLogEntry } from "./types.js";

function entry(
  id: number,
  causationId: string | null,
  recordedAt: Date,
): EventLogEntry {
  return {
    id,
    sequence_number: id,
    actor_id: "a1",
    event_type: "e",
    payload: {},
    schema_version: "1",
    correlation_id: "corr-1",
    causation_id: causationId,
    recorded_at: recordedAt,
  };
}

function createMockRepo(entries: EventLogEntry[]): AppendOnlyLogRepository {
  return {
    append: async () => {},
    findByCorrelationId: async (cid: string) =>
      entries.filter((e) => e.correlation_id === cid),
    findByActorId: async () => [],
  };
}

describe("CausalChainTracer", () => {
  it("returns empty array when no events for correlation", async () => {
    const repo = createMockRepo([]);
    const tracer = new CausalChainTracer(repo);
    const result = await tracer.trace("none");
    expect(result).toEqual([]);
  });

  it("returns single event in order", async () => {
    const e1 = entry(1, null, new Date("2024-01-15T10:00:00Z"));
    const repo = createMockRepo([e1]);
    const tracer = new CausalChainTracer(repo);
    const result = await tracer.trace("corr-1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("returns linear chain in causal order (cause before effect)", async () => {
    const base = new Date("2024-01-15T10:00:00Z");
    const e1 = entry(1, null, new Date(base.getTime() + 0));
    const e2 = entry(2, "1", new Date(base.getTime() + 1000));
    const e3 = entry(3, "2", new Date(base.getTime() + 2000));
    const repo = createMockRepo([e1, e2, e3]);
    const tracer = new CausalChainTracer(repo);

    const result = await tracer.trace("corr-1");
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
    expect(result[2].id).toBe(3);
  });

  it("handles branching (multiple children of same cause)", async () => {
    const base = new Date("2024-01-15T10:00:00Z");
    const e1 = entry(1, null, new Date(base.getTime() + 0));
    const e2 = entry(2, "1", new Date(base.getTime() + 1000));
    const e3 = entry(3, "1", new Date(base.getTime() + 1001));
    const repo = createMockRepo([e1, e2, e3]);
    const tracer = new CausalChainTracer(repo);

    const result = await tracer.trace("corr-1");
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(1);
    expect(new Set(result.slice(1).map((e) => e.id))).toEqual(new Set([2, 3]));
  });

  it("handles cycle gracefully by appending remaining in recorded_at order", async () => {
    const base = new Date("2024-01-15T10:00:00Z");
    const e1 = entry(1, "3", new Date(base.getTime() + 0));
    const e2 = entry(2, "1", new Date(base.getTime() + 1000));
    const e3 = entry(3, "2", new Date(base.getTime() + 2000));
    const repo = createMockRepo([e1, e2, e3]);
    const tracer = new CausalChainTracer(repo);

    const result = await tracer.trace("corr-1");
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.id)).toContain(1);
    expect(result.map((e) => e.id)).toContain(2);
    expect(result.map((e) => e.id)).toContain(3);
  });
});
