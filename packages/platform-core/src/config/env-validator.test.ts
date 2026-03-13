/**
 * Unit tests for env-validator.
 * Architecture: COMP-037.6
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateEnv } from "./env-validator.js";

describe("validateEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("does not throw when all required keys are set and non-empty", () => {
    process.env.FOO = "bar";
    process.env.BAZ = "qux";
    expect(() => validateEnv(["FOO", "BAZ"])).not.toThrow();
  });

  it("throws when a key is missing", () => {
    process.env.FOO = "bar";
    expect(() => validateEnv(["FOO", "MISSING_KEY"])).toThrow(
      /Missing or empty required environment variable\(s\): MISSING_KEY/
    );
  });

  it("throws when a key is empty string", () => {
    process.env.FOO = "bar";
    process.env.EMPTY = "";
    expect(() => validateEnv(["FOO", "EMPTY"])).toThrow(
      /Missing or empty required environment variable\(s\): EMPTY/
    );
  });

  it("throws when a key is only whitespace", () => {
    process.env.WHITESPACE = "   ";
    expect(() => validateEnv(["WHITESPACE"])).toThrow(
      /Missing or empty required environment variable\(s\): WHITESPACE/
    );
  });

  it("does not include secret values in error message", () => {
    process.env.SECRET_KEY = "super-secret-value";
    process.env.API_KEY = "";
    try {
      validateEnv(["SECRET_KEY", "API_KEY"]);
    } catch (e) {
      const message = (e as Error).message;
      expect(message).not.toContain("super-secret-value");
      expect(message).toContain("API_KEY");
    }
  });

  it("includes prefix in error when provided", () => {
    expect(() => validateEnv(["MISSING"], { prefix: "MyApp" })).toThrow(
      /MyApp: Missing or empty/
    );
  });

  it("lists all missing keys in error message", () => {
    expect(() => validateEnv(["A", "B", "C"])).toThrow(
      /Missing or empty required environment variable\(s\): A, B, C/
    );
  });
});
