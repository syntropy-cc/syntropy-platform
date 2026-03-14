/**
 * SignatureCollector — collects n-of-m signatures for IACP.
 * Architecture: COMP-005.4, DIP IACP Engine
 */

import type { IACPParty } from "./value-objects/iacp-party.js";
import type { SignatureThreshold } from "./value-objects/signature-threshold.js";
import { isThresholdMet } from "./value-objects/signature-threshold.js";
import { DuplicateSignatureError } from "./errors.js";

/**
 * Immutable state of collected signatures: actorId -> signature payload.
 */
export interface SignatureCollectorState {
  readonly threshold: SignatureThreshold;
  readonly signatures: ReadonlyMap<string, string>;
}

/**
 * Collects signatures from parties and checks whether the n-of-m threshold is met.
 * Rejects duplicate signatures for the same actorId.
 */
export class SignatureCollector {
  readonly threshold: SignatureThreshold;
  readonly signatures: ReadonlyMap<string, string>;

  constructor(threshold: SignatureThreshold, signatures?: ReadonlyMap<string, string>) {
    this.threshold = threshold;
    this.signatures = signatures ?? new Map();
  }

  /**
   * Returns a new SignatureCollector with the party's signature added.
   * Validates that the party's actorId is not already present.
   *
   * @param party - Party providing the signature (actorId used as key)
   * @param signature - Signature payload (e.g. base64 or hash)
   * @returns New SignatureCollector with signature added
   * @throws DuplicateSignatureError if party.actorId already has a signature
   */
  addSignature(party: IACPParty, signature: string): SignatureCollector {
    if (this.signatures.has(party.actorId)) {
      throw new DuplicateSignatureError(party.actorId);
    }
    const next = new Map(this.signatures);
    next.set(party.actorId, signature);
    return new SignatureCollector(this.threshold, next);
  }

  /**
   * Returns true when the number of collected signatures meets the threshold.
   */
  isThresholdMet(): boolean {
    return isThresholdMet(this.threshold, this.signatures.size);
  }

  /** Number of signatures collected so far. */
  get signedCount(): number {
    return this.signatures.size;
  }
}
