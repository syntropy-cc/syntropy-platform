/**
 * Unit tests for FragmentReviewService (COMP-016.6).
 */

import { createCourseId, createFragmentId } from "@syntropy/types";
import { describe, it, expect, vi } from "vitest";
import { Fragment } from "../../../src/domain/fragment-artifact/fragment.js";
import { FragmentStatus } from "../../../src/domain/fragment-artifact/fragment-status.js";
import { FragmentReviewService } from "../../../src/domain/fragment-artifact/services/fragment-review-service.js";
import { NotReviewerError } from "../../../src/domain/errors.js";
import type { ArtifactPublisherPort } from "../../../src/domain/fragment-artifact/ports/artifact-publisher-port.js";
import type { FragmentRepositoryPort } from "../../../src/domain/fragment-artifact/ports/fragment-repository-port.js";
import type { FragmentReviewRecordPort } from "../../../src/domain/fragment-artifact/ports/fragment-review-record-port.js";
import type { ReviewerRolePort } from "../../../src/domain/fragment-artifact/ports/reviewer-role-port.js";

function createInReviewFragment() {
  const fragment = Fragment.create({
    id: createFragmentId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"),
    courseId: createCourseId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e"),
    creatorId: "creator-1",
    title: "Test Fragment",
    problemContent: "Problem",
    theoryContent: "Theory",
    artifactContent: "Artifact",
    status: FragmentStatus.InReview,
  });
  return fragment;
}

function createDraftFragment() {
  const fragment = Fragment.create({
    id: createFragmentId("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"),
    courseId: createCourseId("b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e"),
    creatorId: "creator-1",
    title: "Test Fragment",
    problemContent: "Problem",
    theoryContent: "Theory",
    artifactContent: "Artifact",
    status: FragmentStatus.Draft,
  });
  return fragment;
}

describe("FragmentReviewService", () => {
  const fragmentId = createFragmentId(
    "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
  );

  it("submit loads draft fragment, transitions to InReview and saves", async () => {
    const draft = createDraftFragment();
    const save = vi.fn().mockResolvedValue(undefined);
    const fragmentRepo: FragmentRepositoryPort = {
      findById: vi.fn().mockResolvedValue(draft),
      save,
    };
    const service = new FragmentReviewService({
      fragmentRepository: fragmentRepo,
      artifactPublisher: { publish: vi.fn() },
      reviewerRole: { hasReviewerRole: vi.fn() },
      reviewRecord: { recordReview: vi.fn().mockResolvedValue(undefined) },
    });

    await service.submit(fragmentId);

    expect(draft.status).toBe(FragmentStatus.InReview);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(draft);
  });

  it("submit throws when fragment not found", async () => {
    const fragmentRepo: FragmentRepositoryPort = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    };
    const service = new FragmentReviewService({
      fragmentRepository: fragmentRepo,
      artifactPublisher: { publish: vi.fn() },
      reviewerRole: { hasReviewerRole: vi.fn() },
      reviewRecord: { recordReview: vi.fn() },
    });

    await expect(service.submit(fragmentId)).rejects.toThrow(
      /Fragment not found/
    );
  });

  it("approve when reviewer publishes fragment and records review", async () => {
    const inReview = createInReviewFragment();
    const save = vi.fn().mockResolvedValue(undefined);
    const publish = vi.fn().mockResolvedValue("dip-artifact-123");
    const recordReview = vi.fn().mockResolvedValue(undefined);
    const service = new FragmentReviewService({
      fragmentRepository: {
        findById: vi.fn().mockResolvedValue(inReview),
        save,
      },
      artifactPublisher: { publish },
      reviewerRole: { hasReviewerRole: vi.fn().mockResolvedValue(true) },
      reviewRecord: { recordReview },
    });

    await service.approve(fragmentId, "reviewer-1");

    expect(inReview.status).toBe(FragmentStatus.Published);
    expect(inReview.publishedArtifactId).toBe("dip-artifact-123");
    expect(save).toHaveBeenCalledWith(inReview);
    expect(publish).toHaveBeenCalledWith(inReview);
    expect(recordReview).toHaveBeenCalledWith(
      fragmentId,
      "reviewer-1",
      "approved"
    );
  });

  it("approve throws NotReviewerError when user does not have reviewer role", async () => {
    const service = new FragmentReviewService({
      fragmentRepository: {
        findById: vi.fn().mockResolvedValue(createInReviewFragment()),
        save: vi.fn(),
      },
      artifactPublisher: { publish: vi.fn() },
      reviewerRole: { hasReviewerRole: vi.fn().mockResolvedValue(false) },
      reviewRecord: { recordReview: vi.fn() },
    });

    await expect(service.approve(fragmentId, "user-1")).rejects.toThrow(
      NotReviewerError
    );
    await expect(service.approve(fragmentId, "user-1")).rejects.toThrow(
      /does not have reviewer role/
    );
  });

  it("reject when reviewer moves fragment to Draft and records reason", async () => {
    const inReview = createInReviewFragment();
    const save = vi.fn().mockResolvedValue(undefined);
    const recordReview = vi.fn().mockResolvedValue(undefined);
    const service = new FragmentReviewService({
      fragmentRepository: {
        findById: vi.fn().mockResolvedValue(inReview),
        save,
      },
      artifactPublisher: { publish: vi.fn() },
      reviewerRole: { hasReviewerRole: vi.fn().mockResolvedValue(true) },
      reviewRecord: { recordReview },
    });

    await service.reject(fragmentId, "Needs more detail", "reviewer-1");

    expect(inReview.status).toBe(FragmentStatus.Draft);
    expect(save).toHaveBeenCalledWith(inReview);
    expect(recordReview).toHaveBeenCalledWith(
      fragmentId,
      "reviewer-1",
      "rejected",
      "Needs more detail"
    );
  });

  it("reject throws NotReviewerError when user does not have reviewer role", async () => {
    const service = new FragmentReviewService({
      fragmentRepository: {
        findById: vi.fn().mockResolvedValue(createInReviewFragment()),
        save: vi.fn(),
      },
      artifactPublisher: { publish: vi.fn() },
      reviewerRole: { hasReviewerRole: vi.fn().mockResolvedValue(false) },
      reviewRecord: { recordReview: vi.fn() },
    });

    await expect(
      service.reject(fragmentId, "reason", "user-1")
    ).rejects.toThrow(NotReviewerError);
  });

  it("approve when fragment not found throws", async () => {
    const service = new FragmentReviewService({
      fragmentRepository: {
        findById: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      },
      artifactPublisher: { publish: vi.fn() },
      reviewerRole: { hasReviewerRole: vi.fn().mockResolvedValue(true) },
      reviewRecord: { recordReview: vi.fn() },
    });

    await expect(service.approve(fragmentId, "reviewer-1")).rejects.toThrow(
      /Fragment not found/
    );
  });
});
