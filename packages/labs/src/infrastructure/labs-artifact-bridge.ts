/**
 * LabsArtifactBridge — ACL that publishes articles as DIP artifacts (COMP-023.4).
 * Architecture: article-editor.md, PAT-005
 */

import { createHash } from "node:crypto";
import type { ScientificArticle } from "../domain/article-editor/scientific-article.js";
import type { ArticlePublisherPort, PublishArticleResult } from "../domain/article-editor/ports/article-publisher-port.js";

/** Minimal dependency: create a DIP artifact and return its id. */
export interface DipArtifactCreator {
  createArtifact(payload: {
    title: string;
    contentHash: string;
    content?: string;
    nostrAnchor?: string;
    metadata?: Record<string, unknown>;
  }): Promise<string>;
}

/**
 * Bridge from Labs article to DIP artifact. Computes content hash and Nostr anchor,
 * delegates artifact creation to injected DipArtifactCreator.
 */
export class LabsArtifactBridge implements ArticlePublisherPort {
  constructor(private readonly dip: DipArtifactCreator) {}

  async publish(
    article: ScientificArticle,
    options?: { contentHash?: string }
  ): Promise<PublishArticleResult> {
    const contentHash =
      options?.contentHash ?? this.computeContentHash(article.content);
    const nostrAnchor = this.computeNostrAnchor(contentHash);

    const artifactId = await this.dip.createArtifact({
      title: article.title,
      contentHash,
      content: article.content,
      nostrAnchor,
      metadata: {
        subjectAreaId: article.subjectAreaId,
        authorId: article.authorId,
      },
    });

    return { artifactId };
  }

  private computeContentHash(content: string): string {
    return createHash("sha256").update(content, "utf8").digest("hex");
  }

  private computeNostrAnchor(contentHash: string): string {
    return `sha256:${contentHash}`;
  }
}
