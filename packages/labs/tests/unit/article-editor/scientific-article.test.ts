/**
 * Unit tests for ScientificArticle aggregate (COMP-023.1).
 */

import { describe, it, expect } from "vitest";
import { createArticleId } from "@syntropy/types";
import { createSubjectAreaId } from "../../../src/domain/scientific-context/subject-area.js";
import {
  ScientificArticle,
  isArticleStatus,
} from "../../../src/domain/article-editor/scientific-article.js";

const VALID_ARTICLE_ID = "a1000001-0000-4000-8000-000000000001";
const VALID_SUBJECT_AREA_ID = "51000001-0000-4000-8000-000000000001";
const AUTHOR_ID = "user-actor-1";
const DIP_ARTIFACT_ID = "dip-artifact-123";

function createArticle(overrides: Partial<{
  articleId: ReturnType<typeof createArticleId>;
  title: string;
  content: string;
  subjectAreaId: ReturnType<typeof createSubjectAreaId>;
  authorId: string;
  status: "draft" | "under_review" | "published";
  publishedArtifactId: string | null;
}> = {}) {
  return new ScientificArticle({
    articleId: createArticleId(VALID_ARTICLE_ID),
    title: "Test Article Title",
    content: "# Introduction\n\nSome MyST content.",
    subjectAreaId: createSubjectAreaId(VALID_SUBJECT_AREA_ID),
    authorId: AUTHOR_ID,
    status: "draft",
    ...overrides,
  });
}

describe("isArticleStatus", () => {
  it("returns true for draft, under_review, published", () => {
    expect(isArticleStatus("draft")).toBe(true);
    expect(isArticleStatus("under_review")).toBe(true);
    expect(isArticleStatus("published")).toBe(true);
  });

  it("returns false for other strings", () => {
    expect(isArticleStatus("")).toBe(false);
    expect(isArticleStatus("submitted")).toBe(false);
  });
});

describe("ScientificArticle", () => {
  it("creates aggregate with draft status and required fields", () => {
    const article = createArticle();
    expect(article.articleId).toBe(VALID_ARTICLE_ID);
    expect(article.title).toBe("Test Article Title");
    expect(article.content).toContain("Introduction");
    expect(article.subjectAreaId).toBe(VALID_SUBJECT_AREA_ID);
    expect(article.authorId).toBe(AUTHOR_ID);
    expect(article.status).toBe("draft");
    expect(article.publishedArtifactId).toBeNull();
    expect(article.publishedAt).toBeNull();
  });

  it("trims title and authorId", () => {
    const article = new ScientificArticle({
      articleId: createArticleId(VALID_ARTICLE_ID),
      title: "  Trimmed Title  ",
      content: "x",
      subjectAreaId: createSubjectAreaId(VALID_SUBJECT_AREA_ID),
      authorId: "  author-1  ",
      status: "draft",
    });
    expect(article.title).toBe("Trimmed Title");
    expect(article.authorId).toBe("author-1");
  });

  it("throws when title is empty", () => {
    expect(() => createArticle({ title: "" })).toThrow("title cannot be empty");
    expect(() => createArticle({ title: "   " })).toThrow("title cannot be empty");
  });

  it("throws when authorId is empty", () => {
    expect(() => createArticle({ authorId: "" })).toThrow("authorId cannot be empty");
  });

  it("throws when status is invalid", () => {
    expect(() =>
      createArticle({ status: "invalid" as "draft" })
    ).toThrow("Invalid article status");
  });

  it("throws when status is published but publishedArtifactId is missing", () => {
    expect(() =>
      createArticle({
        status: "published",
        publishedArtifactId: null,
      })
    ).toThrow("must have publishedArtifactId");
    expect(() =>
      createArticle({
        status: "published",
        publishedArtifactId: "",
      })
    ).toThrow("must have publishedArtifactId");
  });

  it("accepts published status when publishedArtifactId is set", () => {
    const article = createArticle({
      status: "published",
      publishedArtifactId: DIP_ARTIFACT_ID,
      publishedAt: new Date(),
    });
    expect(article.status).toBe("published");
    expect(article.publishedArtifactId).toBe(DIP_ARTIFACT_ID);
  });

  it("submitForReview() transitions draft to under_review", () => {
    const article = createArticle();
    const submitted = article.submitForReview();
    expect(submitted.status).toBe("under_review");
    expect(article.status).toBe("draft");
  });

  it("submitForReview() throws when not draft", () => {
    const underReview = createArticle({ status: "under_review" });
    expect(() => underReview.submitForReview()).toThrow("expected draft");
    const published = createArticle({
      status: "published",
      publishedArtifactId: DIP_ARTIFACT_ID,
    });
    expect(() => published.submitForReview()).toThrow("expected draft");
  });

  it("retractFromReview() transitions under_review to draft", () => {
    const underReview = createArticle({ status: "under_review" });
    const retracted = underReview.retractFromReview();
    expect(retracted.status).toBe("draft");
    expect(underReview.status).toBe("under_review");
  });

  it("retractFromReview() throws when not under_review", () => {
    const draft = createArticle();
    expect(() => draft.retractFromReview()).toThrow("expected under_review");
    const published = createArticle({
      status: "published",
      publishedArtifactId: DIP_ARTIFACT_ID,
    });
    expect(() => published.retractFromReview()).toThrow("expected under_review");
  });

  it("publish() transitions to published and sets artifact id", () => {
    const article = createArticle({ status: "under_review" });
    const published = article.publish(DIP_ARTIFACT_ID);
    expect(published.status).toBe("published");
    expect(published.publishedArtifactId).toBe(DIP_ARTIFACT_ID);
    expect(published.publishedAt).toBeInstanceOf(Date);
  });

  it("publish() works from draft", () => {
    const article = createArticle();
    const published = article.publish(DIP_ARTIFACT_ID);
    expect(published.status).toBe("published");
  });

  it("publish() throws when already published", () => {
    const published = createArticle({
      status: "published",
      publishedArtifactId: DIP_ARTIFACT_ID,
    });
    expect(() => published.publish("other-id")).toThrow("already published");
  });

  it("publish() throws when artifact id is empty", () => {
    const article = createArticle();
    expect(() => article.publish("")).toThrow("cannot be empty");
    expect(() => article.publish("   ")).toThrow("cannot be empty");
  });

  it("updateDraft() updates title and content when draft", () => {
    const article = createArticle();
    const updated = article.updateDraft({
      title: "New Title",
      content: "# New content",
    });
    expect(updated.title).toBe("New Title");
    expect(updated.content).toBe("# New content");
    expect(article.title).toBe("Test Article Title");
  });

  it("updateDraft() throws when not draft", () => {
    const underReview = createArticle({ status: "under_review" });
    expect(() => underReview.updateDraft({ title: "X" })).toThrow("only draft can be updated");
    const published = createArticle({
      status: "published",
      publishedArtifactId: DIP_ARTIFACT_ID,
    });
    expect(() => published.updateDraft({ content: "x" })).toThrow("only draft can be updated");
  });

  it("updateDraft() throws when title becomes empty", () => {
    const article = createArticle();
    expect(() => article.updateDraft({ title: "" })).toThrow("title cannot be empty");
  });
});
