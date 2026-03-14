/**
 * AVUTransaction entity — journal entry for a single credit or debit (COMP-008.3).
 * Architecture: DIP Value Distribution & Treasury; ADR-009.
 */

export type AVUTransactionType = "credit" | "debit";

export interface AVUTransactionParams {
  transactionId: string;
  accountId: string;
  amount: number;
  type: AVUTransactionType;
  sourceEventId?: string;
  createdAt: Date;
}

/**
 * Immutable record of one AVU credit or debit. Stored in journal (avuTransaction).
 */
export class AVUTransaction {
  readonly transactionId: string;
  readonly accountId: string;
  readonly amount: number;
  readonly type: AVUTransactionType;
  readonly sourceEventId: string | undefined;
  readonly createdAt: Date;

  private constructor(params: AVUTransactionParams) {
    this.transactionId = params.transactionId;
    this.accountId = params.accountId;
    this.amount = params.amount;
    this.type = params.type;
    this.sourceEventId = params.sourceEventId;
    this.createdAt = params.createdAt;
  }

  static create(params: AVUTransactionParams): AVUTransaction {
    if (params.amount <= 0 || !Number.isInteger(params.amount)) {
      throw new Error("AVUTransaction amount must be a positive integer");
    }
    if (params.type !== "credit" && params.type !== "debit") {
      throw new Error("AVUTransaction type must be credit or debit");
    }
    if (!params.transactionId?.trim()) {
      throw new Error("AVUTransaction transactionId cannot be empty");
    }
    if (!params.accountId?.trim()) {
      throw new Error("AVUTransaction accountId cannot be empty");
    }
    return new AVUTransaction(params);
  }
}
