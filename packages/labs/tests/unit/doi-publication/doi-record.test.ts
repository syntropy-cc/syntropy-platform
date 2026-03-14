/**
 * Unit tests for DOIRecord and DOIStatus (COMP-026.1).
 */

import { describe, it, expect } from "vitest";
import { createArticleId } from "@syntropy/types";
import {
  DOIRecord,
  createDoiRecordId,
  isDOIStatus,
  isRegisteredOrFindable,
} from "../../../src/domain/doi-publication/index.js";

const ARTICLE_ID = createArticleId("a1000001-0000-4000-8000-000000000001");
const DOI_ID = createDoiRecordId("doi-record-uuid-1");

function createDOIRecord(overrides: Partial<{
  doiId: ReturnType<typeof createDoiRecordId>;
  articleId: ReturnType<typeof createArticleId>;
  doi: string;
  registeredAt: Date;
  status: "draft" | "registered" | "findable";
}> = {}) {
  return new DOIRecord({
    doiId: DOI_ID,
    articleId: ARTICLE_ID,
    doi: "10.1234/example",
    registeredAt: new Date("2026-01-15T00:00:00Z"),
    status: "draft",
    ...overrides,
  });
}

describe("DOIStatus", () => {
  it("isDOIStatus accepts draft, registered, findable", () => {
    expect(isDOIStatus("draft")).toBe(true);
    expect(isDOIStatus("registered")).toBe(true);
    expect(isDOIStatus("findable")).toBe(true);
  });

  it("isDOIStatus rejects invalid values", () => {
    expect(isDOIStatus("invalid")).toBe(false);
    expect(isDOIStatus("")).toBe(false);
  });

  it("isRegisteredOrFindable returns true for registered and findable", () => {
    expect(isRegisteredOrFindable("registered")).toBe(true);
    expect(isRegisteredOrFindable("findable")).toBe(true);
  });

  it("isRegisteredOrFindable returns false for draft", () => {
    expect(isRegisteredOrFindable("draft")).toBe(false);
  });
});

describe("DOIRecord", () => {
  it("creates with required fields", () => {
    const record = createDOIRecord();
    expect(record.doiId).toBe(DOI_ID);
    expect(record.articleId).toBe(ARTICLE_ID);
    expect(record.doi).toBe("10.1234/example");
    expect(record.registeredAt).toEqual(new Date("2026-01-15T00:00:00Z"));
    expect(record.status).toBe("draft");
    expect(record.isImmutable).toBe(false);
  });

  it("isImmutable is true when status is registered", () => {
    const record = createDOIRecord({ status: "registered" });
    expect(record.isImmutable).toBe(true);
  });

  it("isImmutable is true when status is findable", () => {
    const record = createDOIRecord({ status: "findable" });
    expect(record.isImmutable).toBe(true);
  });

  it("withStatus returns new instance with updated status", () => {
    const draft = createDOIRecord({ status: "draft" });
    const registered = draft.withStatus("registered");
    expect(registered.status).toBe("registered");
    expect(draft.status).toBe("draft");
  });

  it("withStatus throws when setting registered record to draft", () => {
    const record = createDOIRecord({ status: "registered" });
    expect(() => record.withStatus("draft")).toThrow(
      "Cannot set status to draft once DOIRecord is registered or findable"
    );
  });

  it("withStatus throws when setting findable record to draft", () => {
    const record = createDOIRecord({ status: "findable" });
    expect(() => record.withStatus("draft")).toThrow(
      "Cannot set status to draft once DOIRecord is registered or findable"
    );
  });

  it("constructor throws when doi is empty", () => {
    expect(() =>
      createDOIRecord({ doi: "" })
    ).toThrow("DOIRecord doi cannot be empty");
  });

  it("constructor throws when status is invalid", () => {
    expect(() =>
      createDOIRecord({ status: "invalid" as "draft" })
    ).toThrow("Invalid DOI status");
  });
});

describe("createDoiRecordId", () => {
  it("returns branded id for non-empty string", () => {
    const id = createDoiRecordId("some-id");
    expect(id).toBe("some-id");
  });

  it("throws when value is empty", () => {
    expect(() => createDoiRecordId("")).toThrow("DoiRecordId cannot be empty");
  });
});
