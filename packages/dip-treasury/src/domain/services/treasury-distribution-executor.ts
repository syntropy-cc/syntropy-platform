/**
 * Executes a treasury distribution: compute allocations then debit source and credit recipients (COMP-008.8).
 * contributorId in allocations is the institution id of the recipient treasury account.
 */

import { randomUUID } from "node:crypto";
import type { ValueDistributionService } from "./value-distribution-service.js";
import type { AVUAccountingService } from "./avu-accounting-service.js";
import type { TreasuryAccountRepositoryPort } from "../ports/treasury-account-repository-port.js";
import type { DistributionPeriod } from "../ports/contributor-score-query-port.js";
import type { DistributionResult } from "../distribution-result.js";
import { InsufficientBalanceError } from "../treasury-account.js";

export class TreasuryDistributionExecutorError extends Error {
  constructor(
    message: string,
    public readonly code: "INSUFFICIENT_BALANCE" | "ACCOUNT_NOT_FOUND" | "DISTRIBUTION_FAILED"
  ) {
    super(message);
    this.name = "TreasuryDistributionExecutorError";
  }
}

/**
 * Executes distribution: computes allocations, debits institution account, credits each contributor.
 * Contributor accounts are looked up by institution id (contributorId = institution id of recipient).
 * All contributor accounts must exist; no on-the-fly account creation.
 */
export class TreasuryDistributionExecutor {
  constructor(
    private readonly accountRepository: TreasuryAccountRepositoryPort,
    private readonly distributionService: ValueDistributionService,
    private readonly accountingService: AVUAccountingService
  ) {}

  /**
   * Run distribution for the given institution and period.
   * Returns the distribution result; persists debit on institution and credits on contributors.
   */
  async execute(
    institutionId: string,
    period: DistributionPeriod
  ): Promise<DistributionResult> {
    const result = await this.distributionService.compute(institutionId, period);
    if (result.totalDistributed <= 0) {
      return result;
    }

    const sourceAccount = await this.accountRepository.findByInstitutionId(
      institutionId
    );
    if (sourceAccount == null) {
      throw new TreasuryDistributionExecutorError(
        `Treasury account not found for institution: ${institutionId}`,
        "ACCOUNT_NOT_FOUND"
      );
    }

    const sourceAccountId = sourceAccount.accountId;

    try {
      await this.accountingService.record({
        transactionId: randomUUID(),
        accountId: sourceAccountId,
        amount: result.totalDistributed,
        type: "debit",
        sourceEventId: `distribute-${institutionId}-${period.start.toISOString()}`,
      });
    } catch (err) {
      if (err instanceof InsufficientBalanceError) {
        throw new TreasuryDistributionExecutorError(
          err.message,
          "INSUFFICIENT_BALANCE"
        );
      }
      throw new TreasuryDistributionExecutorError(
        `Distribution debit failed: ${err instanceof Error ? err.message : String(err)}`,
        "DISTRIBUTION_FAILED"
      );
    }

    for (const { contributorId, amount } of result.allocations) {
      if (amount <= 0) continue;
      const contributorAccount =
        await this.accountRepository.findByInstitutionId(contributorId);
      if (contributorAccount == null) {
        throw new TreasuryDistributionExecutorError(
          `Contributor treasury account not found for institution: ${contributorId}. Create account before distributing.`,
          "ACCOUNT_NOT_FOUND"
        );
      }
      await this.accountingService.record({
        transactionId: randomUUID(),
        accountId: contributorAccount.accountId,
        amount,
        type: "credit",
        sourceEventId: `distribute-${institutionId}-${period.start.toISOString()}`,
      });
    }

    return result;
  }
}
