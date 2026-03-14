/**
 * TreasuryAccount aggregate — AVU balance ledger for an institution (COMP-008.1).
 * Architecture: DIP Value Distribution & Treasury subdomain; ADR-009.
 * Invariant: balance never negative (enforced in debit()).
 */

/** Thrown when debit would make balance negative. */
export class InsufficientBalanceError extends Error {
  constructor(
    public readonly accountId: string,
    public readonly currentBalance: number,
    public readonly requestedDebit: number
  ) {
    super(
      `Insufficient AVU balance: account ${accountId} has ${currentBalance}, cannot debit ${requestedDebit}`
    );
    this.name = "InsufficientBalanceError";
  }
}

/**
 * TreasuryAccount aggregate. Holds AVU balance for an institution; credit/debit
 * enforce non-negative balance (Invariant I4).
 */
export class TreasuryAccount {
  readonly accountId: string;
  readonly institutionId: string;
  private _avuBalance: number;

  private constructor(params: {
    accountId: string;
    institutionId: string;
    avuBalance: number;
  }) {
    this.accountId = params.accountId;
    this.institutionId = params.institutionId;
    this._avuBalance = params.avuBalance;
  }

  get avuBalance(): number {
    return this._avuBalance;
  }

  /**
   * Creates a new TreasuryAccount with zero balance.
   */
  static create(params: {
    accountId: string;
    institutionId: string;
  }): TreasuryAccount {
    if (!params.accountId?.trim()) {
      throw new Error("TreasuryAccount.accountId cannot be empty");
    }
    if (!params.institutionId?.trim()) {
      throw new Error("TreasuryAccount.institutionId cannot be empty");
    }
    return new TreasuryAccount({
      accountId: params.accountId.trim(),
      institutionId: params.institutionId.trim(),
      avuBalance: 0,
    });
  }

  /**
   * Reconstructs from persistence (repository use).
   */
  static fromPersistence(params: {
    accountId: string;
    institutionId: string;
    avuBalance: number;
  }): TreasuryAccount {
    if (params.avuBalance < 0) {
      throw new Error("TreasuryAccount.avuBalance cannot be negative");
    }
    return new TreasuryAccount(params);
  }

  /**
   * Credits AVU to the account. Amount must be positive.
   */
  credit(amount: number): void {
    if (amount <= 0 || !Number.isInteger(amount)) {
      throw new Error("credit amount must be a positive integer");
    }
    this._avuBalance += amount;
  }

  /**
   * Debits AVU from the account. Throws if balance would become negative.
   */
  debit(amount: number): void {
    if (amount <= 0 || !Number.isInteger(amount)) {
      throw new Error("debit amount must be a positive integer");
    }
    if (this._avuBalance < amount) {
      throw new InsufficientBalanceError(
        this.accountId,
        this._avuBalance,
        amount
      );
    }
    this._avuBalance -= amount;
  }
}
