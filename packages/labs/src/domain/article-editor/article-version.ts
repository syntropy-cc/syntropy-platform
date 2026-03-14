/**
 * ArticleVersion entity — immutable content snapshot (COMP-023.2).
 * Architecture: article-editor.md
 */

import type { ArticleId } from "@syntropy/types";

export interface ArticleVersionParams {
  articleId: ArticleId;
  versionNumber: number;
  mystContent: string;
  contentHash?: string | null;
  createdAt: Date;
  createdBy: string;
}

/**
 * ArticleVersion — immutable snapshot of article content at a point in time.
 * Created on each save(); version numbers increment. Append-only.
 */
export class ArticleVersion {
  readonly articleId: ArticleId;
  readonly versionNumber: number;
  readonly mystContent: string;
  readonly contentHash: string | null;
  readonly createdAt: Date;
  readonly createdBy: string;

  constructor(params: ArticleVersionParams) {
    if (params.versionNumber < 1) {
      throw new Error("ArticleVersion versionNumber must be >= 1");
    }
    if (typeof params.mystContent !== "string") {
      throw new Error("ArticleVersion mystContent must be a string");
    }
    if (!params.createdBy?.trim()) {
      throw new Error("ArticleVersion createdBy cannot be empty");
    }
    this.articleId = params.articleId;
    this.versionNumber = params.versionNumber;
    this.mystContent = params.mystContent;
    this.contentHash = params.contentHash?.trim() ?? null;
    this.createdAt = params.createdAt instanceof Date ? params.createdAt : new Date(params.createdAt);
    this.createdBy = params.createdBy.trim();
  }

  /** Returns the latest version from a list (max versionNumber). */
  static getLatest(versions: ArticleVersion[]): ArticleVersion | null {
    if (versions.length === 0) return null;
    return versions.reduce((latest, v) =>
      v.versionNumber > latest.versionNumber ? v : latest
    );
  }
}
