-- COMP-004.5: DIP Smart Contract Engine — governance_contracts table.
-- Stores GovernanceContract aggregate: id, institution_id, dsl (JSONB).

CREATE SCHEMA IF NOT EXISTS dip;

CREATE TABLE dip.governance_contracts (
  id UUID PRIMARY KEY,
  institution_id TEXT NOT NULL,
  dsl JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_governance_contracts_institution_id ON dip.governance_contracts (institution_id);

COMMENT ON TABLE dip.governance_contracts IS 'DIP Smart Contract Engine — governance contract aggregates (COMP-004.5).';
