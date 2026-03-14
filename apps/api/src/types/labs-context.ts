/**
 * Labs scientific context for REST API (COMP-022.5).
 * Injects repositories for subject areas, methodologies, and hypothesis records.
 */

import type {
  SubjectAreaRepositoryPort,
  ResearchMethodologyRepositoryPort,
  HypothesisRecordRepositoryPort,
} from "@syntropy/labs-package";

export interface LabsScientificContext {
  subjectAreaRepository: SubjectAreaRepositoryPort;
  methodologyRepository: ResearchMethodologyRepositoryPort;
  hypothesisRecordRepository: HypothesisRecordRepositoryPort;
}
