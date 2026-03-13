/**
 * Audit columns mixin for temporal record keeping (COMP-039.4).
 *
 * Entities use created_at, updated_at, and optionally created_by_actor_id.
 * Repositories must call touchUpdatedAt() before persisting an update so that
 * updated_at reflects the last write. Database migrations should add these
 * columns and an updated_at trigger; use getAuditColumnsMigrationSnippet().
 *
 * Architecture: COMP-039.4, cross-cutting/data-integrity/ARCHITECTURE.md
 */

/**
 * Interface for entities that carry audit columns.
 */
export interface AuditColumns {
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly created_by_actor_id: string | null;

  /**
   * Call before persisting an update so updated_at is set to now.
   * Repositories should invoke this on the entity before save/update.
   */
  touchUpdatedAt(): void;
}

/**
 * Base class that adds audit column behavior.
 * Extend this or mix in the fields/method when building entities that need
 * created_at, updated_at, and optional created_by_actor_id.
 */
export abstract class AuditColumnsMixin implements AuditColumns {
  created_at: Date;
  updated_at: Date;
  created_by_actor_id: string | null;

  constructor(params?: {
    created_at?: Date;
    updated_at?: Date;
    created_by_actor_id?: string | null;
  }) {
    const now = new Date();
    this.created_at = params?.created_at ?? now;
    this.updated_at = params?.updated_at ?? now;
    this.created_by_actor_id = params?.created_by_actor_id ?? null;
  }

  /**
   * Updates updated_at to now. Call this before persisting an update.
   */
  touchUpdatedAt(): void {
    this.updated_at = new Date();
  }
}

/**
 * Returns a SQL snippet that defines standard audit columns and an
 * updated_at trigger. Use in migrations for tables that need audit columns.
 *
 * Table name placeholder: replace {table_name} with the actual table name,
 * or use the returned columns and trigger DDL separately.
 */
export function getAuditColumnsMigrationSnippet(tableName: string): string {
  return `
-- Audit columns for ${tableName}
ALTER TABLE ${tableName}
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_by_actor_id UUID;

-- Trigger to auto-update updated_at on row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_${tableName.replace(/[^a-z0-9_]/gi, "_")}_updated_at ON ${tableName};
CREATE TRIGGER set_${tableName.replace(/[^a-z0-9_]/gi, "_")}_updated_at
  BEFORE UPDATE ON ${tableName}
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
`.trim();
}
