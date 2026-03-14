-- COMP-008.7: DIP Value Distribution & Treasury — treasury_accounts, avu_transactions, treasury_transfers.

CREATE SCHEMA IF NOT EXISTS dip;

CREATE TABLE dip.treasury_accounts (
  account_id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL UNIQUE,
  avu_balance BIGINT NOT NULL DEFAULT 0 CHECK (avu_balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_treasury_accounts_institution_id ON dip.treasury_accounts (institution_id);

CREATE TABLE dip.avu_transactions (
  transaction_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES dip.treasury_accounts(account_id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  source_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_avu_transactions_account_id ON dip.avu_transactions (account_id);

CREATE TABLE dip.treasury_transfers (
  transfer_id TEXT PRIMARY KEY,
  from_account_id TEXT NOT NULL REFERENCES dip.treasury_accounts(account_id) ON DELETE CASCADE,
  to_account_id TEXT NOT NULL REFERENCES dip.treasury_accounts(account_id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT treasury_transfers_different_accounts CHECK (from_account_id <> to_account_id)
);

CREATE INDEX idx_treasury_transfers_from_account ON dip.treasury_transfers (from_account_id);
CREATE INDEX idx_treasury_transfers_to_account ON dip.treasury_transfers (to_account_id);

COMMENT ON TABLE dip.treasury_accounts IS 'DIP Value Distribution & Treasury — AVU balance per institution (COMP-008.7).';
COMMENT ON TABLE dip.avu_transactions IS 'DIP Value Distribution & Treasury — append-only AVU transaction journal (COMP-008.7).';
COMMENT ON TABLE dip.treasury_transfers IS 'DIP Value Distribution & Treasury — transfer records between accounts (COMP-008.7).';
