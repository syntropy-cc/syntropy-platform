/**
 * Unit tests for AnonymizationPolicyEnforcer (COMP-024.3).
 */

import { describe, it, expect } from "vitest";
import {
  createExperimentId,
  createExperimentResultId,
} from "@syntropy/types";
import {
  ExperimentResult,
  AnonymizationPolicyEnforcer,
  PERSONAL_DATA_FIELDS,
} from "../../../src/domain/experiment-design/index.js";

const RESULT_ID = createExperimentResultId(
  "a1000001-0000-4000-8000-000000000001"
);
const EXPERIMENT_ID = createExperimentId(
  "e1000001-0000-4000-8000-000000000001"
);
const COLLECTED_AT = new Date("2026-01-15T10:00:00Z");

function createResultWithSummary(
  statisticalSummary: Record<string, unknown>
): ExperimentResult {
  return new ExperimentResult({
    id: RESULT_ID,
    experimentId: EXPERIMENT_ID,
    rawDataLocation: "s3://bucket/data.json",
    statisticalSummary,
    pValue: 0.02,
    collectedAt: COLLECTED_AT,
  });
}

describe("AnonymizationPolicyEnforcer", () => {
  it("redacts PII keys in statisticalSummary", () => {
    const enforcer = new AnonymizationPolicyEnforcer();
    const result = createResultWithSummary({
      mean: 0.5,
      n: 100,
      participantId: "user-123",
      email: "pii@example.com",
    });
    const redacted = enforcer.enforce(result, {
      piiKeys: ["participantId", "email"],
    });
    expect(redacted.statisticalSummary).toEqual({
      mean: 0.5,
      n: 100,
      participantId: "[REDACTED]",
      email: "[REDACTED]",
    });
    expect(redacted.id).toBe(result.id);
    expect(redacted.pValue).toBe(0.02);
  });

  it("does not mutate original result", () => {
    const enforcer = new AnonymizationPolicyEnforcer();
    const result = createResultWithSummary({
      participantId: "user-456",
    });
    enforcer.enforce(result, { piiKeys: ["participantId"] });
    expect(result.statisticalSummary.participantId).toBe("user-456");
  });

  it("leaves non-PII keys unchanged when policy lists other keys", () => {
    const enforcer = new AnonymizationPolicyEnforcer();
    const result = createResultWithSummary({
      mean: 0.5,
      std: 0.1,
      name: "should-be-redacted",
    });
    const redacted = enforcer.enforce(result, { piiKeys: ["name"] });
    expect(redacted.statisticalSummary.mean).toBe(0.5);
    expect(redacted.statisticalSummary.std).toBe(0.1);
    expect(redacted.statisticalSummary.name).toBe("[REDACTED]");
  });

  it("returns result with empty redaction when piiKeys is empty", () => {
    const enforcer = new AnonymizationPolicyEnforcer();
    const result = createResultWithSummary({
      participantId: "user-789",
    });
    const redacted = enforcer.enforce(result, { piiKeys: [] });
    expect(redacted.statisticalSummary.participantId).toBe("user-789");
  });

  it("accepts policy with subjectAreaId for per-SubjectArea configuration", () => {
    const enforcer = new AnonymizationPolicyEnforcer();
    const result = createResultWithSummary({ email: "a@b.com" });
    const redacted = enforcer.enforce(result, {
      piiKeys: ["email"],
      subjectAreaId: "area-1",
    });
    expect(redacted.statisticalSummary.email).toBe("[REDACTED]");
  });

  it("PERSONAL_DATA_FIELDS includes expected PII key names", () => {
    expect(PERSONAL_DATA_FIELDS).toContain("participantId");
    expect(PERSONAL_DATA_FIELDS).toContain("email");
    expect(PERSONAL_DATA_FIELDS).toContain("name");
  });
});
