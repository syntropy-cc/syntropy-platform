/**
 * Unit tests for SchemaRegistry (COMP-009.2).
 */

import { describe, it, expect } from "vitest";
import { SchemaRegistry } from "./SchemaRegistry.js";
import { IncompatibleSchemaError } from "./compatibility.js";

describe("SchemaRegistry", () => {
  it("register stores schema and get returns it by topic and version", () => {
    const registry = new SchemaRegistry();
    const schema = { type: "object", properties: { id: { type: "string" } }, required: ["id"] };

    registry.register("identity.events", schema, 1);

    expect(registry.get("identity.events", 1)).toEqual(schema);
    expect(registry.get("identity.events")).toEqual(schema);
    expect(registry.getLatestVersion("identity.events")).toBe(1);
  });

  it("get returns undefined for unknown topic", () => {
    const registry = new SchemaRegistry();
    expect(registry.get("unknown.topic")).toBeUndefined();
    expect(registry.getLatestVersion("unknown.topic")).toBeUndefined();
  });

  it("get returns undefined for unknown version", () => {
    const registry = new SchemaRegistry();
    registry.register("identity.events", { type: "object" }, 1);
    expect(registry.get("identity.events", 99)).toBeUndefined();
  });

  it("register stores multiple versions and getLatestVersion returns highest", () => {
    const registry = new SchemaRegistry();
    const v1 = { type: "object", properties: { a: { type: "string" } } };
    const v2 = { type: "object", properties: { a: { type: "string" }, b: { type: "number" } } };

    registry.register("test.events", v1, 1);
    registry.register("test.events", v2, 2);

    expect(registry.get("test.events", 1)).toEqual(v1);
    expect(registry.get("test.events", 2)).toEqual(v2);
    expect(registry.get("test.events")).toEqual(v2);
    expect(registry.getLatestVersion("test.events")).toBe(2);
  });

  it("getLatest returns full EventSchema for latest version", () => {
    const registry = new SchemaRegistry();
    const schema = { type: "object", required: ["x"] };
    registry.register("hub.events", schema, 3);

    const latest = registry.getLatest("hub.events");
    expect(latest).toEqual({ topic: "hub.events", schema, version: 3 });
  });

  it("getLatest returns undefined when topic has no schema", () => {
    const registry = new SchemaRegistry();
    expect(registry.getLatest("none.events")).toBeUndefined();
  });

  it("register allows backward-compatible schema when existing required fields remain", () => {
    const registry = new SchemaRegistry();
    const v1 = { type: "object", properties: { id: { type: "string" } }, required: ["id"] };
    const v2 = {
      type: "object",
      properties: { id: { type: "string" }, name: { type: "string" } },
      required: ["id"],
    };

    registry.register("identity.events", v1, 1);
    expect(() => registry.register("identity.events", v2, 2)).not.toThrow();
    expect(registry.get("identity.events", 2)).toEqual(v2);
  });

  it("register throws IncompatibleSchemaError when required field is removed", () => {
    const registry = new SchemaRegistry();
    const v1 = { type: "object", properties: { id: { type: "string" } }, required: ["id"] };
    const v2Breaking = { type: "object", properties: { id: { type: "string" } } }; // no required

    registry.register("identity.events", v1, 1);

    expect(() => registry.register("identity.events", v2Breaking, 2)).toThrow(IncompatibleSchemaError);
    expect(() => registry.register("identity.events", v2Breaking, 2)).toThrow(/required field "id"/i);
  });

  it("listAll returns empty array when no schemas registered", () => {
    const registry = new SchemaRegistry();
    expect(registry.listAll()).toEqual([]);
  });

  it("listAll returns all registered topic-version-schema entries", () => {
    const registry = new SchemaRegistry();
    const s1 = { type: "object", properties: { id: { type: "string" } } };
    const s2 = { type: "object", properties: { name: { type: "string" } } };
    registry.register("identity.events", s1, 1);
    registry.register("identity.events", s2, 2);
    registry.register("hub.events", { type: "object" }, 1);

    const list = registry.listAll();
    expect(list).toHaveLength(3);
    expect(list.map((x) => ({ topic: x.topic, version: x.version })).sort(byTopicThenVersion)).toEqual(
      [
        { topic: "hub.events", version: 1 },
        { topic: "identity.events", version: 1 },
        { topic: "identity.events", version: 2 },
      ],
    );
    expect(list.find((x) => x.topic === "identity.events" && x.version === 1)?.schema).toEqual(s1);
    expect(list.find((x) => x.topic === "identity.events" && x.version === 2)?.schema).toEqual(s2);
  });
});

function byTopicThenVersion(
  a: { topic: string; version: number },
  b: { topic: string; version: number },
): number {
  if (a.topic !== b.topic) return a.topic.localeCompare(b.topic);
  return a.version - b.version;
}
