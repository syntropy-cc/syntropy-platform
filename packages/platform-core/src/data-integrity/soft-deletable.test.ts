/**
 * Unit tests for SoftDeletable mixin (COMP-039.1).
 */

import { describe, it, expect } from "vitest";
import { SoftDeletableMixin } from "./soft-deletable.js";

class TestEntity extends SoftDeletableMixin {
  constructor(public id: string) {
    super();
  }
}

describe("SoftDeletableMixin", () => {
  it("has deleted_at null initially", () => {
    const entity = new TestEntity("e1");
    expect(entity.deleted_at).toBeNull();
    expect(entity.isDeleted).toBe(false);
  });

  it("sets deleted_at when softDelete is called", () => {
    const entity = new TestEntity("e1");
    const before = new Date();
    entity.softDelete();
    const after = new Date();
    expect(entity.deleted_at).not.toBeNull();
    expect(entity.deleted_at!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(entity.deleted_at!.getTime()).toBeLessThanOrEqual(after.getTime() + 100);
    expect(entity.isDeleted).toBe(true);
  });

  it("is idempotent: second softDelete leaves deleted_at unchanged", () => {
    const entity = new TestEntity("e1");
    entity.softDelete();
    const first = entity.deleted_at!.getTime();
    entity.softDelete();
    expect(entity.deleted_at!.getTime()).toBe(first);
  });
});
