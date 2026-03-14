-- COMP-024.4: Labs Experiment Design — experiment_designs, experiment_results.
-- Schema: labs (existing).

CREATE TABLE labs.experiment_designs (
  id UUID PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES labs.scientific_articles(id) ON DELETE CASCADE,
  researcher_id TEXT NOT NULL,
  title TEXT NOT NULL,
  methodology_id UUID NOT NULL REFERENCES labs.research_methodologies(id) ON DELETE RESTRICT,
  hypothesis_record_id UUID REFERENCES labs.hypothesis_records(id) ON DELETE SET NULL,
  protocol JSONB NOT NULL DEFAULT '{}',
  variables JSONB NOT NULL DEFAULT '{}',
  ethical_approval_status TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('designing', 'registered', 'running', 'completed')),
  pre_registered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_labs_experiment_designs_article_id ON labs.experiment_designs (article_id);
CREATE INDEX idx_labs_experiment_designs_status ON labs.experiment_designs (status);

CREATE TABLE labs.experiment_results (
  id UUID PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES labs.experiment_designs(id) ON DELETE CASCADE,
  raw_data_location TEXT NOT NULL,
  statistical_summary JSONB NOT NULL DEFAULT '{}',
  p_value DOUBLE PRECISION,
  collected_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_labs_experiment_results_experiment_id ON labs.experiment_results (experiment_id);

COMMENT ON TABLE labs.experiment_designs IS 'Labs Experiment Design — experiment designs (COMP-024.4).';
COMMENT ON TABLE labs.experiment_results IS 'Labs Experiment Design — experiment results (COMP-024.4).';
