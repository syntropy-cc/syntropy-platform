-- COMP-023.5: Labs Article Editor — scientific_articles, article_versions.
-- Schema: labs (existing).

CREATE TABLE labs.scientific_articles (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  subject_area_id UUID NOT NULL,
  author_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'under_review', 'published')),
  current_content TEXT NOT NULL DEFAULT '',
  published_artifact_id TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_labs_scientific_articles_author_id ON labs.scientific_articles (author_id);
CREATE INDEX idx_labs_scientific_articles_status ON labs.scientific_articles (status);

CREATE TABLE labs.article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES labs.scientific_articles(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  myst_content TEXT NOT NULL,
  content_hash TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (article_id, version_number)
);

CREATE INDEX idx_labs_article_versions_article_id ON labs.article_versions (article_id);

COMMENT ON TABLE labs.scientific_articles IS 'Labs Article Editor — scientific articles (COMP-023.5).';
COMMENT ON TABLE labs.article_versions IS 'Labs Article Editor — immutable version snapshots (COMP-023.5).';
