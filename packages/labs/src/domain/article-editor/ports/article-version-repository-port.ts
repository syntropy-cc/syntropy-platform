/**
 * ArticleVersionRepositoryPort — persistence for ArticleVersion (COMP-023.5).
 */

import type { ArticleId } from "@syntropy/types";
import type { ArticleVersion } from "../article-version.js";

export interface ArticleVersionRepositoryPort {
  appendVersion(version: ArticleVersion): Promise<void>;
  getLatest(articleId: ArticleId): Promise<ArticleVersion | null>;
  listByArticleId(articleId: ArticleId): Promise<ArticleVersion[]>;
}
