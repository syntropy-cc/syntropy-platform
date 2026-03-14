/**
 * Scientific context domain — SubjectArea, ResearchMethodology, HypothesisRecord (COMP-022).
 * Architecture: scientific-context-extension.md
 */

export {
  SubjectArea,
  createSubjectAreaId,
  isSubjectAreaId,
  type SubjectAreaId,
  type SubjectAreaLevel,
  type SubjectAreaParams,
} from "./subject-area.js";

export {
  ResearchMethodology,
  createResearchMethodologyId,
  isMethodologyType,
  isResearchMethodologyId,
  type MethodologyType,
  type ResearchMethodologyId,
  type ResearchMethodologyParams,
} from "./research-methodology.js";

export {
  HypothesisRecord,
  createHypothesisId,
  isHypothesisId,
  isHypothesisStatus,
  type HypothesisId,
  type HypothesisRecordParams,
  type HypothesisStatus,
} from "./hypothesis-record.js";
