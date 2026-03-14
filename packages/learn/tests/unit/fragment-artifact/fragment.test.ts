/**
 * Unit tests for Fragment aggregate (COMP-016.1).
 */

import { createCourseId, createFragmentId } from "@syntropy/types";
import { describe, it, expect } from "vitest";
import { Fragment } from "../../../src/domain/fragment-artifact/fragment.js";
import { FragmentStatus } from "../../../src/domain/fragment-artifact/fragment-status.js";
import { IL1ViolationError } from "../../../src/domain/errors.js";

function createDraftFragment(overrides: Partial<{
  problemContent: string;
  theoryContent: string;
  artifactContent: string;
}> = {}) {
  return Fragment.create({
    id: createFragmentId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"),
    courseId: createCourseId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e"),
    creatorId: "creator-1",
    title: "Intro to Fragments",
    problemContent: overrides.problemContent ?? "",
    theoryContent: overrides.theoryContent ?? "",
    artifactContent: overrides.artifactContent ?? "",
  });
}

describe("Fragment", () => {
  it("create builds fragment with id courseId creatorId title and default Draft status", () => {
    const id = createFragmentId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    const courseId = createCourseId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const fragment = Fragment.create({
      id,
      courseId,
      creatorId: "creator-1",
      title: "Test Fragment",
    });

    expect(fragment.id).toBe(id);
    expect(fragment.courseId).toBe(courseId);
    expect(fragment.creatorId).toBe("creator-1");
    expect(fragment.title).toBe("Test Fragment");
    expect(fragment.status).toBe(FragmentStatus.Draft);
    expect(fragment.publishedArtifactId).toBeNull();
  });

  it("markSectionComplete updates section content and isComplete", () => {
    const fragment = createDraftFragment();
    expect(fragment.problemSection.isComplete).toBe(false);

    fragment.markSectionComplete("problem", "What is the problem?");
    expect(fragment.problemSection.content).toBe("What is the problem?");
    expect(fragment.problemSection.isComplete).toBe(true);
  });

  it("submitForReview transitions Draft to InReview", () => {
    const fragment = createDraftFragment();
    fragment.submitForReview();
    expect(fragment.status).toBe(FragmentStatus.InReview);
  });

  it("requestRevisions transitions InReview back to Draft", () => {
    const fragment = createDraftFragment();
    fragment.submitForReview();
    fragment.requestRevisions();
    expect(fragment.status).toBe(FragmentStatus.Draft);
  });

  it("publish throws IL1ViolationError when any section is empty", () => {
    const fragment = createDraftFragment();
    fragment.submitForReview();

    expect(() => fragment.publish()).toThrow(IL1ViolationError);
    expect(() => fragment.publish()).toThrow(/IL1/);
    expect(() => fragment.publish()).toThrow(/sections not complete/);
  });

  it("publish throws IL1ViolationError when only problem is filled", () => {
    const fragment = createDraftFragment({ problemContent: "Problem text" });
    fragment.submitForReview();
    expect(() => fragment.publish()).toThrow(IL1ViolationError);
  });

  it("publish succeeds when all three sections are non-empty", () => {
    const fragment = createDraftFragment({
      problemContent: "Problem",
      theoryContent: "Theory",
      artifactContent: "Artifact",
    });
    fragment.submitForReview();
    fragment.publish();
    expect(fragment.status).toBe(FragmentStatus.Published);
  });

  it("setPublishedArtifactId sets id once when status is Published", () => {
    const fragment = createDraftFragment({
      problemContent: "P",
      theoryContent: "T",
      artifactContent: "A",
    });
    fragment.submitForReview();
    fragment.publish();
    fragment.setPublishedArtifactId("dip-artifact-123");
    expect(fragment.publishedArtifactId).toBe("dip-artifact-123");
  });

  it("setPublishedArtifactId throws when already set (IL3)", () => {
    const fragment = createDraftFragment({
      problemContent: "P",
      theoryContent: "T",
      artifactContent: "A",
    });
    fragment.submitForReview();
    fragment.publish();
    fragment.setPublishedArtifactId("dip-artifact-123");
    expect(() => fragment.setPublishedArtifactId("another-id")).toThrow(
      /already set \(IL3\)/
    );
  });

  it("setPublishedArtifactId throws when status is not Published", () => {
    const fragment = createDraftFragment();
    expect(() => fragment.setPublishedArtifactId("dip-1")).toThrow(
      /must be Published/
    );
    fragment.submitForReview();
    expect(() => fragment.setPublishedArtifactId("dip-1")).toThrow(
      /must be Published/
    );
  });

  it("submitForReview throws when not Draft", () => {
    const fragment = createDraftFragment();
    fragment.submitForReview();
    expect(() => fragment.submitForReview()).toThrow(/only.*from Draft/);
  });

  it("requestRevisions throws when not InReview", () => {
    const fragment = createDraftFragment();
    expect(() => fragment.requestRevisions()).toThrow(/when InReview/);
  });

  it("publish throws when not InReview", () => {
    const fragment = createDraftFragment({
      problemContent: "P",
      theoryContent: "T",
      artifactContent: "A",
    });
    expect(() => fragment.publish()).toThrow(/only.*from InReview/);
  });
});
