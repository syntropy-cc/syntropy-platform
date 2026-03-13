/**
 * Unit tests for schema backward compatibility (COMP-009.2).
 */

import { describe, it, expect } from "vitest";
import { checkBackwardCompatible, IncompatibleSchemaError } from "./compatibility.js";

describe("checkBackwardCompatible", () => {
  it("does not throw when new schema has same required fields", () => {
    const existing = {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    };
    const newSchema = {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    };
    expect(() => checkBackwardCompatible(newSchema, existing)).not.toThrow();
  });

  it("does not throw when new schema adds optional fields", () => {
    const existing = {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    };
    const newSchema = {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
      },
      required: ["id"],
    };
    expect(() => checkBackwardCompatible(newSchema, existing)).not.toThrow();
  });

  it("does not throw when new schema adds required fields", () => {
    const existing = {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    };
    const newSchema = {
      type: "object",
      properties: { id: { type: "string" }, name: { type: "string" } },
      required: ["id", "name"],
    };
    expect(() => checkBackwardCompatible(newSchema, existing)).not.toThrow();
  });

  it("throws when existing required field is removed from required", () => {
    const existing = {
      type: "object",
      properties: { id: { type: "string" }, name: { type: "string" } },
      required: ["id", "name"],
    };
    const newSchema = {
      type: "object",
      properties: { id: { type: "string" }, name: { type: "string" } },
      required: ["id"],
    };
    expect(() => checkBackwardCompatible(newSchema, existing)).toThrow(IncompatibleSchemaError);
    expect(() => checkBackwardCompatible(newSchema, existing)).toThrow(/required field "name"/i);
  });

  it("throws when existing has required and new has no required array", () => {
    const existing = {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    };
    const newSchema = { type: "object", properties: { id: { type: "string" } } };
    expect(() => checkBackwardCompatible(newSchema, existing)).toThrow(IncompatibleSchemaError);
  });

  it("does not throw when both have no required", () => {
    const existing = { type: "object", properties: { x: { type: "number" } } };
    const newSchema = { type: "object", properties: { x: { type: "number" }, y: { type: "string" } } };
    expect(() => checkBackwardCompatible(newSchema, existing)).not.toThrow();
  });
});
