/**
 * Hub domain ports for pillar tool handlers (COMP-014.2).
 * Implementations are wired by the app using Hub package services/repos.
 */

/** Summary of an issue for get_issues. */
export interface IssueSummary {
  id: string;
  projectId: string;
  title: string;
  status: string;
  description?: string;
}

/** Contribution context for get_contribution and analyze_contribution. */
export interface ContributionContext {
  id: string;
  projectId: string;
  contributorId: string;
  title: string;
  status: string;
  description?: string;
  linkedIssueIds?: string[];
}

/** Analysis summary for analyze_contribution. */
export interface ContributionAnalysis {
  contributionId: string;
  status: string;
  title: string;
  linkedIssueCount: number;
  summary?: string;
}

/** Institution summary for get_institution_summary. */
export interface InstitutionSummary {
  id: string;
  name: string;
  slug?: string;
  memberCount?: number;
  projectCount?: number;
}

/**
 * Port for Hub pillar tool handlers. App provides implementation using Hub domain.
 */
export interface HubToolPort {
  getIssues(projectId: string): Promise<IssueSummary[]>;
  getContribution(id: string): Promise<ContributionContext | null>;
  analyzeContribution(id: string): Promise<ContributionAnalysis>;
  getInstitutionSummary(id: string): Promise<InstitutionSummary | null>;
}
