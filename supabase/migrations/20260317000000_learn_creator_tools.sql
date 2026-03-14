-- COMP-017.4: Learn Creator Tools — creator_workflows, approval_records.

CREATE TABLE IF NOT EXISTS learn.creator_workflows (
  id UUID PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES learn.tracks(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL,
  current_phase TEXT NOT NULL DEFAULT 'ideation' CHECK (current_phase IN ('ideation', 'drafting', 'review', 'refinement', 'publication')),
  phases_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_creator_workflows_track_id ON learn.creator_workflows (track_id);
CREATE INDEX idx_creator_workflows_creator_id ON learn.creator_workflows (creator_id);

CREATE TABLE IF NOT EXISTS learn.approval_records (
  id UUID PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES learn.creator_workflows(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('ideation', 'drafting', 'review', 'refinement', 'publication')),
  reviewer_id TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approve', 'reject')),
  notes TEXT NOT NULL DEFAULT '',
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approval_records_workflow_id ON learn.approval_records (workflow_id);

COMMENT ON TABLE learn.creator_workflows IS 'Creator workflow aggregate — 5-phase authoring (COMP-017.4).';
COMMENT ON TABLE learn.approval_records IS 'Approval/rejection records per workflow phase (COMP-017.4).';
