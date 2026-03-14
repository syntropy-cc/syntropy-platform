/**
 * Unit tests for DOIRegistrationService (COMP-026.3).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createArticleId } from "@syntropy/types";
import { createSubjectAreaId } from "../../../src/domain/scientific-context/subject-area.js";
import { ScientificArticle } from "../../../src/domain/article-editor/scientific-article.js";
import { DOIRegistrationService } from "../../../src/application/doi-registration-service.js";
import {
  ArticleNotFoundError,
  ArticleNotEligibleForDOIError,
} from "../../../src/domain/errors.js";
import { createDoiRecordId } from "../../../src/domain/doi-publication/doi-record.js";
import { DOIRecord } from "../../../src/domain/doi-publication/doi-record.js";
import type { DOIProvider, ArticleDOIMetadata, RegisterDOIResult } from "../../../src/domain/doi-publication/ports/doi-provider.js";
import { RetryPolicy } from "@syntropy/platform-core";

const ARTICLE_ID = createArticleId("a2000001-0000-4000-8000-000000000001");
const SUBJECT_AREA_ID = createSubjectAreaId("51000001-0000-4000-8000-000000000001");
const AUTHOR_ID = "user-author-1";

function createPublishedArticle() {
  return new ScientificArticle({
    articleId: ARTICLE_ID,
    title: "Published Paper",
    content: "# Abstract\n\nContent.",
    subjectAreaId: SUBJECT_AREA_ID,
    authorId: AUTHOR_ID,
    status: "published",
    publishedArtifactId: "dip-artifact-456",
    publishedAt: new Date("2025-01-15"),
  });
}

function createDraftArticle() {
  return new ScientificArticle({
    articleId: ARTICLE_ID,
    title: "Draft Paper",
    content: "# Draft",
    subjectAreaId: SUBJECT_AREA_ID,
    authorId: AUTHOR_ID,
    status: "draft",
  });
}

function createUnderReviewArticle() {
  return new ScientificArticle({
    articleId: ARTICLE_ID,
    title: "Under Review",
    content: "# Content",
    subjectAreaId: SUBJECT_AREA_ID,
    authorId: AUTHOR_ID,
    status: "under_review",
  });
}

describe("DOIRegistrationService", () => {
  let articleRepository: { findById: ReturnType<typeof vi.fn> };
  let doiRecordRepository: {
    findByArticleId: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let doiProvider: DOIProvider & { register: ReturnType<typeof vi.fn> };
  let service: DOIRegistrationService;

  beforeEach(() => {
    articleRepository = {
      findById: vi.fn(),
    };
    doiRecordRepository = {
      findByArticleId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };
    doiProvider = {
      register: vi.fn().mockResolvedValue({ doi: "10.1234/test-001" }),
      deactivate: vi.fn().mockResolvedValue(undefined),
    };
    service = new DOIRegistrationService({
      articleRepository,
      doiRecordRepository,
      doiProvider,
    });
  });

  it("throws ArticleNotFoundError when article does not exist", async () => {
    articleRepository.findById.mockResolvedValue(null);

    await expect(service.register(ARTICLE_ID)).rejects.toThrow(ArticleNotFoundError);
    expect(doiProvider.register).not.toHaveBeenCalled();
    expect(doiRecordRepository.save).not.toHaveBeenCalled();
  });

  it("throws ArticleNotEligibleForDOIError when article is draft", async () => {
    articleRepository.findById.mockResolvedValue(createDraftArticle());

    await expect(service.register(ARTICLE_ID)).rejects.toThrow(
      ArticleNotEligibleForDOIError
    );
    await expect(service.register(ARTICLE_ID)).rejects.toThrow(/draft/);
    expect(doiProvider.register).not.toHaveBeenCalled();
    expect(doiRecordRepository.save).not.toHaveBeenCalled();
  });

  it("throws ArticleNotEligibleForDOIError when article is under_review", async () => {
    articleRepository.findById.mockResolvedValue(createUnderReviewArticle());

    await expect(service.register(ARTICLE_ID)).rejects.toThrow(
      ArticleNotEligibleForDOIError
    );
    await expect(service.register(ARTICLE_ID)).rejects.toThrow(/under_review/);
    expect(doiProvider.register).not.toHaveBeenCalled();
    expect(doiRecordRepository.save).not.toHaveBeenCalled();
  });

  it("registers DOI and saves DOIRecord when article is published", async () => {
    const published = createPublishedArticle();
    articleRepository.findById.mockResolvedValue(published);

    const result = await service.register(ARTICLE_ID);

    expect(doiProvider.register).toHaveBeenCalledTimes(1);
    const metadata = doiProvider.register.mock.calls[0]![0] as ArticleDOIMetadata;
    expect(metadata.title).toBe("Published Paper");
    expect(metadata.authors).toEqual([AUTHOR_ID]);
    expect(metadata.year).toBe(2025);
    expect(result).toBeInstanceOf(DOIRecord);
    expect(result.doi).toBe("10.1234/test-001");
    expect(result.articleId).toBe(ARTICLE_ID);
    expect(result.status).toBe("registered");
    expect(doiRecordRepository.save).toHaveBeenCalledTimes(1);
    const saved = doiRecordRepository.save.mock.calls[0]![0] as DOIRecord;
    expect(saved.doi).toBe("10.1234/test-001");
  });

  it("returns existing DOIRecord when article already has DOI (idempotent)", async () => {
    const published = createPublishedArticle();
    articleRepository.findById.mockResolvedValue(published);
    const existingRecord = new DOIRecord({
      doiId: createDoiRecordId("existing-doi-id"),
      articleId: ARTICLE_ID,
      doi: "10.1234/existing",
      registeredAt: new Date(),
      status: "registered",
    });
    doiRecordRepository.findByArticleId.mockResolvedValue(existingRecord);

    const result = await service.register(ARTICLE_ID);

    expect(result).toBe(existingRecord);
    expect(result.doi).toBe("10.1234/existing");
    expect(doiProvider.register).not.toHaveBeenCalled();
    expect(doiRecordRepository.save).not.toHaveBeenCalled();
  });

  it("retries on transient failure and succeeds on second attempt", async () => {
    const published = createPublishedArticle();
    articleRepository.findById.mockResolvedValue(published);
    const retryPolicy = new RetryPolicy({ maxAttempts: 3, baseDelayMs: 1 });
    const serviceWithRetry = new DOIRegistrationService({
      articleRepository,
      doiRecordRepository,
      doiProvider,
      retryPolicy,
    });
    let attempt = 0;
    doiProvider.register.mockImplementation(async (_meta: ArticleDOIMetadata): Promise<RegisterDOIResult> => {
      attempt++;
      if (attempt === 1) {
        const err = new Error("ECONNRESET") as NodeJS.ErrnoException;
        err.code = "ECONNRESET";
        throw err;
      }
      return { doi: "10.1234/after-retry" };
    });

    const result = await serviceWithRetry.register(ARTICLE_ID);

    expect(attempt).toBe(2);
    expect(result.doi).toBe("10.1234/after-retry");
    expect(doiRecordRepository.save).toHaveBeenCalledTimes(1);
  });

  it("throws on non-retryable error without retrying", async () => {
    const published = createPublishedArticle();
    articleRepository.findById.mockResolvedValue(published);
    const retryPolicy = new RetryPolicy({ maxAttempts: 3, baseDelayMs: 1 });
    const serviceWithRetry = new DOIRegistrationService({
      articleRepository,
      doiRecordRepository,
      doiProvider,
      retryPolicy,
    });
    const err = new Error("Bad Request") as Error & { status?: number };
    err.status = 400;
    doiProvider.register.mockRejectedValue(err);

    await expect(serviceWithRetry.register(ARTICLE_ID)).rejects.toThrow("Bad Request");
    expect(doiProvider.register).toHaveBeenCalledTimes(1);
    expect(doiRecordRepository.save).not.toHaveBeenCalled();
  });

  it("includes article page URL in metadata when articlePageBaseUrl is set", async () => {
    const published = createPublishedArticle();
    articleRepository.findById.mockResolvedValue(published);
    const serviceWithBaseUrl = new DOIRegistrationService({
      articleRepository,
      doiRecordRepository,
      doiProvider,
      articlePageBaseUrl: "https://app.example.com/labs/articles",
    });

    await serviceWithBaseUrl.register(ARTICLE_ID);

    const metadata = doiProvider.register.mock.calls[0]![0] as ArticleDOIMetadata;
    expect(metadata.url).toBe(`https://app.example.com/labs/articles/${ARTICLE_ID}`);
  });
});
