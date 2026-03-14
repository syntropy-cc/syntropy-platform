/**
 * ProjectManifest — immutable value object for project manifest data.
 * Architecture: COMP-006, DIP Project Manifest & DAG
 */

/** JSON-serializable shape for ProjectManifest. */
export interface ProjectManifestJSON {
  title: string;
  description: string;
  goals: string[];
  dependencies: string[];
}

/**
 * Immutable value object: title, description, goals, dependencies.
 * equals() and toJSON() for comparison and serialization.
 */
export class ProjectManifest {
  readonly title: string;
  readonly description: string;
  readonly goals: readonly string[];
  readonly dependencies: readonly string[];

  constructor(params: {
    title: string;
    description?: string;
    goals?: readonly string[];
    dependencies?: readonly string[];
  }) {
    this.title = params.title;
    this.description = params.description ?? "";
    this.goals = params.goals ?? [];
    this.dependencies = params.dependencies ?? [];
  }

  /**
   * Value equality: same title, description, goals, dependencies.
   */
  equals(other: ProjectManifest): boolean {
    if (this === other) return true;
    if (
      this.title !== other.title ||
      this.description !== other.description
    ) {
      return false;
    }
    if (this.goals.length !== other.goals.length) return false;
    if (this.dependencies.length !== other.dependencies.length) return false;
    for (let i = 0; i < this.goals.length; i++) {
      if (this.goals[i] !== other.goals[i]) return false;
    }
    for (let i = 0; i < this.dependencies.length; i++) {
      if (this.dependencies[i] !== other.dependencies[i]) return false;
    }
    return true;
  }

  /**
   * Serializes to a plain object for JSON.
   */
  toJSON(): ProjectManifestJSON {
    return {
      title: this.title,
      description: this.description,
      goals: [...this.goals],
      dependencies: [...this.dependencies],
    };
  }
}
