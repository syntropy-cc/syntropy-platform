/**
 * WorkspaceSnapshot entity — file system state for IDE sessions (COMP-030.4).
 * Architecture: IDE domain, PAT-004
 */

/** Single file entry in a workspace snapshot. */
export interface WorkspaceSnapshotFile {
  readonly path: string;
  readonly content: string;
}

/** Data shape for reconstituting a snapshot from persistence. */
export interface WorkspaceSnapshotData {
  readonly snapshotId: string;
  readonly sessionId: string;
  readonly version: number;
  readonly files: readonly WorkspaceSnapshotFile[];
  readonly createdAt: Date;
}

/**
 * WorkspaceSnapshot entity. Stores file system state for an IDE session.
 * Immutable; create via create(), restore via fromPersistence().
 */
export class WorkspaceSnapshot {
  readonly snapshotId: string;
  readonly sessionId: string;
  readonly version: number;
  readonly files: readonly WorkspaceSnapshotFile[];
  readonly createdAt: Date;

  private constructor(params: WorkspaceSnapshotData) {
    this.snapshotId = params.snapshotId;
    this.sessionId = params.sessionId;
    this.version = params.version;
    this.files = params.files;
    this.createdAt = params.createdAt;
  }

  /**
   * Creates a new snapshot (save path). Call when persisting current workspace state.
   *
   * @param sessionId - IDE session this snapshot belongs to
   * @param files - File list (path + content)
   * @param options - Optional version (default 1) and snapshotId (generated if omitted)
   */
  static create(
    sessionId: string,
    files: readonly WorkspaceSnapshotFile[],
    options?: { version?: number; snapshotId?: string }
  ): WorkspaceSnapshot {
    const trimmed = sessionId?.trim();
    if (!trimmed) {
      throw new Error("WorkspaceSnapshot.sessionId cannot be empty");
    }
    const version = options?.version ?? 1;
    if (version < 1 || !Number.isInteger(version)) {
      throw new Error("WorkspaceSnapshot.version must be a positive integer");
    }
    const snapshotId =
      options?.snapshotId ?? `ws-${trimmed}-${Date.now()}-v${version}`;
    return new WorkspaceSnapshot({
      snapshotId,
      sessionId: trimmed,
      version,
      files: Array.isArray(files) ? [...files] : [],
      createdAt: new Date(),
    });
  }

  /**
   * Reconstitutes a snapshot from persistence (restore path).
   */
  static fromPersistence(data: WorkspaceSnapshotData): WorkspaceSnapshot {
    if (!data.snapshotId?.trim()) {
      throw new Error("WorkspaceSnapshotData.snapshotId cannot be empty");
    }
    if (!data.sessionId?.trim()) {
      throw new Error("WorkspaceSnapshotData.sessionId cannot be empty");
    }
    if (
      typeof data.version !== "number" ||
      data.version < 1 ||
      !Number.isInteger(data.version)
    ) {
      throw new Error(
        "WorkspaceSnapshotData.version must be a positive integer"
      );
    }
    const createdAt =
      data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
    return new WorkspaceSnapshot({
      snapshotId: data.snapshotId.trim(),
      sessionId: data.sessionId.trim(),
      version: data.version,
      files: Array.isArray(data.files) ? [...data.files] : [],
      createdAt,
    });
  }

  /** Returns a copy of the file list. */
  getFiles(): readonly WorkspaceSnapshotFile[] {
    return [...this.files];
  }
}
