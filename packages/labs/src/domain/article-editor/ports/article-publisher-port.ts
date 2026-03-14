/**
 * ArticlePublisherPort — publish article as DIP artifact (COMP-023.4).
 * Architecture: article-editor.md, ACL to DIP
 */

import type { ScientificArticle } from "../scientific-article.js";

/** Result of publishing an article as a DIP artifact. */
export interface PublishArticleResult {
  /** DIP artifact id (opaque string; no DIP types in Labs domain). */
  artifactId: string;
}

/** Port for publishing a scientific article as a DIP artifact. */
export interface ArticlePublisherPort {
  /**
   * Publishes the article as a DIP artifact (content hash, Nostr anchor).
   * Returns the created artifact id.
   */
  publish(
    article: ScientificArticle,
    options?: { contentHash?: string }
  ): Promise<PublishArticleResult>;
}
