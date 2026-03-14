/**
 * Labs domain package (COMP-022 through COMP-026).
 * Architecture: domains/labs/subdomains/scientific-context-extension.md
 */
export { LabsDomainError } from "./domain/errors.js";
export { SubjectArea, createSubjectAreaId, isSubjectAreaId, ResearchMethodology, createResearchMethodologyId, isMethodologyType, isResearchMethodologyId, HypothesisRecord, createHypothesisId, isHypothesisId, isHypothesisStatus, } from "./domain/scientific-context/index.js";
export { ScientificArticle, isArticleStatus, ArticleVersion, } from "./domain/article-editor/index.js";
export { MystRenderer } from "./infrastructure/myst-renderer.js";
export { LabsArtifactBridge, } from "./infrastructure/labs-artifact-bridge.js";
export { PostgresSubjectAreaRepository } from "./infrastructure/repositories/postgres-subject-area-repository.js";
export { PostgresResearchMethodologyRepository } from "./infrastructure/repositories/postgres-research-methodology-repository.js";
export { PostgresHypothesisRecordRepository } from "./infrastructure/repositories/postgres-hypothesis-record-repository.js";
