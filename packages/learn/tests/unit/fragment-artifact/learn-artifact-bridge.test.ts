/**
 * Unit tests for LearnArtifactBridge (COMP-016.4).
 */

import { createCourseId, createFragmentId } from "@syntropy/types";
import { describe, it, expect, vi } from "vitest";
import { Fragment } from "../../../src/domain/fragment-artifact/fragment.js";
import {
  LearnArtifactBridge,
  type DipArtifactClientPort,
} from "../../../src/infrastructure/learn-artifact-bridge.js";

function createPublishedFragment(): Fragment {
  const fragment = Fragment.create({
    id: createFragmentId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"),
    courseId: createCourseId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e"),
    creatorId: "creator-uuid-123",
    title: "Intro to Types",
    problemContent: "What is a type?",
    theoryContent: "Types describe structure.",
    artifactContent: "const x: number = 1;",
  });
  fragment.submitForReview();
  fragment.publish();
  return fragment;
}

describe("LearnArtifactBridge", () => {
  it("publish calls DIP client with creatorId and serialized content and returns artifact id", async () => {
    const mockDip: DipArtifactClientPort = {
      createAndPublishArtifact: vi.fn().mockResolvedValue("dip-artifact-456"),
    };
    const bridge = new LearnArtifactBridge(mockDip);
    const fragment = createPublishedFragment();

    const artifactId = await bridge.publish(fragment);

    expect(artifactId).toBe("dip-artifact-456");
    expect(mockDip.createAndPublishArtifact).toHaveBeenCalledTimes(1);
    const [authorId, content] = vi.mocked(mockDip.createAndPublishArtifact).mock.calls[0];
    expect(authorId).toBe("creator-uuid-123");
    const parsed = JSON.parse(content);
    expect(parsed.title).toBe("Intro to Types");
    expect(parsed.problem).toBe("What is a type?");
    expect(parsed.theory).toBe("Types describe structure.");
    expect(parsed.artifact).toBe("const x: number = 1;");
  });
});
