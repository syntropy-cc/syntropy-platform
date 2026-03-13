/**
 * Unit tests for AuditColumns mixin and migration helper (COMP-039.4).
 */

import { describe, it, expect } from "vitest";
import { AuditColumnsMixin, getAuditColumnsMigrationSnippet } from "./audit-columns.js";

class TestEntity extends AuditColumnsMixin {
  constructor(params?: { created_at?: Date; updated_at?: Date; created_by_actor_id?: string | null }) {
    super(params);
  }
}

describe("AuditColumnsMixin", () => {
  it("new_entity_has_created_at_and_updated_at_set", () => {
    const before = new Date();
    const entity = new TestEntity();
    const after = new Date();

    expect(entity.created_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(entity.created_at.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(entity.updated_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(entity.created_by_actor_id).toBeNull();
  });

  it("touchUpdatedAt_updates_updated_at", () => {
    const created = new Date("2025-01-01T00:00:00Z");
    const entity = new TestEntity({ created_at: created, updated_at: created });

    const beforeTouch = new Date();
    entity.touchUpdatedAt();
    const afterTouch = new Date();

    expect(entity.created_at).toEqual(created);
    expect(entity.updated_at.getTime()).toBeGreaterThanOrEqual(beforeTouch.getTime());
    expect(entity.updated_at.getTime()).toBeLessThanOrEqual(afterTouch.getTime() + 1000);
  });

  it("accepts_created_by_actor_id", () => {
    const entity = new TestEntity({
      created_by_actor_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(entity.created_by_actor_id).toBe("550e8400-e29b-41d4-a716-446655440000");
  });
});

describe("getAuditColumnsMigrationSnippet", () => {
  it("returns_sql_with_table_name_and_columns_and_trigger", () => {
    const sql = getAuditColumnsMigrationSnippet("users");
    expect(sql).toContain("users");
    expect(sql).toContain("created_at TIMESTAMPTZ");
    expect(sql).toContain("updated_at TIMESTAMPTZ");
    expect(sql).toContain("created_by_actor_id UUID");
    expect(sql).toContain("set_updated_at");
    expect(sql).toContain("CREATE TRIGGER");
  });
});
