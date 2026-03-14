/**
 * ScientificArticleRepositoryPort — persistence for ScientificArticle (COMP-023.5).
 */

import type { ArticleId } from "@syntropy/types";
import type { ScientificArticle } from "../scientific-article.js";

export interface ScientificArticleRepositoryPort {
  save(article: ScientificArticle): Promise<void>;
  findById(id: ArticleId): Promise<ScientificArticle | null>;
  findByAuthor(authorId: string): Promise<ScientificArticle[]>;
}
