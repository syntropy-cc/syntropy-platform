/**
 * API tests for internal event-schemas routes (COMP-009.8).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../server.js";

describe("internal event-schemas API", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /internal/event-schemas returns empty array when no schemas registered", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/internal/event-schemas",
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual([]);
  });

  it("POST /internal/event-schemas with valid body returns 201 and registered schema", async () => {
    const body = {
      topic: "identity.events",
      schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      version: 1,
    };
    const response = await app.inject({
      method: "POST",
      url: "/internal/event-schemas",
      payload: body,
    });
    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.payload)).toEqual(body);
  });

  it("GET /internal/event-schemas after register returns list including new schema", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/internal/event-schemas",
    });
    expect(response.statusCode).toBe(200);
    const list = JSON.parse(response.payload) as Array<{ topic: string; version: number; schema: unknown }>;
    expect(list.length).toBeGreaterThanOrEqual(1);
    const identity = list.find((x) => x.topic === "identity.events" && x.version === 1);
    expect(identity).toBeDefined();
    expect(identity?.schema).toEqual({ type: "object", properties: { id: { type: "string" } }, required: ["id"] });
  });

  it("GET /internal/event-schemas?topic=identity.events&version=1 returns single schema", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/internal/event-schemas?topic=identity.events&version=1",
    });
    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data).toEqual({
      topic: "identity.events",
      version: 1,
      schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    });
  });

  it("GET /internal/event-schemas?topic=unknown returns 404", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/internal/event-schemas?topic=unknown.topic",
    });
    expect(response.statusCode).toBe(404);
    const data = JSON.parse(response.payload);
    expect(data.error).toBe("Not Found");
  });

  it("POST /internal/event-schemas with incompatible schema returns 400 with IncompatibleSchemaError", async () => {
    const body = {
      topic: "identity.events",
      schema: { type: "object", properties: { id: { type: "string" } } },
      version: 2,
    };
    const response = await app.inject({
      method: "POST",
      url: "/internal/event-schemas",
      payload: body,
    });
    expect(response.statusCode).toBe(400);
    const data = JSON.parse(response.payload);
    expect(data.error).toBe("IncompatibleSchemaError");
    expect(data.details).toBeDefined();
    expect(Array.isArray(data.details)).toBe(true);
  });

  it("POST /internal/event-schemas without admin key when INTERNAL_API_KEY set returns 403", async () => {
    const prev = process.env.INTERNAL_API_KEY;
    process.env.INTERNAL_API_KEY = "secret-admin-key";
    try {
      const response = await app.inject({
        method: "POST",
        url: "/internal/event-schemas",
        payload: {
          topic: "test.events",
          schema: { type: "object" },
          version: 1,
        },
      });
      expect(response.statusCode).toBe(403);
      const data = JSON.parse(response.payload);
      expect(data.error).toBe("Forbidden");
    } finally {
      if (prev !== undefined) process.env.INTERNAL_API_KEY = prev;
      else delete process.env.INTERNAL_API_KEY;
    }
  });

  it("GET /internal/event-schemas without admin key when INTERNAL_API_KEY set returns 403", async () => {
    const prev = process.env.INTERNAL_API_KEY;
    process.env.INTERNAL_API_KEY = "secret-admin-key";
    try {
      const response = await app.inject({
        method: "GET",
        url: "/internal/event-schemas",
      });
      expect(response.statusCode).toBe(403);
      const data = JSON.parse(response.payload);
      expect(data.error).toBe("Forbidden");
    } finally {
      if (prev !== undefined) process.env.INTERNAL_API_KEY = prev;
      else delete process.env.INTERNAL_API_KEY;
    }
  });

  it("POST /internal/event-schemas with valid admin key when INTERNAL_API_KEY set returns 201", async () => {
    const prev = process.env.INTERNAL_API_KEY;
    process.env.INTERNAL_API_KEY = "test-key-123";
    try {
      const response = await app.inject({
        method: "POST",
        url: "/internal/event-schemas",
        headers: { "x-internal-api-key": "test-key-123" },
        payload: {
          topic: "hub.events",
          schema: { type: "object", properties: { name: { type: "string" } } },
          version: 1,
        },
      });
      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.payload);
      expect(data.topic).toBe("hub.events");
      expect(data.version).toBe(1);
    } finally {
      if (prev !== undefined) process.env.INTERNAL_API_KEY = prev;
      else delete process.env.INTERNAL_API_KEY;
    }
  });

  it("POST /internal/event-schemas with invalid body returns 400", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/internal/event-schemas",
      payload: { topic: "x", version: 1 },
    });
    expect(response.statusCode).toBe(400);
    const data = JSON.parse(response.payload);
    expect(data.error).toBe("Bad Request");
  });
});
