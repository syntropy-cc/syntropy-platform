/**
 * Hub collaboration context for REST API (COMP-019.8).
 * Injects repositories and ContributionIntegrationService for hub issues and contributions.
 */

import type {
  ContributionIntegrationService,
  ContributionRepositoryPort,
  IssueRepositoryPort,
} from "@syntropy/hub-package";

export interface HubCollaborationContext {
  issueRepository: IssueRepositoryPort;
  contributionRepository: ContributionRepositoryPort;
  contributionIntegrationService: ContributionIntegrationService;
}
