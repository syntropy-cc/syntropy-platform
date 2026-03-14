/**
 * ArticleStatus — lifecycle status for ScientificArticle (COMP-023.1).
 * Architecture: article-editor.md, ADR-008
 */

/** Lifecycle status for a scientific article. */
export type ArticleStatus = "draft" | "under_review" | "published";

const ARTICLE_STATUSES: ArticleStatus[] = [
  "draft",
  "under_review",
  "published",
];

export function isArticleStatus(value: string): value is ArticleStatus {
  return ARTICLE_STATUSES.includes(value as ArticleStatus);
}
