/**
 * DOIRegistrationService — register DOI for published articles (COMP-026.3).
 * Validates article is published, calls DOIProvider (DataCite ACL), stores DOIRecord; retries on transient failure.
 */

import { randomUUID } from "node:crypto";
import type { ArticleId } from "@syntropy/types";
import { RetryPolicy } from "@syntropy/platform-core";
import { ArticleNotFoundError, ArticleNotEligibleForDOIError } from "../domain/errors.js";
import type { ScientificArticleRepositoryPort } from "../domain/article-editor/ports/scientific-article-repository-port.js";
import type { DOIRecordRepositoryPort } from "../domain/doi-publication/ports/doi-record-repository-port.js";
import type { DOIProvider, ArticleDOIMetadata } from "../domain/doi-publication/ports/doi-provider.js";
import { DOIRecord, createDoiRecordId } from "../domain/doi-publication/doi-record.js";

export interface DOIRegistrationServiceDeps {
  articleRepository: ScientificArticleRepositoryPort;
  doiRecordRepository: DOIRecordRepositoryPort;
  doiProvider: DOIProvider;
  retryPolicy?: RetryPolicy;
  /** Optional base URL for article page (e.g. https://app.example.com/labs/articles). */
  articlePageBaseUrl?: string;
}

/**
 * Application service for registering DOIs for published Labs articles.
 * Only articles with status "published" are eligible.
 */
export class DOIRegistrationService {
  private readonly retryPolicy: RetryPolicy;

  constructor(private readonly deps: DOIRegistrationServiceDeps) {
    this.retryPolicy = deps.retryPolicy ?? new RetryPolicy({ maxAttempts: 3 });
  }

  /**
   * Register a DOI for the article. Idempotent: if a DOI already exists for the article, returns it.
   * @throws ArticleNotFoundError if article does not exist
   * @throws ArticleNotEligibleForDOIError if article is not published
   */
  async register(articleId: ArticleId): Promise<DOIRecord> {
    const article = await this.deps.articleRepository.findById(articleId);
    if (!article) {
      throw new ArticleNotFoundError(String(articleId));
    }
    if (article.status !== "published") {
      throw new ArticleNotEligibleForDOIError(
        String(articleId),
        `article status is ${article.status}, expected published`
      );
    }

    const existing = await this.deps.doiRecordRepository.findByArticleId(articleId);
    if (existing) {
      return existing;
    }

    const metadata: ArticleDOIMetadata = {
      title: article.title,
      authors: [article.authorId],
      year: article.publishedAt
        ? new Date(article.publishedAt).getFullYear()
        : new Date().getFullYear(),
    };
    if (this.deps.articlePageBaseUrl) {
      metadata.url = `${this.deps.articlePageBaseUrl}/${articleId}`;
    }

    const result = await this.retryPolicy.execute(() =>
      this.deps.doiProvider.register(metadata)
    );

    const record = new DOIRecord({
      doiId: createDoiRecordId(randomUUID()),
      articleId,
      doi: result.doi,
      registeredAt: new Date(),
      status: "registered",
    });
    await this.deps.doiRecordRepository.save(record);
    return record;
  }
}
