/**
 * Port for persisting TreasuryAccount (COMP-008.3).
 * Architecture: PAT-004 Repository pattern
 */

import type { TreasuryAccount } from "../treasury-account.js";

export interface TreasuryAccountRepositoryPort {
  findByAccountId(accountId: string): Promise<TreasuryAccount | null>;
  findByInstitutionId(institutionId: string): Promise<TreasuryAccount | null>;
  save(account: TreasuryAccount): Promise<void>;
}
