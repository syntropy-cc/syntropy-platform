/**
 * Unit tests for HypothesisRecord aggregate (COMP-022.3).
 */

import { describe, it, expect } from "vitest";
import { createExperimentId } from "@syntropy/types";
import {
  HypothesisRecord,
  createHypothesisId,
  isHypothesisId,
  isHypothesisStatus,
} from "../../../src/domain/scientific-context/hypothesis-record.js";

const VALID_HYP_ID = "c3000001-0000-4000-8000-000000000001";
const VALID_EXP_ID = "c3000001-0000-4000-8000-000000000002";
const PROJECT_ID = "proj-1";
const USER_ID = "user-1";

function createRecord(overrides: Partial<{
  hypothesisId: ReturnType<typeof createHypothesisId>;
  projectId: string;
  statement: string;
  status: "proposed" | "confirmed" | "refuted";
  createdBy: string;
}> = {}) {
  return new HypothesisRecord({
    hypothesisId: createHypothesisId(VALID_HYP_ID),
    projectId: PROJECT_ID,
    statement: "Increased X will lead to increased Y.",
    status: "proposed",
    createdBy: USER_ID,
    ...overrides,
  });
}

describe("createHypothesisId", () => {
  it("returns branded id for valid UUID", () => {
    const id = createHypothesisId(VALID_HYP_ID);
    expect(id).toBe(VALID_HYP_ID);
    expect(isHypothesisId(id)).toBe(true);
  });

  it("throws for empty or invalid value", () => {
    expect(() => createHypothesisId("")).toThrow("cannot be empty");
    expect(() => createHypothesisId("x")).toThrow("expected UUID format");
  });
});

describe("isHypothesisStatus", () => {
  it("returns true for proposed, confirmed, refuted", () => {
    expect(isHypothesisStatus("proposed")).toBe(true);
    expect(isHypothesisStatus("confirmed")).toBe(true);
    expect(isHypothesisStatus("refuted")).toBe(true);
  });

  it("returns false for other strings", () => {
    expect(isHypothesisStatus("draft")).toBe(false);
    expect(isHypothesisStatus("")).toBe(false);
  });
});

describe("HypothesisRecord", () => {
  it("creates aggregate with proposed status", () => {
    const r = createRecord();
    expect(r.statement).toBe("Increased X will lead to increased Y.");
    expect(r.status).toBe("proposed");
    expect(r.projectId).toBe(PROJECT_ID);
    expect(r.experimentId).toBeNull();
  });

  it("accepts optional experimentId", () => {
    const expId = createExperimentId(VALID_EXP_ID);
    const r = new HypothesisRecord({
      hypothesisId: createHypothesisId(VALID_HYP_ID),
      projectId: PROJECT_ID,
      statement: "H",
      status: "proposed",
      createdBy: USER_ID,
      experimentId: expId,
    });
    expect(r.experimentId).toBe(expId);
  });

  it("throws when statement is empty", () => {
    expect(() =>
      createRecord({ statement: "" })
    ).toThrow("statement cannot be empty");
    expect(() =>
      createRecord({ statement: "   " })
    ).toThrow("statement cannot be empty");
  });

  it("throws when status is invalid", () => {
    expect(() =>
      createRecord({ status: "invalid" as "proposed" })
    ).toThrow("Invalid hypothesis status");
  });

  it("confirm() transitions proposed to confirmed", () => {
    const r = createRecord();
    const confirmed = r.confirm();
    expect(confirmed.status).toBe("confirmed");
    expect(confirmed.updatedAt.getTime()).toBeGreaterThanOrEqual(r.updatedAt.getTime());
  });

  it("refute() transitions proposed to refuted", () => {
    const r = createRecord();
    const refuted = r.refute();
    expect(refuted.status).toBe("refuted");
  });

  it("confirm() throws when status is not proposed", () => {
    const r = createRecord({ status: "confirmed" });
    expect(() => r.confirm()).toThrow("Cannot confirm");
  });

  it("refute() throws when status is not proposed", () => {
    const r = createRecord({ status: "refuted" });
    expect(() => r.refute()).toThrow("Cannot refute");
  });

  it("linkExperiment() returns new record with experimentId set", () => {
    const r = createRecord();
    const expId = createExperimentId(VALID_EXP_ID);
    const linked = r.linkExperiment(expId);
    expect(linked.experimentId).toBe(expId);
    expect(r.experimentId).toBeNull();
  });
});
