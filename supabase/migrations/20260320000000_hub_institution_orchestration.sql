-- COMP-020.5: Hub Institution Orchestration — contract_templates, institution_creation_workflows, institution_profiles.
-- Schema: hub (existing).

CREATE TABLE hub.contract_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dsl TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hub_contract_templates_type ON hub.contract_templates (type);

CREATE TABLE hub.institution_creation_workflows (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  current_phase TEXT NOT NULL,
  configured_parameters JSONB NOT NULL DEFAULT '{}',
  dip_institution_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hub_institution_creation_workflows_template_id ON hub.institution_creation_workflows (template_id);
CREATE INDEX idx_hub_institution_creation_workflows_current_phase ON hub.institution_creation_workflows (current_phase);

CREATE TABLE hub.institution_profiles (
  institution_id TEXT PRIMARY KEY,
  snapshot JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE hub.contract_templates IS 'Hub Institution Orchestration — pre-audited governance templates (COMP-020.5).';
COMMENT ON TABLE hub.institution_creation_workflows IS 'Hub Institution Orchestration — creation workflow state (COMP-020.5).';
COMMENT ON TABLE hub.institution_profiles IS 'Hub Institution Orchestration — optional cache for InstitutionProfile read model (COMP-020.5).';
