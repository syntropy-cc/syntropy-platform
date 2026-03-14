/**
 * Unit tests for IACPRecord state machine transitions (submit, activate, terminate).
 * Tests for: COMP-005.3
 */

import { describe, expect, it } from "vitest";
import { InvalidTransitionError } from "../../src/domain/errors.js";
import { IACPRecord } from "../../src/domain/iacp-record.js";
import { IACPStatus } from "../../src/domain/iacp-status.js";
import { createIACPId } from "../../src/domain/value-objects/iacp-id.js";

const SAMPLE_IACP_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

describe("IACPRecord.submit", () => {
  it("transitions from draft to pending_signatures", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });

    const submitted = record.submit();

    expect(submitted).not.toBe(record);
    expect(submitted.status).toBe(IACPStatus.PendingSignatures);
    expect(submitted.id).toBe(record.id);
    expect(record.status).toBe(IACPStatus.Draft);
  });

  it("throws InvalidTransitionError when not in draft", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const submitted = record.submit();

    expect(() => submitted.submit()).toThrow(InvalidTransitionError);
    expect(() => submitted.submit()).toThrow(
      /cannot move record.*from "pending_signatures" to "pending_signatures"/
    );
  });

  it("throws InvalidTransitionError when already active", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const submitted = record.submit();
    const active = submitted.activate();

    expect(() => active.submit()).toThrow(InvalidTransitionError);
    expect(() => active.submit()).toThrow(/from "active"/);
  });

  it("throws InvalidTransitionError when terminated", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const terminated = record.terminate();

    expect(() => terminated.submit()).toThrow(InvalidTransitionError);
    expect(() => terminated.submit()).toThrow(/from "terminated"/);
  });
});

describe("IACPRecord.activate", () => {
  it("transitions from pending_signatures to active", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const submitted = record.submit();

    const active = submitted.activate();

    expect(active).not.toBe(submitted);
    expect(active.status).toBe(IACPStatus.Active);
    expect(active.id).toBe(record.id);
    expect(submitted.status).toBe(IACPStatus.PendingSignatures);
  });

  it("throws InvalidTransitionError when in draft", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });

    expect(() => record.activate()).toThrow(InvalidTransitionError);
    expect(() => record.activate()).toThrow(/from "draft"/);
  });

  it("throws InvalidTransitionError when already active", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const submitted = record.submit();
    const active = submitted.activate();

    expect(() => active.activate()).toThrow(InvalidTransitionError);
    expect(() => active.activate()).toThrow(/from "active"/);
  });

  it("throws InvalidTransitionError when terminated", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const terminated = record.terminate();

    expect(() => terminated.activate()).toThrow(InvalidTransitionError);
    expect(() => terminated.activate()).toThrow(/from "terminated"/);
  });
});

describe("IACPRecord.terminate", () => {
  it("transitions from draft to terminated", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });

    const terminated = record.terminate();

    expect(terminated).not.toBe(record);
    expect(terminated.status).toBe(IACPStatus.Terminated);
    expect(record.status).toBe(IACPStatus.Draft);
  });

  it("transitions from pending_signatures to terminated", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const submitted = record.submit();

    const terminated = submitted.terminate();

    expect(terminated.status).toBe(IACPStatus.Terminated);
    expect(submitted.status).toBe(IACPStatus.PendingSignatures);
  });

  it("transitions from active to terminated", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const submitted = record.submit();
    const active = submitted.activate();

    const terminated = active.terminate();

    expect(terminated.status).toBe(IACPStatus.Terminated);
    expect(active.status).toBe(IACPStatus.Active);
  });

  it("throws InvalidTransitionError when already terminated", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const terminated = record.terminate();

    expect(() => terminated.terminate()).toThrow(InvalidTransitionError);
    expect(() => terminated.terminate()).toThrow(/from "terminated"/);
  });

  it("InvalidTransitionError exposes fromStatus, toStatus, recordId", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const terminated = record.terminate();

    try {
      terminated.terminate();
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InvalidTransitionError);
      const e = err as InvalidTransitionError;
      expect(e.fromStatus).toBe(IACPStatus.Terminated);
      expect(e.toStatus).toBe(IACPStatus.Terminated);
      expect(e.recordId).toBe(SAMPLE_IACP_ID);
    }
  });
});
