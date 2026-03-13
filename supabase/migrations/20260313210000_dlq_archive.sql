-- COMP-034.3: DLQ archive table for messages that failed after max retries.

CREATE TABLE IF NOT EXISTS platform_core.dlq_archive (
  id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  message_key BYTEA,
  payload BYTEA NOT NULL,
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dlq_archive_topic ON platform_core.dlq_archive (topic);
CREATE INDEX IF NOT EXISTS idx_dlq_archive_created_at ON platform_core.dlq_archive (created_at);

COMMENT ON TABLE platform_core.dlq_archive IS 'Archived DLQ messages after max retries (COMP-034.3).';
