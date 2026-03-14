/**
 * Labs scientific context for REST API (COMP-022.5, COMP-023.7, COMP-024.5, COMP-025.7, COMP-026.5).
 * Injects repositories for subject areas, methodologies, hypothesis records,
 * articles, versions, article submission service, experiment design, peer review, and DOI.
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
  ReviewRepositoryPort,
  ReviewPassageLinkRepositoryPort,
  AuthorResponseRepositoryPort,
  ReviewVisibilityEvaluator,
  DOIRegistrationService,
  DOIRecordRepositoryPort,
} from "@syntropy/labs-package";
import type { ExternalIndexingNotifier } from "@syntropy/labs-package";

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
  /** Peer review (COMP-025.7). When set, review routes are registered. */
  reviewRepository?: ReviewRepositoryPort;
  reviewPassageLinkRepository?: ReviewPassageLinkRepositoryPort;
  authorResponseRepository?: AuthorResponseRepositoryPort;
  reviewVisibilityEvaluator?: ReviewVisibilityEvaluator;
  /** DOI registration (COMP-026.5). When set with doiRecordRepository, DOI routes are registered. */
  doiRegistrationService?: DOIRegistrationService;
  doiRecordRepository?: DOIRecordRepositoryPort;
  /** Optional: notify external indexers after DOI registration (fire-and-forget). */
  externalIndexingNotifier?: ExternalIndexingNotifier;
}
