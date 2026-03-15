"use strict";
/**
 * Hub domain package.
 * Architecture: COMP-019 through COMP-021
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryContractTemplateRepository = exports.PostgresContractTemplateRepository = exports.PostgresInstitutionWorkflowRepository = exports.PostgresDiscoveryRepository = exports.InMemoryDiscoveryRepository = exports.PUBLIC_SQUARE_INDEXER_GROUP_ID = exports.PublicSquareIndexer = exports.PROMINENCE_WEIGHTS = exports.ProminenceScorer = exports.timeDecayFactor = exports.computeProminenceScore = exports.withProjectCount = exports.withProminenceScore = exports.applyDiscoveryEvent = exports.createEmptyDocument = exports.ContractTemplateType = exports.ContractTemplate = exports.InvalidWorkflowTransitionError = exports.InstitutionCreationPhase = exports.InstitutionCreationWorkflow = exports.InstitutionProfileProjector = exports.InstitutionOrchestrationTemplateNotFoundError = exports.InstitutionOrchestrationInvalidPhaseError = exports.InstitutionOrchestrationService = exports.PostgresContributionSandboxRepository = exports.PostgresContributionRepository = exports.PostgresIssueRepository = exports.DIPContributionAdapter = exports.IDESessionAdapter = exports.SandboxNotReadyForProvisionError = exports.ContributionSandboxOrchestrator = exports.ContributionNotReadyForMergeError = exports.ContributionIntegrationService = void 0;
__exportStar(require("./domain/collaboration/index.js"), exports);
var contribution_integration_service_js_1 = require("./application/contribution-integration-service.js");
Object.defineProperty(exports, "ContributionIntegrationService", { enumerable: true, get: function () { return contribution_integration_service_js_1.ContributionIntegrationService; } });
Object.defineProperty(exports, "ContributionNotReadyForMergeError", { enumerable: true, get: function () { return contribution_integration_service_js_1.ContributionNotReadyForMergeError; } });
var contribution_sandbox_orchestrator_js_1 = require("./application/contribution-sandbox-orchestrator.js");
Object.defineProperty(exports, "ContributionSandboxOrchestrator", { enumerable: true, get: function () { return contribution_sandbox_orchestrator_js_1.ContributionSandboxOrchestrator; } });
Object.defineProperty(exports, "SandboxNotReadyForProvisionError", { enumerable: true, get: function () { return contribution_sandbox_orchestrator_js_1.SandboxNotReadyForProvisionError; } });
var ide_session_adapter_js_1 = require("./infrastructure/ide-session-adapter.js");
Object.defineProperty(exports, "IDESessionAdapter", { enumerable: true, get: function () { return ide_session_adapter_js_1.IDESessionAdapter; } });
var dip_contribution_adapter_js_1 = require("./infrastructure/dip-contribution-adapter.js");
Object.defineProperty(exports, "DIPContributionAdapter", { enumerable: true, get: function () { return dip_contribution_adapter_js_1.DIPContributionAdapter; } });
var postgres_issue_repository_js_1 = require("./infrastructure/repositories/postgres-issue-repository.js");
Object.defineProperty(exports, "PostgresIssueRepository", { enumerable: true, get: function () { return postgres_issue_repository_js_1.PostgresIssueRepository; } });
var postgres_contribution_repository_js_1 = require("./infrastructure/repositories/postgres-contribution-repository.js");
Object.defineProperty(exports, "PostgresContributionRepository", { enumerable: true, get: function () { return postgres_contribution_repository_js_1.PostgresContributionRepository; } });
var postgres_contribution_sandbox_repository_js_1 = require("./infrastructure/repositories/postgres-contribution-sandbox-repository.js");
Object.defineProperty(exports, "PostgresContributionSandboxRepository", { enumerable: true, get: function () { return postgres_contribution_sandbox_repository_js_1.PostgresContributionSandboxRepository; } });
// Institution orchestration (COMP-020)
var institution_orchestration_service_js_1 = require("./application/institution-orchestration-service.js");
Object.defineProperty(exports, "InstitutionOrchestrationService", { enumerable: true, get: function () { return institution_orchestration_service_js_1.InstitutionOrchestrationService; } });
Object.defineProperty(exports, "InstitutionOrchestrationInvalidPhaseError", { enumerable: true, get: function () { return institution_orchestration_service_js_1.InstitutionOrchestrationInvalidPhaseError; } });
Object.defineProperty(exports, "InstitutionOrchestrationTemplateNotFoundError", { enumerable: true, get: function () { return institution_orchestration_service_js_1.InstitutionOrchestrationTemplateNotFoundError; } });
var institution_profile_projector_js_1 = require("./application/institution-profile-projector.js");
Object.defineProperty(exports, "InstitutionProfileProjector", { enumerable: true, get: function () { return institution_profile_projector_js_1.InstitutionProfileProjector; } });
var institution_creation_workflow_js_1 = require("./domain/institution-orchestration/institution-creation-workflow.js");
Object.defineProperty(exports, "InstitutionCreationWorkflow", { enumerable: true, get: function () { return institution_creation_workflow_js_1.InstitutionCreationWorkflow; } });
Object.defineProperty(exports, "InstitutionCreationPhase", { enumerable: true, get: function () { return institution_creation_workflow_js_1.InstitutionCreationPhase; } });
Object.defineProperty(exports, "InvalidWorkflowTransitionError", { enumerable: true, get: function () { return institution_creation_workflow_js_1.InvalidWorkflowTransitionError; } });
var contract_template_js_1 = require("./domain/institution-orchestration/contract-template.js");
Object.defineProperty(exports, "ContractTemplate", { enumerable: true, get: function () { return contract_template_js_1.ContractTemplate; } });
Object.defineProperty(exports, "ContractTemplateType", { enumerable: true, get: function () { return contract_template_js_1.ContractTemplateType; } });
var discovery_document_js_1 = require("./domain/public-square/discovery-document.js");
Object.defineProperty(exports, "createEmptyDocument", { enumerable: true, get: function () { return discovery_document_js_1.createEmptyDocument; } });
Object.defineProperty(exports, "applyDiscoveryEvent", { enumerable: true, get: function () { return discovery_document_js_1.applyDiscoveryEvent; } });
Object.defineProperty(exports, "withProminenceScore", { enumerable: true, get: function () { return discovery_document_js_1.withProminenceScore; } });
Object.defineProperty(exports, "withProjectCount", { enumerable: true, get: function () { return discovery_document_js_1.withProjectCount; } });
var prominence_scorer_js_1 = require("./domain/public-square/services/prominence-scorer.js");
Object.defineProperty(exports, "computeProminenceScore", { enumerable: true, get: function () { return prominence_scorer_js_1.computeProminenceScore; } });
Object.defineProperty(exports, "timeDecayFactor", { enumerable: true, get: function () { return prominence_scorer_js_1.timeDecayFactor; } });
Object.defineProperty(exports, "ProminenceScorer", { enumerable: true, get: function () { return prominence_scorer_js_1.ProminenceScorer; } });
Object.defineProperty(exports, "PROMINENCE_WEIGHTS", { enumerable: true, get: function () { return prominence_scorer_js_1.PROMINENCE_WEIGHTS; } });
var public_square_indexer_js_1 = require("./infrastructure/consumers/public-square-indexer.js");
Object.defineProperty(exports, "PublicSquareIndexer", { enumerable: true, get: function () { return public_square_indexer_js_1.PublicSquareIndexer; } });
Object.defineProperty(exports, "PUBLIC_SQUARE_INDEXER_GROUP_ID", { enumerable: true, get: function () { return public_square_indexer_js_1.PUBLIC_SQUARE_INDEXER_GROUP_ID; } });
var in_memory_discovery_repository_js_1 = require("./infrastructure/repositories/in-memory-discovery-repository.js");
Object.defineProperty(exports, "InMemoryDiscoveryRepository", { enumerable: true, get: function () { return in_memory_discovery_repository_js_1.InMemoryDiscoveryRepository; } });
var postgres_discovery_repository_js_1 = require("./infrastructure/repositories/postgres-discovery-repository.js");
Object.defineProperty(exports, "PostgresDiscoveryRepository", { enumerable: true, get: function () { return postgres_discovery_repository_js_1.PostgresDiscoveryRepository; } });
var postgres_institution_workflow_repository_js_1 = require("./infrastructure/repositories/postgres-institution-workflow-repository.js");
Object.defineProperty(exports, "PostgresInstitutionWorkflowRepository", { enumerable: true, get: function () { return postgres_institution_workflow_repository_js_1.PostgresInstitutionWorkflowRepository; } });
var postgres_contract_template_repository_js_1 = require("./infrastructure/repositories/postgres-contract-template-repository.js");
Object.defineProperty(exports, "PostgresContractTemplateRepository", { enumerable: true, get: function () { return postgres_contract_template_repository_js_1.PostgresContractTemplateRepository; } });
var contract_template_repository_in_memory_js_1 = require("./infrastructure/institution-orchestration/contract-template-repository-in-memory.js");
Object.defineProperty(exports, "InMemoryContractTemplateRepository", { enumerable: true, get: function () { return contract_template_repository_in_memory_js_1.InMemoryContractTemplateRepository; } });
