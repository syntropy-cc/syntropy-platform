-- COMP-006.4: DIP Project Manifest & DAG — digital_projects and project_dag_edges.

CREATE TABLE IF NOT EXISTS dip.digital_projects (
  id UUID PRIMARY KEY,
  institution_id UUID NOT NULL,
  manifest_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_digital_projects_institution_id ON dip.digital_projects (institution_id);

CREATE TABLE IF NOT EXISTS dip.project_dag_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES dip.digital_projects(id) ON DELETE CASCADE,
  from_node_id TEXT NOT NULL,
  to_node_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_dag_edges_project_id ON dip.project_dag_edges (project_id);

COMMENT ON TABLE dip.digital_projects IS 'DIP Project Manifest & DAG — DigitalProject aggregates (COMP-006.4).';
COMMENT ON TABLE dip.project_dag_edges IS 'DIP Project DAG edges (COMP-006.4).';
