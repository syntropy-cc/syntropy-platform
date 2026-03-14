/**
 * Unit tests for ValueDistributionService (COMP-008.4).
 */

import { describe, it, expect } from "vitest";
import { ValueDistributionService } from "../../src/domain/services/value-distribution-service.js";
import { TreasuryAccount } from "../../src/domain/treasury-account.js";
import { InMemoryTreasuryAccountRepository } from "../../src/infrastructure/in-memory-treasury-account-repository.js";
import type {
  ContributorScoreQueryPort,
  DistributionPeriod,
} from "../../src/domain/ports/contributor-score-query-port.js";

function makeMockContributorScores(
  scores: { contributorId: string; score: number }[]
): ContributorScoreQueryPort {
  return {
    async getContributorScores(
      _institutionId: string,
      _period: DistributionPeriod
    ) {
      return scores.map((s) => ({ contributorId: s.contributorId, score: s.score }));
    },
  };
}

describe("ValueDistributionService", () => {
  const institutionId = "inst-1";
  const period: DistributionPeriod = {
    start: new Date("2024-01-01"),
    end: new Date("2024-01-31"),
  };

  it("returns empty result when no account exists for institution", async () => {
    const accountRepo = new InMemoryTreasuryAccountRepository();
    const scores = makeMockContributorScores([
      { contributorId: "c1", score: 10 },
    ]);
    const service = new ValueDistributionService(accountRepo, scores);

    const result = await service.compute(institutionId, period);

    expect(result.allocations).toHaveLength(0);
    expect(result.totalDistributed).toBe(0);
  });

  it("returns empty result when account has zero balance", async () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId,
    });
    const accountRepo = new InMemoryTreasuryAccountRepository();
    await accountRepo.save(account);
    const scores = makeMockContributorScores([
      { contributorId: "c1", score: 10 },
    ]);
    const service = new ValueDistributionService(accountRepo, scores);

    const result = await service.compute(institutionId, period);

    expect(result.allocations).toHaveLength(0);
    expect(result.totalDistributed).toBe(0);
  });

  it("returns empty result when no contributors have scores", async () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId,
    });
    account.credit(100);
    const accountRepo = new InMemoryTreasuryAccountRepository();
    await accountRepo.save(account);
    const scores = makeMockContributorScores([]);
    const service = new ValueDistributionService(accountRepo, scores);

    const result = await service.compute(institutionId, period);

    expect(result.allocations).toHaveLength(0);
    expect(result.totalDistributed).toBe(0);
  });

  it("returns empty result when total contributor score is zero", async () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId,
    });
    account.credit(100);
    const accountRepo = new InMemoryTreasuryAccountRepository();
    await accountRepo.save(account);
    const scores = makeMockContributorScores([
      { contributorId: "c1", score: 0 },
      { contributorId: "c2", score: 0 },
    ]);
    const service = new ValueDistributionService(accountRepo, scores);

    const result = await service.compute(institutionId, period);

    expect(result.allocations).toHaveLength(0);
    expect(result.totalDistributed).toBe(0);
  });

  it("distributes balance equally when all scores are equal", async () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId,
    });
    account.credit(100);
    const accountRepo = new InMemoryTreasuryAccountRepository();
    await accountRepo.save(account);
    const scores = makeMockContributorScores([
      { contributorId: "c1", score: 1 },
      { contributorId: "c2", score: 1 },
      { contributorId: "c3", score: 1 },
    ]);
    const service = new ValueDistributionService(accountRepo, scores);

    const result = await service.compute(institutionId, period);

    expect(result.allocations).toHaveLength(3);
    expect(result.allocations.map((a) => a.amount).sort()).toEqual([33, 33, 33]);
    expect(result.totalDistributed).toBe(99);
    expect(result.allocations.every((a) => Number.isInteger(a.amount))).toBe(
      true
    );
  });

  it("distributes balance proportionally when scores differ", async () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId,
    });
    account.credit(100);
    const accountRepo = new InMemoryTreasuryAccountRepository();
    await accountRepo.save(account);
    const scores = makeMockContributorScores([
      { contributorId: "c1", score: 50 },
      { contributorId: "c2", score: 30 },
      { contributorId: "c3", score: 20 },
    ]);
    const service = new ValueDistributionService(accountRepo, scores);

    const result = await service.compute(institutionId, period);

    expect(result.allocations).toHaveLength(3);
    const byContributor = Object.fromEntries(
      result.allocations.map((a) => [a.contributorId, a.amount])
    );
    expect(byContributor.c1).toBe(50);
    expect(byContributor.c2).toBe(30);
    expect(byContributor.c3).toBe(20);
    expect(result.totalDistributed).toBe(100);
    expect(result.allocations.every((a) => Number.isInteger(a.amount))).toBe(
      true
    );
  });

  it("single contributor receives full balance", async () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId,
    });
    account.credit(100);
    const accountRepo = new InMemoryTreasuryAccountRepository();
    await accountRepo.save(account);
    const scores = makeMockContributorScores([{ contributorId: "c1", score: 1 }]);
    const service = new ValueDistributionService(accountRepo, scores);

    const result = await service.compute(institutionId, period);

    expect(result.allocations).toHaveLength(1);
    expect(result.allocations[0]).toEqual({ contributorId: "c1", amount: 100 });
    expect(result.totalDistributed).toBe(100);
  });

  it("total distributed does not exceed balance with fractional proportions", async () => {
    const account = TreasuryAccount.create({
      accountId: "acc-1",
      institutionId,
    });
    account.credit(10);
    const accountRepo = new InMemoryTreasuryAccountRepository();
    await accountRepo.save(account);
    const scores = makeMockContributorScores([
      { contributorId: "c1", score: 1 },
      { contributorId: "c2", score: 1 },
      { contributorId: "c3", score: 1 },
    ]);
    const service = new ValueDistributionService(accountRepo, scores);

    const result = await service.compute(institutionId, period);

    expect(result.totalDistributed).toBeLessThanOrEqual(10);
    expect(result.allocations.every((a) => Number.isInteger(a.amount))).toBe(
      true
    );
  });
});
