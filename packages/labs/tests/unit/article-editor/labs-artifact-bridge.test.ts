/**
 * Unit tests for LabsArtifactBridge (COMP-023.4).
 */

import { describe, it, expect, vi } from "vitest";
import { createArticleId } from "@syntropy/types";
import { createSubjectAreaId } from "../../../src/domain/scientific-context/subject-area.js";
import { ScientificArticle } from "../../../src/domain/article-editor/scientific-article.js";
import {
  LabsArtifactBridge,
  type DipArtifactCreator,
} from "../../../src/infrastructure/labs-artifact-bridge.js";

const VALID_ARTICLE_ID = "a1000001-0000-4000-8000-000000000001";
const VALID_SUBJECT_AREA_ID = "51000001-0000-4000-8000-000000000001";
const AUTHOR_ID = "user-actor-1";
const DIP_ARTIFACT_ID = "dip-artifact-123";

function createArticle(): ScientificArticle {
  return new ScientificArticle({
    articleId: createArticleId(VALID_ARTICLE_ID),
    title: "Test Article",
    content: "# Intro\n\nContent.",
    subjectAreaId: createSubjectAreaId(VALID_SUBJECT_AREA_ID),
    authorId: AUTHOR_ID,
    status: "under_review",
  });
}

describe("LabsArtifactBridge", () => {
  it("publish() calls DIP creator with content hash and Nostr anchor", async () => {
    const createArtifact = vi.fn<DipArtifactCreator["createArtifact"]>().mockResolvedValue(DIP_ARTIFACT_ID);
    const bridge = new LabsArtifactBridge({ createArtifact });
    const article = createArticle();

    const result = await bridge.publish(article);

    expect(result.artifactId).toBe(DIP_ARTIFACT_ID);
    expect(createArtifact).toHaveBeenCalledTimes(1);
    const payload = createArtifact.mock.calls[0]![0];
    expect(payload.title).toBe("Test Article");
    expect(payload.content).toBe(article.content);
    expect(typeof payload.contentHash).toBe("string");
    expect(payload.contentHash.length).toBe(64);
    expect(payload.nostrAnchor).toMatch(/^sha256:[a-f0-9]+$/);
    expect(payload.metadata?.subjectAreaId).toBe(VALID_SUBJECT_AREA_ID);
    expect(payload.metadata?.authorId).toBe(AUTHOR_ID);
  });

  it("publish() uses provided contentHash when given", async () => {
    const createArtifact = vi.fn<DipArtifactCreator["createArtifact"]>().mockResolvedValue(DIP_ARTIFACT_ID);
    const bridge = new LabsArtifactBridge({ createArtifact });
    const article = createArticle();
    const customHash = "a".repeat(64);

    await bridge.publish(article, { contentHash: customHash });

    const payload = createArtifact.mock.calls[0]![0];
    expect(payload.contentHash).toBe(customHash);
    expect(payload.nostrAnchor).toBe(`sha256:${customHash}`);
  });

  it("publish() returns artifact id from DIP", async () => {
    const createArtifact = vi.fn<DipArtifactCreator["createArtifact"]>().mockResolvedValue("custom-id-456");
    const bridge = new LabsArtifactBridge({ createArtifact });
    const result = await bridge.publish(createArticle());
    expect(result.artifactId).toBe("custom-id-456");
  });
});
