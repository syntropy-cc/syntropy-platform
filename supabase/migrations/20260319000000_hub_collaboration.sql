-- COMP-019.7: Hub Collaboration Layer — issues, contributions, contribution_issue_links, contribution_sandboxes.
-- Schema: hub (ADR-004 one schema per domain).

CREATE SCHEMA IF NOT EXISTS hub;

CREATE TABLE hub.issues (
  id UUID PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  assignee_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hub_issues_project_id ON hub.issues (project_id);
CREATE INDEX idx_hub_issues_status ON hub.issues (status);

CREATE TABLE hub.contributions (
  id UUID PRIMARY KEY,
  project_id TEXT NOT NULL,
  contributor_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  dip_artifact_id TEXT,
  reviewer_ids JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hub_contributions_project_id ON hub.contributions (project_id);
CREATE INDEX idx_hub_contributions_status ON hub.contributions (status);

-- dip_artifact_id is set once on integration; immutable thereafter.
CREATE OR REPLACE FUNCTION hub.check_dip_artifact_id_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.dip_artifact_id IS NOT NULL AND NEW.dip_artifact_id IS DISTINCT FROM OLD.dip_artifact_id THEN
    RAISE EXCEPTION 'dip_artifact_id cannot be changed after integration';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hub_contributions_dip_artifact_id_immutable
  BEFORE UPDATE ON hub.contributions
  FOR EACH ROW
  EXECUTE FUNCTION hub.check_dip_artifact_id_immutable();

CREATE TABLE hub.contribution_issue_links (
  contribution_id UUID NOT NULL REFERENCES hub.contributions(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES hub.issues(id) ON DELETE CASCADE,
  PRIMARY KEY (contribution_id, issue_id)
);

CREATE INDEX idx_hub_contribution_issue_links_contribution_id ON hub.contribution_issue_links (contribution_id);
CREATE INDEX idx_hub_contribution_issue_links_issue_id ON hub.contribution_issue_links (issue_id);

CREATE TABLE hub.contribution_sandboxes (
  id UUID PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  challenge_description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  ide_session_id TEXT,
  challenge_issue_ids JSONB NOT NULL DEFAULT '[]',
  participant_contribution_ids JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hub_contribution_sandboxes_project_id ON hub.contribution_sandboxes (project_id);
CREATE INDEX idx_hub_contribution_sandboxes_status ON hub.contribution_sandboxes (status);

COMMENT ON TABLE hub.issues IS 'Hub Collaboration — Issue aggregates (COMP-019.7).';
COMMENT ON TABLE hub.contributions IS 'Hub Collaboration — Contribution aggregates (COMP-019.7).';
COMMENT ON TABLE hub.contribution_issue_links IS 'Hub Collaboration — Contribution–Issue links (COMP-019.7).';
COMMENT ON TABLE hub.contribution_sandboxes IS 'Hub Collaboration — ContributionSandbox aggregates (COMP-019.7).';
