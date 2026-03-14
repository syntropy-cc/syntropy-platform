/**
 * Port for recording usage contributions (COMP-008.2).
 * Architecture: DIP Value Distribution & Treasury
 */

export interface UsageContributionRecord {
  artifactId: string;
  institutionId: string;
  contributionScore: number;
  recordedAt: Date;
}

/**
 * Port to record usage contributions derived from artifact published events.
 * Used by UsageRegisteredConsumer; persistence implementation in COMP-008.7.
 */
export interface UsageRegistryPort {
  recordContribution(record: UsageContributionRecord): Promise<void>;
}
