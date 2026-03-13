-- COMP-003.4: DIP Artifact Registry — artifacts table.
-- Stores Artifact aggregate: id, author, content_hash, status, timestamps, nostr_event_id.

CREATE SCHEMA IF NOT EXISTS dip;

CREATE TABLE dip.artifacts (
  id UUID PRIMARY KEY,
  author_actor_id TEXT NOT NULL,
  content_hash VARCHAR(64),
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  nostr_event_id VARCHAR(64)
);

CREATE INDEX idx_artifacts_author_actor_id ON dip.artifacts (author_actor_id);
CREATE INDEX idx_artifacts_status ON dip.artifacts (status);

COMMENT ON TABLE dip.artifacts IS 'DIP Artifact Registry — artifact aggregates (COMP-003.4).';
