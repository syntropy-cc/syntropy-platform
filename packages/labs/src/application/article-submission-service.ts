/**
 * ArticleSubmissionService — submit, retract, and accept article workflow (COMP-023.6).
 * Architecture: article-editor.md
 */

import type { ArticleId } from "@syntropy/types";
import { ArticleForbiddenError, ArticleNotFoundError } from "../domain/errors.js";
import type { ScientificArticleRepositoryPort } from "../domain/article-editor/ports/scientific-article-repository-port.js";
import type { ArticlePublisherPort } from "../domain/article-editor/ports/article-publisher-port.js";
import type { ArticleSubmissionNotifierPort } from "../domain/article-editor/ports/article-submission-notifier-port.js";

export interface ArticleSubmissionServiceDeps {
  articleRepository: ScientificArticleRepositoryPort;
  articlePublisher: ArticlePublisherPort;
  notifier: ArticleSubmissionNotifierPort;
}

/**
 * Application service for article submission workflow: submit for review,
 * retract from review, and accept (DIP publication).
 */
export class ArticleSubmissionService {
  constructor(private readonly deps: ArticleSubmissionServiceDeps) {}

  /**
   * Submit article for review. Transitions draft → under_review and notifies reviewers.
   * @throws ArticleNotFoundError if article does not exist
   * @throws ArticleForbiddenError if actor is not the author
   */
  async submit(articleId: ArticleId, actorId: string): Promise<void> {
    const article = await this.deps.articleRepository.findById(articleId);
    if (!article) {
      throw new ArticleNotFoundError(String(articleId));
    }
    if (article.authorId !== actorId) {
      throw new ArticleForbiddenError(String(articleId), "submit");
    }
    const submitted = article.submitForReview();
    await this.deps.articleRepository.save(submitted);
    await this.deps.notifier.notifySubmittedForReview(
      articleId,
      article.authorId,
      article.subjectAreaId
    );
  }

  /**
   * Retract article from review. Transitions under_review → draft.
   * @throws ArticleNotFoundError if article does not exist
   * @throws ArticleForbiddenError if actor is not the author
   */
  async retract(articleId: ArticleId, actorId: string): Promise<void> {
    const article = await this.deps.articleRepository.findById(articleId);
    if (!article) {
      throw new ArticleNotFoundError(String(articleId));
    }
    if (article.authorId !== actorId) {
      throw new ArticleForbiddenError(String(articleId), "retract");
    }
    const retracted = article.retractFromReview();
    await this.deps.articleRepository.save(retracted);
  }

  /**
   * Accept article (publish as DIP artifact). Transitions under_review → published.
   * @throws ArticleNotFoundError if article does not exist
   * @throws ArticleForbiddenError if actor is not the author (or extend for reviewer role later)
   */
  async accept(articleId: ArticleId, actorId: string): Promise<void> {
    const article = await this.deps.articleRepository.findById(articleId);
    if (!article) {
      throw new ArticleNotFoundError(String(articleId));
    }
    if (article.authorId !== actorId) {
      throw new ArticleForbiddenError(String(articleId), "accept");
    }
    const result = await this.deps.articlePublisher.publish(article);
    const published = article.publish(result.artifactId);
    await this.deps.articleRepository.save(published);
  }
}
