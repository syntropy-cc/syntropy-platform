-- COMP-009.3: Event log table for Event Bus audit (append-only).
-- Indexes for correlation_id and (actor_id, recorded_at); trigger prevents UPDATE/DELETE.

CREATE SCHEMA IF NOT EXISTS platform_core;

CREATE TABLE platform_core.event_log (
  id BIGSERIAL PRIMARY KEY,
  sequence_number BIGINT NOT NULL GENERATED ALWAYS AS (id) STORED,
  actor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  schema_version TEXT NOT NULL,
  correlation_id TEXT,
  causation_id TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_log_actor_recorded ON platform_core.event_log (actor_id, recorded_at);
CREATE INDEX idx_event_log_correlation_id ON platform_core.event_log (correlation_id);

REVOKE UPDATE ON platform_core.event_log FROM PUBLIC;
REVOKE DELETE ON platform_core.event_log FROM PUBLIC;

-- Trigger to prevent UPDATE and DELETE at the database level.
CREATE OR REPLACE FUNCTION platform_core.reject_event_log_mutations()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Updates to platform_core.event_log are not allowed (append-only)';
  ELSIF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Deletes from platform_core.event_log are not allowed (append-only)';
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_reject_event_log_update
  BEFORE UPDATE ON platform_core.event_log
  FOR EACH ROW EXECUTE FUNCTION platform_core.reject_event_log_mutations();

CREATE TRIGGER trigger_reject_event_log_delete
  BEFORE DELETE ON platform_core.event_log
  FOR EACH ROW EXECUTE FUNCTION platform_core.reject_event_log_mutations();

COMMENT ON TABLE platform_core.event_log IS 'Append-only event log for Event Bus audit (COMP-009.3). No updates or deletes.';
