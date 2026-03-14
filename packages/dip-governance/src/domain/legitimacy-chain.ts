/**
 * LegitimacyChain — append-only hash-linked record of governance decisions (COMP-007.5).
 * Architecture: DIP Institutional Governance subdomain, Invariant I7
 */

import { createHash } from "node:crypto";
import type { LegitimacyChainEntryPayload } from "./legitimacy-chain-entry.js";
import { LegitimacyChainEntry } from "./legitimacy-chain-entry.js";

/** Fixed hash used as previousChainHash for the first entry in any chain. */
export const LEGITIMACY_CHAIN_GENESIS_HASH =
  "0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Builds the canonical string used as input for chain hash computation.
 * Order is fixed so that hashes are deterministic.
 */
function buildCanonicalPayload(payload: LegitimacyChainEntryPayload): string {
  const parts = [
    payload.institutionId,
    payload.proposalId,
    payload.eventType,
    payload.executedAt,
    payload.institutionStateBeforeHash ?? "",
    payload.institutionStateAfterHash ?? "",
  ];
  return parts.join("\n");
}

/**
 * Computes SHA-256 hex hash of (previousChainHash + canonicalPayload).
 */
function computeChainHash(
  previousChainHash: string,
  payload: LegitimacyChainEntryPayload
): string {
  const canonical = buildCanonicalPayload(payload);
  const input = previousChainHash + "\n" + canonical;
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Append-only chain of governance execution events. Each entry references the previous via hash.
 */
export class LegitimacyChain {
  private readonly _entries: LegitimacyChainEntry[] = [];

  /**
   * Returns a copy of the entries in order (oldest first).
   */
  get entries(): readonly LegitimacyChainEntry[] {
    return [...this._entries];
  }

  /**
   * Appends a new entry to the chain. Computes previousChainHash from the last entry
   * (or genesis) and chainHash from the canonical payload.
   */
  append(payload: LegitimacyChainEntryPayload): LegitimacyChainEntry {
    const previousChainHash =
      this._entries.length > 0
        ? this._entries[this._entries.length - 1].chainHash
        : LEGITIMACY_CHAIN_GENESIS_HASH;
    const chainHash = computeChainHash(previousChainHash, payload);
    const entry = LegitimacyChainEntry.create({
      institutionId: payload.institutionId,
      proposalId: payload.proposalId,
      eventType: payload.eventType,
      executedAt: payload.executedAt,
      executorId: payload.executorId,
      executorSignature: payload.executorSignature,
      institutionStateBeforeHash: payload.institutionStateBeforeHash,
      institutionStateAfterHash: payload.institutionStateAfterHash,
      previousChainHash,
      chainHash,
      nostrEventId: payload.nostrEventId,
    });
    this._entries.push(entry);
    return entry;
  }

  /**
   * Verifies the integrity of the chain: each entry's previousChainHash links to the
   * previous entry's chainHash, and each chainHash matches the recomputed value.
   */
  verify(): boolean {
    return LegitimacyChainVerifier.verify(this._entries);
  }
}

/**
 * Verifies a sequence of legitimacy chain entries (e.g. when loaded from repository).
 */
export class LegitimacyChainVerifier {
  /**
   * Returns true if the given entries form a valid hash-linked chain from genesis.
   */
  static verify(entries: readonly LegitimacyChainEntry[]): boolean {
    if (entries.length === 0) {
      return true;
    }
    let expectedPrevious = LEGITIMACY_CHAIN_GENESIS_HASH;
    for (const entry of entries) {
      if (entry.previousChainHash !== expectedPrevious) {
        return false;
      }
      const payload: LegitimacyChainEntryPayload = {
        institutionId: entry.institutionId,
        proposalId: entry.proposalId,
        eventType: entry.eventType,
        executedAt: entry.executedAt,
        executorId: entry.executorId,
        executorSignature: entry.executorSignature,
        institutionStateBeforeHash: entry.institutionStateBeforeHash,
        institutionStateAfterHash: entry.institutionStateAfterHash,
        nostrEventId: entry.nostrEventId,
      };
      const expectedChainHash = computeChainHash(expectedPrevious, payload);
      if (entry.chainHash !== expectedChainHash) {
        return false;
      }
      expectedPrevious = entry.chainHash;
    }
    return true;
  }
}
