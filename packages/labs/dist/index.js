"use strict";
/**
 * Labs domain package (COMP-022 through COMP-026).
 * Architecture: domains/labs/subdomains/scientific-context-extension.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresHypothesisRecordRepository = exports.PostgresResearchMethodologyRepository = exports.PostgresSubjectAreaRepository = exports.isHypothesisStatus = exports.isHypothesisId = exports.createHypothesisId = exports.HypothesisRecord = exports.isResearchMethodologyId = exports.isMethodologyType = exports.createResearchMethodologyId = exports.ResearchMethodology = exports.isSubjectAreaId = exports.createSubjectAreaId = exports.SubjectArea = exports.LabsDomainError = void 0;
var errors_js_1 = require("./domain/errors.js");
Object.defineProperty(exports, "LabsDomainError", { enumerable: true, get: function () { return errors_js_1.LabsDomainError; } });
var index_js_1 = require("./domain/scientific-context/index.js");
Object.defineProperty(exports, "SubjectArea", { enumerable: true, get: function () { return index_js_1.SubjectArea; } });
Object.defineProperty(exports, "createSubjectAreaId", { enumerable: true, get: function () { return index_js_1.createSubjectAreaId; } });
Object.defineProperty(exports, "isSubjectAreaId", { enumerable: true, get: function () { return index_js_1.isSubjectAreaId; } });
Object.defineProperty(exports, "ResearchMethodology", { enumerable: true, get: function () { return index_js_1.ResearchMethodology; } });
Object.defineProperty(exports, "createResearchMethodologyId", { enumerable: true, get: function () { return index_js_1.createResearchMethodologyId; } });
Object.defineProperty(exports, "isMethodologyType", { enumerable: true, get: function () { return index_js_1.isMethodologyType; } });
Object.defineProperty(exports, "isResearchMethodologyId", { enumerable: true, get: function () { return index_js_1.isResearchMethodologyId; } });
Object.defineProperty(exports, "HypothesisRecord", { enumerable: true, get: function () { return index_js_1.HypothesisRecord; } });
Object.defineProperty(exports, "createHypothesisId", { enumerable: true, get: function () { return index_js_1.createHypothesisId; } });
Object.defineProperty(exports, "isHypothesisId", { enumerable: true, get: function () { return index_js_1.isHypothesisId; } });
Object.defineProperty(exports, "isHypothesisStatus", { enumerable: true, get: function () { return index_js_1.isHypothesisStatus; } });
var postgres_subject_area_repository_js_1 = require("./infrastructure/repositories/postgres-subject-area-repository.js");
Object.defineProperty(exports, "PostgresSubjectAreaRepository", { enumerable: true, get: function () { return postgres_subject_area_repository_js_1.PostgresSubjectAreaRepository; } });
var postgres_research_methodology_repository_js_1 = require("./infrastructure/repositories/postgres-research-methodology-repository.js");
Object.defineProperty(exports, "PostgresResearchMethodologyRepository", { enumerable: true, get: function () { return postgres_research_methodology_repository_js_1.PostgresResearchMethodologyRepository; } });
var postgres_hypothesis_record_repository_js_1 = require("./infrastructure/repositories/postgres-hypothesis-record-repository.js");
Object.defineProperty(exports, "PostgresHypothesisRecordRepository", { enumerable: true, get: function () { return postgres_hypothesis_record_repository_js_1.PostgresHypothesisRecordRepository; } });
