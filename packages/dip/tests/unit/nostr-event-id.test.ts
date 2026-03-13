/**
 * Unit tests for NostrEventId value object.
 * Tests for: COMP-003.3
 */

import { describe, expect, it } from "vitest";
import {
  createNostrEventId,
  isNostrEventId,
} from "../../src/domain/artifact-registry/value-objects/nostr-event-id.js";

const VALID_64_HEX = "a".repeat(64);

describe("createNostrEventId", () => {
  it("accepts 64-character hex string and returns NostrEventId", () => {
    const id = createNostrEventId(VALID_64_HEX);
    expect(id).toBe(VALID_64_HEX);
    expect(isNostrEventId(id)).toBe(true);
  });

  it("normalizes to lowercase", () => {
    const upper = "A".repeat(64);
    const id = createNostrEventId(upper);
    expect(id).toBe("a".repeat(64));
  });

  it("throws when value is empty", () => {
    expect(() => createNostrEventId("")).toThrow("cannot be empty");
  });

  it("throws when value is not 64 characters", () => {
    expect(() => createNostrEventId("abc")).toThrow("expected 64");
    expect(() => createNostrEventId(VALID_64_HEX + "00")).toThrow("expected 64");
  });

  it("throws when value is not hexadecimal", () => {
    expect(() =>
      createNostrEventId("g" + "0".repeat(63)),
    ).toThrow("must be hexadecimal");
  });
});

describe("isNostrEventId", () => {
  it("returns true for valid 64-char hex", () => {
    expect(isNostrEventId(VALID_64_HEX)).toBe(true);
  });

  it("returns false for invalid strings", () => {
    expect(isNostrEventId("short")).toBe(false);
    expect(isNostrEventId("")).toBe(false);
  });
});
