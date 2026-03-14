-- COMP-007.6: DIP Institutional Governance — digital_institutions, proposals, votes, legitimacy_chain_entries.
-- Schema per institutional-governance subdomain ERD.

CREATE SCHEMA IF NOT EXISTS dip;

-- DigitalInstitution aggregate
CREATE TABLE dip.digital_institutions (
  institution_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  institution_type TEXT NOT NULL,
  governance_contract_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('forming', 'active', 'dissolved')),
  legitimacy_chain_head_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_digital_institutions_status ON dip.digital_institutions (status);

-- Proposal aggregate
CREATE TABLE dip.proposals (
  proposal_id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES dip.digital_institutions(institution_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'executed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposals_institution_id ON dip.proposals (institution_id);

-- Votes (one row per actor per proposal)
CREATE TABLE dip.votes (
  proposal_id TEXT NOT NULL REFERENCES dip.proposals(proposal_id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('for', 'against', 'abstain')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (proposal_id, actor_id)
);

CREATE INDEX idx_votes_proposal_id ON dip.votes (proposal_id);

-- Legitimacy chain entries — append-only, immutable (no update/delete)
CREATE TABLE dip.legitimacy_chain_entries (
  id BIGSERIAL PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES dip.digital_institutions(institution_id) ON DELETE CASCADE,
  proposal_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL,
  executor_id TEXT,
  executor_signature TEXT,
  institution_state_before_hash TEXT,
  institution_state_after_hash TEXT,
  previous_chain_hash TEXT NOT NULL,
  chain_hash TEXT NOT NULL,
  nostr_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_legitimacy_chain_entries_institution_id ON dip.legitimacy_chain_entries (institution_id);
CREATE UNIQUE INDEX idx_legitimacy_chain_entries_order ON dip.legitimacy_chain_entries (institution_id, id);

COMMENT ON TABLE dip.digital_institutions IS 'DIP Institutional Governance — DigitalInstitution aggregates (COMP-007.6).';
COMMENT ON TABLE dip.proposals IS 'DIP Institutional Governance — Proposal aggregates (COMP-007.6).';
COMMENT ON TABLE dip.votes IS 'DIP Institutional Governance — proposal votes (COMP-007.6).';
COMMENT ON TABLE dip.legitimacy_chain_entries IS 'DIP Institutional Governance — append-only legitimacy chain (COMP-007.6).';
