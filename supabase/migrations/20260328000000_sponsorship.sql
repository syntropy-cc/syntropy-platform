-- COMP-027.4: Sponsorship — sponsorships, impact_metrics.
-- Schema: sponsorship.

CREATE SCHEMA IF NOT EXISTS sponsorship;

CREATE TABLE sponsorship.sponsorships (
  id TEXT PRIMARY KEY,
  sponsor_id TEXT NOT NULL,
  sponsored_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recurring', 'one_time')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'paused', 'cancelled')),
  stripe_subscription_id TEXT,
  started_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sponsorship_sponsorships_sponsor_id ON sponsorship.sponsorships (sponsor_id);
CREATE INDEX idx_sponsorship_sponsorships_sponsored_id ON sponsorship.sponsorships (sponsored_id);
CREATE INDEX idx_sponsorship_sponsorships_status ON sponsorship.sponsorships (status);

CREATE TABLE sponsorship.impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsorship_id TEXT NOT NULL,
  period DATE NOT NULL,
  artifact_views INTEGER NOT NULL DEFAULT 0 CHECK (artifact_views >= 0),
  portfolio_growth INTEGER NOT NULL DEFAULT 0 CHECK (portfolio_growth >= 0),
  contribution_activity INTEGER NOT NULL DEFAULT 0 CHECK (contribution_activity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sponsorship_impact_metrics_sponsorship_id ON sponsorship.impact_metrics (sponsorship_id);
CREATE INDEX idx_sponsorship_impact_metrics_period ON sponsorship.impact_metrics (sponsorship_id, period);

COMMENT ON TABLE sponsorship.sponsorships IS 'Sponsorship aggregate — sponsor to sponsored (COMP-027.4).';
COMMENT ON TABLE sponsorship.impact_metrics IS 'Impact metric snapshots per sponsorship and period (COMP-027.4).';
