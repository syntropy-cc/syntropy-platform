/**
 * Unit tests for ExperimentDesign aggregate (COMP-024.1).
 */

import { describe, it, expect } from "vitest";
import { createArticleId, createExperimentId } from "@syntropy/types";
import { createHypothesisId } from "../../../src/domain/scientific-context/hypothesis-record.js";
import {
  ExperimentDesign,
  isExperimentStatus,
} from "../../../src/domain/experiment-design/index.js";

const EXPERIMENT_ID = createExperimentId(
  "e1000001-0000-4000-8000-000000000001"
);
const ARTICLE_ID = createArticleId("a1000001-0000-4000-8000-000000000001");
const HYPOTHESIS_ID = createHypothesisId(
  "91000001-0000-4000-8000-000000000001"
);
const RESEARCHER_ID = "researcher-1";

function createDesign(overrides: Partial<{
  experimentId: ReturnType<typeof createExperimentId>;
  articleId: ReturnType<typeof createArticleId>;
  status: "designing" | "registered" | "running" | "completed";
  hypothesisRecordId: ReturnType<typeof createHypothesisId> | null;
}> = {}) {
  return new ExperimentDesign({
    experimentId: EXPERIMENT_ID,
    articleId: ARTICLE_ID,
    researcherId: RESEARCHER_ID,
    title: "Test Experiment",
    methodologyId: "method-1",
    hypothesisRecordId: HYPOTHESIS_ID,
    protocol: { steps: ["step1"] },
    variables: { x: 1 },
    ethicalApprovalStatus: "approved",
    status: "designing",
    ...overrides,
  });
}

describe("isExperimentStatus", () => {
  it("returns true for designing, registered, running, completed", () => {
    expect(isExperimentStatus("designing")).toBe(true);
    expect(isExperimentStatus("registered")).toBe(true);
    expect(isExperimentStatus("running")).toBe(true);
    expect(isExperimentStatus("completed")).toBe(true);
  });

  it("returns false for other strings", () => {
    expect(isExperimentStatus("")).toBe(false);
    expect(isExperimentStatus("draft")).toBe(false);
  });
});

describe("ExperimentDesign", () => {
  it("creates aggregate with required fields and designing status", () => {
    const design = createDesign();
    expect(design.experimentId).toBe(EXPERIMENT_ID);
    expect(design.articleId).toBe(ARTICLE_ID);
    expect(design.title).toBe("Test Experiment");
    expect(design.researcherId).toBe(RESEARCHER_ID);
    expect(design.status).toBe("designing");
    expect(design.hypothesisRecordId).toBe(HYPOTHESIS_ID);
    expect(design.protocol).toEqual({ steps: ["step1"] });
    expect(design.variables).toEqual({ x: 1 });
    expect(design.isRegistered()).toBe(false);
  });

  it("accepts null hypothesisRecordId", () => {
    const design = createDesign({ hypothesisRecordId: null });
    expect(design.hypothesisRecordId).toBeNull();
  });

  it("register() transitions designing to registered and sets preRegisteredAt", () => {
    const design = createDesign();
    const registered = design.register();
    expect(registered.status).toBe("registered");
    expect(registered.preRegisteredAt).toBeInstanceOf(Date);
    expect(registered.isRegistered()).toBe(true);
    expect(design.status).toBe("designing");
    expect(design.isRegistered()).toBe(false);
  });

  it("register() throws when already registered", () => {
    const design = createDesign({ status: "registered" });
    expect(() => design.register()).toThrow("expected designing");
  });

  it("register() throws when status is not designing", () => {
    const running = createDesign({ status: "running" });
    expect(() => running.register()).toThrow("expected designing");
    const completed = createDesign({ status: "completed" });
    expect(() => completed.register()).toThrow("expected designing");
  });

  it("second register() on same designing instance throws", () => {
    const design = createDesign();
    const registered = design.register();
    expect(() => registered.register()).toThrow("expected designing");
  });

  it("throws when title is empty", () => {
    expect(() =>
      new ExperimentDesign({
        experimentId: EXPERIMENT_ID,
        articleId: ARTICLE_ID,
        researcherId: RESEARCHER_ID,
        title: "",
        methodologyId: "m1",
        hypothesisRecordId: null,
        protocol: {},
        variables: {},
        ethicalApprovalStatus: "pending",
        status: "designing",
      })
    ).toThrow("title cannot be empty");
  });

  it("throws when researcherId is empty", () => {
    expect(() =>
      new ExperimentDesign({
        experimentId: EXPERIMENT_ID,
        articleId: ARTICLE_ID,
        researcherId: "",
        title: "Test",
        methodologyId: "m1",
        hypothesisRecordId: null,
        protocol: {},
        variables: {},
        ethicalApprovalStatus: "pending",
        status: "designing",
      })
    ).toThrow("researcherId cannot be empty");
  });
});
