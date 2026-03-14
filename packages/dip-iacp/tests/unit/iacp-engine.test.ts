/**
 * Unit tests for IACPEngine.evaluate() consensus check.
 * Tests for: COMP-005.5
 */

import { describe, expect, it } from "vitest";
import { createEvaluationResult } from "../../src/domain/evaluation-result.js";
import { IACPEngine } from "../../src/domain/iacp-engine.js";
import { IACPRecord } from "../../src/domain/iacp-record.js";
import type { ConsensusEvaluatorPort } from "../../src/domain/ports/consensus-evaluator-port.js";
import { createIACPId } from "../../src/domain/value-objects/iacp-id.js";

const SAMPLE_IACP_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

function createRecordInPending(): IACPRecord {
  const id = createIACPId(SAMPLE_IACP_ID);
  return IACPRecord.draft({ id, type: "usage_agreement" }).submit();
}

describe("IACPEngine.evaluate", () => {
  it("returns allowed when consensus evaluator allows", async () => {
    const allowedResult = createEvaluationResult(true);
    const evaluator: ConsensusEvaluatorPort = {
      evaluate: async () => allowedResult,
    };
    const engine = new IACPEngine(evaluator);
    const record = createRecordInPending();

    const result = await engine.evaluate(record);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("returns denied when consensus evaluator denies", async () => {
    const deniedResult = createEvaluationResult(false, "Quorum not met");
    const evaluator: ConsensusEvaluatorPort = {
      evaluate: async () => deniedResult,
    };
    const engine = new IACPEngine(evaluator);
    const record = createRecordInPending();

    const result = await engine.evaluate(record);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("Quorum not met");
  });

  it("passes record and context to consensus evaluator", async () => {
    let capturedRecord: IACPRecord | null = null;
    let capturedContext: unknown = null;
    const evaluator: ConsensusEvaluatorPort = {
      evaluate: async (record, context) => {
        capturedRecord = record;
        capturedContext = context;
        return createEvaluationResult(true);
      },
    };
    const engine = new IACPEngine(evaluator);
    const record = createRecordInPending();
    const context = { contractId: "contract-123" };

    await engine.evaluate(record, context);

    expect(capturedRecord).toBe(record);
    expect(capturedRecord).not.toBeNull();
    expect((capturedRecord as unknown as IACPRecord).id).toBe(SAMPLE_IACP_ID);
    expect(capturedContext).toEqual({ contractId: "contract-123" });
  });

  it("evaluates draft record when evaluator accepts any status", async () => {
    const evaluator: ConsensusEvaluatorPort = {
      evaluate: async (record) =>
        createEvaluationResult(record.status === "draft", "status check"),
    };
    const engine = new IACPEngine(evaluator);
    const draftRecord = IACPRecord.draft({
      id: createIACPId(SAMPLE_IACP_ID),
      type: "usage_agreement",
    });

    const result = await engine.evaluate(draftRecord);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBe("status check");
  });
});
