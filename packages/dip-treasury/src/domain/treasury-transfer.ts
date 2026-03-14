/**
 * TreasuryTransfer aggregate — records a debit/credit between two accounts (COMP-008.6).
 * Architecture: DIP Value Distribution & Treasury; immutable once created.
 * Publishes dip.treasury.transfer_recorded (payload exposed for application layer to publish).
 */

import type { TransferRecordedPayload } from "./events/treasury-transfer-events.js";
import { TREASURY_TRANSFER_RECORDED } from "./events/treasury-transfer-events.js";

export interface TreasuryTransferParams {
  transferId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  createdAt?: Date;
}

/**
 * Immutable aggregate recording a transfer of AVU from one treasury account to another.
 * Created via record(); no mutating methods.
 */
export class TreasuryTransfer {
  readonly transferId: string;
  readonly fromAccountId: string;
  readonly toAccountId: string;
  readonly amount: number;
  readonly createdAt: Date;

  private constructor(params: TreasuryTransferParams) {
    this.transferId = params.transferId;
    this.fromAccountId = params.fromAccountId;
    this.toAccountId = params.toAccountId;
    this.amount = params.amount;
    this.createdAt = params.createdAt ?? new Date();
  }

  /**
   * Creates a new TreasuryTransfer. Used when a transfer has been applied (debit from, credit to).
   */
  static record(params: TreasuryTransferParams): TreasuryTransfer {
    if (!params.transferId?.trim()) {
      throw new Error("TreasuryTransfer.transferId cannot be empty");
    }
    if (!params.fromAccountId?.trim()) {
      throw new Error("TreasuryTransfer.fromAccountId cannot be empty");
    }
    if (!params.toAccountId?.trim()) {
      throw new Error("TreasuryTransfer.toAccountId cannot be empty");
    }
    if (params.fromAccountId === params.toAccountId) {
      throw new Error(
        "TreasuryTransfer fromAccountId and toAccountId must differ"
      );
    }
    if (params.amount <= 0 || !Number.isInteger(params.amount)) {
      throw new Error("TreasuryTransfer.amount must be a positive integer");
    }
    return new TreasuryTransfer(params);
  }

  /**
   * Returns the event payload for dip.treasury.transfer_recorded.
   * Application layer uses this to publish the event (e.g. to Kafka).
   */
  toTransferRecordedEvent(): { type: typeof TREASURY_TRANSFER_RECORDED; payload: TransferRecordedPayload } {
    return {
      type: TREASURY_TRANSFER_RECORDED,
      payload: {
        transferId: this.transferId,
        fromAccountId: this.fromAccountId,
        toAccountId: this.toAccountId,
        amount: this.amount,
        recordedAt: this.createdAt.toISOString(),
      },
    };
  }
}
