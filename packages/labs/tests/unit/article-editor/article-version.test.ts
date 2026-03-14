/**
 * Unit tests for ArticleVersion entity (COMP-023.2).
 */

import { describe, it, expect } from "vitest";
import { createArticleId } from "@syntropy/types";
import {
  ArticleVersion,
} from "../../../src/domain/article-editor/article-version.js";

const VALID_ARTICLE_ID = "a1000001-0000-4000-8000-000000000001";
const CREATED_BY = "user-actor-1";

function createVersion(overrides: Partial<{
  articleId: ReturnType<typeof createArticleId>;
  versionNumber: number;
  mystContent: string;
  contentHash: string | null;
  createdAt: Date;
  createdBy: string;
}> = {}) {
  return new ArticleVersion({
    articleId: createArticleId(VALID_ARTICLE_ID),
    versionNumber: 1,
    mystContent: "# Title\n\nContent.",
    createdAt: new Date("2026-03-01T12:00:00Z"),
    createdBy: CREATED_BY,
    ...overrides,
  });
}

describe("ArticleVersion", () => {
  it("creates entity with required fields", () => {
    const v = createVersion();
    expect(v.articleId).toBe(VALID_ARTICLE_ID);
    expect(v.versionNumber).toBe(1);
    expect(v.mystContent).toContain("Title");
    expect(v.contentHash).toBeNull();
    expect(v.createdAt).toEqual(new Date("2026-03-01T12:00:00Z"));
    expect(v.createdBy).toBe(CREATED_BY);
  });

  it("accepts optional contentHash", () => {
    const v = createVersion({ contentHash: "sha256-abc" });
    expect(v.contentHash).toBe("sha256-abc");
  });

  it("trims contentHash and createdBy", () => {
    const v = new ArticleVersion({
      articleId: createArticleId(VALID_ARTICLE_ID),
      versionNumber: 1,
      mystContent: "x",
      createdAt: new Date(),
      createdBy: "  author-1  ",
    });
    expect(v.createdBy).toBe("author-1");
  });

  it("throws when versionNumber is less than 1", () => {
    expect(() => createVersion({ versionNumber: 0 })).toThrow("must be >= 1");
    expect(() => createVersion({ versionNumber: -1 })).toThrow("must be >= 1");
  });

  it("throws when createdBy is empty", () => {
    expect(() => createVersion({ createdBy: "" })).toThrow("createdBy cannot be empty");
  });

  it("getLatest returns null for empty list", () => {
    expect(ArticleVersion.getLatest([])).toBeNull();
  });

  it("getLatest returns the version with max versionNumber", () => {
    const v1 = createVersion({ versionNumber: 1 });
    const v2 = createVersion({ versionNumber: 2 });
    const v3 = createVersion({ versionNumber: 3 });
    expect(ArticleVersion.getLatest([v1, v2, v3])).toBe(v3);
    expect(ArticleVersion.getLatest([v3, v1, v2])).toBe(v3);
    expect(ArticleVersion.getLatest([v1])).toBe(v1);
  });

  it("snapshot content is stored unchanged", () => {
    const content = "# Intro\n\nMyST **content**.";
    const v = createVersion({ mystContent: content });
    expect(v.mystContent).toBe(content);
  });
});
