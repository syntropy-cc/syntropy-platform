-- COMP-010.7: Portfolio Aggregation — portfolios, achievements, skill_records.

CREATE TABLE IF NOT EXISTS platform_core.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  reputation_score NUMERIC(5,4) NOT NULL DEFAULT 0 CHECK (reputation_score >= 0 AND reputation_score <= 1),
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portfolios_user_id ON platform_core.portfolios (user_id);

CREATE TABLE IF NOT EXISTS platform_core.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES platform_core.portfolios(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(portfolio_id, achievement_type)
);

CREATE INDEX idx_achievements_portfolio_id ON platform_core.achievements (portfolio_id);

CREATE TABLE IF NOT EXISTS platform_core.skill_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES platform_core.portfolios(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  evidence_event_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE(portfolio_id, skill_name)
);

CREATE INDEX idx_skill_records_portfolio_id ON platform_core.skill_records (portfolio_id);

COMMENT ON TABLE platform_core.portfolios IS 'Portfolio aggregation — user XP, reputation, version for optimistic locking (COMP-010.7).';
COMMENT ON TABLE platform_core.achievements IS 'Unlocked achievements per portfolio (COMP-010.7).';
COMMENT ON TABLE platform_core.skill_records IS 'Computed skill level per portfolio (COMP-010.7).';
