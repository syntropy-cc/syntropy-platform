/**
 * Hub collaboration context for REST API (COMP-019.8, COMP-020.6).
 * Injects repositories and services for hub issues, contributions, and institution orchestration.
 */

import type {
  ContributionIntegrationService,
  ContributionRepositoryPort,
  ContractTemplateRepositoryPort,
  DiscoveryRepositoryPort,
  InstitutionOrchestrationService,
  InstitutionProfileProjector,
  InstitutionWorkflowRepositoryPort,
  IssueRepositoryPort,
} from "@syntropy/hub-package";

export interface HubCollaborationContext {
  issueRepository: IssueRepositoryPort;
  contributionRepository: ContributionRepositoryPort;
  contributionIntegrationService: ContributionIntegrationService;
  /** Optional: for POST/GET hub institutions and contract templates (COMP-020.6). */
  contractTemplateRepository?: ContractTemplateRepositoryPort;
  institutionWorkflowRepository?: InstitutionWorkflowRepositoryPort;
  institutionOrchestrationService?: InstitutionOrchestrationService;
  institutionProfileProjector?: InstitutionProfileProjector;
  /** Optional: for GET /api/v1/hub/discover (COMP-021.5). */
  discoveryRepository?: DiscoveryRepositoryPort;
}
