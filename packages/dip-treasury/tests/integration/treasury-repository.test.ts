/**
 * Integration tests for treasury Postgres repositories (COMP-008.7).
 * Uses in-memory mock client to verify repository logic without real DB.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { TreasuryAccount } from "../../src/domain/treasury-account.js";
import { AVUTransaction } from "../../src/domain/avu-transaction.js";
import { TreasuryTransfer } from "../../src/domain/treasury-transfer.js";
import type { TreasuryDbClient } from "../../src/infrastructure/treasury-db-client.js";
import { PostgresTreasuryAccountRepository } from "../../src/infrastructure/repositories/postgres-treasury-account-repository.js";
import { PostgresAVUJournal } from "../../src/infrastructure/repositories/postgres-avu-journal.js";
import { PostgresTreasuryTransferRepository } from "../../src/infrastructure/repositories/postgres-treasury-transfer-repository.js";

function createMockTreasuryDbClient(): TreasuryDbClient {
  const accounts = new Map<string, Record<string, unknown>>();
  const transactions: Record<string, unknown>[] = [];
  const transfers = new Map<string, Record<string, unknown>>();

  return {
    async execute(sql: string, params: unknown[]): Promise<void> {
      if (sql.includes("treasury_accounts")) {
        const accountId = String(params[0]);
        accounts.set(accountId, {
          account_id: params[0],
          institution_id: params[1],
          avu_balance: params[2],
        });
      } else if (sql.includes("avu_transactions")) {
        transactions.push({
          transaction_id: params[0],
          account_id: params[1],
          amount: params[2],
          type: params[3],
          source_event_id: params[4],
          created_at: params[5],
        });
      } else if (sql.includes("treasury_transfers")) {
        const transferId = String(params[0]);
        transfers.set(transferId, {
          transfer_id: params[0],
          from_account_id: params[1],
          to_account_id: params[2],
          amount: params[3],
          created_at: params[4],
        });
      }
    },
    async query<T = Record<string, unknown>>(
      sql: string,
      params: unknown[]
    ): Promise<T[]> {
      if (sql.includes("treasury_accounts")) {
        if (sql.includes("account_id = $1")) {
          const row = accounts.get(String(params[0]));
          return (row ? [row] : []) as T[];
        }
        if (sql.includes("institution_id = $1")) {
          const institutionId = String(params[0]);
          const row = [...accounts.values()].find(
            (r) => r.institution_id === institutionId
          );
          return (row ? [row] : []) as T[];
        }
      }
      if (sql.includes("avu_transactions")) {
        return [] as T[];
      }
      if (sql.includes("treasury_transfers") && sql.includes("transfer_id = $1")) {
        const row = transfers.get(String(params[0]));
        return (row ? [row] : []) as T[];
      }
      return [] as T[];
    },
  };
}

describe("Treasury repositories (integration)", () => {
  let db: TreasuryDbClient;
  let accountRepo: PostgresTreasuryAccountRepository;
  let journal: PostgresAVUJournal;
  let transferRepo: PostgresTreasuryTransferRepository;

  beforeEach(() => {
    db = createMockTreasuryDbClient();
    accountRepo = new PostgresTreasuryAccountRepository(db);
    journal = new PostgresAVUJournal(db);
    transferRepo = new PostgresTreasuryTransferRepository(db);
  });

  describe("PostgresTreasuryAccountRepository", () => {
    it("saves and finds account by accountId", async () => {
      const account = TreasuryAccount.create({
        accountId: "acc-1",
        institutionId: "inst-1",
      });
      account.credit(100);

      await accountRepo.save(account);

      const found = await accountRepo.findByAccountId("acc-1");
      expect(found).not.toBeNull();
      expect(found!.accountId).toBe("acc-1");
      expect(found!.institutionId).toBe("inst-1");
      expect(found!.avuBalance).toBe(100);
    });

    it("finds account by institutionId", async () => {
      const account = TreasuryAccount.create({
        accountId: "acc-1",
        institutionId: "inst-1",
      });
      await accountRepo.save(account);

      const found = await accountRepo.findByInstitutionId("inst-1");
      expect(found).not.toBeNull();
      expect(found!.institutionId).toBe("inst-1");
    });

    it("returns null when account not found", async () => {
      const found = await accountRepo.findByAccountId("nonexistent");
      expect(found).toBeNull();
    });
  });

  describe("PostgresAVUJournal", () => {
    it("appends transaction", async () => {
      const account = TreasuryAccount.create({
        accountId: "acc-1",
        institutionId: "inst-1",
      });
      await accountRepo.save(account);

      const tx = AVUTransaction.create({
        transactionId: "tx-1",
        accountId: "acc-1",
        amount: 50,
        type: "credit",
        sourceEventId: "ev-1",
        createdAt: new Date(),
      });

      await journal.append(tx);

      const found = await accountRepo.findByAccountId("acc-1");
      expect(found).not.toBeNull();
    });
  });

  describe("PostgresTreasuryTransferRepository", () => {
    it("saves and finds transfer by id", async () => {
      const transfer = TreasuryTransfer.record({
        transferId: "xf-1",
        fromAccountId: "acc-from",
        toAccountId: "acc-to",
        amount: 25,
      });

      await transferRepo.save(transfer);

      const found = await transferRepo.findById("xf-1");
      expect(found).not.toBeNull();
      expect(found!.transferId).toBe("xf-1");
      expect(found!.fromAccountId).toBe("acc-from");
      expect(found!.toAccountId).toBe("acc-to");
      expect(found!.amount).toBe(25);
    });

    it("returns null when transfer not found", async () => {
      const found = await transferRepo.findById("nonexistent");
      expect(found).toBeNull();
    });
  });
});
