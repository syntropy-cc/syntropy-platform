/**
 * Unit tests for ArtifactId value object.
 * Tests for: COMP-003.1
 */

import { describe, expect, it } from "vitest";
import { createArtifactId, isArtifactId } from "../../src/domain/artifact-registry/value-objects/artifact-id.js";

describe("createArtifactId", () => {
  it("accepts valid UUID v4 format and returns ArtifactId", () => {
    const valid = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
    const id = createArtifactId(valid);
    expect(id).toBe(valid);
    expect(isArtifactId(id)).toBe(true);
  });

  it("accepts UUID with uppercase hex and normalizes", () => {
    const valid = "F47AC10B-58CC-4372-A567-0E02B2C3D479";
    const id = createArtifactId(valid);
    expect(id).toBe(valid);
  });

  it("throws when value is empty string", () => {
    expect(() => createArtifactId("")).toThrow("cannot be empty");
  });

  it("throws when value is whitespace only", () => {
    expect(() => createArtifactId("   ")).toThrow("cannot be empty");
  });

  it("throws when value is not a valid UUID format", () => {
    expect(() => createArtifactId("not-a-uuid")).toThrow("expected UUID format");
    expect(() => createArtifactId("123")).toThrow("expected UUID format");
  });
});

describe("isArtifactId", () => {
  it("returns true for valid UUID string", () => {
    expect(isArtifactId("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(true);
  });

  it("returns false for invalid string", () => {
    expect(isArtifactId("invalid")).toBe(false);
    expect(isArtifactId("")).toBe(false);
  });
});
