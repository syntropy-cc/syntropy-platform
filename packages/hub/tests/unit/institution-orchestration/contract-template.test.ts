/**
 * Unit tests for ContractTemplate entity and repository (COMP-020.1).
 */

import { describe, it, expect } from "vitest";
import {
  ContractTemplate,
  ContractTemplateType,
} from "../../../src/domain/institution-orchestration/contract-template.js";
import { InMemoryContractTemplateRepository } from "../../../src/infrastructure/institution-orchestration/contract-template-repository-in-memory.js";

describe("ContractTemplate", () => {
  it("create returns template with trimmed templateId name and dsl", () => {
    const t = ContractTemplate.create({
      templateId: "  id-1  ",
      name: "  Test Template  ",
      dsl: "  governance {}  ",
      type: ContractTemplateType.OpenSourceProject,
    });

    expect(t.templateId).toBe("id-1");
    expect(t.name).toBe("Test Template");
    expect(t.dsl).toBe("governance {}");
    expect(t.type).toBe(ContractTemplateType.OpenSourceProject);
  });

  it("create throws when templateId is empty", () => {
    expect(() =>
      ContractTemplate.create({
        templateId: "  ",
        name: "Name",
        dsl: "dsl",
        type: ContractTemplateType.OpenSourceProject,
      })
    ).toThrow("templateId cannot be empty");
  });

  it("create throws when name is empty", () => {
    expect(() =>
      ContractTemplate.create({
        templateId: "id",
        name: "",
        dsl: "dsl",
        type: ContractTemplateType.OpenSourceProject,
      })
    ).toThrow("name cannot be empty");
  });

  it("create throws when dsl is empty", () => {
    expect(() =>
      ContractTemplate.create({
        templateId: "id",
        name: "Name",
        dsl: "   ",
        type: ContractTemplateType.OpenSourceProject,
      })
    ).toThrow("dsl cannot be empty");
  });

  it("create throws when type is invalid", () => {
    expect(() =>
      ContractTemplate.create({
        templateId: "id",
        name: "Name",
        dsl: "governance {}",
        type: "invalid" as typeof ContractTemplateType.OpenSourceProject,
      })
    ).toThrow("ContractTemplate.type must be one of");
  });

  it("fromPersistence reconstructs template without validation", () => {
    const t = ContractTemplate.fromPersistence({
      templateId: "persisted-id",
      name: "Persisted",
      dsl: "dsl",
      type: ContractTemplateType.ResearchLaboratory,
    });

    expect(t.templateId).toBe("persisted-id");
    expect(t.name).toBe("Persisted");
    expect(t.type).toBe(ContractTemplateType.ResearchLaboratory);
  });
});

describe("InMemoryContractTemplateRepository", () => {
  it("list returns all pre-defined templates", async () => {
    const repo = new InMemoryContractTemplateRepository();
    const list = await repo.list();

    expect(list).toHaveLength(3);
    const ids = list.map((t) => t.templateId).sort();
    expect(ids).toContain("template-open-source-v1");
    expect(ids).toContain("template-research-lab-v1");
    expect(ids).toContain("template-educational-v1");
  });

  it("getById returns template when it exists", async () => {
    const repo = new InMemoryContractTemplateRepository();
    const t = await repo.getById("template-open-source-v1");

    expect(t).not.toBeNull();
    expect(t!.name).toBe("Open Source Project");
    expect(t!.type).toBe(ContractTemplateType.OpenSourceProject);
    expect(t!.dsl).toContain("governance");
  });

  it("getById returns null when template does not exist", async () => {
    const repo = new InMemoryContractTemplateRepository();
    const t = await repo.getById("non-existent");

    expect(t).toBeNull();
  });

  it("constructor accepts custom initial templates", async () => {
    const custom = ContractTemplate.create({
      templateId: "custom-1",
      name: "Custom",
      dsl: "custom dsl",
      type: ContractTemplateType.EducationalInstitution,
    });
    const repo = new InMemoryContractTemplateRepository([custom]);

    const list = await repo.list();
    expect(list).toHaveLength(1);
    expect(list[0]!.templateId).toBe("custom-1");
    expect(await repo.getById("custom-1")).not.toBeNull();
  });
});
