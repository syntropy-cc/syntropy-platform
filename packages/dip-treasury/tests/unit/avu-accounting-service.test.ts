import { describe, it, expect } from "vitest";
import { AVUAccountingService } from "../../src/domain/services/avu-accounting-service.js";
import { TreasuryAccount } from "../../src/domain/treasury-account.js";
import { InMemoryTreasuryAccountRepository } from "../../src/infrastructure/in-memory-treasury-account-repository.js";
import { InMemoryAVUJournal } from "../../src/infrastructure/in-memory-avu-journal.js";
import { InsufficientBalanceError } from "../../src/domain/treasury-account.js";

describe("AVUAccountingService", () => {
  it("record credit increases balance and appends credit transaction", async () => {
    const repo = new InMemoryTreasuryAccountRepository();
    const journal = new InMemoryAVUJournal();
    const service = new AVUAccountingService(repo, journal);

    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId: "inst-1",
    });
    await repo.save(account);

    await service.record({
      transactionId: "tx-1",
      accountId: "acc-1",
      amount: 100,
      type: "credit",
      sourceEventId: "evt-1",
    });

    const updated = await repo.findByAccountId("acc-1");
    expect(updated).not.toBeNull();
    expect(updated!.avuBalance).toBe(100);

    const entries = journal.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("credit");
    expect(entries[0].amount).toBe(100);
    expect(entries[0].accountId).toBe("acc-1");
  });

  it("record debit decreases balance and appends debit transaction", async () => {
    const repo = new InMemoryTreasuryAccountRepository();
    const journal = new InMemoryAVUJournal();
    const service = new AVUAccountingService(repo, journal);

    const account = TreasuryAccount.create({
      accountId: "acc-2",
      institutionId: "inst-2",
    });
    account.credit(200);
    await repo.save(account);

    await service.record({
      transactionId: "tx-2",
      accountId: "acc-2",
      amount: 70,
      type: "debit",
    });

    const updated = await repo.findByAccountId("acc-2");
    expect(updated).not.toBeNull();
    expect(updated!.avuBalance).toBe(130);

    const entries = journal.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("debit");
    expect(entries[0].amount).toBe(70);
  });

  it("debit that would make balance negative throws and no journal entry", async () => {
    const repo = new InMemoryTreasuryAccountRepository();
    const journal = new InMemoryAVUJournal();
    const service = new AVUAccountingService(repo, journal);

    const account = TreasuryAccount.create({
      accountId: "acc-3",
      institutionId: "inst-3",
    });
    account.credit(50);
    await repo.save(account);

    await expect(
      service.record({
        transactionId: "tx-3",
        accountId: "acc-3",
        amount: 100,
        type: "debit",
      })
    ).rejects.toThrow(InsufficientBalanceError);

    const updated = await repo.findByAccountId("acc-3");
    expect(updated!.avuBalance).toBe(50);
    expect(journal.getEntries()).toHaveLength(0);
  });

  it("throws when account does not exist", async () => {
    const repo = new InMemoryTreasuryAccountRepository();
    const journal = new InMemoryAVUJournal();
    const service = new AVUAccountingService(repo, journal);

    await expect(
      service.record({
        transactionId: "tx-4",
        accountId: "nonexistent",
        amount: 10,
        type: "credit",
      })
    ).rejects.toThrow("TreasuryAccount not found");
    expect(journal.getEntries()).toHaveLength(0);
  });

  it("when journal append fails balance is not updated", async () => {
    const repo = new InMemoryTreasuryAccountRepository();
    const account = TreasuryAccount.create({
      accountId: "acc-4",
      institutionId: "inst-4",
    });
    account.credit(100);
    await repo.save(account);

    const failingJournal = {
      append: async () => {
        throw new Error("journal write failed");
      },
      getEntries: () => [] as const,
    };

    const service = new AVUAccountingService(repo, failingJournal);

    await expect(
      service.record({
        transactionId: "tx-5",
        accountId: "acc-4",
        amount: 20,
        type: "debit",
      })
    ).rejects.toThrow("journal write failed");

    const updated = await repo.findByAccountId("acc-4");
    expect(updated!.avuBalance).toBe(100);
  });
});
