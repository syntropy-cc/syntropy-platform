/**
 * Unit tests for ArticleSubmissionService (COMP-023.6).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createArticleId } from "@syntropy/types";
import { createSubjectAreaId } from "../../../src/domain/scientific-context/subject-area.js";
import { ScientificArticle } from "../../../src/domain/article-editor/scientific-article.js";
import { ArticleSubmissionService } from "../../../src/application/article-submission-service.js";
import { ArticleNotFoundError, ArticleForbiddenError } from "../../../src/domain/errors.js";

const ARTICLE_ID = createArticleId("a1000001-0000-4000-8000-000000000001");
const SUBJECT_AREA_ID = createSubjectAreaId("51000001-0000-4000-8000-000000000001");
const AUTHOR_ID = "user-actor-1";
const OTHER_ACTOR = "user-actor-2";

function createDraftArticle() {
  return new ScientificArticle({
    articleId: ARTICLE_ID,
    title: "Test Article",
    content: "# Intro\n\nContent.",
    subjectAreaId: SUBJECT_AREA_ID,
    authorId: AUTHOR_ID,
    status: "draft",
  });
}

function createUnderReviewArticle() {
  return new ScientificArticle({
    articleId: ARTICLE_ID,
    title: "Test Article",
    content: "# Intro\n\nContent.",
    subjectAreaId: SUBJECT_AREA_ID,
    authorId: AUTHOR_ID,
    status: "under_review",
  });
}

describe("ArticleSubmissionService", () => {
  let articleRepository: {
    findById: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let articlePublisher: { publish: ReturnType<typeof vi.fn> };
  let notifier: { notifySubmittedForReview: ReturnType<typeof vi.fn> };
  let service: ArticleSubmissionService;

  beforeEach(() => {
    articleRepository = {
      findById: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
    };
    articlePublisher = {
      publish: vi.fn().mockResolvedValue({ artifactId: "dip-artifact-123" }),
    };
    notifier = {
      notifySubmittedForReview: vi.fn().mockResolvedValue(undefined),
    };
    service = new ArticleSubmissionService({
      articleRepository,
      articlePublisher,
      notifier,
    });
  });

  describe("submit", () => {
    it("transitions draft to under_review and calls notifier", async () => {
      const draft = createDraftArticle();
      articleRepository.findById.mockResolvedValue(draft);

      await service.submit(ARTICLE_ID, AUTHOR_ID);

      expect(articleRepository.save).toHaveBeenCalledTimes(1);
      const saved = articleRepository.save.mock.calls[0]![0] as ScientificArticle;
      expect(saved.status).toBe("under_review");
      expect(notifier.notifySubmittedForReview).toHaveBeenCalledWith(
        ARTICLE_ID,
        AUTHOR_ID,
        SUBJECT_AREA_ID
      );
    });

    it("throws ArticleNotFoundError when article does not exist", async () => {
      articleRepository.findById.mockResolvedValue(null);

      await expect(service.submit(ARTICLE_ID, AUTHOR_ID)).rejects.toThrow(
        ArticleNotFoundError
      );
      expect(articleRepository.save).not.toHaveBeenCalled();
      expect(notifier.notifySubmittedForReview).not.toHaveBeenCalled();
    });

    it("throws ArticleForbiddenError when actor is not the author", async () => {
      const draft = createDraftArticle();
      articleRepository.findById.mockResolvedValue(draft);

      await expect(service.submit(ARTICLE_ID, OTHER_ACTOR)).rejects.toThrow(
        ArticleForbiddenError
      );
      expect(articleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("retract", () => {
    it("transitions under_review to draft", async () => {
      const underReview = createUnderReviewArticle();
      articleRepository.findById.mockResolvedValue(underReview);

      await service.retract(ARTICLE_ID, AUTHOR_ID);

      expect(articleRepository.save).toHaveBeenCalledTimes(1);
      const saved = articleRepository.save.mock.calls[0]![0] as ScientificArticle;
      expect(saved.status).toBe("draft");
    });

    it("throws ArticleNotFoundError when article does not exist", async () => {
      articleRepository.findById.mockResolvedValue(null);

      await expect(service.retract(ARTICLE_ID, AUTHOR_ID)).rejects.toThrow(
        ArticleNotFoundError
      );
    });

    it("throws ArticleForbiddenError when actor is not the author", async () => {
      const underReview = createUnderReviewArticle();
      articleRepository.findById.mockResolvedValue(underReview);

      await expect(service.retract(ARTICLE_ID, OTHER_ACTOR)).rejects.toThrow(
        ArticleForbiddenError
      );
    });
  });

  describe("accept", () => {
    it("calls DIP publisher then transitions to published and saves", async () => {
      const underReview = createUnderReviewArticle();
      articleRepository.findById.mockResolvedValue(underReview);

      await service.accept(ARTICLE_ID, AUTHOR_ID);

      expect(articlePublisher.publish).toHaveBeenCalledWith(underReview);
      expect(articleRepository.save).toHaveBeenCalledTimes(1);
      const saved = articleRepository.save.mock.calls[0]![0] as ScientificArticle;
      expect(saved.status).toBe("published");
      expect(saved.publishedArtifactId).toBe("dip-artifact-123");
    });

    it("throws ArticleNotFoundError when article does not exist", async () => {
      articleRepository.findById.mockResolvedValue(null);

      await expect(service.accept(ARTICLE_ID, AUTHOR_ID)).rejects.toThrow(
        ArticleNotFoundError
      );
    });

    it("throws ArticleForbiddenError when actor is not the author", async () => {
      const underReview = createUnderReviewArticle();
      articleRepository.findById.mockResolvedValue(underReview);

      await expect(service.accept(ARTICLE_ID, OTHER_ACTOR)).rejects.toThrow(
        ArticleForbiddenError
      );
    });
  });
});
