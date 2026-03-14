/**
 * LegitimacyChainEntry value object — single link in the governance legitimacy chain (COMP-007.5).
 * Architecture: DIP Institutional Governance subdomain, Invariant I7
 */

/**
 * Payload used to create a new chain entry (before chain hash is computed).
 */
export interface LegitimacyChainEntryPayload {
  readonly institutionId: string;
  readonly proposalId: string;
  readonly eventType: string;
  readonly executedAt: string; // ISO 8601
  readonly executorId?: string;
  readonly executorSignature?: string;
  readonly institutionStateBeforeHash?: string;
  readonly institutionStateAfterHash?: string;
  readonly nostrEventId?: string;
}

/**
 * Immutable value object representing one entry in the LegitimacyChain.
 * Each entry references the previous via previousChainHash; chainHash is SHA256(previousChainHash + canonicalPayload).
 */
export class LegitimacyChainEntry {
  readonly institutionId: string;
  readonly proposalId: string;
  readonly eventType: string;
  readonly executedAt: string;
  readonly executorId: string | undefined;
  readonly executorSignature: string | undefined;
  readonly institutionStateBeforeHash: string | undefined;
  readonly institutionStateAfterHash: string | undefined;
  readonly previousChainHash: string;
  readonly chainHash: string;
  readonly nostrEventId: string | undefined;

  private constructor(params: {
    institutionId: string;
    proposalId: string;
    eventType: string;
    executedAt: string;
    executorId?: string;
    executorSignature?: string;
    institutionStateBeforeHash?: string;
    institutionStateAfterHash?: string;
    previousChainHash: string;
    chainHash: string;
    nostrEventId?: string;
  }) {
    this.institutionId = params.institutionId;
    this.proposalId = params.proposalId;
    this.eventType = params.eventType;
    this.executedAt = params.executedAt;
    this.executorId = params.executorId;
    this.executorSignature = params.executorSignature;
    this.institutionStateBeforeHash = params.institutionStateBeforeHash;
    this.institutionStateAfterHash = params.institutionStateAfterHash;
    this.previousChainHash = params.previousChainHash;
    this.chainHash = params.chainHash;
    this.nostrEventId = params.nostrEventId;
  }

  /**
   * Creates an entry with precomputed hashes (used by LegitimacyChain.append).
   */
  static create(params: {
    institutionId: string;
    proposalId: string;
    eventType: string;
    executedAt: string;
    executorId?: string;
    executorSignature?: string;
    institutionStateBeforeHash?: string;
    institutionStateAfterHash?: string;
    previousChainHash: string;
    chainHash: string;
    nostrEventId?: string;
  }): LegitimacyChainEntry {
    if (!params.institutionId?.trim()) {
      throw new Error("LegitimacyChainEntry.institutionId cannot be empty");
    }
    if (!params.proposalId?.trim()) {
      throw new Error("LegitimacyChainEntry.proposalId cannot be empty");
    }
    if (!params.eventType?.trim()) {
      throw new Error("LegitimacyChainEntry.eventType cannot be empty");
    }
    if (!params.executedAt?.trim()) {
      throw new Error("LegitimacyChainEntry.executedAt cannot be empty");
    }
    if (!params.previousChainHash?.trim()) {
      throw new Error("LegitimacyChainEntry.previousChainHash cannot be empty");
    }
    if (!params.chainHash?.trim()) {
      throw new Error("LegitimacyChainEntry.chainHash cannot be empty");
    }
    return new LegitimacyChainEntry(params);
  }

  /**
   * Reconstructs from persistence (repository use).
   */
  static fromPersistence(params: {
    institutionId: string;
    proposalId: string;
    eventType: string;
    executedAt: string;
    executorId?: string;
    executorSignature?: string;
    institutionStateBeforeHash?: string;
    institutionStateAfterHash?: string;
    previousChainHash: string;
    chainHash: string;
    nostrEventId?: string;
  }): LegitimacyChainEntry {
    return new LegitimacyChainEntry(params);
  }
}
