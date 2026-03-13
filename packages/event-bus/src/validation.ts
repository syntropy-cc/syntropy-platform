/**
 * Event envelope validation for the event bus.
 *
 * Validates minimal required shape before publish. Full SchemaRegistry
 * validation is implemented in COMP-009.2.
 *
 * Architecture: COMP-009.1
 */

import type { EventEnvelope } from "./types.js";

export class InvalidEventEnvelopeError extends Error {
  constructor(
    message: string,
    public readonly errors: string[],
  ) {
    super(message);
    this.name = "InvalidEventEnvelopeError";
    Object.setPrototypeOf(this, InvalidEventEnvelopeError.prototype);
  }
}

/**
 * Validates that the value is a valid EventEnvelope (has eventType and payload).
 * Returns the validated envelope or throws InvalidEventEnvelopeError.
 */
export function validateEventEnvelope(event: unknown): EventEnvelope {
  const errors: string[] = [];

  if (event === null || typeof event !== "object") {
    throw new InvalidEventEnvelopeError(
      "Event must be a non-null object",
      ["Event must be an object"],
    );
  }

  const obj = event as Record<string, unknown>;

  if (typeof obj.eventType !== "string" || obj.eventType.trim() === "") {
    errors.push("eventType is required and must be a non-empty string");
  }

  if (obj.payload === undefined) {
    errors.push("payload is required");
  }

  if (obj.schemaVersion !== undefined && typeof obj.schemaVersion !== "number") {
    errors.push("schemaVersion must be a number when present");
  }

  if (obj.correlationId !== undefined && typeof obj.correlationId !== "string") {
    errors.push("correlationId must be a string when present");
  }

  if (obj.causationId !== undefined && typeof obj.causationId !== "string") {
    errors.push("causationId must be a string when present");
  }

  if (obj.timestamp !== undefined && typeof obj.timestamp !== "string") {
    errors.push("timestamp must be a string when present");
  }

  if (obj.key !== undefined && typeof obj.key !== "string") {
    errors.push("key must be a string when present");
  }

  if (errors.length > 0) {
    throw new InvalidEventEnvelopeError(
      `Invalid event envelope: ${errors.join("; ")}`,
      errors,
    );
  }

  return {
    eventType: (obj.eventType as string).trim(),
    payload: obj.payload,
    schemaVersion: obj.schemaVersion as number | undefined,
    correlationId: obj.correlationId as string | undefined,
    causationId: obj.causationId as string | undefined,
    timestamp: obj.timestamp as string | undefined,
    key: obj.key as string | undefined,
  };
}
