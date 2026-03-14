/**
 * Labs scientific context for REST API (COMP-022.5, COMP-023.7).
 * Injects repositories for subject areas, methodologies, hypothesis records,
 * articles, versions, and article submission service.
 */

import type {
  SubjectAreaRepositoryPort,
  ResearchMethodologyRepositoryPort,
  HypothesisRecordRepositoryPort,
  ScientificArticleRepositoryPort,
  ArticleVersionRepositoryPort,
  ArticleSubmissionService,
} from "@syntropy/labs-package";

export interface LabsScientificContext {
  subjectAreaRepository: SubjectAreaRepositoryPort;
  methodologyRepository: ResearchMethodologyRepositoryPort;
  hypothesisRecordRepository: HypothesisRecordRepositoryPort;
  /** Article editor (COMP-023.7). When set, article routes are registered. */
  scientificArticleRepository?: ScientificArticleRepositoryPort;
  articleVersionRepository?: ArticleVersionRepositoryPort;
  articleSubmissionService?: ArticleSubmissionService;
}
