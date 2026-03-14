/**
 * LearnerProgressRecord — tracks completion per (userId, entityId) (COMP-016.3).
 * Architecture: fragment-artifact-engine.md.
 */

export type ProgressEntityType = "fragment" | "course" | "track";

export type LearnerProgressStatus = "not_started" | "in_progress" | "completed";

export interface LearnerProgressRecordParams {
  userId: string;
  entityId: string;
  entityType: ProgressEntityType;
  status?: LearnerProgressStatus;
  startedAt?: Date;
  completedAt?: Date | null;
  score?: number | null;
}

/**
 * Tracks a learner's progress for a single entity (fragment, course, or track).
 * Completion and event emission are orchestrated by ProgressTrackingService.
 */
export class LearnerProgressRecord {
  readonly userId: string;
  readonly entityId: string;
  readonly entityType: ProgressEntityType;
  private _status: LearnerProgressStatus;
  private _startedAt: Date;
  private _completedAt: Date | null;
  private _score: number | null;

  private constructor(params: LearnerProgressRecordParams) {
    this.userId = params.userId;
    this.entityId = params.entityId;
    this.entityType = params.entityType;
    this._status = params.status ?? "not_started";
    this._startedAt = params.startedAt ?? new Date(0);
    this._completedAt = params.completedAt ?? null;
    this._score = params.score ?? null;
  }

  static create(params: LearnerProgressRecordParams): LearnerProgressRecord {
    return new LearnerProgressRecord(params);
  }

  get status(): LearnerProgressStatus {
    return this._status;
  }

  get startedAt(): Date {
    return this._startedAt;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  get score(): number | null {
    return this._score;
  }

  get isCompleted(): boolean {
    return this._status === "completed";
  }

  markStarted(): void {
    if (this._status === "not_started") {
      this._status = "in_progress";
      this._startedAt = new Date();
    }
  }

  /**
   * Mark as completed with optional score. Idempotent if already completed.
   */
  complete(score?: number): void {
    this._status = "completed";
    this._completedAt = this._completedAt ?? new Date();
    if (score !== undefined && score !== null) {
      this._score = score;
    }
  }
}
