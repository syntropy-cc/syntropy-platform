-- COMP-005.6: DIP IACP Engine — iacp_records and iacp_parties tables.

CREATE TABLE IF NOT EXISTS dip.iacp_records (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  institution_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_iacp_records_institution_id ON dip.iacp_records (institution_id);
CREATE INDEX idx_iacp_records_status ON dip.iacp_records (status);

CREATE TABLE IF NOT EXISTS dip.iacp_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iacp_id UUID NOT NULL REFERENCES dip.iacp_records(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL,
  role TEXT NOT NULL,
  signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_iacp_parties_iacp_id ON dip.iacp_parties (iacp_id);

COMMENT ON TABLE dip.iacp_records IS 'DIP IACP Engine — IACP record aggregates (COMP-005.6).';
COMMENT ON TABLE dip.iacp_parties IS 'DIP IACP Engine — parties and signatures per record (COMP-005.6).';
