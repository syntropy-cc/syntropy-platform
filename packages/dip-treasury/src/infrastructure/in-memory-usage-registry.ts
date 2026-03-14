/**
 * In-memory implementation of UsageRegistryPort for tests and development.
 * Architecture: COMP-008.2
 */

import type {
  UsageRegistryPort,
  UsageContributionRecord,
} from "../domain/ports/usage-registry-port.js";

export class InMemoryUsageRegistry implements UsageRegistryPort {
  private readonly records: UsageContributionRecord[] = [];

  async recordContribution(record: UsageContributionRecord): Promise<void> {
    this.records.push(record);
  }

  getContributions(): readonly UsageContributionRecord[] {
    return this.records;
  }

  clear(): void {
    this.records.length = 0;
  }
}
