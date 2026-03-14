/**
 * Domain events for treasury transfers (COMP-008.6).
 * Architecture: DIP Value Distribution & Treasury; event type for dip.treasury.transfer_recorded.
 */

export const TREASURY_TRANSFER_RECORDED = "dip.treasury.transfer_recorded" as const;

export interface TransferRecordedPayload {
  transferId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  recordedAt: string;
}
