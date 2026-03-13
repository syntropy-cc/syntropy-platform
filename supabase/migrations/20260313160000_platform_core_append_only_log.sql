-- COMP-039.3: Append-only log table for event audit (Layer 2 immutability).
-- No UPDATE/DELETE permissions; INSERT and SELECT only.

CREATE SCHEMA IF NOT EXISTS platform_core;

CREATE TABLE platform_core.append_only_log (
  id BIGSERIAL PRIMARY KEY,
  actor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  schema_version TEXT NOT NULL,
  correlation_id TEXT,
  causation_id TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent UPDATE and DELETE: revoke from default roles and allow only INSERT + SELECT.
REVOKE UPDATE ON platform_core.append_only_log FROM PUBLIC;
REVOKE DELETE ON platform_core.append_only_log FROM PUBLIC;

COMMENT ON TABLE platform_core.append_only_log IS 'Append-only event log; no updates or deletes (COMP-039.3).';
