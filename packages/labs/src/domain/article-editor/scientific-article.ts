/**
 * ScientificArticle aggregate — article with MyST Markdown content (COMP-023.1).
 * Architecture: article-editor.md, ADR-008
 */

import type { ArticleId } from "@syntropy/types";
import type { SubjectAreaId } from "../scientific-context/subject-area.js";
import { isArticleStatus } from "./article-status.js";
import type { ArticleStatus } from "./article-status.js";

export { isArticleStatus };
export type { ArticleStatus } from "./article-status.js";

export interface ScientificArticleParams {
  articleId: ArticleId;
  title: string;
  content: string;
  subjectAreaId: SubjectAreaId;
  authorId: string;
  status: ArticleStatus;
  publishedArtifactId?: string | null;
  publishedAt?: Date | null;
}

/**
 * ScientificArticle aggregate — primary output of the Labs pillar.
 * Content is stored as MyST Markdown. Lifecycle: draft → under_review → published.
 */
export class ScientificArticle {
  readonly articleId: ArticleId;
  readonly title: string;
  readonly content: string;
  readonly subjectAreaId: SubjectAreaId;
  readonly authorId: string;
  readonly status: ArticleStatus;
  readonly publishedArtifactId: string | null;
  readonly publishedAt: Date | null;

  constructor(params: ScientificArticleParams) {
    if (!params.title?.trim()) {
      throw new Error("ScientificArticle title cannot be empty");
    }
    if (typeof params.content !== "string") {
      throw new Error("ScientificArticle content must be a string");
    }
    if (!params.authorId?.trim()) {
      throw new Error("ScientificArticle authorId cannot be empty");
    }
    if (!isArticleStatus(params.status)) {
      throw new Error(
        `Invalid article status: ${params.status}. Must be draft, under_review, or published.`
      );
    }
    if (
      params.status === "published" &&
      (params.publishedArtifactId == null || !String(params.publishedArtifactId).trim())
    ) {
      throw new Error(
        "ScientificArticle in published status must have publishedArtifactId"
      );
    }

    this.articleId = params.articleId;
    this.title = params.title.trim();
    this.content = params.content;
    this.subjectAreaId = params.subjectAreaId;
    this.authorId = params.authorId.trim();
    this.status = params.status;
    this.publishedArtifactId = params.publishedArtifactId?.trim() ?? null;
    this.publishedAt = params.publishedAt ?? null;
  }

  /** Transition to under_review (submitted for peer review). */
  submitForReview(): ScientificArticle {
    if (this.status !== "draft") {
      throw new Error(
        `Cannot submit for review: current status is ${this.status}, expected draft`
      );
    }
    return new ScientificArticle({
      ...this,
      status: "under_review",
    });
  }

  /** Retract from review: transition back to draft (only when under_review). */
  retractFromReview(): ScientificArticle {
    if (this.status !== "under_review") {
      throw new Error(
        `Cannot retract: current status is ${this.status}, expected under_review`
      );
    }
    return new ScientificArticle({
      ...this,
      status: "draft",
    });
  }

  /** Transition to published and set DIP artifact id. */
  publish(artifactId: string): ScientificArticle {
    if (this.status === "published") {
      throw new Error("Article is already published");
    }
    const trimmed = artifactId.trim();
    if (!trimmed) {
      throw new Error("publishedArtifactId cannot be empty");
    }
    return new ScientificArticle({
      ...this,
      status: "published",
      publishedArtifactId: trimmed,
      publishedAt: new Date(),
    });
  }

  /** Update title and/or content (only when draft). */
  updateDraft(updates: { title?: string; content?: string }): ScientificArticle {
    if (this.status !== "draft") {
      throw new Error(
        `Cannot update: current status is ${this.status}, only draft can be updated`
      );
    }
    const title = updates.title !== undefined ? updates.title : this.title;
    const content = updates.content !== undefined ? updates.content : this.content;
    if (!title.trim()) {
      throw new Error("ScientificArticle title cannot be empty");
    }
    return new ScientificArticle({
      ...this,
      title: title.trim(),
      content,
    });
  }
}
