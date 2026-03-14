/**
 * FragmentReviewService — submit for review, approve, reject (COMP-016.6).
 * Architecture: fragment-artifact-engine.md state machine.
 */

import type { FragmentId } from "@syntropy/types";

import { NotReviewerError } from "../../errors.js";
import type { ArtifactPublisherPort } from "../ports/artifact-publisher-port.js";
import type { FragmentRepositoryPort } from "../ports/fragment-repository-port.js";
import type { FragmentReviewRecordPort } from "../ports/fragment-review-record-port.js";
import type { ReviewerRolePort } from "../ports/reviewer-role-port.js";

export interface FragmentReviewServiceParams {
  fragmentRepository: FragmentRepositoryPort;
  artifactPublisher: ArtifactPublisherPort;
  reviewerRole: ReviewerRolePort;
  reviewRecord: FragmentReviewRecordPort;
}

/**
 * Orchestrates fragment review workflow: submit (Draft → InReview),
 * approve (InReview → Published + DIP), reject (InReview → Draft + store reason).
 */
export class FragmentReviewService {
  private readonly _fragments: FragmentRepositoryPort;
  private readonly _artifactPublisher: ArtifactPublisherPort;
  private readonly _reviewerRole: ReviewerRolePort;
  private readonly _reviewRecord: FragmentReviewRecordPort;

  constructor(params: FragmentReviewServiceParams) {
    this._fragments = params.fragmentRepository;
    this._artifactPublisher = params.artifactPublisher;
    this._reviewerRole = params.reviewerRole;
    this._reviewRecord = params.reviewRecord;
  }

  /**
   * Submit fragment for review (Draft → InReview). Caller is creator; no role check.
   */
  async submit(fragmentId: FragmentId): Promise<void> {
    const fragment = await this._fragments.findById(fragmentId);
    if (fragment === null) {
      throw new Error(`Fragment not found: ${fragmentId}`);
    }
    fragment.submitForReview();
    await this._fragments.save(fragment);
  }

  /**
   * Approve fragment (InReview → Published). Publishes to DIP and sets published_artifact_id.
   * Throws NotReviewerError if reviewerId does not have reviewer role.
   */
  async approve(fragmentId: FragmentId, reviewerId: string): Promise<void> {
    const isReviewer = await this._reviewerRole.hasReviewerRole(reviewerId);
    if (!isReviewer) {
      throw new NotReviewerError(reviewerId);
    }
    const fragment = await this._fragments.findById(fragmentId);
    if (fragment === null) {
      throw new Error(`Fragment not found: ${fragmentId}`);
    }
    fragment.publish();
    const artifactId = await this._artifactPublisher.publish(fragment);
    fragment.setPublishedArtifactId(artifactId);
    await this._fragments.save(fragment);
    await this._reviewRecord.recordReview(fragmentId, reviewerId, "approved");
  }

  /**
   * Reject fragment (InReview → Draft) and store reason. Throws NotReviewerError if not reviewer.
   */
  async reject(
    fragmentId: FragmentId,
    reason: string,
    reviewerId: string
  ): Promise<void> {
    const isReviewer = await this._reviewerRole.hasReviewerRole(reviewerId);
    if (!isReviewer) {
      throw new NotReviewerError(reviewerId);
    }
    const fragment = await this._fragments.findById(fragmentId);
    if (fragment === null) {
      throw new Error(`Fragment not found: ${fragmentId}`);
    }
    fragment.requestRevisions();
    await this._fragments.save(fragment);
    await this._reviewRecord.recordReview(
      fragmentId,
      reviewerId,
      "rejected",
      reason
    );
  }
}
