/**
 * Labs scientific context for REST API (COMP-022.5, COMP-023.7, COMP-024.5).
 * Injects repositories for subject areas, methodologies, hypothesis records,
 * articles, versions, article submission service, and experiment design.
 */

import type {
  SubjectAreaRepositoryPort,
  ResearchMethodologyRepositoryPort,
  HypothesisRecordRepositoryPort,
  ScientificArticleRepositoryPort,
  ArticleVersionRepositoryPort,
  ArticleSubmissionService,
  ExperimentDesignRepositoryPort,
  ExperimentResultRepositoryPort,
} from "@syntropy/labs-package";

export interface LabsScientificContext {
  subjectAreaRepository: SubjectAreaRepositoryPort;
  methodologyRepository: ResearchMethodologyRepositoryPort;
  hypothesisRecordRepository: HypothesisRecordRepositoryPort;
  /** Article editor (COMP-023.7). When set, article routes are registered. */
  scientificArticleRepository?: ScientificArticleRepositoryPort;
  articleVersionRepository?: ArticleVersionRepositoryPort;
  articleSubmissionService?: ArticleSubmissionService;
  /** Experiment design (COMP-024.5). When set, experiment routes are registered. */
  experimentDesignRepository?: ExperimentDesignRepositoryPort;
  experimentResultRepository?: ExperimentResultRepositoryPort;
}
