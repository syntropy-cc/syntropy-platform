/**
 * Unit tests for MockAppendOnlyLog and IAppendOnlyLog contract (COMP-039.2).
 */

import { describe, it, expect } from "vitest";
import { MockAppendOnlyLog } from "./MockAppendOnlyLog.js";

describe("MockAppendOnlyLog", () => {
  it("append_and_query_without_filter_returns_all_events", async () => {
    const log = new MockAppendOnlyLog<{
      correlation_id?: string;
      actor_id?: string;
      id: string;
    }>();
    await log.append({
      id: "1",
      correlation_id: "c1",
      actor_id: "a1",
    });
    await log.append({ id: "2", correlation_id: "c1" });
    const all = await log.query();
    expect(all).toHaveLength(2);
    expect(all[0].id).toBe("1");
    expect(all[1].id).toBe("2");
  });

  it("query_filter_by_correlationId_returns_matching_events", async () => {
    const log = new MockAppendOnlyLog<{
      correlation_id?: string | null;
      actor_id?: string | null;
      id: string;
    }>();
    await log.append({ id: "1", correlation_id: "c1", actor_id: "a1" });
    await log.append({ id: "2", correlation_id: "c2", actor_id: "a1" });
    await log.append({ id: "3", correlation_id: "c1" });
    const found = await log.query({ correlationId: "c1" });
    expect(found).toHaveLength(2);
    expect(found.map((e) => e.id)).toEqual(["1", "3"]);
  });

  it("query_filter_by_actorId_returns_matching_events", async () => {
    const log = new MockAppendOnlyLog<{
      correlation_id?: string | null;
      actor_id?: string | null;
      id: string;
    }>();
    await log.append({ id: "1", actor_id: "a1" });
    await log.append({ id: "2", actor_id: "a2" });
    const found = await log.query({ actorId: "a1" });
    expect(found).toHaveLength(1);
    expect(found[0].id).toBe("1");
  });

  it("clear_removes_all_entries", async () => {
    type E = { id: string; correlation_id?: string };
    const log = new MockAppendOnlyLog<E>();
    await log.append({ id: "1" });
    expect(log.length).toBe(1);
    log.clear();
    expect(log.length).toBe(0);
    const all = await log.query();
    expect(all).toHaveLength(0);
  });
});
