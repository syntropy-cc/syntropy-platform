/**
 * Tests for PostgresAppendOnlyLogRepository (COMP-009.6).
 *
 * Uses in-memory mock client to verify repository logic without real DB.
 */

import { describe, it, expect } from "vitest";
import { PostgresAppendOnlyLogRepository } from "./PostgresAppendOnlyLogRepository.js";
import type { EventLogClient } from "./EventLogClient.js";
import type { EventLogEntry } from "./types.js";

function createMockClient(): EventLogClient & { inserts: unknown[]; rows: EventLogEntry[] } {
  const inserts: unknown[] = [];
  const rows: EventLogEntry[] = [];
  let idCounter = 1;
  return {
    inserts,
    rows,
    async execute(sql: string, params: unknown[]): Promise<void> {
      inserts.push({ sql, params });
      if (sql.trimStart().startsWith("INSERT")) {
        rows.push({
          id: idCounter++,
          sequence_number: idCounter - 1,
          actor_id: String(params[0]),
          event_type: String(params[1]),
          payload: (typeof params[2] === "string" ? JSON.parse(params[2]) : params[2]) as Record<string, unknown>,
          schema_version: String(params[3]),
          correlation_id: params[4] != null ? String(params[4]) : null,
          causation_id: params[5] != null ? String(params[5]) : null,
          recorded_at: new Date(),
        });
      }
    },
    async query<T>(sql: string, params: unknown[]): Promise<T[]> {
      if (sql.includes("correlation_id = $1")) {
        const cid = params[0] as string;
        return rows.filter((r) => r.correlation_id === cid).sort((a, b) => a.recorded_at.getTime() - b.recorded_at.getTime()) as T[];
      }
      if (sql.includes("actor_id = $1")) {
        const actorId = params[0] as string;
        const from = (params[1] as Date).getTime();
        const to = (params[2] as Date).getTime();
        return rows
          .filter((r) => r.actor_id === actorId && r.recorded_at.getTime() >= from && r.recorded_at.getTime() <= to)
          .sort((a, b) => a.recorded_at.getTime() - b.recorded_at.getTime()) as T[];
      }
      return [];
    },
  };
}

describe("PostgresAppendOnlyLogRepository", () => {
  it("append inserts with correct params", async () => {
    const mock = createMockClient();
    const repo = new PostgresAppendOnlyLogRepository(mock);

    await repo.append({
      actor_id: "actor-1",
      event_type: "identity.user.created",
      payload: { userId: "u1" },
      schema_version: "1",
      correlation_id: "corr-1",
      causation_id: null,
    });

    expect(mock.inserts).toHaveLength(1);
    expect((mock.inserts[0] as { params: unknown[] }).params[0]).toBe("actor-1");
    expect((mock.inserts[0] as { params: unknown[] }).params[1]).toBe("identity.user.created");
    expect((mock.inserts[0] as { params: unknown[] }).params[3]).toBe("1");
    expect((mock.inserts[0] as { params: unknown[] }).params[4]).toBe("corr-1");
  });

  it("findByCorrelationId returns matching entries in order", async () => {
    const mock = createMockClient();
    const repo = new PostgresAppendOnlyLogRepository(mock);

    await repo.append({
      actor_id: "a1",
      event_type: "e1",
      payload: {},
      schema_version: "1",
      correlation_id: "c1",
    });
    await repo.append({
      actor_id: "a2",
      event_type: "e2",
      payload: {},
      schema_version: "1",
      correlation_id: "c1",
    });
    await repo.append({
      actor_id: "a3",
      event_type: "e3",
      payload: {},
      schema_version: "1",
      correlation_id: "c2",
    });

    const found = await repo.findByCorrelationId("c1");
    expect(found).toHaveLength(2);
    expect(found.map((e) => e.event_type)).toEqual(["e1", "e2"]);
  });

  it("findByActorId returns entries in date range", async () => {
    const mock = createMockClient();
    const repo = new PostgresAppendOnlyLogRepository(mock);
    const base = new Date("2024-01-15T12:00:00Z");
    mock.rows.push(
      {
        id: 1,
        sequence_number: 1,
        actor_id: "user-1",
        event_type: "e1",
        payload: {},
        schema_version: "1",
        correlation_id: null,
        causation_id: null,
        recorded_at: new Date(base.getTime() + 1000),
      },
      {
        id: 2,
        sequence_number: 2,
        actor_id: "user-1",
        event_type: "e2",
        payload: {},
        schema_version: "1",
        correlation_id: null,
        causation_id: null,
        recorded_at: new Date(base.getTime() + 2000),
      },
      {
        id: 3,
        sequence_number: 3,
        actor_id: "user-2",
        event_type: "e3",
        payload: {},
        schema_version: "1",
        correlation_id: null,
        causation_id: null,
        recorded_at: new Date(base.getTime() + 1500),
      },
    );

    const from = new Date(base.getTime());
    const to = new Date(base.getTime() + 5000);
    const found = await repo.findByActorId("user-1", { from, to });
    expect(found).toHaveLength(2);
    expect(found.map((e) => e.event_type)).toEqual(["e1", "e2"]);
  });
});
