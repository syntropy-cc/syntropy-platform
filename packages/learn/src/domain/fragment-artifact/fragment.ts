/**
 * Fragment aggregate — enforces Problem→Theory→Artifact (IL1) (COMP-016.1).
 * Architecture: fragment-artifact-engine.md.
 */

import type { CourseId, FragmentId } from "@syntropy/types";

import { IL1ViolationError } from "../errors.js";
import type { FragmentSectionType } from "./fragment-section.js";
import { FragmentSection } from "./fragment-section.js";
import { FragmentStatus } from "./fragment-status.js";

export interface FragmentParams {
  id: FragmentId;
  courseId: CourseId;
  creatorId: string;
  title: string;
  status?: FragmentStatus;
  problemContent?: string;
  theoryContent?: string;
  artifactContent?: string;
  publishedArtifactId?: string | null;
}

/**
 * Fragment aggregate. IL1: cannot publish until all three sections are non-empty.
 * IL3: published_artifact_id is immutable once set.
 */
export class Fragment {
  readonly id: FragmentId;
  readonly courseId: CourseId;
  readonly creatorId: string;
  readonly title: string;
  private _status: FragmentStatus;
  private readonly _problem: FragmentSection;
  private readonly _theory: FragmentSection;
  private readonly _artifact: FragmentSection;
  private _publishedArtifactId: string | null;

  private constructor(params: FragmentParams) {
    this.id = params.id;
    this.courseId = params.courseId;
    this.creatorId = params.creatorId;
    this.title = params.title;
    this._status = params.status ?? FragmentStatus.Draft;
    this._problem = FragmentSection.create({
      sectionType: "problem",
      content: params.problemContent ?? "",
    });
    this._theory = FragmentSection.create({
      sectionType: "theory",
      content: params.theoryContent ?? "",
    });
    this._artifact = FragmentSection.create({
      sectionType: "artifact",
      content: params.artifactContent ?? "",
    });
    this._publishedArtifactId = params.publishedArtifactId ?? null;
  }

  static create(params: FragmentParams): Fragment {
    return new Fragment(params);
  }

  get status(): FragmentStatus {
    return this._status;
  }

  get problemSection(): FragmentSection {
    return this._problem;
  }

  get theorySection(): FragmentSection {
    return this._theory;
  }

  get artifactSection(): FragmentSection {
    return this._artifact;
  }

  get publishedArtifactId(): string | null {
    return this._publishedArtifactId;
  }

  get sections(): [FragmentSection, FragmentSection, FragmentSection] {
    return [this._problem, this._theory, this._artifact];
  }

  /** All three sections (problem, theory, artifact) must be non-empty for IL1. */
  private get isIL1Satisfied(): boolean {
    return (
      this._problem.isComplete &&
      this._theory.isComplete &&
      this._artifact.isComplete
    );
  }

  markSectionComplete(sectionType: FragmentSectionType, content: string): void {
    const section = this.getSectionByType(sectionType);
    section.markComplete(content);
  }

  setSectionContent(sectionType: FragmentSectionType, content: string): void {
    const section = this.getSectionByType(sectionType);
    section.setContent(content);
  }

  private getSectionByType(
    sectionType: FragmentSectionType
  ): FragmentSection {
    switch (sectionType) {
      case "problem":
        return this._problem;
      case "theory":
        return this._theory;
      case "artifact":
        return this._artifact;
      default: {
        const _: never = sectionType;
        throw new Error(`Unknown section type: ${sectionType}`);
      }
    }
  }

  submitForReview(): void {
    if (this._status !== FragmentStatus.Draft) {
      throw new Error(
        `Fragment can only be submitted for review from Draft, current status: ${this._status}`
      );
    }
    this._status = FragmentStatus.InReview;
  }

  requestRevisions(): void {
    if (this._status !== FragmentStatus.InReview) {
      throw new Error(
        `Revisions can only be requested when InReview, current status: ${this._status}`
      );
    }
    this._status = FragmentStatus.Draft;
  }

  /**
   * Transition to Published. Validates IL1 (all three sections non-empty).
   * Does not call DIP; use setPublishedArtifactId after bridge publishes.
   */
  publish(): void {
    if (this._status !== FragmentStatus.InReview) {
      throw new Error(
        `Fragment can only be published from InReview, current status: ${this._status}`
      );
    }
    if (!this.isIL1Satisfied) {
      const missing: string[] = [];
      if (!this._problem.isComplete) missing.push("problem");
      if (!this._theory.isComplete) missing.push("theory");
      if (!this._artifact.isComplete) missing.push("artifact");
      throw new IL1ViolationError(
        `Cannot publish Fragment: sections not complete (IL1). Missing or empty: ${missing.join(", ")}`
      );
    }
    this._status = FragmentStatus.Published;
  }

  /**
   * Set the DIP artifact id after publication (IL3: immutable once set).
   */
  setPublishedArtifactId(artifactId: string): void {
    if (this._status !== FragmentStatus.Published) {
      throw new Error(
        `Cannot set published artifact id when status is ${this._status}; fragment must be Published`
      );
    }
    if (this._publishedArtifactId != null) {
      throw new Error(
        `published_artifact_id already set (IL3); cannot change after publication`
      );
    }
    if (!artifactId || artifactId.trim().length === 0) {
      throw new Error("published_artifact_id cannot be empty");
    }
    this._publishedArtifactId = artifactId.trim();
  }
}
