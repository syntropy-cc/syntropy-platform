/**
 * Unit tests for ResearchMethodology entity and seed (COMP-022.2).
 */

import { describe, it, expect } from "vitest";
import {
  ResearchMethodology,
  createResearchMethodologyId,
  isResearchMethodologyId,
  isMethodologyType,
} from "../../../src/domain/scientific-context/research-methodology.js";
import { METHODOLOGY_SEED } from "../../../src/infrastructure/seeds/methodologies.js";

const VALID_UUID = "b2000001-0000-4000-8000-000000000001";

describe("createResearchMethodologyId", () => {
  it("returns branded id when value is valid UUID", () => {
    const id = createResearchMethodologyId(VALID_UUID);
    expect(id).toBe(VALID_UUID);
    expect(isResearchMethodologyId(id)).toBe(true);
  });

  it("throws when value is empty or not UUID", () => {
    expect(() => createResearchMethodologyId("")).toThrow("cannot be empty");
    expect(() => createResearchMethodologyId("x")).toThrow("expected UUID format");
  });
});

describe("isMethodologyType", () => {
  it("returns true for quantitative, qualitative, mixed", () => {
    expect(isMethodologyType("quantitative")).toBe(true);
    expect(isMethodologyType("qualitative")).toBe(true);
    expect(isMethodologyType("mixed")).toBe(true);
  });

  it("returns false for invalid strings", () => {
    expect(isMethodologyType("")).toBe(false);
    expect(isMethodologyType("experimental")).toBe(false);
    expect(isMethodologyType("QUANTITATIVE")).toBe(false);
  });
});

describe("ResearchMethodology", () => {
  it("creates entity with required fields", () => {
    const m = new ResearchMethodology({
      id: createResearchMethodologyId(VALID_UUID),
      name: "Quantitative",
      type: "quantitative",
    });
    expect(m.name).toBe("Quantitative");
    expect(m.type).toBe("quantitative");
    expect(m.description).toBeUndefined();
  });

  it("creates entity with optional description", () => {
    const m = new ResearchMethodology({
      id: createResearchMethodologyId(VALID_UUID),
      name: "Mixed methods",
      type: "mixed",
      description: "Combines both approaches.",
    });
    expect(m.description).toBe("Combines both approaches.");
  });

  it("trims name and description", () => {
    const m = new ResearchMethodology({
      id: createResearchMethodologyId(VALID_UUID),
      name: "  Qualitative  ",
      type: "qualitative",
      description: "  Non-numeric  ",
    });
    expect(m.name).toBe("Qualitative");
    expect(m.description).toBe("Non-numeric");
  });

  it("throws when name is empty", () => {
    expect(
      () =>
        new ResearchMethodology({
          id: createResearchMethodologyId(VALID_UUID),
          name: "",
          type: "quantitative",
        })
    ).toThrow("name cannot be empty");
  });

  it("throws when type is invalid", () => {
    expect(
      () =>
        new ResearchMethodology({
          id: createResearchMethodologyId(VALID_UUID),
          name: "X",
          type: "invalid" as "quantitative",
        })
    ).toThrow("Invalid methodology type");
  });
});

describe("METHODOLOGY_SEED", () => {
  it("has one entry per type: quantitative, qualitative, mixed", () => {
    const types = METHODOLOGY_SEED.map((m) => m.type);
    expect(types).toContain("quantitative");
    expect(types).toContain("qualitative");
    expect(types).toContain("mixed");
    expect(METHODOLOGY_SEED.length).toBe(3);
  });

  it("every entry can be instantiated as ResearchMethodology", () => {
    for (const params of METHODOLOGY_SEED) {
      const m = new ResearchMethodology(params);
      expect(m.name).toBeDefined();
      expect(m.name).not.toBe("");
      expect(m.type).toBe(params.type);
    }
  });
});
