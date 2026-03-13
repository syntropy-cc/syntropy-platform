/**
 * Unit tests for AuthorId value object.
 * Tests for: COMP-003.1
 */

import { describe, expect, it } from "vitest";
import { createAuthorId, isAuthorId } from "../../src/domain/artifact-registry/value-objects/author-id.js";

describe("createAuthorId", () => {
  it("accepts valid UUID format and returns AuthorId", () => {
    const valid = "a1b2c3d4-e5f6-4789-a012-3456789abcde";
    const id = createAuthorId(valid);
    expect(id).toBe(valid);
    expect(isAuthorId(id)).toBe(true);
  });

  it("throws when value is empty string", () => {
    expect(() => createAuthorId("")).toThrow("cannot be empty");
  });

  it("throws when value is not a valid UUID", () => {
    expect(() => createAuthorId("not-a-uuid")).toThrow("expected UUID format");
  });
});

describe("isAuthorId", () => {
  it("returns true for valid UUID string", () => {
    expect(isAuthorId("a1b2c3d4-e5f6-4789-a012-3456789abcde")).toBe(true);
  });

  it("returns false for invalid string", () => {
    expect(isAuthorId("invalid")).toBe(false);
  });
});
