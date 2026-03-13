/**
 * Soft-delete pattern for audit and data retention (COMP-039.1).
 *
 * Entities that extend or implement SoftDeletable are never hard-deleted;
 * softDelete() sets deleted_at. Repositories must filter with
 * `WHERE deleted_at IS NULL` by default and support a withDeleted option for admin queries.
 *
 * Architecture: COMP-039.1, cross-cutting/data-integrity/ARCHITECTURE.md
 */

/**
 * Interface for entities that support soft delete.
 * Use with SoftDeletableMixin or implement on your entity.
 */
export interface SoftDeletable {
  readonly deleted_at: Date | null;

  /**
   * Marks the entity as deleted by setting deleted_at.
   * Idempotent: calling again leaves deleted_at unchanged.
   */
  softDelete(): void;
}

/**
 * Options for repository queries that support including soft-deleted records.
 */
export interface WithDeletedOption {
  /**
   * When true, include entities where deleted_at IS NOT NULL.
   * Default is false (exclude soft-deleted).
   */
  withDeleted?: boolean;
}

/**
 * Base class that adds soft-delete behavior.
 *
 * Extend this or use the fields/methods when building entities that must
 * support soft delete for audit and data retention (CON-005).
 *
 * Repository contract: implementations that persist SoftDeletable entities
 * must filter out deleted records by default (deleted_at IS NULL) and
 * support a withDeleted option for admin/audit queries.
 */
export abstract class SoftDeletableMixin implements SoftDeletable {
  deleted_at: Date | null = null;

  softDelete(): void {
    if (this.deleted_at === null) {
      this.deleted_at = new Date();
    }
  }

  /**
   * Returns true if this entity has been soft-deleted.
   */
  get isDeleted(): boolean {
    return this.deleted_at !== null;
  }
}
