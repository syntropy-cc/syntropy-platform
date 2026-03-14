-- COMP-021.4: Hub Public Square — discovery_documents read model.
-- Schema: hub.

CREATE TABLE hub.discovery_documents (
  institution_id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  prominence_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  project_count INTEGER NOT NULL DEFAULT 0,
  contributor_count INTEGER NOT NULL DEFAULT 0,
  recent_artifacts JSONB NOT NULL DEFAULT '[]',
  indexed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hub_discovery_documents_prominence ON hub.discovery_documents (prominence_score DESC);

COMMENT ON TABLE hub.discovery_documents IS 'Hub Public Square — DiscoveryDocument read model for prominence ranking (COMP-021.4).';
