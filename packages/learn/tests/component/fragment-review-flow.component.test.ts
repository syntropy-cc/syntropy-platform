/**
 * Component test: Fragment review flow (COMP-016).
 * Exercises FragmentReviewService with in-memory ports (no DB).
 * Verifies submit (Draft → InReview) and approve (InReview → Published) in one flow.
 */

import { createCourseId, createFragmentId } from "@syntropy/types";
import { describe, it, expect } from "vitest";
import { Fragment } from "../../src/domain/fragment-artifact/fragment.js";
import { FragmentStatus } from "../../src/domain/fragment-artifact/fragment-status.js";
import { FragmentReviewService } from "../../src/domain/fragment-artifact/services/fragment-review-service.js";
import type { ArtifactPublisherPort } from "../../src/domain/fragment-artifact/ports/artifact-publisher-port.js";
import type { FragmentRepositoryPort } from "../../src/domain/fragment-artifact/ports/fragment-repository-port.js";
import type { FragmentReviewRecordPort } from "../../src/domain/fragment-artifact/ports/fragment-review-record-port.js";
import type { ReviewerRolePort } from "../../src/domain/fragment-artifact/ports/reviewer-role-port.js";

const REVIEWER_ID = "reviewer-1";

function createInMemoryFragmentRepository(
  initial?: Fragment
): FragmentRepositoryPort {
  const map = new Map<string, Fragment>();
  if (initial) {
    map.set(initial.id, initial);
  }
  return {
    async findById(id) {
      return map.get(id) ?? null;
    },
    async save(fragment) {
      map.set(fragment.id, fragment);
    },
  };
}

function createStubArtifactPublisher(returnId: string): ArtifactPublisherPort {
  return {
    async publish() {
      return returnId;
    },
  };
}

function createStubReviewerRole(reviewerIds: Set<string>): ReviewerRolePort {
  return {
    async hasReviewerRole(userId: string) {
      return reviewerIds.has(userId);
    },
  };
}

function createStubReviewRecord(): FragmentReviewRecordPort & { recorded: Array<{ fragmentId: string; reviewerId: string; action: string }> } {
  const recorded: Array<{ fragmentId: string; reviewerId: string; action: string }> = [];
  return {
    recorded,
    async recordReview(fragmentId, reviewerId, action) {
      recorded.push({ fragmentId, reviewerId, action });
    },
  };
}

describe("Fragment review flow (component)", () => {
  it("submit then approve transitions draft to published and records review", async () => {
    const fragmentId = createFragmentId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    const courseId = createCourseId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const draft = Fragment.create({
      id: fragmentId,
      courseId,
      creatorId: "creator-1",
      title: "Component Test Fragment",
      problemContent: "P",
      theoryContent: "T",
      artifactContent: "A",
      status: FragmentStatus.Draft,
    });

    const fragmentRepo = createInMemoryFragmentRepository(draft);
    const publishedArtifactId = "dip-artifact-123";
    const artifactPublisher = createStubArtifactPublisher(publishedArtifactId);
    const reviewerRole = createStubReviewerRole(new Set([REVIEWER_ID]));
    const reviewRecord = createStubReviewRecord();

    const service = new FragmentReviewService({
      fragmentRepository: fragmentRepo,
      artifactPublisher,
      reviewerRole,
      reviewRecord,
    });

    await service.submit(fragmentId);

    const inReview = await fragmentRepo.findById(fragmentId);
    expect(inReview).not.toBeNull();
    expect(inReview!.status).toBe(FragmentStatus.InReview);

    await service.approve(fragmentId, REVIEWER_ID);

    const published = await fragmentRepo.findById(fragmentId);
    expect(published).not.toBeNull();
    expect(published!.status).toBe(FragmentStatus.Published);
    expect(published!.publishedArtifactId).toBe(publishedArtifactId);
    expect(reviewRecord.recorded).toHaveLength(1);
    expect(reviewRecord.recorded[0]).toEqual({
      fragmentId,
      reviewerId: REVIEWER_ID,
      action: "approved",
    });
  });

  it("reject transitions InReview back to Draft and records reason", async () => {
    const fragmentId = createFragmentId("c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f");
    const courseId = createCourseId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e");
    const inReview = Fragment.create({
      id: fragmentId,
      courseId,
      creatorId: "creator-1",
      title: "Reject Test",
      problemContent: "P",
      theoryContent: "T",
      artifactContent: "A",
      status: FragmentStatus.InReview,
    });

    const fragmentRepo = createInMemoryFragmentRepository(inReview);
    const reviewRecord = createStubReviewRecord();

    const service = new FragmentReviewService({
      fragmentRepository: fragmentRepo,
      artifactPublisher: createStubArtifactPublisher("unused"),
      reviewerRole: createStubReviewerRole(new Set([REVIEWER_ID])),
      reviewRecord,
    });

    await service.reject(fragmentId, "Needs more content", REVIEWER_ID);

    const draft = await fragmentRepo.findById(fragmentId);
    expect(draft).not.toBeNull();
    expect(draft!.status).toBe(FragmentStatus.Draft);
    expect(reviewRecord.recorded).toHaveLength(1);
    expect(reviewRecord.recorded[0].action).toBe("rejected");
  });
});
