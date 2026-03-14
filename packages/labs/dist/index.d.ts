/**
 * Labs domain package (COMP-022 through COMP-026).
 * Architecture: domains/labs/subdomains/scientific-context-extension.md
 */
export { LabsDomainError, ArticleNotFoundError, ArticleForbiddenError, } from "./domain/errors.js";
export { SubjectArea, createSubjectAreaId, isSubjectAreaId, type SubjectAreaId, type SubjectAreaLevel, type SubjectAreaParams, ResearchMethodology, createResearchMethodologyId, isMethodologyType, isResearchMethodologyId, type MethodologyType, type ResearchMethodologyId, type ResearchMethodologyParams, HypothesisRecord, createHypothesisId, isHypothesisId, isHypothesisStatus, type HypothesisId, type HypothesisRecordParams, type HypothesisStatus, } from "./domain/scientific-context/index.js";
export { ScientificArticle, ArticleStatus, isArticleStatus, ArticleVersion, type ScientificArticleParams, type ArticleVersionParams, } from "./domain/article-editor/index.js";
export type { SubjectAreaRepositoryPort, SubjectAreaTreeNode, } from "./domain/scientific-context/ports/subject-area-repository-port.js";
export type { ResearchMethodologyRepositoryPort } from "./domain/scientific-context/ports/research-methodology-repository-port.js";
export type { HypothesisRecordRepositoryPort } from "./domain/scientific-context/ports/hypothesis-record-repository-port.js";
export type { ScientificArticleRepositoryPort } from "./domain/article-editor/ports/scientific-article-repository-port.js";
export type { ArticleVersionRepositoryPort } from "./domain/article-editor/ports/article-version-repository-port.js";
export type { ExperimentDesignRepositoryPort } from "./domain/experiment-design/ports/experiment-design-repository-port.js";
export type { ExperimentResultRepositoryPort } from "./domain/experiment-design/ports/experiment-result-repository-port.js";
export type { ReviewRepositoryPort } from "./domain/open-peer-review/ports/review-repository-port.js";
export type { ReviewPassageLinkRepositoryPort } from "./domain/open-peer-review/ports/review-passage-link-repository-port.js";
export type { AuthorResponseRepositoryPort } from "./domain/open-peer-review/ports/author-response-repository-port.js";
export type { LabsDbClient } from "./infrastructure/labs-db-client.js";
export { MystRenderer } from "./infrastructure/myst-renderer.js";
export { LabsArtifactBridge, type DipArtifactCreator, } from "./infrastructure/labs-artifact-bridge.js";
export type { ArticlePublisherPort, PublishArticleResult, } from "./domain/article-editor/ports/article-publisher-port.js";
export type { ArticleSubmissionNotifierPort } from "./domain/article-editor/ports/article-submission-notifier-port.js";
export { ArticleSubmissionService, type ArticleSubmissionServiceDeps, } from "./application/article-submission-service.js";
export { runReviewPublication } from "./application/review-publication-job.js";
export { AnonymizationPolicyEnforcer, ExperimentDesign, ExperimentResult, ExperimentStatus, isExperimentStatus, PERSONAL_DATA_FIELDS, type AnonymizationPolicy, type ExperimentDesignParams, type ExperimentResultParams, type PersonalDataField, } from "./domain/experiment-design/index.js";
export { Review, ReviewStatus, isReviewStatus, ReviewPassageLink, getLinkedText, AuthorResponse, ReviewVisibilityEvaluator, type ReviewParams, type ReviewPassageLinkParams, type ArticleContent, type AuthorResponseParams, } from "./domain/open-peer-review/index.js";
export { PostgresSubjectAreaRepository } from "./infrastructure/repositories/postgres-subject-area-repository.js";
export { PostgresResearchMethodologyRepository } from "./infrastructure/repositories/postgres-research-methodology-repository.js";
export { PostgresHypothesisRecordRepository } from "./infrastructure/repositories/postgres-hypothesis-record-repository.js";
export { PostgresScientificArticleRepository } from "./infrastructure/repositories/postgres-scientific-article-repository.js";
export { PostgresArticleVersionRepository } from "./infrastructure/repositories/postgres-article-version-repository.js";
export { PostgresExperimentDesignRepository } from "./infrastructure/repositories/postgres-experiment-design-repository.js";
export { PostgresExperimentResultRepository } from "./infrastructure/repositories/postgres-experiment-result-repository.js";
export { PostgresReviewRepository } from "./infrastructure/repositories/postgres-review-repository.js";
export { PostgresReviewPassageLinkRepository } from "./infrastructure/repositories/postgres-review-passage-link-repository.js";
export { PostgresAuthorResponseRepository } from "./infrastructure/repositories/postgres-author-response-repository.js";
//# sourceMappingURL=index.d.ts.map