/**
 * Labs domain package (COMP-022 through COMP-026).
 * Architecture: domains/labs/subdomains/scientific-context-extension.md
 */
export { LabsDomainError, ArticleNotFoundError, ArticleForbiddenError, } from "./domain/errors.js";
export { SubjectArea, createSubjectAreaId, isSubjectAreaId, ResearchMethodology, createResearchMethodologyId, isMethodologyType, isResearchMethodologyId, HypothesisRecord, createHypothesisId, isHypothesisId, isHypothesisStatus, } from "./domain/scientific-context/index.js";
export { ScientificArticle, isArticleStatus, ArticleVersion, } from "./domain/article-editor/index.js";
export { MystRenderer } from "./infrastructure/myst-renderer.js";
export { LabsArtifactBridge, } from "./infrastructure/labs-artifact-bridge.js";
export { ArticleSubmissionService, } from "./application/article-submission-service.js";
export { AnonymizationPolicyEnforcer, ExperimentDesign, ExperimentResult, isExperimentStatus, PERSONAL_DATA_FIELDS, } from "./domain/experiment-design/index.js";
export { PostgresSubjectAreaRepository } from "./infrastructure/repositories/postgres-subject-area-repository.js";
export { PostgresResearchMethodologyRepository } from "./infrastructure/repositories/postgres-research-methodology-repository.js";
export { PostgresHypothesisRecordRepository } from "./infrastructure/repositories/postgres-hypothesis-record-repository.js";
export { PostgresScientificArticleRepository } from "./infrastructure/repositories/postgres-scientific-article-repository.js";
export { PostgresArticleVersionRepository } from "./infrastructure/repositories/postgres-article-version-repository.js";
export { PostgresExperimentDesignRepository } from "./infrastructure/repositories/postgres-experiment-design-repository.js";
export { PostgresExperimentResultRepository } from "./infrastructure/repositories/postgres-experiment-result-repository.js";
