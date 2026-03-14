/**
 * Article editor domain — ScientificArticle, ArticleVersion (COMP-023).
 * Architecture: article-editor.md
 */

export {
  ScientificArticle,
  type ScientificArticleParams,
} from "./scientific-article.js";
export {
  ArticleStatus,
  isArticleStatus,
} from "./article-status.js";
export {
  ArticleVersion,
  type ArticleVersionParams,
} from "./article-version.js";
