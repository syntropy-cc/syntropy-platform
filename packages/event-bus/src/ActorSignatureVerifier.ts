/**
 * Verifies actor or service signatures on event envelopes.
 *
 * Supports HMAC-SHA256 (Level 2 ecosystem events) and Ed25519 (Level 1 DIP).
 * Architecture: COMP-009.4, ADR-010
 */

import { createHmac, timingSafeEqual } from "crypto";
import type { EventEnvelope } from "./types.js";

/**
 * Envelope with optional signature fields (from message headers or payload).
 */
export interface SignedEnvelope extends EventEnvelope {
  /** Base64 or hex-encoded signature. */
  signature?: string;
  /** For Ed25519: public key (hex or base64). */
  actorPublicKey?: string;
}

export class InvalidSignatureError extends Error {
  constructor(message: string, public readonly reason?: string) {
    super(message);
    this.name = "InvalidSignatureError";
    Object.setPrototypeOf(this, InvalidSignatureError.prototype);
  }
}

/**
 * Options for HMAC-based verification (Level 2 service-signed events).
 */
export interface HmacVerifyOptions {
  /** Shared secret for HMAC-SHA256. */
  secret: string;
  /** Encoding of the signature in the envelope. Default "base64". */
  encoding?: "base64" | "hex";
}

/**
 * Options for Ed25519 verification (Level 1 actor-signed events).
 */
export interface Ed25519VerifyOptions {
  /** If true, require actorPublicKey and signature and verify with Ed25519. */
  allowEd25519: true;
}

export type ActorSignatureVerifierOptions = HmacVerifyOptions | Ed25519VerifyOptions;

/**
 * Builds a canonical payload string for signing/verification.
 * Must match what the producer used when signing.
 */
function canonicalPayload(envelope: EventEnvelope): string {
  const payload = {
    eventType: envelope.eventType,
    payload: envelope.payload,
    timestamp: envelope.timestamp ?? "",
    correlationId: envelope.correlationId ?? "",
    causationId: envelope.causationId ?? "",
  };
  return JSON.stringify(payload);
}

/**
 * Verifies event envelope signatures (HMAC or Ed25519).
 * Rejects events with missing or invalid signature.
 */
export class ActorSignatureVerifier {
  constructor(private readonly options: ActorSignatureVerifierOptions) {}

  /**
   * Verifies the envelope's signature. Throws if signature is missing or invalid.
   */
  async verify(envelope: SignedEnvelope): Promise<void> {
    const sig = envelope.signature;
    const publicKey = envelope.actorPublicKey;

    if ("allowEd25519" in this.options && this.options.allowEd25519 && publicKey && sig) {
      await this.verifyEd25519(envelope, sig, publicKey);
      return;
    }

    if ("secret" in this.options) {
      if (!sig) {
        throw new InvalidSignatureError("Signature is required for HMAC verification", "missing");
      }
      this.verifyHmac(envelope, sig);
      return;
    }

    throw new InvalidSignatureError(
      "Envelope has no signature or verifier not configured for this signing method",
      "missing",
    );
  }

  private verifyHmac(envelope: SignedEnvelope, signature: string): void {
    if (!("secret" in this.options)) return;
    const opts = this.options as HmacVerifyOptions;
    const secret = opts.secret;
    const canonical = canonicalPayload(envelope);
    const expected = createHmac("sha256", secret).update(canonical).digest("base64");
    const encoding = opts.encoding ?? "base64";
    let actual: Buffer;
    try {
      actual = Buffer.from(signature, encoding);
    } catch {
      throw new InvalidSignatureError("Signature is not valid base64", "invalid_encoding");
    }
    const expectedBuf = Buffer.from(expected, "base64");
    if (expectedBuf.length !== actual.length || !timingSafeEqual(expectedBuf, actual)) {
      throw new InvalidSignatureError("HMAC signature does not match", "invalid");
    }
  }

  private async verifyEd25519(envelope: SignedEnvelope, signature: string, publicKey: string): Promise<void> {
    const canonical = canonicalPayload(envelope);
    const message = Buffer.from(canonical, "utf8");
    let sigBuf: Buffer;
    let keyBuf: Buffer;
    try {
      sigBuf = Buffer.from(signature, "hex");
      keyBuf = Buffer.from(publicKey, "hex");
    } catch {
      try {
        sigBuf = Buffer.from(signature, "base64");
        keyBuf = Buffer.from(publicKey, "base64");
      } catch {
        throw new InvalidSignatureError("Signature or public key encoding invalid", "invalid_encoding");
      }
    }
    const ok = await ed25519Verify(message, sigBuf, keyBuf);
    if (!ok) {
      throw new InvalidSignatureError("Ed25519 signature verification failed", "invalid");
    }
  }
}

/**
 * Build SPKI DER for raw 32-byte Ed25519 public key (Node.js compatibility).
 */
function ed25519PublicKeyToDer(raw: Buffer): Buffer {
  const OID_ED25519 = Buffer.from([0x06, 0x03, 0x2b, 0x65, 0x70]);
  const key = raw.length === 32 ? raw : raw.subarray(-32);
  const bitString = Buffer.concat([Buffer.from([0x03, 0x21, 0x00]), key]);
  const alg = Buffer.concat([Buffer.from([0x30, 0x05]), OID_ED25519]);
  const spki = Buffer.concat([Buffer.from([0x30, 0x2a]), alg, bitString]);
  return spki;
}

/**
 * Ed25519 verify using Node crypto.
 */
async function ed25519Verify(message: Buffer, signature: Buffer, publicKey: Buffer): Promise<boolean> {
  const { createPublicKey, verify } = await import("crypto");
  const keyBuf = publicKey.length === 32 ? publicKey : publicKey.subarray(-32);
  try {
    const keyObject = createPublicKey({
      key: ed25519PublicKeyToDer(keyBuf),
      format: "der",
      type: "spki",
    });
    return verify(null, message, keyObject, signature);
  } catch {
    return false;
  }
}
