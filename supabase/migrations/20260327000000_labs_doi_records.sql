-- COMP-026.3: Labs DOI & External Publication — doi_records table.
-- Schema: labs (existing).

CREATE TABLE labs.doi_records (
  id TEXT PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES labs.scientific_articles(id) ON DELETE CASCADE,
  doi TEXT NOT NULL,
  datacite_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'registered', 'findable')),
  registered_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (article_id)
);

CREATE INDEX idx_labs_doi_records_article_id ON labs.doi_records (article_id);
CREATE UNIQUE INDEX idx_labs_doi_records_doi ON labs.doi_records (doi);

COMMENT ON TABLE labs.doi_records IS 'Labs DOI — minted DOI records per article (COMP-026.3).';
