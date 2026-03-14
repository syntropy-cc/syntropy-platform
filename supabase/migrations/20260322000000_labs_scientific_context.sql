-- COMP-022.4: Labs Scientific Context — subject_areas, research_methodologies, hypothesis_records.
-- Schema: labs (one schema per domain).

CREATE SCHEMA IF NOT EXISTS labs;

CREATE TABLE labs.subject_areas (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES labs.subject_areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  depth_level SMALLINT NOT NULL CHECK (depth_level >= 1 AND depth_level <= 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_labs_subject_areas_parent_id ON labs.subject_areas (parent_id);
CREATE INDEX idx_labs_subject_areas_depth_level ON labs.subject_areas (depth_level);

CREATE TABLE labs.research_methodologies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quantitative', 'qualitative', 'mixed')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE labs.hypothesis_records (
  id UUID PRIMARY KEY,
  project_id TEXT NOT NULL,
  statement TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('proposed', 'confirmed', 'refuted')),
  experiment_id UUID,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_labs_hypothesis_records_project_id ON labs.hypothesis_records (project_id);
CREATE INDEX idx_labs_hypothesis_records_status ON labs.hypothesis_records (status);

COMMENT ON TABLE labs.subject_areas IS 'Labs Scientific Context — hierarchical taxonomy (COMP-022.4).';
COMMENT ON TABLE labs.research_methodologies IS 'Labs Scientific Context — methodology catalog (COMP-022.4).';
COMMENT ON TABLE labs.hypothesis_records IS 'Labs Scientific Context — hypothesis records per project (COMP-022.4).';
