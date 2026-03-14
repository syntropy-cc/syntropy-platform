/**
 * Port for persisting TreasuryTransfer records (COMP-008.7).
 * Architecture: PAT-004 Repository pattern.
 */

import type { TreasuryTransfer } from "../treasury-transfer.js";

export interface TreasuryTransferRepositoryPort {
  save(transfer: TreasuryTransfer): Promise<void>;
  findById(transferId: string): Promise<TreasuryTransfer | null>;
}
