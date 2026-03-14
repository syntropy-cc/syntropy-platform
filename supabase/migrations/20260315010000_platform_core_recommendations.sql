-- COMP-011.6: Search & Recommendation — recommendation_sets and recommendations tables.

CREATE TABLE IF NOT EXISTS platform_core.recommendation_sets (
  user_id TEXT NOT NULL PRIMARY KEY,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_core.recommendations (
  id TEXT NOT NULL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES platform_core.recommendation_sets (user_id) ON DELETE CASCADE,
  opportunity_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  relevance_score DOUBLE PRECISION NOT NULL,
  reasoning TEXT,
  was_clicked BOOLEAN NOT NULL DEFAULT false,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON platform_core.recommendations (user_id);

COMMENT ON TABLE platform_core.recommendation_sets IS 'Per-user recommendation set (COMP-011.6). Refreshed on portfolio.updated.';
COMMENT ON TABLE platform_core.recommendations IS 'Individual recommendations within a set (COMP-011.6).';
