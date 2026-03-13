/**
 * Unit tests for ContentHash value object.
 * Tests for: COMP-003.1
 */

import { describe, expect, it } from "vitest";
import {
  createContentHash,
  isContentHash,
} from "../../src/domain/artifact-registry/value-objects/content-hash.js";

const VALID_64_HEX =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

describe("createContentHash", () => {
  it("accepts 64-character hex string and returns ContentHash", () => {
    const hash = createContentHash(VALID_64_HEX);
    expect(hash).toBe(VALID_64_HEX.toLowerCase());
    expect(isContentHash(hash)).toBe(true);
  });

  it("normalizes to lowercase", () => {
    const upper =
      "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855";
    const hash = createContentHash(upper);
    expect(hash).toBe(upper.toLowerCase());
  });

  it("throws when value is empty", () => {
    expect(() => createContentHash("")).toThrow("cannot be empty");
  });

  it("throws when length is not 64", () => {
    expect(() => createContentHash("abc")).toThrow("expected 64");
    expect(() =>
      createContentHash(VALID_64_HEX + "00"),
    ).toThrow("expected 64");
  });

  it("throws when value contains non-hex characters", () => {
    expect(() =>
      createContentHash("g3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
    ).toThrow("must be hexadecimal");
  });
});

describe("isContentHash", () => {
  it("returns true for valid 64-char hex", () => {
    expect(isContentHash(VALID_64_HEX)).toBe(true);
  });

  it("returns false for invalid string", () => {
    expect(isContentHash("short")).toBe(false);
    expect(isContentHash("")).toBe(false);
  });
});
