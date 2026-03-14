/**
 * Unit tests for ExperimentResult entity (COMP-024.2).
 */

import { describe, it, expect } from "vitest";
import {
  createExperimentId,
  createExperimentResultId,
} from "@syntropy/types";
import { ExperimentResult } from "../../../src/domain/experiment-design/index.js";

const RESULT_ID = createExperimentResultId(
  "a1000001-0000-4000-8000-000000000001"
);
const EXPERIMENT_ID = createExperimentId(
  "e1000001-0000-4000-8000-000000000001"
);
const COLLECTED_AT = new Date("2026-01-15T10:00:00Z");

function createResult(overrides: Partial<{
  id: ReturnType<typeof createExperimentResultId>;
  experimentId: ReturnType<typeof createExperimentId>;
  rawDataLocation: string;
  statisticalSummary: Record<string, unknown>;
  pValue: number | null;
  collectedAt: Date;
}> = {}) {
  return new ExperimentResult({
    id: RESULT_ID,
    experimentId: EXPERIMENT_ID,
    rawDataLocation: "s3://bucket/experiment-e1/result-r1.json",
    statisticalSummary: { mean: 0.5, std: 0.1, n: 100 },
    pValue: 0.03,
    collectedAt: COLLECTED_AT,
    ...overrides,
  });
}

describe("ExperimentResult", () => {
  it("creates entity with required fields and link to experiment", () => {
    const result = createResult();
    expect(result.id).toBe(RESULT_ID);
    expect(result.experimentId).toBe(EXPERIMENT_ID);
    expect(result.rawDataLocation).toBe("s3://bucket/experiment-e1/result-r1.json");
    expect(result.statisticalSummary).toEqual({ mean: 0.5, std: 0.1, n: 100 });
    expect(result.pValue).toBe(0.03);
    expect(result.collectedAt).toBe(COLLECTED_AT);
  });

  it("accepts null pValue", () => {
    const result = createResult({ pValue: null });
    expect(result.pValue).toBeNull();
  });

  it("accepts pValue at boundaries 0 and 1", () => {
    const r0 = createResult({ pValue: 0 });
    expect(r0.pValue).toBe(0);
    const r1 = createResult({ pValue: 1 });
    expect(r1.pValue).toBe(1);
  });

  it("defaults statisticalSummary to empty object when not provided", () => {
    const result = new ExperimentResult({
      id: RESULT_ID,
      experimentId: EXPERIMENT_ID,
      rawDataLocation: "path/to/data",
      statisticalSummary: undefined as unknown as Record<string, unknown>,
      pValue: null,
      collectedAt: COLLECTED_AT,
    });
    expect(result.statisticalSummary).toEqual({});
  });

  it("throws when rawDataLocation is empty", () => {
    expect(() =>
      createResult({ rawDataLocation: "" })
    ).toThrow("rawDataLocation cannot be empty");
    expect(() =>
      createResult({ rawDataLocation: "   " })
    ).toThrow("rawDataLocation cannot be empty");
  });

  it("throws when pValue is less than 0", () => {
    expect(() => createResult({ pValue: -0.1 })).toThrow(
      "pValue must be in [0, 1]"
    );
  });

  it("throws when pValue is greater than 1", () => {
    expect(() => createResult({ pValue: 1.1 })).toThrow(
      "pValue must be in [0, 1]"
    );
  });

  it("throws when collectedAt is not a Date", () => {
    expect(() =>
      new ExperimentResult({
        id: RESULT_ID,
        experimentId: EXPERIMENT_ID,
        rawDataLocation: "path",
        statisticalSummary: {},
        pValue: null,
        collectedAt: "2026-01-15" as unknown as Date,
      })
    ).toThrow("collectedAt must be a Date");
  });

  it("is immutable — no mutating methods and readonly shape", () => {
    const result = createResult();
    const descriptor = Object.getOwnPropertyDescriptor(
      ExperimentResult.prototype,
      "experimentId"
    );
    expect(descriptor?.writable).toBeFalsy();
    expect(Object.keys(result)).toEqual([
      "id",
      "experimentId",
      "rawDataLocation",
      "statisticalSummary",
      "pValue",
      "collectedAt",
    ]);
  });
});
