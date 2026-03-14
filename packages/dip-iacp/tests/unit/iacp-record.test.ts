/**
 * Unit tests for IACPRecord aggregate.
 * Tests for: COMP-005.1, COMP-005.2
 */

import { describe, expect, it } from "vitest";
import { IACPRecord } from "../../src/domain/iacp-record.js";
import { IACPStatus } from "../../src/domain/iacp-status.js";
import { createIACPId } from "../../src/domain/value-objects/iacp-id.js";
import { createIACPParty } from "../../src/domain/value-objects/iacp-party.js";

const SAMPLE_IACP_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

describe("IACPRecord.draft", () => {
  it("creates record with draft status and empty parties", () => {
    const id = createIACPId(SAMPLE_IACP_ID);

    const record = IACPRecord.draft({ id, type: "usage_agreement" });

    expect(record.id).toBe(id);
    expect(record.type).toBe("usage_agreement");
    expect(record.status).toBe(IACPStatus.Draft);
    expect(record.parties).toEqual([]);
    expect(record.parties).toHaveLength(0);
  });

  it("creates draft with different type", () => {
    const id = createIACPId(SAMPLE_IACP_ID);

    const record = IACPRecord.draft({ id, type: "governance_contract" });

    expect(record.type).toBe("governance_contract");
    expect(record.status).toBe(IACPStatus.Draft);
  });
});

describe("IACPRecord.addParty", () => {
  it("returns new record with one party added", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const party = createIACPParty({ actorId: "actor-1", role: "signer" });

    const updated = record.addParty(party);

    expect(updated).not.toBe(record);
    expect(updated.id).toBe(record.id);
    expect(updated.type).toBe(record.type);
    expect(updated.parties).toHaveLength(1);
    expect(updated.parties[0]).toEqual(party);
    expect(record.parties).toHaveLength(0);
  });

  it("returns new record with multiple parties", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const p1 = createIACPParty({ actorId: "actor-1", role: "signer" });
    const p2 = createIACPParty({ actorId: "actor-2", role: "author" });

    const withOne = record.addParty(p1);
    const withTwo = withOne.addParty(p2);

    expect(withTwo.parties).toHaveLength(2);
    expect(withTwo.parties[0]).toEqual(p1);
    expect(withTwo.parties[1]).toEqual(p2);
    expect(withOne.parties).toHaveLength(1);
    expect(record.parties).toHaveLength(0);
  });

  it("throws when adding duplicate actorId", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    const record = IACPRecord.draft({ id, type: "usage_agreement" });
    const party = createIACPParty({ actorId: "actor-1", role: "signer" });
    const withParty = record.addParty(party);

    expect(() => withParty.addParty(party)).toThrow(
      "actor actor-1 is already in the record"
    );
    expect(() =>
      withParty.addParty(createIACPParty({ actorId: "actor-1", role: "other" }))
    ).toThrow("already in the record");
  });
});

describe("createIACPId", () => {
  it("accepts valid UUID", () => {
    const id = createIACPId(SAMPLE_IACP_ID);
    expect(id).toBe(SAMPLE_IACP_ID);
  });

  it("throws when value is empty", () => {
    expect(() => createIACPId("")).toThrow("cannot be empty");
    expect(() => createIACPId("   ")).toThrow("cannot be empty");
  });

  it("throws when value is not a valid UUID", () => {
    expect(() => createIACPId("not-a-uuid")).toThrow("expected UUID format");
    expect(() => createIACPId("f47ac10b-58cc-4372-a567")).toThrow(
      "expected UUID format"
    );
  });
});

describe("IACPStatus", () => {
  it("exposes all required status values", () => {
    expect(IACPStatus.Draft).toBe("draft");
    expect(IACPStatus.PendingSignatures).toBe("pending_signatures");
    expect(IACPStatus.Active).toBe("active");
    expect(IACPStatus.Terminated).toBe("terminated");
  });
});
