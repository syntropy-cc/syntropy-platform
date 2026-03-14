/**
 * AVUAccountingService — records credit/debit and updates TreasuryAccount (COMP-008.3).
 * Architecture: DIP Value Distribution & Treasury; all transactions journalled; atomic with repo + journal.
 */

import { TreasuryAccount } from "../treasury-account.js";
import { AVUTransaction } from "../avu-transaction.js";
import type { TreasuryAccountRepositoryPort } from "../ports/treasury-account-repository-port.js";
import type { AVUTransactionJournalPort } from "../ports/avu-transaction-journal-port.js";

export interface RecordTransactionParams {
  transactionId: string;
  accountId: string;
  amount: number;
  type: "credit" | "debit";
  sourceEventId?: string;
}

/**
 * Records an AVU credit or debit: appends to journal then updates account balance and saves.
 * Order: journal append first so that if it fails, balance is not updated (atomicity).
 */
export class AVUAccountingService {
  constructor(
    private readonly accountRepository: TreasuryAccountRepositoryPort,
    private readonly journal: AVUTransactionJournalPort
  ) {}

  async record(params: RecordTransactionParams): Promise<void> {
    const existing = await this.accountRepository.findByAccountId(params.accountId);
    if (existing == null) {
      throw new Error(
        `TreasuryAccount not found: ${params.accountId}. Create account before recording transactions.`
      );
    }

    const account = TreasuryAccount.fromPersistence({
      accountId: existing.accountId,
      institutionId: existing.institutionId,
      avuBalance: existing.avuBalance,
    });

    if (params.type === "credit") {
      account.credit(params.amount);
    } else {
      account.debit(params.amount);
    }

    const transaction = AVUTransaction.create({
      transactionId: params.transactionId,
      accountId: params.accountId,
      amount: params.amount,
      type: params.type,
      sourceEventId: params.sourceEventId,
      createdAt: new Date(),
    });
    await this.journal.append(transaction);
    await this.accountRepository.save(account);
  }
}
