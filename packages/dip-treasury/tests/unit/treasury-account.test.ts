import { describe, it, expect } from "vitest";
import {
  TreasuryAccount,
  InsufficientBalanceError,
} from "../../src/domain/treasury-account.js";

describe("TreasuryAccount", () => {
  it("credit increases balance", () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId: "inst-1",
    });
    expect(account.avuBalance).toBe(0);
    account.credit(100);
    expect(account.avuBalance).toBe(100);
    account.credit(50);
    expect(account.avuBalance).toBe(150);
  });

  it("debit decreases balance", () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId: "inst-1",
    });
    account.credit(100);
    account.debit(30);
    expect(account.avuBalance).toBe(70);
    account.debit(70);
    expect(account.avuBalance).toBe(0);
  });

  it("debit when balance < amount throws InsufficientBalanceError", () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId: "inst-1",
    });
    account.credit(50);
    expect(() => account.debit(100)).toThrow(InsufficientBalanceError);
    expect(() => account.debit(100)).toThrow("Insufficient AVU balance");
    expect(account.avuBalance).toBe(50);
  });

  it("debit exact balance leaves zero", () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId: "inst-1",
    });
    account.credit(40);
    account.debit(40);
    expect(account.avuBalance).toBe(0);
  });

  it("credit with zero or negative throws", () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId: "inst-1",
    });
    expect(() => account.credit(0)).toThrow("positive integer");
    expect(() => account.credit(-10)).toThrow("positive integer");
  });

  it("debit with zero or negative throws", () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId: "inst-1",
    });
    account.credit(100);
    expect(() => account.debit(0)).toThrow("positive integer");
    expect(() => account.debit(-5)).toThrow("positive integer");
  });

  it("fromPersistence reconstitutes account with given balance", () => {
    const account = TreasuryAccount.fromPersistence({
      accountId: "acc-2",
      institutionId: "inst-2",
      avuBalance: 200,
    });
    expect(account.accountId).toBe("acc-2");
    expect(account.institutionId).toBe("inst-2");
    expect(account.avuBalance).toBe(200);
  });

  it("fromPersistence throws when avuBalance is negative", () => {
    expect(() =>
      TreasuryAccount.fromPersistence({
        accountId: "acc-2",
        institutionId: "inst-2",
        avuBalance: -1,
      })
    ).toThrow("cannot be negative");
  });

  it("create rejects empty accountId or institutionId", () => {
    expect(() =>
      TreasuryAccount.create({ accountId: "", institutionId: "i" })
    ).toThrow("accountId cannot be empty");
    expect(() =>
      TreasuryAccount.create({ accountId: "a", institutionId: "   " })
    ).toThrow("institutionId cannot be empty");
  });
});
