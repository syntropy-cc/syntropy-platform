/**
 * Unit tests for InstitutionOrchestrationService (COMP-020.4).
 */

import { describe, it, expect, vi } from "vitest";
import {
  InstitutionOrchestrationService,
  InstitutionOrchestrationInvalidPhaseError,
  InstitutionOrchestrationTemplateNotFoundError,
} from "../../../src/application/institution-orchestration-service.js";
import {
  InstitutionCreationWorkflow,
  InstitutionCreationPhase,
} from "../../../src/domain/institution-orchestration/institution-creation-workflow.js";
import { ContractTemplate, ContractTemplateType } from "../../../src/domain/institution-orchestration/contract-template.js";
import type { ContractTemplateRepositoryPort } from "../../../src/domain/institution-orchestration/ports/contract-template-repository-port.js";
import type { DIPInstitutionAdapterPort } from "../../../src/domain/institution-orchestration/ports/dip-institution-adapter-port.js";
import type { InstitutionEventPublisherPort } from "../../../src/domain/institution-orchestration/ports/institution-event-publisher-port.js";
import type { InstitutionWorkflowRepositoryPort } from "../../../src/domain/institution-orchestration/ports/institution-workflow-repository-port.js";

describe("InstitutionOrchestrationService", () => {
  const templateId = "tpl-open";
  const workflowId = "wf-1";
  const institutionId = "inst-abc123";

  function workflowInFoundersConfirmed(): InstitutionCreationWorkflow {
    return InstitutionCreationWorkflow.fromPersistence({
      id: workflowId,
      templateId,
      currentPhase: InstitutionCreationPhase.FoundersConfirmed,
      configuredParameters: {},
    });
  }

  function createTemplate() {
    return ContractTemplate.create({
      templateId,
      name: "Open Source Project",
      dsl: "governance { }",
      type: ContractTemplateType.OpenSourceProject,
    });
  }

  it("createInstitution completes workflow and saves when DIP succeeds", async () => {
    const workflow = workflowInFoundersConfirmed();
    const template = createTemplate();

    const templateRepo: ContractTemplateRepositoryPort = {
      getById: vi.fn().mockResolvedValue(template),
      list: vi.fn(),
    };
    const workflowRepo: InstitutionWorkflowRepositoryPort = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    };
    const dipAdapter: DIPInstitutionAdapterPort = {
      createInstitution: vi.fn().mockResolvedValue({ institutionId }),
    };
    const eventPublisher: InstitutionEventPublisherPort = {
      publishInstitutionCreated: vi.fn().mockResolvedValue(undefined),
    };

    const service = new InstitutionOrchestrationService(
      templateRepo,
      workflowRepo,
      dipAdapter,
      eventPublisher
    );

    const result = await service.createInstitution(workflow);

    expect(result.institutionId).toBe(institutionId);
    expect(result.workflow.currentPhase).toBe(InstitutionCreationPhase.InstitutionCreated);
    expect(result.workflow.dipInstitutionId).toBe(institutionId);
    expect(result.workflow.isComplete()).toBe(true);

    expect(dipAdapter.createInstitution).toHaveBeenCalledOnce();
    expect(dipAdapter.createInstitution).toHaveBeenCalledWith({
      name: template.name,
      type: template.type,
      governanceContract: template.dsl,
    });
    expect(workflowRepo.save).toHaveBeenCalledOnce();
    expect(eventPublisher.publishInstitutionCreated).toHaveBeenCalledOnce();
    expect(eventPublisher.publishInstitutionCreated).toHaveBeenCalledWith({
      institutionId,
      workflowId,
      name: template.name,
      type: template.type,
    });
  });

  it("createInstitution does not save or publish when DIP adapter throws", async () => {
    const workflow = workflowInFoundersConfirmed();
    const template = createTemplate();

    const templateRepo: ContractTemplateRepositoryPort = {
      getById: vi.fn().mockResolvedValue(template),
      list: vi.fn(),
    };
    const workflowRepo: InstitutionWorkflowRepositoryPort = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    };
    const dipAdapter: DIPInstitutionAdapterPort = {
      createInstitution: vi.fn().mockRejectedValue(new Error("DIP unavailable")),
    };
    const eventPublisher: InstitutionEventPublisherPort = {
      publishInstitutionCreated: vi.fn().mockResolvedValue(undefined),
    };

    const service = new InstitutionOrchestrationService(
      templateRepo,
      workflowRepo,
      dipAdapter,
      eventPublisher
    );

    await expect(service.createInstitution(workflow)).rejects.toThrow("DIP unavailable");

    expect(workflowRepo.save).not.toHaveBeenCalled();
    expect(eventPublisher.publishInstitutionCreated).not.toHaveBeenCalled();
  });

  it("createInstitution throws when workflow is not in founders_confirmed", async () => {
    const workflow = InstitutionCreationWorkflow.fromPersistence({
      id: workflowId,
      templateId,
      currentPhase: InstitutionCreationPhase.TemplateSelected,
      configuredParameters: {},
    });

    const templateRepo: ContractTemplateRepositoryPort = {
      getById: vi.fn(),
      list: vi.fn(),
    };
    const workflowRepo: InstitutionWorkflowRepositoryPort = {
      save: vi.fn(),
      findById: vi.fn(),
    };
    const dipAdapter: DIPInstitutionAdapterPort = {
      createInstitution: vi.fn(),
    };

    const service = new InstitutionOrchestrationService(
      templateRepo,
      workflowRepo,
      dipAdapter
    );

    await expect(service.createInstitution(workflow)).rejects.toThrow(
      InstitutionOrchestrationInvalidPhaseError
    );
    await expect(service.createInstitution(workflow)).rejects.toMatchObject({
      workflowId,
      currentPhase: InstitutionCreationPhase.TemplateSelected,
    });
    expect(dipAdapter.createInstitution).not.toHaveBeenCalled();
  });

  it("createInstitution throws when template is not found", async () => {
    const workflow = workflowInFoundersConfirmed();

    const templateRepo: ContractTemplateRepositoryPort = {
      getById: vi.fn().mockResolvedValue(null),
      list: vi.fn(),
    };
    const workflowRepo: InstitutionWorkflowRepositoryPort = {
      save: vi.fn(),
      findById: vi.fn(),
    };
    const dipAdapter: DIPInstitutionAdapterPort = {
      createInstitution: vi.fn(),
    };

    const service = new InstitutionOrchestrationService(
      templateRepo,
      workflowRepo,
      dipAdapter
    );

    await expect(service.createInstitution(workflow)).rejects.toThrow(
      InstitutionOrchestrationTemplateNotFoundError
    );
    await expect(service.createInstitution(workflow)).rejects.toMatchObject({
      workflowId,
      templateId,
    });
    expect(dipAdapter.createInstitution).not.toHaveBeenCalled();
  });

  it("createInstitution does not call event publisher when not provided", async () => {
    const workflow = workflowInFoundersConfirmed();
    const template = createTemplate();

    const templateRepo: ContractTemplateRepositoryPort = {
      getById: vi.fn().mockResolvedValue(template),
      list: vi.fn(),
    };
    const workflowRepo: InstitutionWorkflowRepositoryPort = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    };
    const dipAdapter: DIPInstitutionAdapterPort = {
      createInstitution: vi.fn().mockResolvedValue({ institutionId }),
    };

    const service = new InstitutionOrchestrationService(
      templateRepo,
      workflowRepo,
      dipAdapter
    );

    const result = await service.createInstitution(workflow);

    expect(result.workflow.isComplete()).toBe(true);
    expect(workflowRepo.save).toHaveBeenCalledOnce();
  });
});
