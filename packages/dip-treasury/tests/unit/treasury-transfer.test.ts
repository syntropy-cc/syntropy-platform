/**
 * Unit tests for TreasuryTransfer aggregate (COMP-008.6).
 */

import { describe, it, expect } from "vitest";
import { TreasuryTransfer } from "../../src/domain/treasury-transfer.js";
import { TREASURY_TRANSFER_RECORDED } from "../../src/domain/events/treasury-transfer-events.js";

describe("TreasuryTransfer", () => {
  it("creates transfer with required fields", () => {
    const transfer = TreasuryTransfer.record({
      transferId: "tx-1",
      fromAccountId: "acc-from",
      toAccountId: "acc-to",
      amount: 100,
    });

    expect(transfer.transferId).toBe("tx-1");
    expect(transfer.fromAccountId).toBe("acc-from");
    expect(transfer.toAccountId).toBe("acc-to");
    expect(transfer.amount).toBe(100);
    expect(transfer.createdAt).toBeInstanceOf(Date);
  });

  it("uses provided createdAt when given", () => {
    const at = new Date("2024-06-01T12:00:00Z");
    const transfer = TreasuryTransfer.record({
      transferId: "tx-1",
      fromAccountId: "acc-from",
      toAccountId: "acc-to",
      amount: 50,
      createdAt: at,
    });

    expect(transfer.createdAt).toBe(at);
  });

  it("throws when transferId is empty", () => {
    expect(() =>
      TreasuryTransfer.record({
        transferId: "",
        fromAccountId: "acc-from",
        toAccountId: "acc-to",
        amount: 10,
      })
    ).toThrow("transferId cannot be empty");
  });

  it("throws when fromAccountId is empty", () => {
    expect(() =>
      TreasuryTransfer.record({
        transferId: "tx-1",
        fromAccountId: "",
        toAccountId: "acc-to",
        amount: 10,
      })
    ).toThrow("fromAccountId cannot be empty");
  });

  it("throws when toAccountId is empty", () => {
    expect(() =>
      TreasuryTransfer.record({
        transferId: "tx-1",
        fromAccountId: "acc-from",
        toAccountId: "",
        amount: 10,
      })
    ).toThrow("toAccountId cannot be empty");
  });

  it("throws when from and to account are the same", () => {
    expect(() =>
      TreasuryTransfer.record({
        transferId: "tx-1",
        fromAccountId: "acc-1",
        toAccountId: "acc-1",
        amount: 10,
      })
    ).toThrow("fromAccountId and toAccountId must differ");
  });

  it("throws when amount is not a positive integer", () => {
    expect(() =>
      TreasuryTransfer.record({
        transferId: "tx-1",
        fromAccountId: "acc-from",
        toAccountId: "acc-to",
        amount: 0,
      })
    ).toThrow("amount must be a positive integer");

    expect(() =>
      TreasuryTransfer.record({
        transferId: "tx-1",
        fromAccountId: "acc-from",
        toAccountId: "acc-to",
        amount: -1,
      })
    ).toThrow("amount must be a positive integer");
  });

  it("exposes transfer_recorded event with correct type and payload", () => {
    const createdAt = new Date("2024-06-01T12:00:00Z");
    const transfer = TreasuryTransfer.record({
      transferId: "tx-1",
      fromAccountId: "acc-from",
      toAccountId: "acc-to",
      amount: 100,
      createdAt,
    });

    const event = transfer.toTransferRecordedEvent();

    expect(event.type).toBe(TREASURY_TRANSFER_RECORDED);
    expect(event.payload).toEqual({
      transferId: "tx-1",
      fromAccountId: "acc-from",
      toAccountId: "acc-to",
      amount: 100,
      recordedAt: "2024-06-01T12:00:00.000Z",
    });
  });

  it("is immutable — no mutating methods", () => {
    const transfer = TreasuryTransfer.record({
      transferId: "tx-1",
      fromAccountId: "acc-from",
      toAccountId: "acc-to",
      amount: 100,
    });

    expect(Object.getOwnPropertyNames(TreasuryTransfer.prototype)).not.toContain(
      "setAmount"
    );
    expect(transfer).not.toHaveProperty("setAmount");
  });
});
