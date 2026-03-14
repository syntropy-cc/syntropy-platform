/**
 * Unit tests for InstitutionCreationWorkflow aggregate (COMP-020.2).
 */

import { describe, it, expect } from "vitest";
import {
  InstitutionCreationWorkflow,
  InstitutionCreationPhase,
  InvalidWorkflowTransitionError,
} from "../../../src/domain/institution-orchestration/institution-creation-workflow.js";

describe("InstitutionCreationWorkflow", () => {
  it("start creates workflow in template_selected phase", () => {
    const w = InstitutionCreationWorkflow.start({
      id: "wf-1",
      templateId: "template-open-source-v1",
    });

    expect(w.id).toBe("wf-1");
    expect(w.templateId).toBe("template-open-source-v1");
    expect(w.currentPhase).toBe(InstitutionCreationPhase.TemplateSelected);
    expect(w.dipInstitutionId).toBeNull();
    expect(w.isComplete()).toBe(false);
  });

  it("start throws when id is empty", () => {
    expect(() =>
      InstitutionCreationWorkflow.start({
        id: "  ",
        templateId: "t1",
      })
    ).toThrow("id cannot be empty");
  });

  it("start throws when templateId is empty", () => {
    expect(() =>
      InstitutionCreationWorkflow.start({
        id: "wf-1",
        templateId: "",
      })
    ).toThrow("templateId cannot be empty");
  });

  it("proceed advances template_selected to founders_confirmed", () => {
    const w = InstitutionCreationWorkflow.start({
      id: "wf-1",
      templateId: "t1",
    });
    const next = w.proceed({ founderIds: ["user-1"] });

    expect(next.currentPhase).toBe(InstitutionCreationPhase.FoundersConfirmed);
    expect(next.id).toBe(w.id);
    expect(next.templateId).toBe(w.templateId);
  });

  it("proceed from founders_confirmed to contract_deployed requires contractDeployed true", () => {
    const w = InstitutionCreationWorkflow.fromPersistence({
      id: "wf-1",
      templateId: "t1",
      currentPhase: InstitutionCreationPhase.FoundersConfirmed,
    });

    expect(() => w.proceed()).toThrow(InvalidWorkflowTransitionError);
    expect(() => w.proceed({ contractDeployed: false })).toThrow(
      "contract must be deployed"
    );

    const next = w.proceed({ contractDeployed: true });
    expect(next.currentPhase).toBe(InstitutionCreationPhase.ContractDeployed);
  });

  it("proceed from contract_deployed to institution_created requires dipInstitutionId", () => {
    const w = InstitutionCreationWorkflow.fromPersistence({
      id: "wf-1",
      templateId: "t1",
      currentPhase: InstitutionCreationPhase.ContractDeployed,
    });

    expect(() => w.proceed()).toThrow(InvalidWorkflowTransitionError);
    expect(() => w.proceed({ dipInstitutionId: "" })).toThrow(
      "dipInstitutionId is required"
    );

    const next = w.proceed({ dipInstitutionId: "dip-inst-123" });
    expect(next.currentPhase).toBe(InstitutionCreationPhase.InstitutionCreated);
    expect(next.dipInstitutionId).toBe("dip-inst-123");
    expect(next.isComplete()).toBe(true);
  });

  it("proceed from institution_created throws already in final phase", () => {
    const w = InstitutionCreationWorkflow.fromPersistence({
      id: "wf-1",
      templateId: "t1",
      currentPhase: InstitutionCreationPhase.InstitutionCreated,
      dipInstitutionId: "dip-1",
    });

    expect(() => w.proceed()).toThrow("already in final phase");
  });

  it("proceed from template_selected with empty founderIds throws", () => {
    const w = InstitutionCreationWorkflow.start({ id: "wf-1", templateId: "t1" });

    expect(() => w.proceed({ founderIds: [] })).toThrow(
      "at least one founder required"
    );
  });

  it("full flow from start to institution_created", () => {
    let w = InstitutionCreationWorkflow.start({
      id: "wf-1",
      templateId: "template-open-source-v1",
    });
    expect(w.currentPhase).toBe(InstitutionCreationPhase.TemplateSelected);

    w = w.proceed({ founderIds: ["u1", "u2"] });
    expect(w.currentPhase).toBe(InstitutionCreationPhase.FoundersConfirmed);

    w = w.proceed({ contractDeployed: true });
    expect(w.currentPhase).toBe(InstitutionCreationPhase.ContractDeployed);

    w = w.proceed({ dipInstitutionId: "dip-abc" });
    expect(w.currentPhase).toBe(InstitutionCreationPhase.InstitutionCreated);
    expect(w.dipInstitutionId).toBe("dip-abc");
    expect(w.isComplete()).toBe(true);
  });
});
