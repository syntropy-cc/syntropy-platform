/**
 * Labs domain package (COMP-022 through COMP-026).
 * Architecture: domains/labs/subdomains/scientific-context-extension.md
 */

export { LabsDomainError } from "./domain/errors.js";
export {
  SubjectArea,
  createSubjectAreaId,
  isSubjectAreaId,
  type SubjectAreaId,
  type SubjectAreaLevel,
  type SubjectAreaParams,
  ResearchMethodology,
  createResearchMethodologyId,
  isMethodologyType,
  isResearchMethodologyId,
  type MethodologyType,
  type ResearchMethodologyId,
  type ResearchMethodologyParams,
  HypothesisRecord,
  createHypothesisId,
  isHypothesisId,
  isHypothesisStatus,
  type HypothesisId,
  type HypothesisRecordParams,
  type HypothesisStatus,
} from "./domain/scientific-context/index.js";
export type {
  SubjectAreaRepositoryPort,
  SubjectAreaTreeNode,
} from "./domain/scientific-context/ports/subject-area-repository-port.js";
export type { ResearchMethodologyRepositoryPort } from "./domain/scientific-context/ports/research-methodology-repository-port.js";
export type { HypothesisRecordRepositoryPort } from "./domain/scientific-context/ports/hypothesis-record-repository-port.js";
export type { LabsDbClient } from "./infrastructure/labs-db-client.js";
export { PostgresSubjectAreaRepository } from "./infrastructure/repositories/postgres-subject-area-repository.js";
export { PostgresResearchMethodologyRepository } from "./infrastructure/repositories/postgres-research-methodology-repository.js";
export { PostgresHypothesisRecordRepository } from "./infrastructure/repositories/postgres-hypothesis-record-repository.js";
