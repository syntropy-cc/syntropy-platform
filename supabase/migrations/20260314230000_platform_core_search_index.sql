-- COMP-011.1: Search & Recommendation — search_index table (FTS via tsvector).
-- GIN index for full-text search; embedding column added in COMP-011.4.

CREATE TABLE IF NOT EXISTS platform_core.search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_id TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  tsvector_content TSVECTOR NOT NULL DEFAULT to_tsvector('english', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_search_index_entity ON platform_core.search_index (entity_type, entity_id);
CREATE INDEX idx_search_index_entity_type ON platform_core.search_index (entity_type);
CREATE INDEX idx_search_index_fts ON platform_core.search_index USING GIN (tsvector_content);

COMMENT ON TABLE platform_core.search_index IS 'Search index for FTS and semantic search (COMP-011.1). Updated by EventIndexingConsumer.';
