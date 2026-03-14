/**
 * Unit tests for SignatureThreshold value object.
 * Tests for: COMP-005.2
 */

import { describe, expect, it } from "vitest";
import {
  createSignatureThreshold,
  isThresholdMet,
} from "../../src/domain/value-objects/signature-threshold.js";

describe("createSignatureThreshold", () => {
  it("creates valid n-of-m threshold", () => {
    const t = createSignatureThreshold(2, 3);
    expect(t.required).toBe(2);
    expect(t.total).toBe(3);
  });

  it("accepts 1-of-1", () => {
    const t = createSignatureThreshold(1, 1);
    expect(t.required).toBe(1);
    expect(t.total).toBe(1);
  });

  it("accepts required equals total", () => {
    const t = createSignatureThreshold(5, 5);
    expect(t.required).toBe(5);
    expect(t.total).toBe(5);
  });

  it("throws when required greater than total", () => {
    expect(() => createSignatureThreshold(4, 3)).toThrow(
      "required must be between 1 and total"
    );
  });

  it("throws when required is zero", () => {
    expect(() => createSignatureThreshold(0, 3)).toThrow(
      "required must be between 1 and total"
    );
  });

  it("throws when total is zero", () => {
    expect(() => createSignatureThreshold(0, 0)).toThrow(
      "total must be at least 1"
    );
  });

  it("throws when total is negative", () => {
    expect(() => createSignatureThreshold(1, -1)).toThrow(
      "total must be at least 1"
    );
  });

  it("throws when required or total are non-integer", () => {
    expect(() => createSignatureThreshold(1.5, 3)).toThrow(
      "required and total must be integers"
    );
    expect(() => createSignatureThreshold(1, 3.5)).toThrow(
      "required and total must be integers"
    );
  });
});

describe("isThresholdMet", () => {
  it("returns true when signedCount equals required", () => {
    const t = createSignatureThreshold(2, 3);
    expect(isThresholdMet(t, 2)).toBe(true);
  });

  it("returns true when signedCount exceeds required", () => {
    const t = createSignatureThreshold(2, 3);
    expect(isThresholdMet(t, 3)).toBe(true);
  });

  it("returns false when signedCount below required", () => {
    const t = createSignatureThreshold(2, 3);
    expect(isThresholdMet(t, 0)).toBe(false);
    expect(isThresholdMet(t, 1)).toBe(false);
  });

  it("returns true for 1-of-1 when one signature", () => {
    const t = createSignatureThreshold(1, 1);
    expect(isThresholdMet(t, 1)).toBe(true);
  });

  it("returns false for 1-of-1 when zero signatures", () => {
    const t = createSignatureThreshold(1, 1);
    expect(isThresholdMet(t, 0)).toBe(false);
  });
});
