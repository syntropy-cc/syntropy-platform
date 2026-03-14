/**
 * In-memory TreasuryAccount repository for tests (COMP-008.3).
 */

import type { TreasuryAccount } from "../domain/treasury-account.js";
import type { TreasuryAccountRepositoryPort } from "../domain/ports/treasury-account-repository-port.js";

export class InMemoryTreasuryAccountRepository implements TreasuryAccountRepositoryPort {
  private readonly accounts = new Map<string, TreasuryAccount>();

  async findByAccountId(accountId: string): Promise<TreasuryAccount | null> {
    return this.accounts.get(accountId) ?? null;
  }

  async findByInstitutionId(institutionId: string): Promise<TreasuryAccount | null> {
    for (const account of this.accounts.values()) {
      if (account.institutionId === institutionId) {
        return account;
      }
    }
    return null;
  }

  async save(account: TreasuryAccount): Promise<void> {
    this.accounts.set(account.accountId, account);
  }

  clear(): void {
    this.accounts.clear();
  }
}
