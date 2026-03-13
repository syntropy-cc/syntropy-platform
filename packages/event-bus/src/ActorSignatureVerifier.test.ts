/**
 * Unit tests for ActorSignatureVerifier (COMP-009.4).
 */

import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import {
  ActorSignatureVerifier,
  InvalidSignatureError,
  type SignedEnvelope,
} from "./ActorSignatureVerifier.js";

function buildCanonical(envelope: SignedEnvelope): string {
  const payload = {
    eventType: envelope.eventType,
    payload: envelope.payload,
    timestamp: envelope.timestamp ?? "",
    correlationId: envelope.correlationId ?? "",
    causationId: envelope.causationId ?? "",
  };
  return JSON.stringify(payload);
}

function signHmac(secret: string, canonical: string): string {
  return createHmac("sha256", secret).update(canonical).digest("base64");
}

describe("ActorSignatureVerifier", () => {
  describe("HMAC verification", () => {
    it("accepts envelope with valid HMAC signature", async () => {
      const secret = "test-secret";
      const verifier = new ActorSignatureVerifier({ secret });
      const envelope: SignedEnvelope = {
        eventType: "identity.user.created",
        payload: { userId: "u1" },
        timestamp: "2024-01-15T10:00:00Z",
      };
      const canonical = buildCanonical(envelope);
      envelope.signature = signHmac(secret, canonical);

      await expect(verifier.verify(envelope)).resolves.toBeUndefined();
    });

    it("rejects envelope with missing signature", async () => {
      const verifier = new ActorSignatureVerifier({ secret: "x" });
      const envelope: SignedEnvelope = {
        eventType: "test.event",
        payload: {},
      };

      await expect(verifier.verify(envelope)).rejects.toThrow(InvalidSignatureError);
      await expect(verifier.verify(envelope)).rejects.toThrow(/signature is required/i);
    });

    it("rejects envelope with invalid HMAC signature", async () => {
      const verifier = new ActorSignatureVerifier({ secret: "secret-a" });
      const envelope: SignedEnvelope = {
        eventType: "test.event",
        payload: { id: 1 },
        signature: "invalid-or-wrong-secret-signature-base64==",
      };

      await expect(verifier.verify(envelope)).rejects.toThrow(InvalidSignatureError);
      await expect(verifier.verify(envelope)).rejects.toThrow(/does not match/i);
    });

    it("rejects envelope when signature was computed with different secret", async () => {
      const envelope: SignedEnvelope = {
        eventType: "identity.user.created",
        payload: { userId: "u1" },
      };
      const canonical = buildCanonical(envelope);
      envelope.signature = signHmac("other-secret", canonical);

      const verifier = new ActorSignatureVerifier({ secret: "correct-secret" });
      await expect(verifier.verify(envelope)).rejects.toThrow(InvalidSignatureError);
    });

    it("rejects envelope with tampered payload when signature is valid for original", async () => {
      const secret = "s";
      const envelope: SignedEnvelope = {
        eventType: "test.event",
        payload: { value: 1 },
      };
      const canonical = buildCanonical(envelope);
      envelope.signature = signHmac(secret, canonical);

      const verifier = new ActorSignatureVerifier({ secret });
      await expect(verifier.verify(envelope)).resolves.toBeUndefined();

      envelope.payload = { value: 2 };
      await expect(verifier.verify(envelope)).rejects.toThrow(InvalidSignatureError);
    });
  });
});
