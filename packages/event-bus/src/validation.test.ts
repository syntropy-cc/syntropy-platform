/**
 * Unit tests for event envelope validation (COMP-009.1).
 */

import { describe, it, expect } from "vitest";
import { validateEventEnvelope, InvalidEventEnvelopeError } from "./validation.js";

describe("validateEventEnvelope", () => {
  it("accepts valid envelope with eventType and payload", () => {
    const event = { eventType: "identity.user.created", payload: { userId: "u1" } };
    const result = validateEventEnvelope(event);
    expect(result.eventType).toBe("identity.user.created");
    expect(result.payload).toEqual({ userId: "u1" });
  });

  it("accepts envelope with optional fields", () => {
    const event = {
      eventType: "test.event",
      payload: {},
      schemaVersion: 1,
      correlationId: "c1",
      causationId: "p1",
      timestamp: "2024-01-15T10:00:00Z",
      key: "k1",
    };
    const result = validateEventEnvelope(event);
    expect(result.schemaVersion).toBe(1);
    expect(result.correlationId).toBe("c1");
    expect(result.causationId).toBe("p1");
    expect(result.timestamp).toBe("2024-01-15T10:00:00Z");
    expect(result.key).toBe("k1");
  });

  it("trims eventType whitespace", () => {
    const result = validateEventEnvelope({
      eventType: "  learn.fragment.published  ",
      payload: null,
    });
    expect(result.eventType).toBe("learn.fragment.published");
  });

  it("throws when event is null", () => {
    expect(() => validateEventEnvelope(null)).toThrow(InvalidEventEnvelopeError);
    expect(() => validateEventEnvelope(null)).toThrow("Event must be a non-null object");
  });

  it("throws when event is not an object", () => {
    expect(() => validateEventEnvelope("string")).toThrow(InvalidEventEnvelopeError);
    expect(() => validateEventEnvelope(42)).toThrow(InvalidEventEnvelopeError);
  });

  it("throws when eventType is missing", () => {
    expect(() => validateEventEnvelope({ payload: {} })).toThrow(InvalidEventEnvelopeError);
    expect(() => validateEventEnvelope({ payload: {} })).toThrow("eventType");
  });

  it("throws when eventType is empty string", () => {
    expect(() => validateEventEnvelope({ eventType: "", payload: {} })).toThrow(
      InvalidEventEnvelopeError,
    );
  });

  it("throws when payload is missing", () => {
    expect(() => validateEventEnvelope({ eventType: "test" })).toThrow(InvalidEventEnvelopeError);
    expect(() => validateEventEnvelope({ eventType: "test" })).toThrow("payload");
  });

  it("throws when schemaVersion is not a number", () => {
    expect(() =>
      validateEventEnvelope({
        eventType: "test",
        payload: {},
        schemaVersion: "1",
      }),
    ).toThrow(InvalidEventEnvelopeError);
  });

  it("exposes errors array on InvalidEventEnvelopeError", () => {
    try {
      validateEventEnvelope({});
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidEventEnvelopeError);
      expect((e as InvalidEventEnvelopeError).errors).toContain(
        "eventType is required and must be a non-empty string",
      );
      expect((e as InvalidEventEnvelopeError).errors).toContain("payload is required");
    }
  });
});
